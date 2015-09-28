
function RaDec (ra, dec)
{
	this.ra = ra;
	this.dec = dec;

	// This should be relatively easy to do. In the northern hemisphere,
	// objects never set if dec > 90 - lat and never rise if dec < lat -
	// 90. In the southern hemisphere, objects never set if dec < -90 - lat
	// and never rise if dec > 90 + lat. There must be a better way to do
	// this...


	/**
	 * Return true if the given Ra/Dec is always above the horizon. Return
	 * false otherwise.
	 * In the northern hemisphere, objects never set if dec > 90 - lat.
	 * In the southern hemisphere, objects never set if dec < -90 - lat.
	 */
	this.isCircumpolarFor = function (loc)
	{
		if (loc.latitude > 0.0)
		{
			return (this.dec > (90.0 - loc.latitude));
		}
		else
		{
			return (this.dec < (-90.0 - loc.latitude));
		}
	};


	/**
	 * Return true if the given Ra/Dec is always below the horizon. Return
	 * false otherwise.
	 * In the northern hemisphere, objects never rise if dec < lat - 90.
	 * In the southern hemisphere, objects never rise if dec > 90 - lat.
	 */
	this.isNeverVisible = function (loc)
	{
		if (loc.latitude > 0.0)
		{
			return (this.dec < (loc.latitude - 90.0));
		}
		else
		{
			return (this.dec > (90.0 + loc.latitude));
		}
	};
}




RaDec.calculateRaDecDist = function (coords)
{
	// find the RA and DEC from the rectangular equatorial coords
	var ra = Geometry.mod2pi(Math.atan2(coords.y, coords.x)) * Geometry.RADIANS_TO_DEGREES;
	var dec = Math.atan(coords.z / Math.sqrt(coords.x * coords.x + coords.y * coords.y))
		* Geometry.RADIANS_TO_DEGREES;

	return new RaDec(ra, dec);
};

RaDec.getInstance = function (planet, time, earthCoordinates)
{
	if (time != undefined)
	{
		// TODO(serafini): This is a temporary hack until we re-factor the Planetary calculations.
		if (planet == Planet.Moon)
		{
			return Planet.calculateLunarGeocentricLocation(time);
		}

		var coords = null;
		if (planet == Planet.Sun)
		{
			// Invert the view, since we want the Sun in earth coordinates, not the Earth in sun
			// coordinates.
			coords = new HeliocentricCoordinates(earthCoordinates.radius, earthCoordinates.x * -1.0,
												earthCoordinates.y * -1.0, earthCoordinates.z * -1.0);
		}
		else
		{
			coords = HeliocentricCoordinates.getInstance(planet, time);
			coords.Subtract(earthCoordinates);
		}
		var equ = coords.CalculateEquatorialCoordinates();
		return RaDec.calculateRaDecDist(equ);
	}
	
	var coords = planet;

	var raRad = Math.atan2(coords.y, coords.x);
	if (raRad < 0) raRad += Math.PI*2;
	var decRad = Math.atan2(coords.z, Math.sqrt(coords.x * coords.x + coords.y * coords.y));

	return new RaDec(raRad * Geometry.RADIANS_TO_DEGREES,
						decRad * Geometry.RADIANS_TO_DEGREES);
};


