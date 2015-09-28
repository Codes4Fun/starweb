var REGION_COVERAGE_ANGLE_IN_RADIANS = 0.396023592;
// 32 points to cover the sphere.  Each region is about 22.7 degrees.
var REGION_CENTERS =
[
	new GeocentricCoordinates(-0.850649066269, 0.525733930059, -0.000001851469),
	new GeocentricCoordinates(-0.934170971625, 0.000004098751, -0.356825719588),
	new GeocentricCoordinates(0.577349931933, 0.577346773818, 0.577354100533),
	new GeocentricCoordinates(0.577350600623, -0.577350601554, -0.577349603176),
	new GeocentricCoordinates(-0.577354427427, -0.577349954285, 0.577346424572),
	new GeocentricCoordinates(-0.577346098609, 0.577353779227, -0.577350928448),
	new GeocentricCoordinates(-0.577349943109, -0.577346729115, -0.577354134060),
	new GeocentricCoordinates(-0.577350598760, 0.577350586653, 0.577349620871),
	new GeocentricCoordinates(0.577354458161, 0.577349932864, -0.577346415259),
	new GeocentricCoordinates(0.577346091159, -0.577353793196, 0.577350921929),
	new GeocentricCoordinates(-0.850652559660, -0.525728277862, -0.000004770234),
	new GeocentricCoordinates(-0.934173742309, 0.000002107583, 0.356818466447),
	new GeocentricCoordinates(0.525734450668, 0.000000594184, -0.850648744032),
	new GeocentricCoordinates(0.000002468936, -0.356819496490, -0.934173349291),
	new GeocentricCoordinates(0.525727798231, -0.000004087575, 0.850652855821),
	new GeocentricCoordinates(-0.000002444722, 0.356819517910, 0.934173340909),
	new GeocentricCoordinates(-0.525727787986, 0.000004113652, -0.850652862340),
	new GeocentricCoordinates(0.000004847534, 0.356824675575, -0.934171371162),
	new GeocentricCoordinates(-0.000004885718, -0.850652267225, 0.525728750974),
	new GeocentricCoordinates(-0.356825215742, -0.934171164408, -0.000003995374),
	new GeocentricCoordinates(0.000000767410, 0.850649364293, 0.525733447634),
	new GeocentricCoordinates(0.356825180352, 0.934171177447, 0.000003952533),
	new GeocentricCoordinates(-0.000000790693, -0.850649344735, -0.525733478367),
	new GeocentricCoordinates(0.356818960048, -0.934173554182, -0.000001195818),
	new GeocentricCoordinates(0.850652555004, 0.525728284381, 0.000004773028),
	new GeocentricCoordinates(0.934170960449, -0.000004090369, 0.356825748459),
	new GeocentricCoordinates(-0.525734410621, -0.000000609085, 0.850648769177),
	new GeocentricCoordinates(-0.000004815869, -0.356824668124, 0.934171373956),
	new GeocentricCoordinates(0.000004877336, 0.850652255118, -0.525728769600),
	new GeocentricCoordinates(-0.356819001026, 0.934173538350, 0.000001183711),
	new GeocentricCoordinates(0.850649050437, -0.525733955204, 0.000001879409),
	new GeocentricCoordinates(0.934173759073, -0.000002136454, -0.356818422675),
];

