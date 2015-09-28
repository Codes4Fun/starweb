
function OrbitalElements (d, e, i, a, p, l)
{
	this.distance = d;
	this.eccentricity = e;
	this.inclination = i;
	this.ascendingNode = a;
	this.perihelion = p;
	this.meanLongitude = l;
	
	this.getAnomaly = function ()
	{
		return OrbitalElements.calculateTrueAnomaly(this.meanLongitude - this.perihelion, this.eccentricity);
	}

}


// compute the true anomaly from mean anomaly using iteration
// m - mean anomaly in radians
// e - orbit eccentricity
// Return value is in radians.
OrbitalElements.calculateTrueAnomaly = function (m, e)
{
	// initial approximation of eccentric anomaly
	var e0 = m + e * Math.sin(m) * (1.0 + e * Math.cos(m));
	var e1;

	var EPSILON = 1.0e-6;

	// iterate to improve accuracy
	var counter = 0;
	do {
		e1 = e0;
		e0 = e1 - (e1 - e * Math.sin(e1) - m) / (1.0 - e * Math.cos(e1));
		if (counter++ > 100) {
			Log.d(TAG, "Failed to converge! Exiting.");
			Log.d(TAG, "e1 = " + e1 + ", e0 = " + e0);
			Log.d(TAG, "diff = " + Math.abs(e0 - e1));
			break;
		}
	} while (Math.abs(e0 - e1) > EPSILON);

	// convert eccentric anomaly to true anomaly
	var v =
		2 * Math.atan(Math.sqrt((1 + e) / (1 - e))
			* Math.tan(0.5 * e0));
	return Geometry.mod2pi(v);
};
