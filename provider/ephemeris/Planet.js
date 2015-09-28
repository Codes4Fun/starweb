
function PlanetObject(image, name, freq)
{
		var imageResourceId = image;
		var nameResourceId = name;
		var updateFreqMs = freq;

	this.getUpdateFrequencyMs = function ()
	{
		return updateFreqMs;
	};

	/**
	 * Returns the resource id for the string corresponding to the name of this
	 * planet.
	 */
	this.getNameResourceId = function ()
	{
		return nameResourceId;
	};

	/** Returns the resource id for the planet's image. */
	this.getImageResourceId = function (time)
	{
		if (this == Planet.Moon)
		{
			return this.getLunarPhaseImageId(time);
		}
		return imageResourceId;
	};

	/**
	 * Determine the Moon's phase and return the resource ID of the correct
	 * image.
	 */
	this.getLunarPhaseImageId = function (time)
	{
		// First, calculate phase angle:
		var phase = this.calculatePhaseAngle(time);
		Log.d(TAG, "Lunar phase = " + phase);

		// Next, figure out what resource id to return.
		if (phase < 22.5)
		{
			// New moon.
			return R.drawable.moon0;
		}
		else if (phase > 150.0)
		{
			// Full moon.
			return R.drawable.moon4;
		}

		// Either crescent, quarter, or gibbous. Need to see whether we are
		// waxing or waning. Calculate the phase angle one day in the future.
		// If phase is increasing, we are waxing. If not, we are waning.
		var tomorrow = new Date(time.getTime() + 24 * 3600 * 1000);
		var phase2 = this.calculatePhaseAngle(tomorrow);
		Log.d(TAG, "Tomorrow's phase = " + phase2);

		if (phase < 67.5)
		{
			// Crescent
			return (phase2 > phase) ? R.drawable.moon1 : R.drawable.moon7;
		}
		else if (phase < 112.5)
		{
			// Quarter
			return (phase2 > phase) ? R.drawable.moon2 : R.drawable.moon6;
		}

		// Gibbous
		return (phase2 > phase) ? R.drawable.moon3 : R.drawable.moon5;
	};


	// Taken from JPL's Planetary Positions page: http://ssd.jpl.nasa.gov/?planet_pos
	// This gives us a good approximation for the years 1800 to 2050 AD.
	// TODO(serafini): Update the numbers so we can extend the approximation to cover 
	// 3000 BC to 3000 AD.
	this.getOrbitalElements = function (date)
	{
		// Centuries since J2000
		var jc = TimeUtil.julianCenturies(date);

		switch (this)
		{
		case Planet.Mercury: {
			var a = 0.38709927 + 0.00000037 * jc;
			var e = 0.20563593 + 0.00001906 * jc;
			var i = (7.00497902 - 0.00594749 * jc) * Geometry.DEGREES_TO_RADIANS;
			var l = 
				Geometry.mod2pi((252.25032350 + 149472.67411175 * jc) * Geometry.DEGREES_TO_RADIANS);
			var w = (77.45779628 + 0.16047689 * jc) * Geometry.DEGREES_TO_RADIANS;
			var o = (48.33076593 - 0.12534081 * jc) * Geometry.DEGREES_TO_RADIANS;
			return new OrbitalElements(a, e, i, o, w, l);
		}

		case Planet.Venus: {
			var a = 0.72333566 + 0.00000390 * jc;
			var e = 0.00677672 - 0.00004107 * jc;
			var i = (3.39467605 - 0.00078890 * jc) * Geometry.DEGREES_TO_RADIANS;
			var l =
				Geometry.mod2pi((181.97909950 + 58517.81538729 * jc) * Geometry.DEGREES_TO_RADIANS);
			var w = (131.60246718 + 0.00268329 * jc) * Geometry.DEGREES_TO_RADIANS;
			var o = (76.67984255 - 0.27769418 * jc) * Geometry.DEGREES_TO_RADIANS;
			return new OrbitalElements(a, e, i, o, w, l);
		}

		// Note that this is the orbital data for Earth.
		case Planet.Sun: {
			var a = 1.00000261 + 0.00000562 * jc;
			var e = 0.01671123 - 0.00004392 * jc;
			var i = (-0.00001531 - 0.01294668 * jc) * Geometry.DEGREES_TO_RADIANS;
			var l =
				Geometry.mod2pi((100.46457166 + 35999.37244981 * jc) * Geometry.DEGREES_TO_RADIANS);
			var w = (102.93768193 + 0.32327364 * jc) * Geometry.DEGREES_TO_RADIANS;
			var o = 0;
			return new OrbitalElements(a, e, i, o, w, l);
		}

		case Planet.Mars: {
			var a = 1.52371034 + 0.00001847 * jc;
			var e = 0.09339410 + 0.00007882 * jc;
			var i = (1.84969142 - 0.00813131 * jc) * Geometry.DEGREES_TO_RADIANS;
			var l =
				Geometry.mod2pi((-4.55343205 + 19140.30268499 * jc) * Geometry.DEGREES_TO_RADIANS);
			var w = (-23.94362959 + 0.44441088 * jc) * Geometry.DEGREES_TO_RADIANS;
			var o = (49.55953891 - 0.29257343 * jc) * Geometry.DEGREES_TO_RADIANS;
			return new OrbitalElements(a, e, i, o, w, l);
		}

		case Planet.Jupiter: {
			var a = 5.20288700 - 0.00011607 * jc;
			var e = 0.04838624 - 0.00013253 * jc;
			var i = (1.30439695 - 0.00183714 * jc) * Geometry.DEGREES_TO_RADIANS;
			var l =
				Geometry.mod2pi((34.39644051 + 3034.74612775 * jc) * Geometry.DEGREES_TO_RADIANS);
			var w = (14.72847983 + 0.21252668 * jc) * Geometry.DEGREES_TO_RADIANS;
			var o = (100.47390909 + 0.20469106 * jc) * Geometry.DEGREES_TO_RADIANS;
			return new OrbitalElements(a, e, i, o, w, l);
		}

		case Planet.Saturn: {
			var a = 9.53667594 - 0.00125060 * jc;
			var e = 0.05386179 - 0.00050991 * jc;
			var i = (2.48599187 + 0.00193609 * jc) * Geometry.DEGREES_TO_RADIANS;
			var l =
				Geometry.mod2pi((49.95424423 + 1222.49362201 * jc) * Geometry.DEGREES_TO_RADIANS);
			var w = (92.59887831 - 0.41897216 * jc) * Geometry.DEGREES_TO_RADIANS;
			var o = (113.66242448 - 0.28867794 * jc) * Geometry.DEGREES_TO_RADIANS;
			return new OrbitalElements(a, e, i, o, w, l);
		}

		case Planet.Uranus: {
			var a = 19.18916464 - 0.00196176 * jc;
			var e = 0.04725744 - 0.00004397 * jc;
			var i = (0.77263783 - 0.00242939 * jc) * Geometry.DEGREES_TO_RADIANS;
			var l =
				Geometry.mod2pi((313.23810451 + 428.48202785 * jc) * Geometry.DEGREES_TO_RADIANS);
			var w = (170.95427630 + 0.40805281 * jc) * Geometry.DEGREES_TO_RADIANS;
			var o = (74.01692503 + 0.04240589 * jc) * Geometry.DEGREES_TO_RADIANS;
			return new OrbitalElements(a, e, i, o, w, l);
		}

		case Planet.Neptune: {
			var a = 30.06992276 + 0.00026291 * jc;
			var e = 0.00859048 + 0.00005105 * jc;
			var i = (1.77004347 + 0.00035372 * jc) * Geometry.DEGREES_TO_RADIANS;
			var l =
				Geometry.mod2pi((-55.12002969 + 218.45945325 * jc) * Geometry.DEGREES_TO_RADIANS);
			var w = (44.96476227 - 0.32241464 * jc) * Geometry.DEGREES_TO_RADIANS;
			var o = (131.78422574 - 0.00508664 * jc) * Geometry.DEGREES_TO_RADIANS;
			return new OrbitalElements(a, e, i, o, w, l);
		}

		case Planet.Pluto: {
			var a = 39.48211675 - 0.00031596 * jc;
			var e = 0.24882730 + 0.00005170 * jc;
			var i = (17.14001206 + 0.00004818 * jc) * Geometry.DEGREES_TO_RADIANS;
			var l =
				Geometry.mod2pi((238.92903833 + 145.20780515 * jc) * Geometry.DEGREES_TO_RADIANS);
			var w = (224.06891629 - 0.04062942 * jc) * Geometry.DEGREES_TO_RADIANS;
			var o = (110.30393684 - 0.01183482 * jc) * Geometry.DEGREES_TO_RADIANS;
			return new OrbitalElements(a, e, i, o, w, l);
		}

		default:
			throw new Error("Unknown Planet: " + this);
		}
	};


	/**
	 * Calculates the phase angle of the planet, in degrees.
	 */
	this.calculatePhaseAngle = function (time)
	{
		// For the moon, we will approximate phase angle by calculating the
		// elongation of the moon relative to the sun. This is accurate to within
		// about 1%.
		if (this == Planet.Moon)
		{
			var moonRaDec = Planet.calculateLunarGeocentricLocation(time);
			var moon = GeocentricCoordinates.getInstance(moonRaDec);

			var sunCoords = HeliocentricCoordinates.getInstance(Planet.Sun, time);
			var sunRaDec = RaDec.calculateRaDecDist(sunCoords);
			var sun = GeocentricCoordinates.getInstance(sunRaDec);

			return 180.0 -
				Math.acos(sun.x * moon.x + sun.y * moon.y + sun.z * moon.z)
				* Geometry.RADIANS_TO_DEGREES;
		}

		// First, determine position in the solar system.
		var planetCoords = HeliocentricCoordinates.getInstance(this, time);

		// Second, determine position relative to Earth
		var earthCoords = HeliocentricCoordinates.getInstance(Planet.Sun, time);
		var earthDistance = planetCoords.DistanceFrom(earthCoords);

		// Finally, calculate the phase of the body.
		var phase = Math.acos((earthDistance * earthDistance +
			planetCoords.radius * planetCoords.radius -
			earthCoords.radius * earthCoords.radius) /
			(2.0 * earthDistance * planetCoords.radius)) * Geometry.RADIANS_TO_DEGREES;

		return phase;
	};

	/**
	 * Calculate the percent of the body that is illuminated. The value returned
	 * is a fraction in the range from 0.0 to 100.0.
	 */
	// TODO(serafini): Do we need this method?
	this.calculatePercentIlluminated = function (time)
	{
		var phaseAngle = this.calculatePhaseAngle(time);
		return 50.0 * (1.0 + Math.cos(phaseAngle * Geometry.DEGREES_TO_RADIANS));
	};


	/**
	 * Calculates the planet's magnitude for the given date.
	 *
	 * TODO(serafini): I need to re-factor this method so it uses the phase
	 * calculations above. For now, I'm going to duplicate some code to avoid
	 * some redundant calculations at run time.
	 */
	this.getMagnitude = function (time)
	{
		// TODO(serafini): For now, return semi-reasonable values for the Sun and
		// Moon. We shouldn't call this method for those bodies, but we want to do
		// something sane if we do.
		if (this == Planet.Sun)
		{
			return -27.0;
		}
		if (this == Planet.Moon)
		{
			return -10.0;
		}

		// First, determine position in the solar system.
		var planetCoords = HeliocentricCoordinates.getInstance(this, time);

		// Second, determine position relative to Earth
		var earthCoords = HeliocentricCoordinates.getInstance(Planet.Sun, time);
		var earthDistance = planetCoords.DistanceFrom(earthCoords);

		// Third, calculate the phase of the body.
		var phase = Math.acos((earthDistance * earthDistance +
				planetCoords.radius * planetCoords.radius -
				earthCoords.radius * earthCoords.radius) /
				(2.0 * earthDistance * planetCoords.radius)) * Geometry.RADIANS_TO_DEGREES;
		var p = phase/100.0;		 // Normalized phase angle

		// Finally, calculate the magnitude of the body.
		var mag = -100.0;			// Apparent visual magnitude

		switch (this) {
			case Planet.Mercury:
				mag = -0.42 + (3.80 - (2.73 - 2.00 * p) * p) * p;
				break;
			case Planet.Venus:
				mag = -4.40 + (0.09 + (2.39 - 0.65 * p) * p) * p;
				break;
			case Planet.Mars:
				mag = -1.52 + 1.6 * p;
				break;
			case Planet.Jupiter:
				mag = -9.40 + 0.5 * p;
				break;
			case Planet.Saturn:
				// TODO(serafini): Add the real calculations that consider the position
				// of the rings. For now, lets assume the following, which gets us a reasonable
				// approximation of Saturn's magnitude for the near future.
				mag = -8.75;
				break;
			case Planet.Uranus:
				mag = -7.19;
				break;
			case Planet.Neptune:
				mag = -6.87;
				break;
			case Planet.Pluto:
				mag = -1.0;
				break;
			default:
				Log.e("Planet", "Invalid planet: " + this);
				// At least make it faint!
				mag = 100;
				break;
		}
		return (mag + 5.0 * Math.log10(planetCoords.radius * earthDistance));
	};


	// TODO(serafini): This is experimental code used to scale planetary images.
	this.getPlanetaryImageSize = function ()
	{
		switch(this) {
		case Planet.Sun:
		case Planet.Moon:
			return 0.02;
		case Planet.Mercury:
		case Planet.Venus:
		case Planet.Mars:
		case Planet.Pluto:
			return 0.01;
		case Planet.Jupiter:
				return 0.025;
		case Planet.Uranus:
		case Planet.Neptune:
			return 0.015;
		case Planet.Saturn:
			return 0.035;
		default:
			return 0.02;
		}
	};



	/**
	 * Enum that identifies whether we are interested in rise or set time.
	 */
	this.RiseSetIndicator = { RISE:0, SET:1 };

	// Maximum number of times to calculate rise/set times. If we cannot
	// converge after this many iteretions, we will fail.
	var MAX_ITERATIONS = 25;

	// Internally calculate the rise and set time of an object.
	// Returns a double, the number of hours through the day in UT.
	/*this.calcRiseSetTime = function (d, loc, indicator)
	{
		var cal = Calendar.getInstance(TimeZone.getTimeZone("UT"));
		cal.setTime(d);

		float sign = (indicator == RiseSetIndicator.RISE ? 1.0f : -1.0f);
		float delta = 5.0f;
		float ut = 12.0f;

		int counter = 0;
		while ((Math.abs(delta) > 0.008) && counter < MAX_ITERATIONS) {
			cal.set(Calendar.HOUR_OF_DAY, (int) Math.floor(ut));
			float minutes = (ut - Math.floor(ut)) * 60.0f;
			cal.set(Calendar.MINUTE, (int) minutes);
			cal.set(Calendar.SECOND, (int) ((minutes - Math.floor(minutes)) * 60.f));

			// Calculate the hour angle and declination of the planet.
			// TODO(serafini): Need to fix this for arbitrary RA/Dec locations.
			Date tmp = cal.getTime();
			HeliocentricCoordinates sunCoordinates =
				HeliocentricCoordinates.getInstance(Planet.Sun, tmp);
			RaDec raDec = RaDec.getInstance(this, tmp, sunCoordinates);

			// GHA = GST - RA. (In degrees.)
			float gst = TimeUtil.meanSiderealTime(tmp, 0);
			float gha = gst - raDec.ra;

			// The value of -0.83 works for the diameter of the Sun and Moon. We
			// assume that other objects are simply points.
			float bodySize = (this == Planet.Sun || this == Planet.Moon) ? -0.83f : 0.0f;
			float hourAngle = calculateHourAngle(bodySize, loc.latitude, raDec.dec);

			delta = (gha + loc.longitude + (sign * hourAngle)) / 15.0f;
			while (delta < -24.0f) {
				delta = delta + 24.0f;
			}
			while (delta > 24.0f) {
				delta = delta - 24.0f;
			}
			ut = ut - delta;

			// I think we need to normalize UT
			while (ut < 0.0f) {
				ut = ut + 24.0f;
			}
			while (ut > 24.0f) {
				ut = ut - 24.0f;
			}

			++counter;
		}

		// Return failure if we didn't converge.
		if (counter == MAX_ITERATIONS) {
			Log.d(TAG, "Rise/Set calculation didn't converge.");
			return -1.0f;
		}

		// TODO(serafini): Need to handle latitudes above 60
		// At latitudes above 60, we need to calculate the following:
		// sin h = sin phi sin delta + cos phi cos delta cos (gha + lambda)
		return ut;
	};*/

	/**
	 * Calculates the next rise or set time of this planet from a given observer.
	 * Returns null if the planet doesn't rise or set during the next day.
	 * 
	 * @param now Calendar time from which to calculate next rise / set time.
	 * @param loc Location of observer.
	 * @param indicator Indicates whether to look for rise or set time.
	 * @return New Calendar set to the next rise or set time if within
	 *				 the next day, otherwise null.
	 */
	/*this.calcNextRiseSetTime = function (now, loc, indicator)
	{
		// Make a copy of the calendar to return.
		Calendar riseSetTime = Calendar.getInstance();
		double riseSetUt = calcRiseSetTime(now.getTime(), loc, indicator);
		// Early out if no nearby rise set time.
		if (riseSetUt < 0) {
			return null;
		}
		
		// Find the start of this day in the local time zone. The (a / b) * b
		// formulation looks weird, it's using the properties of int arithmetic
		// so that (a / b) is really floor(a / b).
		long dayStart = (now.getTimeInMillis() / TimeConstants.MILLISECONDS_PER_DAY)
										* TimeConstants.MILLISECONDS_PER_DAY - riseSetTime.get(Calendar.ZONE_OFFSET);
		long riseSetUtMillis = (long) (calcRiseSetTime(now.getTime(), loc, indicator)
																	* TimeConstants.MILLISECONDS_PER_HOUR);
		long newTime = dayStart + riseSetUtMillis + riseSetTime.get(Calendar.ZONE_OFFSET);
		// If the newTime is before the current time, go forward 1 day.
		if (newTime < now.getTimeInMillis()) {
			Log.d(TAG, "Nearest Rise/Set is in the past. Adding one day.");
			newTime += TimeConstants.MILLISECONDS_PER_DAY;
		}
		riseSetTime.setTimeInMillis(newTime);
		if (!riseSetTime.after(now)) {
			Log.e(TAG, "Next rise set time (" + riseSetTime.toString()
								 + ") should be after current time (" + now.toString() + ")");
		}
		return riseSetTime;
	};*/
};