function SkyRegionMap()
{
	this.mRegionCoverageAngles = null;
	var mRegionData = {};
	var mRegionDataFactory = null;

	// Clear the region map and coverage angles.
	this.clear = function ()
	{
		mRegionData = {};
		this.mRegionCoverageAngles = null;
	};

	/**
	 * Sets a function for constructing an empty rendering data object
	 * for a sky region.  This is used to create an object if getRegionData()
	 * is called and none already exists.
	 */
	this.setRegionDataFactory = function (factory) 
	{
		mRegionDataFactory = factory;
	};

	this.setRegionData = function (id, data) 
	{
		mRegionData[id] = data;
	};

	this.getRegionCoverageAngle = function (id) 
	{
		return this.mRegionCoverageAngles == null ? REGION_COVERAGE_ANGLE_IN_RADIANS
			: this.mRegionCoverageAngles[id];
	};
	/**
	 * Sets the coverage angle for a sky region.  Needed for non-point
	 * objects (see the javadoc for this class).
	 * @param id
	 * @param angleInRadians
	 */
	this.setRegionCoverageAngle = function (id, angleInRadians) 
	{
		if (this.mRegionCoverageAngles == null) 
		{
			this.mRegionCoverageAngles = new Float32Array(REGION_CENTERS.length);
			for (var i = 0; i < REGION_CENTERS.length; ++i) 
			{
				this.mRegionCoverageAngles[i] = REGION_COVERAGE_ANGLE_IN_RADIANS;
			}
		}
		if (angleInRadians < this.mRegionCoverageAngles[id]) 
		{
			Log.e("SkyRegionMap", "Reducing coverage angle of region " + id +
				" from " + this.mRegionCoverageAngles[id] + " to " + angleInRadians);
		}
		this.mRegionCoverageAngles[id] = angleInRadians;
	};

	/**
	* Lookup the region data corresponding to a region ID.  If none exists,
	* and a region data constructor has been set (see setRegionDataConstructor),
	* that will be used to create a new region - otherwise, this will return
	* null.  This can be useful while building or updating a region, but to get
	* the region data when rendering a frame, use getDataForActiveRegions().
	* @param id
	* @return The data for the specified region.
	*/
	this.getRegionData = function (id) 
	{
		var data = mRegionData[id];
		if (data == null && mRegionDataFactory != null) 
		{
			// If we have a factory, construct a new object.
			data = mRegionDataFactory.construct();
			mRegionData[id] = data;
		}
		return data;
	};

	/**
	* Returns the rendering data for the active regions.  When using a
	* SkyRegionMap for rendering, this is the function will return the
	* data for the regions you need to render.
	*
	* TODO(jpowell): I've done a little bit to verify that the regions I'm
	* computing here doesn't include regions that are obviously off screen, but
	* I should do some more work to verify that.
	*
	* @param regions
	* @return ArrayList of rendering data corresponding to the on-screen
	* regions.
	*/
	this.getDataForActiveRegions = function (regions) 
	{
		var data = [];

		// Always add the catchall region if non-NULL.
		var catchallData = mRegionData[SkyRegionMap.CATCHALL_REGION_ID];
		if (catchallData != null) 
		{
			data.push(catchallData);
		}

		if (this.mRegionCoverageAngles == null) 
		{
			// Just return the data for the standard visible regions.
			regions.activeStandardRegions.forEach(function (region)
			{
				var regionData = mRegionData[region];
				if (regionData != null) 
				{
					data.push(regionData);
				}
			});
			return data;
		}
		else 
		{
			for (var i = 0; i < REGION_CENTERS.length; i++) 
			{
				// Need to specially compute the visible regions.
				if (regions.regionIsActive(i, this.mRegionCoverageAngles[i])) 
				{
					var regionData = mRegionData[i];
					if (regionData != null) 
					{
						data.push(regionData);
					}
				}
			}
			return data;
		}
	};

	this.getDataForAllRegions = function () 
	{
		var values = [];
		for (var i  in mRegionData)
		{
			values.push(mRegionData[i]);
		}
		return values;
	};
}

SkyRegionMap.CATCHALL_REGION_ID = -1;

/**
* This stores data that we only want to compute once per frame about
* which regions are on the screen.  We don't want to compute these
* regions for every manager separately, since we can share them
* between managers.
*/
function ActiveRegionData(regionCenterDotProducts, screenAngle,  activeScreenRegions)
{
	if (regionCenterDotProducts.length != REGION_CENTERS.length) 
	{
		Log.e("SkyRegionMap", "Bad regionCenterDotProducts length: " +
			regionCenterDotProducts.length + " vs " + REGION_CENTERS.length);
	}

	// Dot product of look direction with each region's center.
	// We need this for non-standard regions.  For standard regions,
	// we can compute the visible regions when we compute the
	// ActiveRegionData, so we don't need to cache this.
	this.regionCenterDotProducts = regionCenterDotProducts;

	// Angle between the look direction and the corners of the screen.
	this.screenAngle = screenAngle;

	// The list of standard regions which are active given the current
	// look direction and screen angle.
	this.activeStandardRegions = activeScreenRegions;

	/**
	 * Returns true if a non-standard region is active.
	 * @param region The ID of the region to check
	 * @param coverageAngle the coverage angle of the region.
	 * @return true if the region is active, false if not.
	 */
	this.regionIsActive = function (region, coverageAngle) 
	{
		// A region cannot be active if the angle between screen's center
		// and the region's center is greater than the sum of the region angle
		// and screen angle.  I make a few definitions:
		// S = screen direction (look direction)
		// s = screen angle
		// R = region center
		// r = region angle
		// If the region is active, then
		// (angle between S and R) < s + r
		// These angles are between 0 and Pi, and cos is decreasing here, so
		// cos(angle between S and R) > cos(s + r)
		// S and R are unit vectors, so S dot R = cos(angle between S and R)
		// S dot R > cos(s + r)
		// So the regions where this holds true are the visible regions.
		return regionCenterDotProducts[region] > MathUtil.cos(coverageAngle + screenAngle);
	};
}

