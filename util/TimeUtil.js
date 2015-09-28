
TimeUtil = {};


/**
 * Calculate the number of Julian Centuries from the epoch 2000.0
 * (equivalent to Julian Day 2451545.0).
 */
TimeUtil.julianCenturies = function (date)
{
	var jd = TimeUtil.calculateJulianDay(date);
	var delta = jd - 2451545.0;
	return delta/36525.0;
}

/**
 * Calculate the Julian Day for a given date using the following formula:
 * JD = 367 * Y - INT(7 * (Y + INT((M + 9)/12))/4) + INT(275 * M / 9)
 *      + D + 1721013.5 + UT/24
 *
 * Note that this is only valid for the year range 1900 - 2099.
 */
TimeUtil.calculateJulianDay = function (date)
{
	var hour = date.getUTCHours()
		+ date.getUTCMinutes()/60.0
		+ date.getUTCSeconds()/3600.0;

	var year = date.getUTCFullYear();
	var month = date.getUTCMonth() + 1;
	var day = date.getUTCDate();

	var jd = 367.0 * year - Math.floor(7.0 * (year
			+ Math.floor((month + 9.0) / 12.0)) / 4.0)
			+ Math.floor(275.0 * month / 9.0) + day
			+ 1721013.5 + hour/24.0;
	return jd;
}

/**
 * Convert the given Julian Day to Gregorian Date (in UT time zone).
 * Based on the formula given in the Explanitory Supplement to the
 * Astronomical Almanac, pg 604.
 */
TimeUtil.calculateGregorianDate = function (jd)
{
	var l = Math.trunc(jd) + 68569;
	var n = (4 * l) / 146097;
	l = l - (146097 * n + 3) / 4;
	var i = (4000 * (l + 1)) / 1461001;
	l = l - (1461 * i) / 4 + 31;
	var j =(80 * l) / 2447;
	var d = l - (2447 * j) / 80;
	l = j / 11;
	var m = j + 2 - 12 * l;
	var y = 100 * (n - 49) + i + l;

	var fraction = jd - Math.floor(jd);
	var dHours = fraction * 24.0;
	var hours = Math.trunc(dHours);
	var dMinutes = (dHours - hours) * 60.0;
	var minutes = Math.trunc(dMinutes);
	var seconds = Math.trunc((dMinutes - minutes) * 60.0);

	var cal = Calendar.getInstance(TimeZone.getTimeZone("UT"));
	cal.set(y, m - 1, d, hours + 12, minutes, seconds);
	return cal.getTime();
}

/**
 * Calculate local mean sidereal time in degrees. Note that longitude is
 * negative for western longitude values.
 */
TimeUtil.meanSiderealTime = function (date,longitude)
{
	// First, calculate number of Julian days since J2000.0.
	var jd = TimeUtil.calculateJulianDay(date);
	var delta = jd - 2451545;

	// Calculate the global and local sidereal times
	var gst = 280.461 + 360.98564737 * delta;
	var lst = TimeUtil.normalizeAngle(gst + longitude);

	return lst;
}

/**
 * Normalize the angle to the range 0 <= value < 360.
 */
TimeUtil.normalizeAngle = function (angle)
{
	var remainder = angle % 360;
	if (remainder < 0) remainder += 360;
	return remainder;
}

/**
 * Normalize the time to the range 0 <= value < 24.
 */
TimeUtil.normalizeHours = function (time)
{
	var remainder = time % 24;
	if (remainder < 0) remainder += 24;
	return remainder;
}

/**
 * Take a universal time between 0 and 24 and return a triple
 * [hours, minutes, seconds].
 * 
 * @param ut Universal time - presumed to be between 0 and 24.
 * @return [hours, minutes, seconds]
 */
TimeUtil.clockTimeFromHrs = function (ut)
{
	var hms = [];
	hms[0] = Math.trunc(Math.floor(ut));
	var remainderMins = 60 * (ut - hms[0]);
	hms[1] = Math.trunc(Math.floor(remainderMins));
	hms[2] = Math.trunc(Math.floor(remainderMins - hms[1]));
	return hms;
}