var Planet = 
{
	Mercury: new PlanetObject(R.drawable.mercury, R.string.mercury, TimeConstants.MILLISECONDS_PER_DAY),
	Venus: new PlanetObject(R.drawable.venus, R.string.venus, TimeConstants.MILLISECONDS_PER_DAY),
	Sun: new PlanetObject(R.drawable.sun, R.string.sun, TimeConstants.MILLISECONDS_PER_DAY),
	Mars: new PlanetObject(R.drawable.mars, R.string.mars, TimeConstants.MILLISECONDS_PER_DAY),
	Jupiter: new PlanetObject(R.drawable.jupiter, R.string.jupiter, TimeConstants.MILLISECONDS_PER_WEEK),
	Saturn: new PlanetObject(R.drawable.saturn, R.string.saturn, TimeConstants.MILLISECONDS_PER_WEEK),
	Uranus: new PlanetObject(R.drawable.uranus, R.string.uranus, TimeConstants.MILLISECONDS_PER_WEEK),
	Neptune: new PlanetObject(R.drawable.neptune, R.string.neptune, TimeConstants.MILLISECONDS_PER_WEEK),
	Pluto: new PlanetObject(R.drawable.pluto, R.string.pluto, TimeConstants.MILLISECONDS_PER_WEEK),
	Moon: new PlanetObject(R.drawable.moon4, R.string.moon, TimeConstants.MILLISECONDS_PER_HOUR)
};


