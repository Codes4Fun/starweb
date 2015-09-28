
function HeliocentricCoordinates(radius, xh, yh, zh)
{
	// Value of the obliquity of the ecliptic for J2000
	var OBLIQUITY = 23.439281 * 3.141593/180;//Geometry.DEGREES_TO_RADIANS;

	if (radius == undefined)
	{
		this.radius = 0;
		this.x = 0;
		this.y = 0;
		this.z = 0;
	}
	else if (radius.constructor == Number)
	{
		this.radius = radius;
		this.x = xh;
		this.y = yh;
		this.z = zh;
	}
	else if (radius.constructor == HeliocentricCoordinates)
	{
		this.radius = radius.radius;
		this.x = radius.xh;
		this.y = radius.yh;
		this.z = radius.zh;
	}
	else
	{
		this.radius = 0;
		this.x = 0;
		this.y = 0;
		this.z = 0;
	}
	
	this.Subtract = function (other)
	{
		this.x -= other.x;
		this.y -= other.y;
		this.z -= other.z;
	}

	this.CalculateEquatorialCoordinates = function()
	{
		return new HeliocentricCoordinates(this.radius,
			this.x,
			this.y * Math.cos(OBLIQUITY) - this.z * Math.sin(OBLIQUITY),
			this.y * Math.sin(OBLIQUITY) + this.z * Math.cos(OBLIQUITY));
	}

	this.DistanceFrom = function (other)
	{
		var dx = this.x - other.x;
		var dy = this.y - other.y;
		var dz = this.z - other.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}
}


HeliocentricCoordinates.getInstance = function (planet, date)
{
	var elem;
	if (date != undefined)
	{
		elem = planet.getOrbitalElements(date);
	}
	else
	{
		elem = planet;
	}

   	var anomaly = elem.getAnomaly();
   	var ecc = elem.eccentricity;
   	var radius = elem.distance * (1 - ecc * ecc) / (1 + ecc * Math.cos(anomaly));

	// heliocentric rectangular coordinates of planet
   	var per = elem.perihelion;
   	var asc = elem.ascendingNode;
   	var inc = elem.inclination;
   	var xh = radius *
		(Math.cos(asc) * Math.cos(anomaly + per - asc) -
		Math.sin(asc) * Math.sin(anomaly + per - asc) *
		Math.cos(inc));
   	var yh = radius *
		(Math.sin(asc) * Math.cos(anomaly + per - asc) +
		Math.cos(asc) * Math.sin(anomaly + per - asc) *
		Math.cos(inc));
   	var zh = radius * (Math.sin(anomaly + per - asc) * Math.sin(inc));

	return new HeliocentricCoordinates(radius, xh, yh, zh);
}

