
/**
 * A POJO to hold the user's view direction.
 *
 * @author John Taylor
 */
function Pointing(a, b)
{
	var lineOfSight;
	var perpendicular;
	if (a != undefined)
	{
		lineOfSight = a;
		perpendicular = b;
	}
	else
	{
		lineOfSight = new GeocentricCoordinates(1, 0, 0);
		perpendicular = new GeocentricCoordinates(0, 1, 0);
	}

	/**
	 * Gets the line of sight component of the pointing.
	 * Warning: creates a copy - if you can reuse your own
	 * GeocentricCoordinates object it might be more efficient to
	 * use {@link #getLineOfSightX()} etc.
	 */
	this.getLineOfSight = function ()
	{
		return lineOfSight.copy();
	};

	/**
	 * Gets the perpendicular component of the pointing.
	 * Warning: creates a copy - if you can reuse your own
	 * GeocentricCoordinates object it might be more efficient to
	 * use {@link #getLineOfSightX()} etc.
	 */
	this.getPerpendicular = function ()
	{
		return perpendicular.copy();
	};

	this.getLineOfSightX = function ()
	{
		return lineOfSight.x;
	};
	this.getLineOfSightY = function ()
	{
		return lineOfSight.y;
	};
	this.getLineOfSightZ = function ()
	{
		return lineOfSight.z;
	};
	this.getPerpendicularX = function ()
	{
		return perpendicular.x;
	};
	this.getPerpendicularY = function ()
	{
		return perpendicular.y;
	};
	this.getPerpendicularZ = function ()
	{
		return perpendicular.z;
	};

	/**
	 * Only the AstronomerModel should change this.
	 */
	this.updatePerpendicular = function (newPerpendicular)
	{
		perpendicular.assign(newPerpendicular);
		
	};

	/**
	 * Only the AstronomerModel should change this.
	 */
	this.updateLineOfSight = function (newLineOfSight)
	{
		lineOfSight.assign(newLineOfSight);
	};
}

/**
 * The model of the astronomer.
 *
 * <p>Stores all the data about where and when he is and where he's looking and
 * handles translations between three frames of reference:
 * <ol>
 * <li>Celestial - a frame fixed against the background stars with
 * x, y, z axes pointing to (RA = 90, DEC = 0), (RA = 0, DEC = 0), DEC = 90
 * <li>Phone - a frame fixed in the phone with x across the short side, y across
 * the long side, and z coming out of the phone screen.
 * <li>Local - a frame fixed in the astronomer's local position. x is due east
 * along the ground y is due north along the ground, and z points towards the
 * zenith.
 * </ol>
 *
 * <p>We calculate the local frame in phone coords, and in celestial coords and
 * calculate a transform between the two.
 * In the following, N, E, U correspond to the local
 * North, East and Up vectors (ie N, E along the ground, Up to the Zenith)
 *
 * <p>In Phone Space: axesPhone = [N, E, U]
 *
 * <p>In Celestial Space: axesSpace = [N, E, U]
 *
 * <p>We find T such that axesCelestial = T * axesPhone
 *
 * <p>Then, [viewDir, viewUp]_celestial = T * [viewDir, viewUp]_phone
 *
 * <p>where the latter vector is trivial to calculate.
 *
 * <p>Implementation note: this class isn't making defensive copies and
 * so is vulnerable to clients changing its internal state.
 *
 * @author John Taylor
 */