var PlanetValues = [];
for (var planet in Planet)
{
	PlanetValues.push(Planet[planet]);
}
Planet.values = function ()
{
	return PlanetValues;
};




// TODO(serafini): We need to correct the Ra/Dec for the user's location. The
// current calculation is probably accurate to a degree or two, but we can,
// and should, do better.
/**
 * Calculate the geocentric right ascension and declination of the moon using
 * an approximation as described on page D22 of the 2008 Astronomical Almanac
 * All of the variables in this method use the same names as those described
 * in the text: lambda = Ecliptic longitude (degrees) beta = Ecliptic latitude
 * (degrees) pi = horizontal parallax (degrees) r = distance (Earth radii)
 *
 * NOTE: The text does not give a specific time period where the approximation
 * is valid, but it should be valid through at least 2009.
 */
Planet.calculateLunarGeocentricLocation = function (time)
{
	// First, calculate the number of Julian centuries from J2000.0.
	var t = (TimeUtil.calculateJulianDay(time) - 2451545.0) / 36525.0;

	// Second, calculate the approximate geocentric orbital elements.
	var lambda =
		218.32 + 481267.881 * t + 6.29
			* Math.sin((135.0 + 477198.87 * t) * Geometry.DEGREES_TO_RADIANS) - 1.27
			* Math.sin((259.3 - 413335.36 * t) * Geometry.DEGREES_TO_RADIANS) + 0.66
			* Math.sin((235.7 + 890534.22 * t) * Geometry.DEGREES_TO_RADIANS) + 0.21
			* Math.sin((269.9 + 954397.74 * t) * Geometry.DEGREES_TO_RADIANS) - 0.19
			* Math.sin((357.5 + 35999.05 * t) * Geometry.DEGREES_TO_RADIANS) - 0.11
			* Math.sin((186.5 + 966404.03 * t) * Geometry.DEGREES_TO_RADIANS);
	var beta =
		5.13 * Math.sin((93.3 + 483202.02 * t) * Geometry.DEGREES_TO_RADIANS) + 0.28
			* Math.sin((228.2 + 960400.89 * t) * Geometry.DEGREES_TO_RADIANS) - 0.28
			* Math.sin((318.3 + 6003.15 * t) * Geometry.DEGREES_TO_RADIANS) - 0.17
			* Math.sin((217.6 - 407332.21 * t) * Geometry.DEGREES_TO_RADIANS);
	//var pi =
	//		0.9508f + 0.0518f * Math.cos((135.0f + 477198.87f * t) * Geometry.DEGREES_TO_RADIANS)
	//				+ 0.0095f * Math.cos((259.3f - 413335.36f * t) * Geometry.DEGREES_TO_RADIANS)
	//				+ 0.0078f * Math.cos((235.7f + 890534.22f * t) * Geometry.DEGREES_TO_RADIANS)
	//				+ 0.0028f * Math.cos((269.9f + 954397.74f * t) * Geometry.DEGREES_TO_RADIANS);
	// var r = 1.0f / Math.sin(pi * Geometry.DEGREES_TO_RADIANS);

	// Third, convert to RA and Dec.
	var l =
		Math.cos(beta * Geometry.DEGREES_TO_RADIANS)
			* Math.cos(lambda * Geometry.DEGREES_TO_RADIANS);
	var m =
		0.9175 * Math.cos(beta * Geometry.DEGREES_TO_RADIANS)
			* Math.sin(lambda * Geometry.DEGREES_TO_RADIANS) - 0.3978
			* Math.sin(beta * Geometry.DEGREES_TO_RADIANS);
	var n =
		0.3978 * Math.cos(beta * Geometry.DEGREES_TO_RADIANS)
			* Math.sin(lambda * Geometry.DEGREES_TO_RADIANS) + 0.9175
			* Math.sin(beta * Geometry.DEGREES_TO_RADIANS);
	var ra = Geometry.mod2pi(Math.atan2(m, l)) * Geometry.RADIANS_TO_DEGREES;
	var dec = Math.asin(n) * Geometry.RADIANS_TO_DEGREES;

	return new RaDec(ra, dec);
};


