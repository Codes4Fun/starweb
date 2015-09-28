
function Matrix4x4 (contents)
{
	var mValues = new Float32Array(16);

	if (contents != undefined)
	{
		//assert(contents.length == 16);
		for (var i = 0; i < 16; ++i) 
		{
			mValues[i] = contents[i];
		}
	}

	this.getFloatArray = function () 
	{
		return mValues;
	};
}

Matrix4x4.createIdentity = function () 
{
	return this.createScaling(1, 1, 1);
};

Matrix4x4.createScaling = function (x, y, z) 
{
	return new Matrix4x4([
		x, 0, 0, 0,
		0, y, 0, 0,
		0, 0, z, 0,
		0, 0, 0, 1]);
};

Matrix4x4.createTranslation = function (x, y, z) 
{
	return new Matrix4x4([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		x, y, z, 1]);
};

// axis MUST be normalized.
Matrix4x4.createRotation = function (angle, axis) 
{
	var m = [];

	var xSqr = axis.x * axis.x;
	var ySqr = axis.y * axis.y;
	var zSqr = axis.z * axis.z;

	var sinAngle = Math.sin(angle);

	var cosAngle = Math.cos(angle);
	var oneMinusCosAngle = 1 - cosAngle;

	var xSinAngle = axis.x * sinAngle;
	var ySinAngle = axis.y * sinAngle;
	var zSinAngle = axis.z * sinAngle;

	var zOneMinusCosAngle = axis.z * oneMinusCosAngle;

	var xyOneMinusCosAngle = axis.x * axis.y * oneMinusCosAngle;
	var xzOneMinusCosAngle = axis.x * zOneMinusCosAngle;
	var yzOneMinusCosAngle = axis.y * zOneMinusCosAngle;

	m[0] = xSqr + (ySqr + zSqr) * cosAngle;
	m[1] = xyOneMinusCosAngle + zSinAngle;
	m[2] = xzOneMinusCosAngle - ySinAngle;
	m[3] = 0;

	m[4] = xyOneMinusCosAngle - zSinAngle;
	m[5] = ySqr + (xSqr + zSqr) * cosAngle;
	m[6] = yzOneMinusCosAngle + xSinAngle;
	m[7] = 0;

	m[8] = xzOneMinusCosAngle + ySinAngle;
	m[9] = yzOneMinusCosAngle - xSinAngle;
	m[10] = zSqr + (xSqr + ySqr) * cosAngle;
	m[11] = 0;

	m[12] = 0;
	m[13] = 0;
	m[14] = 0;
	m[15] = 1;

	return new Matrix4x4(m);
};

Matrix4x4.createPerspectiveProjection = function (width, height, fovyInRadians) 
{
	var near = 0.01;
	var far = 10000.0;

	var inverseAspectRatio = height / width;

	var oneOverTanHalfRadiusOfView = 1.0 / Math.tan(fovyInRadians);

	return new Matrix4x4([
		inverseAspectRatio * oneOverTanHalfRadiusOfView,
		0,
		0,
		0,

		0,
		oneOverTanHalfRadiusOfView,
		0,
		0,

		0,
		0,
		-(far + near) / (far - near),
		-1,

		0,
		0,
		-2*far*near / (far - near),
		0]);
};

Matrix4x4.createFOVProjection = function (fov)
{
	var zNear = 0.01;
	var zFar = 10000.0;

	var upTan = Math.tan(fov.upDegrees * Math.PI/180.0);
	var downTan = Math.tan(fov.downDegrees * Math.PI/180.0);
	var leftTan = Math.tan(fov.leftDegrees * Math.PI/180.0);
	var rightTan = Math.tan(fov.rightDegrees * Math.PI/180.0);
	var xScale = 2.0 / (leftTan + rightTan);
	var yScale = 2.0 / (upTan + downTan);

	return new Matrix4x4([
		xScale,
		0.0,
		0.0,
		0.0,

		0.0,
		yScale,
		0.0,
		0.0,

		-((leftTan - rightTan) * xScale * 0.5),
		((upTan - downTan) * yScale * 0.5),
		-(zNear + zFar) / (zFar - zNear),
		-1.0,

		0.0,
		0.0,
		-(2.0 * zFar * zNear) / (zFar - zNear),
		0.0]);
}

Matrix4x4.createView = function (lookDir, up, right) 
{
	return new Matrix4x4([ 
		right.x,
		up.x,
		-lookDir.x,
		0,

		right.y,
		up.y,
		-lookDir.y,
		0,

		right.z,
		up.z,
		-lookDir.z,
		0,

		0,
		0,
		0,
		1,]);
};

Matrix4x4.multiplyMM = function (mat1, mat2) 
{
	var m = mat1.getFloatArray();
	var n = mat2.getFloatArray();

	return new Matrix4x4([
		m[0]*n[0] + m[4]*n[1] + m[8]*n[2] + m[12]*n[3],
		m[1]*n[0] + m[5]*n[1] + m[9]*n[2] + m[13]*n[3],
		m[2]*n[0] + m[6]*n[1] + m[10]*n[2] + m[14]*n[3],
		m[3]*n[0] + m[7]*n[1] + m[11]*n[2] + m[15]*n[3],

		m[0]*n[4] + m[4]*n[5] + m[8]*n[6] + m[12]*n[7],
		m[1]*n[4] + m[5]*n[5] + m[9]*n[6] + m[13]*n[7],
		m[2]*n[4] + m[6]*n[5] + m[10]*n[6] + m[14]*n[7],
		m[3]*n[4] + m[7]*n[5] + m[11]*n[6] + m[15]*n[7],

		m[0]*n[8] + m[4]*n[9] + m[8]*n[10] + m[12]*n[11],
		m[1]*n[8] + m[5]*n[9] + m[9]*n[10] + m[13]*n[11],
		m[2]*n[8] + m[6]*n[9] + m[10]*n[10] + m[14]*n[11],
		m[3]*n[8] + m[7]*n[9] + m[11]*n[10] + m[15]*n[11],

		m[0]*n[12] + m[4]*n[13] + m[8]*n[14] + m[12]*n[15],
		m[1]*n[12] + m[5]*n[13] + m[9]*n[14] + m[13]*n[15],
		m[2]*n[12] + m[6]*n[13] + m[10]*n[14] + m[14]*n[15],
		m[3]*n[12] + m[7]*n[13] + m[11]*n[14] + m[15]*n[15]]);
};

Matrix4x4.multiplyMV = function (mat, v) 
{
	var m = mat.getFloatArray();
	return new Vector3(
		m[0]*v.x + m[4]*v.y + m[8]*v.z + m[12],
		m[1]*v.x + m[5]*v.y + m[9]*v.z + m[13],
		m[2]*v.x + m[6]*v.y + m[10]*v.z + m[14]);
};

/**
* Used to perform a perspective transformation.  This multiplies the given
* vector by the matrix, but also divides the x and y components by the w
* component of the result, as needed when doing perspective projections.
*/
Matrix4x4.transformVector = function (mat, v) 
{
	var trans = multiplyMV(mat, v);
	var m = mat.getFloatArray();
	var w = m[3]*v.x + m[7]*v.y + m[11]*v.z + m[15];
	var oneOverW = 1.0 / w;
	trans.x *= oneOverW;
	trans.y *= oneOverW;
	// Don't transform z, we just leave it as a "pseudo-depth".
	return trans;
};