/**
 * Computes the data necessary to determine which regions on the screen
 * are active.  This should be produced once per frame and passed to
 * the getDataForActiveRegions method of all SkyRegionMap objects to
 * get the active regions for each map.
 *
 * @param lookDir The direction the user is currently facing.
 * @param fovyInDegrees The field of view (in degrees).
 * @param aspect The aspect ratio of the screen.
 * @return A data object containing data for quickly determining the
 * active regions.
 */
SkyRegionMap.getActiveRegions = function (lookDir, fovyInDegrees, aspect)
{
	// We effectively compute a screen "region" here.  The center of this
	// region is the look direction, and the radius is the angle between
	// the center and one of the corners.  If any region intersects the
	// screen region, we consider that region to be active.
	//
	// First, we compute the screen angle.  The angle between the vectors
	// to the top of the screen and the center of the screen is defined to
	// be fovy/2.
	// The distance between the top and center of the view plane, then, is
	// sin(fovy / 2).  The difference between the right and center must be.
	// (width / height) * sin(fovy / 2) = aspect * sin(fovy / 2)
	// This gives us a right triangle to find the distance between the center
	// and the corner of the screen.  This distance is:
	// d = sin(fovy / 2) * sqrt(1 + aspect^2).
	// The angle for the screen region is the arcsin of this value.
	var halfFovy = (fovyInDegrees * MathUtil.DEGREES_TO_RADIANS) / 2;
	var screenAngle = MathUtil.asin(
		MathUtil.sin(halfFovy) * MathUtil.sqrt(1 + aspect * aspect));

	// Next, determine whether or not the region is active.  See the
	// regionIsActive method for an explanation of the math here.
	// We don't use that method because if we did, we would repeatedly
	// compute the same cosine in that function.
	var angleThreshold = screenAngle + REGION_COVERAGE_ANGLE_IN_RADIANS;
	var dotProductThreshold = MathUtil.cos(angleThreshold);
	var regionCenterDotProducts = new Float32Array(REGION_CENTERS.length);
	var activeStandardRegions = [];
	for (var i = 0; i < REGION_CENTERS.length; i++) 
	{
		var dotProduct = VectorUtil.dotProduct(lookDir, REGION_CENTERS[i]);
		regionCenterDotProducts[i] = dotProduct;
		if (dotProduct > dotProductThreshold) 
		{
			activeStandardRegions.push(i);
		}
	}

	// Log.d("SkyRegionMap", "ScreenAngle: " + screenAngle);
	// Log.d("SkyRegionMap", "Angle Threshold: " + angleThreshold);
	// Log.d("SkyRegionMap", "DP Threshold: " + dotProductThreshold);

	return new ActiveRegionData(regionCenterDotProducts, screenAngle,
		activeStandardRegions);
};

/**
* Returns the region that a point belongs in.
*
* @param position
* @return The region the point belongs in.
*/
SkyRegionMap.getObjectRegion = function (position)
{
	return SkyRegionMap.getObjectRegionData(position).region;
};

/**
* Returns the region a point belongs in, as well as the dot product of the
* region center and the position.  The latter is a measure of how close it
* is to the center of the region (1 being a perfect match).
*
* TODO(jpowell): I think this is useful for putting lines into regions, but
* if I don't end up using this when I implement that, I should delete this.
* @param position
* @return The closest region and dot product with center of that region.
*/
SkyRegionMap.getObjectRegionData = function (position)
{
	// The closest region will minimize the angle between the vectors, which
	// will maximize the dot product, so we just return the region which
	// does that.
	var data = 
	{
		region : SkyRegionMap.CATCHALL_REGION_ID,
		regionCenterDotProduct : -1
	};
	for (var i = 0; i < REGION_CENTERS.length; i++) 
	{
		var dotProduct = VectorUtil.dotProduct(REGION_CENTERS[i], position);
		if (dotProduct > data.regionCenterDotProduct) 
		{
			data.regionCenterDotProduct = dotProduct;
			data.region = i;
		}
	}

	// For debugging only: make sure we're within the maximum region coverage angle.
	if (data.regionCenterDotProduct < MathUtil.cos(REGION_COVERAGE_ANGLE_IN_RADIANS)) 
	{
		Log.e("ActiveSkyRegionData",
			"Object put in region, but outside of coverage angle." +
			"Angle was " + MathUtil.acos(data.regionCenterDotProduct) + " vs "  +
			REGION_COVERAGE_ANGLE_IN_RADIANS + ". Region was " + data.region);
	}

	return data;
};



