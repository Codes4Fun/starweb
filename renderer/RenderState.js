

function RenderState()
{
	var mCameraPos = new GeocentricCoordinates(0, 0, 0);
	var mLookDir = new GeocentricCoordinates(1, 0, 0);
	var mUpDir = new GeocentricCoordinates(0, 1, 0);
	var mRadiusOfView = 45;	// in degrees
	var mUpAngle = 0;
	var mCosUpAngle = 1;
	var mSinUpAngle = 0;
	var mScreenWidth = 100;
	var mScreenHeight = 100;
	var mTransformToDevice = Matrix4x4.createIdentity();
	var mTransformToScreen = Matrix4x4.createIdentity();
	var mRes;
	var mNightVisionMode = false;
	var mActiveSkyRegionSet = null;

	var mTextureShader = null;
	var mColorVertexShader = null;
	var mTCVShader = null;

	this.getCameraPos = function ()
	{
		return mCameraPos;
	};

	this.getLookDir = function ()
	{
		return mLookDir;
	};

	this.getUpDir = function ()
	{
		return mUpDir;
	};

	this.getRadiusOfView = function ()
	{
		return mRadiusOfView;
	};

	this.getUpAngle = function ()
	{
		return mUpAngle;
	};

	this.getCosUpAngle = function ()
	{
		return mCosUpAngle;
	};

	this.getSinUpAngle = function ()
	{
		return mSinUpAngle;
	};

	this.getScreenWidth = function ()
	{
		return mScreenWidth;
	};

	this.getScreenHeight = function ()
	{
		return mScreenHeight;
	};

	this.getTransformToDeviceMatrix = function ()
	{
		return mTransformToDevice;
	};

	this.getTransformToScreenMatrix = function ()
	{
		return mTransformToScreen;
	};

	this.getResources = function ()
	{
		return mRes;
	};

	this.getNightVisionMode = function ()
	{
		return mNightVisionMode;
	};

	this.getActiveSkyRegions = function ()
	{
		return mActiveSkyRegionSet;
	};


	this.setCameraPos = function (pos)
	{
		mCameraPos = pos.copy();
	};

	this.setLookDir = function (dir)
	{
		mLookDir = dir.copy();
	};

	this.setUpDir = function (dir)
	{
		mUpDir = dir.copy();
	};

	this.setRadiusOfView = function (radius)
	{
		mRadiusOfView = radius;
	};

	this.setUpAngle = function (angle)
	{
		mUpAngle = angle;
		mCosUpAngle = FloatMath.cos(angle);
		mSinUpAngle = FloatMath.sin(angle);
	};

	this.setScreenSize = function (width, height)
	{
		mScreenWidth = width;
		mScreenHeight = height;
	};

	this.setTransformToDeviceMatrix = function (transformToDevice)
	{
		mTransformToDevice = transformToDevice;
	};

	this.setTransformationMatrices = function (transformToDevice, transformToScreen)
	{
		mTransformToDevice = transformToDevice;
		mTransformToScreen = transformToScreen;
	};

	this.setResources = function (res)
	{
		mRes = res;
	};

	this.setNightVisionMode = function (enabled)
	{
		mNightVisionMode = enabled;
	};

	this.setActiveSkyRegions = function (set)
	{
		mActiveSkyRegionSet = set;
	};

	this.getTextureShader = function ()
	{
		return mTextureShader;
	}
	this.setTextureShader = function (shader)
	{
		mTextureShader = shader;
	}

	this.getColorVertexShader = function ()
	{
		return mColorVertexShader;
	}
	this.setColorVertexShader = function (shader)
	{
		mColorVertexShader = shader;
	}

	this.getTCVShader = function ()
	{
		return mTCVShader;
	}
	this.setTCVShader = function (shader)
	{
		mTCVShader = shader;
	}
}


