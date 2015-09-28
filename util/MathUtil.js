/**
 * Methods for doing mathematical operations with floats.
 *
 * @author Brent Bryan
 */
var MathUtil = {};

MathUtil.PI = Math.PI;
MathUtil.TWO_PI = 2 * Math.PI;
MathUtil.DEGREES_TO_RADIANS = Math.PI / 180;
MathUtil.RADIANS_TO_DEGREES = 180 / Math.PI;

MathUtil.abs = function (x) 
{
	return Math.abs(x);
};

MathUtil.sqrt = function (x) 
{
	return Math.sqrt(x);
};

MathUtil.floor = function (x) 
{
	return Math.floor(x);
};

MathUtil.ceil = function (x) 
{
	return Math.ceil(x);
};

MathUtil.sin = function (x) 
{
	return Math.sin(x);
};

MathUtil.cos = function (x) 
{
	return Math.cos(x);
};

MathUtil.tan = function (x) 
{
	return Math.sin(x) / Math.cos(x);
};

MathUtil.asin = function (x) 
{
	return Math.asin(x);
};

MathUtil.acos = function (x) 
{
	return Math.acos(x);
};

MathUtil.atan = function (x) 
{
	return Math.atan(x);
};

MathUtil.atan2 = function (y, x) 
{
	return Math.atan2(y, x);
};

MathUtil.log10 = function (x) 
{
	return Math.log10(x);
};

/**
* Returns x if x <= y, or x-y if not. While this utility performs a role similar to a modulo
* operation, it assumes x >=0 and that x < 2y.
*/
MathUtil.quickModulo = function (x, y) 
{
	if (x > y) return x - y;
	return x;
};

/**
* Returns a random number between 0 and f.
*/
MathUtil.random = function (f) 
{
	return Math.random() * f;
};

MathUtil.pow = function (x, exponent) 
{
	return Math.pow(x, exponent);
};
