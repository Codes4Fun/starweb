/**
 * Calculate the position of the Sun in RA and Dec
 * 
 * TODO(johntaylor): get rid of this class once the provider
 * framework is refactored.  This duplicates functionality from elsewhere,
 * but the current ephemeris/provider code is a bit too tangled up for easy reuse.
 *
 */
var SolarPositionCalculator =
{
	getSolarPosition : function (time)
	{
		var sunCoordinates = HeliocentricCoordinates.getInstance(Planet.Sun, time);
		var raDec = RaDec.getInstance(Planet.Sun, time, sunCoordinates);
		return raDec;
	}
}