/**
 * Return the date of the next full moon after today.
 */
// TODO(serafini): This could also be error prone right around the time
// of the full and new moons...
/*Planet.getNextFullMoon = function (now)
{
	// First, get the moon's current phase.
	float phase = Moon.calculatePhaseAngle(now);

	// Next, figure out if the moon is waxing or waning.
	boolean isWaxing = false;
	Date later = new Date(now.getTime() + 1 * 3600 * 1000);
	float phase2 = Moon.calculatePhaseAngle(later);
	isWaxing = phase2 > phase;

	// If moon is waxing, next full moon is (180.0 - phase)/360.0 * 29.53.
	// If moon is waning, next full moon is (360.0 - phase)/360.0 * 29.53.
	final float LUNAR_CYCLE = 29.53f;	// In days.
	float baseAngle = (isWaxing ? 180.0f : 360.0f);
	float numDays = (baseAngle - phase) / 360.0f * LUNAR_CYCLE;

	return new Date(now.getTime() + (long) (numDays * 24.0 * 3600.0 * 1000.0));
};*/

/**
 * Return the date of the next full moon after today.
 * Slow incremental version, only correct to within an hour.
 */
/*Planet.getNextFullMoonSlow = function (now)
{
	Date fullMoon = new Date(now.getTime());
	float phase = Moon.calculatePhaseAngle(now);
	boolean waxing = false;
	
	while (true) {
		fullMoon.setTime(fullMoon.getTime() + TimeConstants.MILLISECONDS_PER_HOUR);
		float nextPhase = Moon.calculatePhaseAngle(fullMoon);
		if (waxing && nextPhase < phase) {
			fullMoon.setTime(fullMoon.getTime() - TimeConstants.MILLISECONDS_PER_HOUR);
			return fullMoon;
		}
		waxing = (nextPhase > phase);
		phase = nextPhase;
		Log.d(TAG, "Phase: " + phase + "\tDate:" + fullMoon);
	}
};*/

// Calculates the hour angle of a given declination for the given location.
// This is a helper application for the rise and set calculations. Its
// probably not worth using as a general purpose method.
// All values are in degrees.
//
// This method calculates the hour angle from the meridian using the
// following equation from the Astronomical Almanac (p487):
// cos ha = (sin alt - sin lat * sin dec) / (cos lat * cos dec)
/*Planet.calculateHourAngle = function (altitude, latitude, declination)
{
	float altRads = altitude * MathUtil.DEGREES_TO_RADIANS;
	float latRads = latitude * MathUtil.DEGREES_TO_RADIANS;
	float decRads = declination * MathUtil.DEGREES_TO_RADIANS;
	float cosHa = (Math.sin(altRads) - Math.sin(latRads) * Math.sin(decRads)) /
			(Math.cos(latRads) * Math.cos(decRads));

	return MathUtil.RADIANS_TO_DEGREES * Math.acos(cosHa);
};*/
