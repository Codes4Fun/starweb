/**
 * This class corresponds to an object's location in Euclidean space
 * when it is projected onto a unit sphere (with the Earth at the
 * center).
 *
 * @author Brent Bryan
 */
function GeocentricCoordinates (x,y,z)
{
	Vector3.call(this,x,y,z);

	/** Recomputes the x, y, and z variables in this class based on the specified
	 * {@link RaDec}.
	 */
	this.updateFromRaDec = function (raDec)
	{
		this.updateFromRaDec(raDec.ra, raDec.dec);
	}

	this.updateFromRaDec = function (ra, dec)
	{
		if (dec == undefined)
		{
			dec = ra.dec;
			ra = ra.ra;
		}
		var raRadians = ra * Geometry.DEGREES_TO_RADIANS;
		var decRadians = dec * Geometry.DEGREES_TO_RADIANS;

		this.x = Math.cos(raRadians) * Math.cos(decRadians);
		this.y = Math.sin(raRadians) * Math.cos(decRadians);
		this.z = Math.sin(decRadians);
	}

	this.toFloatArray = function ()
	{
		return [x, y, z];
	}

	/**
	 * Assumes it's an array of length 3.
	 * @param xyz
	 */
  	this.updateFromFloatArray = function (xyz)
  	{
		this.x = xyz[0];
		this.y = xyz[1];
		this.z = xyz[2];
	}

  	this.updateFromVector3 = function (v)
  	{
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
	}

  	this.copy = function ()
  	{
		return new GeocentricCoordinates(this.x, this.y, this.z);
	}
}


GeocentricCoordinates.prototype = new Vector3;
GeocentricCoordinates.prototype.constructor = GeocentricCoordinates;


/**
 * Convert ra and dec to x,y,z where the point is place on the unit sphere.
 */
GeocentricCoordinates.getInstance = function (ra, dec)
{
	if (dec == undefined)
	{
		dec = ra.dec;
		ra = ra.ra;
	}
	var coords = new GeocentricCoordinates(0.0, 0.0, 0.0);
	coords.updateFromRaDec(ra, dec);
	return coords;
}

/**
 * Convert ra and dec to x,y,z where the point is place on the unit sphere.
 */
GeocentricCoordinates.getInstanceFromFloatArray = function (xyz)
{
	return new GeocentricCoordinates(xyz[0], xyz[1], xyz[2]);
}

GeocentricCoordinates.getInstanceFromVector3 = function (v)
{
	return new GeocentricCoordinates(v.x, v.y, v.z);
}
