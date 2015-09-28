
var Geometry = {}


// Convert Degrees to Radians
Geometry.DEGREES_TO_RADIANS = Math.PI / 180.0;

// Convert Radians to Degrees
Geometry.RADIANS_TO_DEGREES = 180.0 / Math.PI;

/**
 * Return the integer part of a number
 */
Geometry.abs_floor = function (x)
{
	var result;
	if (x >= 0.0)
		result = Math.floor(x);
	else
		result = Math.ceil(x);
	return result;
}

/**
 * Returns the modulo the given value by 2\pi. Returns an angle in the range 0
 * to 2\pi radians.
 */
Geometry.mod2pi = function (x)
{
	var factor = x / (2 * Math.PI);
	var result = (2 * Math.PI) * (factor - Geometry.abs_floor(factor));
	if (result < 0.0)
	{
		result = (2 * Math.PI) + result;
	}
	return result;
}

Geometry.scalarProduct = function (v1, v2)
{
	return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

Geometry.vectorProduct = function (v1, v2)
{
	return new Vector3(v1.y * v2.z - v1.z * v2.y,
						-v1.x * v2.z + v1.z * v2.x,
						v1.x * v2.y - v1.y * v2.x);
}

/**
 * Scales the vector by the given amount
 */
Geometry.scaleVector = function (v, scale)
{
	return new Vector3 (scale * v.x, scale * v.y, scale * v.z);
}

/**
 * Creates and returns a new Vector3 which is the sum of both arguments.
 * @param first
 * @param second
 * @return vector sum first + second
 */
Geometry.addVectors = function (first, second)
{
	return new Vector3(first.x + second.x, first.y + second.y, first.z + second.z);
}

Geometry.cosineSimilarity = function (v1, v2)
{
	// We might want to optimize this implementation at some point.
	return scalarProduct(v1, v2)
		/ Math.sqrt(scalarProduct(v1, v1)
			* scalarProduct(v2, v2));
}

/**
 * Convert ra and dec to x,y,z where the point is place on the unit sphere.
 */
Geometry.getXYZ = function (raDec)
{
	var raRadians = raDec.ra * Geometry.DEGREES_TO_RADIANS;
	var decRadians = raDec.dec * Geometry.DEGREES_TO_RADIANS;
	var result = new GeocentricCoordinates(
		Math.cos(raRadians) * Math.cos(decRadians),
		Math.sin(raRadians) * Math.cos(decRadians),
		Math.sin(decRadians));
    return result;
  }

/**
 * Compute celestial coordinates of zenith from utc, lat long.
 */
Geometry.calculateRADecOfZenith = function (utc, location)
{
	// compute overhead RA in degrees
	var my_ra = TimeUtil.meanSiderealTime(utc, location.longitude);
	var my_dec = location.latitude;
	return new RaDec(my_ra, my_dec);
}

/**
 * Multiply two 3X3 matrices m1 * m2.
 */
Geometry.matrixMultiply = function (m1, m2)
{
	return new Matrix33(m1.xx*m2.xx + m1.xy*m2.yx + m1.xz*m2.zx,
						m1.xx*m2.xy + m1.xy*m2.yy + m1.xz*m2.zy,
						m1.xx*m2.xz + m1.xy*m2.yz + m1.xz*m2.zz,
						m1.yx*m2.xx + m1.yy*m2.yx + m1.yz*m2.zx,
						m1.yx*m2.xy + m1.yy*m2.yy + m1.yz*m2.zy,
						m1.yx*m2.xz + m1.yy*m2.yz + m1.yz*m2.zz,
						m1.zx*m2.xx + m1.zy*m2.yx + m1.zz*m2.zx,
						m1.zx*m2.xy + m1.zy*m2.yy + m1.zz*m2.zy,
						m1.zx*m2.xz + m1.zy*m2.yz + m1.zz*m2.zz);
}

/**
 * Calculate w = m * v where m is a 3X3 matrix and v a column vector.
 */
Geometry.matrixVectorMultiply = function (m, v)
{
	return new Vector3(m.xx*v.x + m.xy*v.y + m.xz*v.z,
						m.yx*v.x + m.yy*v.y + m.yz*v.z,
						m.zx*v.x + m.zy*v.y + m.zz*v.z);
}

/**
 * Calculate the rotation matrix for a certain number of degrees about the
 * give axis.
 * @param degrees
 * @param axis - must be a unit vector.
 */
Geometry.calculateRotationMatrix = function (degrees, axis)
{
	// Construct the rotation matrix about this vector
	var cosD = Math.cos(degrees * Geometry.DEGREES_TO_RADIANS);
	var sinD = Math.sin(degrees * Geometry.DEGREES_TO_RADIANS);
	var oneMinusCosD = 1 - cosD;

	var x = axis.x;
	var y = axis.y;
	var z = axis.z;

	var xs = x * sinD;
	var ys = y * sinD;
	var zs = z * sinD;

	var xm = x * oneMinusCosD;
	var ym = y * oneMinusCosD;
	var zm = z * oneMinusCosD;

	var xym = x * ym;
	var yzm = y * zm;
	var zxm = z * xm;

	var rotationMatrix = new Matrix33(x * xm + cosD, xym + zs, zxm - ys,
										xym - zs, y * ym+cosD, yzm + xs,
										zxm + ys, yzm - xs, z * zm + cosD);
	return rotationMatrix;
}