function AstronomerModelImpl(magneticDeclinationCalculator)
{
	var TAG = 'AstronomerModel';
	var POINTING_DIR_IN_PHONE_COORDS = new Vector3(0, 0, -1);
	var SCREEN_UP_IN_PHONE_COORDS = new Vector3(0, 1, 0);
	var AXIS_OF_EARTHS_ROTATION = new Vector3(0, 0, 1);
	var MINIMUM_TIME_BETWEEN_CELESTIAL_COORD_UPDATES_MILLIS = 60000;

	var magneticDeclinationCalculator = magneticDeclinationCalculator;
	var autoUpdatePointing = true;
	var fieldOfView = 45;	// Degrees
	var location = new LatLong(0, 0);
	var clock = new RealClock();
	var celestialCoordsLastUpdated = -1;

	/**
	 * The pointing comprises a vector into the phone's screen expressed in
	 * celestial coordinates combined with a perpendicular vector along the
	 * phone's longer side.
	 */
	var pointing = new Pointing();

	/** The sensor acceleration in the phone's coordinate system. */
	var acceleration = ApplicationConstants.INITIAL_DOWN;

	/** The sensor magnetic field in the phone's coordinate system. */
	var magneticField = ApplicationConstants.INITIAL_SOUTH;

	/** North along the ground in celestial coordinates. */
	var trueNorthCelestial = new Vector3(1, 0, 0);

	/** Up in celestial coordinates. */
	var upCelestial = new Vector3(0, 1, 0);

	/** East in celestial coordinates. */
	var trueEastCelestial = AXIS_OF_EARTHS_ROTATION;

	/** [North, Up, East]^-1 in phone coordinates. */
	var axesPhoneInverseMatrix = Matrix33.getIdMatrix();

	/** [North, Up, East] in celestial coordinates. */
	var axesMagneticCelestialMatrix = Matrix33.getIdMatrix();


	/**
	 * Updates the astronomer's 'pointing', that is, the direction the phone is
	 * facing in celestial coordinates and also the 'up' vector along the
	 * screen (also in celestial coordinates).
	 *
	 * <p>This method requires that {@link #axesMagneticCelestialMatrix} and
	 * {@link #axesPhoneInverseMatrix} are currently up to date.
	 */
	this.calculatePointing = function ()
	{
		if (!autoUpdatePointing)
		{
			return;
		}

		var transform = Geometry.matrixMultiply(axesMagneticCelestialMatrix, axesPhoneInverseMatrix);

		var viewInSpaceSpace = Geometry.matrixVectorMultiply(transform, POINTING_DIR_IN_PHONE_COORDS);
		var screenUpInSpaceSpace = Geometry.matrixVectorMultiply(transform, SCREEN_UP_IN_PHONE_COORDS);

		pointing.updateLineOfSight(viewInSpaceSpace);
		pointing.updatePerpendicular(screenUpInSpaceSpace);
	}

	/**
	 * Calculates local North, East and Up vectors in terms of the celestial
	 * coordinate frame.
	 */
	this.calculateLocalNorthAndUpInCelestialCoords = function (forceUpdate)
	{
		var currentTime = clock.getTimeInMillisSinceEpoch();
		if (!forceUpdate &&
				Math.abs(currentTime - celestialCoordsLastUpdated) <
				MINIMUM_TIME_BETWEEN_CELESTIAL_COORD_UPDATES_MILLIS) {
			return;
		}
		celestialCoordsLastUpdated = currentTime;
		this.updateMagneticCorrection();
		var up = Geometry.calculateRADecOfZenith(this.getTime(), location);
		upCelestial = GeocentricCoordinates.getInstance(up);
		var z = AXIS_OF_EARTHS_ROTATION;
		var zDotu = Geometry.scalarProduct(upCelestial, z);
		trueNorthCelestial = Geometry.addVectors(z, Geometry.scaleVector(upCelestial, -zDotu));
		trueNorthCelestial.normalize();
		trueEastCelestial = Geometry.vectorProduct(trueNorthCelestial, upCelestial);

		// Apply magnetic correction.	Rather than correct the phone's axes for
		// the magnetic declination, it's more efficient to rotate the
		// celestial axes by the same amount in the opposite direction.
		var rotationMatrix = Geometry.calculateRotationMatrix(
				magneticDeclinationCalculator.getDeclination(), upCelestial);

		var magneticNorthCelestial = Geometry.matrixVectorMultiply(
			rotationMatrix,
			trueNorthCelestial);
		var magneticEastCelestial = Geometry.vectorProduct(magneticNorthCelestial, upCelestial);

		axesMagneticCelestialMatrix = new Matrix33(magneticNorthCelestial,
													upCelestial,
													magneticEastCelestial);
	}

	/**
	 * Calculates local North and Up vectors in terms of the phone's coordinate
	 * frame.
	 */
	this.calculateLocalNorthAndUpInPhoneCoords = function ()
	{
		// TODO(johntaylor): we can reduce the number of vector copies done in here.
		var down = acceleration.copy();
		down.normalize();
		// Magnetic field goes *from* North to South, so reverse it.
		var magneticFieldToNorth = magneticField.copy();
		magneticFieldToNorth.scale(-1);
		magneticFieldToNorth.normalize();
		// This is the vector to magnetic North *along the ground*.
		var magneticNorthPhone = Geometry.addVectors(magneticFieldToNorth,
				Geometry.scaleVector(down, -Geometry.scalarProduct(magneticFieldToNorth, down)));
		magneticNorthPhone.normalize();
		var upPhone = Geometry.scaleVector(down, -1);
		var magneticEastPhone = Geometry.vectorProduct(magneticNorthPhone, upPhone);

		// The matrix is orthogonal, so transpose it to find its inverse.
		// Easiest way to do that is to construct it from row vectors instead
		// of column vectors.
		axesPhoneInverseMatrix = new Matrix33(magneticNorthPhone, upPhone, magneticEastPhone, false);
	}

	/**
	 * Updates the angle between True North and Magnetic North.
	 */
	this.updateMagneticCorrection = function ()
	{
		magneticDeclinationCalculator.setLocationAndTime(location, this.getTimeMillis());
	}

	this.setAutoUpdatePointing = function (autoUpdate)
	{
		autoUpdatePointing = autoUpdate;
	};

	this.getFieldOfView = function ()
	{
		return fieldOfView;
	};

	this.setFieldOfView = function (degrees)
	{
		fieldOfView = degrees;
	};

	this.getTime = function ()
	{
		return new Date(clock.getTimeInMillisSinceEpoch());
	};

	this.getLocation = function ()
	{
		return location;
	};

	this.setLocation = function (newLocation)
	{
		location = newLocation;
		this.calculateLocalNorthAndUpInCelestialCoords(true);
	};

	this.getPhoneAcceleration = function ()
	{
		return acceleration;
	};

	this.setPhoneSensorValues = function (acc, mag)
	{
		acceleration.assign(acc);
		magneticField.assign(mag);
	};

	this.getNorth = function ()
	{
		this.calculateLocalNorthAndUpInCelestialCoords(false);
		return GeocentricCoordinates.getInstanceFromVector3(trueNorthCelestial);
	};

	this.getSouth = function ()
	{
		this.calculateLocalNorthAndUpInCelestialCoords(false);
		return GeocentricCoordinates.getInstanceFromVector3(Geometry.scaleVector(trueNorthCelestial, -1));
	};

	this.getZenith = function ()
	{
		this.calculateLocalNorthAndUpInCelestialCoords(false);
		return GeocentricCoordinates.getInstanceFromVector3(upCelestial);
	};

	this.getNadir = function ()
	{
		this.calculateLocalNorthAndUpInCelestialCoords(false);
		return GeocentricCoordinates.getInstanceFromVector3(Geometry.scaleVector(upCelestial, -1));
	};

	this.getEast = function ()
	{
		this.calculateLocalNorthAndUpInCelestialCoords(false);
		return GeocentricCoordinates.getInstanceFromVector3(trueEastCelestial);
	};

	this.getWest = function ()
	{
		this.calculateLocalNorthAndUpInCelestialCoords(false);
		return GeocentricCoordinates.getInstanceFromVector3(Geometry.scaleVector(trueEastCelestial, -1));
	};

	this.setMagneticDeclinationCalculator = function (calculator)
	{
		this.magneticDeclinationCalculator = calculator;
		this.calculateLocalNorthAndUpInCelestialCoords(true);
	};

	/**
	 * Returns the user's pointing.	Note that clients should not usually modify this
	 * object as it is not defensively copied.
	 */
	this.getPointing = function ()
	{
		this.calculateLocalNorthAndUpInPhoneCoords();
		this.calculatePointing();
		return pointing;
	};

	this.setPointing = function (lineOfSight, perpendicular)
	{
		pointing.updateLineOfSight(lineOfSight);
		pointing.updatePerpendicular(perpendicular);
	};

	this.setClock = function (otherClock)
	{
		clock = otherClock;
		this.calculateLocalNorthAndUpInCelestialCoords(true);
	};

	this.getTimeMillis = function ()
	{
		return clock.getTimeInMillisSinceEpoch();
	};
}

