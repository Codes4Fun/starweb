
var VectorUtil = { }

VectorUtil.zero = function ()
{
	return new Vector3(0, 0, 0);
};

VectorUtil.dotProduct = function (p1, p2)
{
	return p1.x * p2.x + p1.y * p2.y + p1.z * p2.z;
};

VectorUtil.crossProduct = function (p1, p2)
{
	return new Vector3(p1.y * p2.z - p1.z * p2.y,
						-p1.x * p2.z + p1.z * p2.x,
						 p1.x * p2.y - p1.y * p2.x);
};

VectorUtil.angleBetween = function (p1, p2)
{
	return Math.acos(VectorUtil.dotProduct(p1, p2) / (VectorUtil.length(p1) * VectorUtil.length(p2))); 
};

VectorUtil.length = function (v)
{
	return Math.sqrt(VectorUtil.lengthSqr(v));
};

VectorUtil.lengthSqr = function (v)
{
	return VectorUtil.dotProduct(v, v);
};

VectorUtil.normalized = function (v)
{
	var len = VectorUtil.length(v);
	if (len < 0.000001)
	{
		return VectorUtil.zero();
	}
	return VectorUtil.scale(v, 1.0 / len);
};

VectorUtil.project = function (v, onto)
{
	return scale(VectorUtil.dotProduct(v, onto) / VectorUtil.length(onto), onto); 
};

VectorUtil.projectOntoUnit = function (v, onto)
{
	return VectorUtil.scale(VectorUtil.dotProduct(v, onto), onto); 
};

VectorUtil.projectOntoPlane = function (v, unitNormal)
{
	return VectorUtil.difference(v, VectorUtil.projectOntoUnit(v, unitNormal)); 
};

VectorUtil.negate = function (v)
{
	return new Vector3(-v.x, -v.y, -v.z);
};

VectorUtil.sum = function (v1, v2)
{
	return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
};

VectorUtil.difference = function (v1, v2)
{
	return VectorUtil.sum(v1, VectorUtil.negate(v2));
};
	
VectorUtil.scale = function (a, b)
{
	var factor;
	var v;
	if (a.constructor == Number)
	{
		factor = a;
		v = b;
	}
	else
	{
		factor = b;
		v = a;
	}
	return new Vector3(v.x * factor, v.y * factor, v.z * factor);
};
