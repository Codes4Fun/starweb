
function RendererObjectManager(layer, textureManager)
{
	var mLayer = layer;
	var mTextureManager = textureManager;
	var mIndex = RendererObjectManager.sIndex++;

	var mEnabled = true;
	var mRenderState = null;
	var mListener = null;
	var mMaxRadiusOfView = 360;

	this.enable = function (enable)
	{
		mEnabled = enable;
	};

	this.setMaxRadiusOfView = function (radiusOfView)
	{
		mMaxRadiusOfView = radiusOfView;
	};

	this.compareTo = function (rom)
	{
		if (this.constructor != rom.constructor)
		{
			return this.constructor.name < rom.constructor.name ? -1 : 1;
		}
		if (mIndex < rom.mIndex)
		{
			return -1;
		}
		else if (mIndex == rom.mIndex)
		{
			return 0;
		}
		else
		{
			return 1;
		}
	};

	this.getLayer = function ()
	{
		return mLayer;
	};

	this.draw = function (gl)
	{
		if (mEnabled && mRenderState.getRadiusOfView() <= mMaxRadiusOfView)
		{
			this.drawInternal(gl);
		}
	};
	this.setRenderState = function (state)
	{
		mRenderState = state;
	};

	this.getRenderState = function ()
	{
		return mRenderState;
	};

	this.setUpdateListener = function (listener)
	{
		mListener = listener;
	};

	// Notifies the renderer that the manager must be reloaded before the next time it is drawn.
	this.queueForReload = function (fullReload)
	{
		mListener.queueForReload(this, fullReload);
	};

	this.logUpdateMismatch = function (managerType, expectedLength, actualLength, type)
	{
		Log.e("ImageObjectManager",
			"Trying to update objects in " + managerType + ", but number of input sources was "
			+ "different from the number currently set on the manager (" + actualLength
			+ " vs " + expectedLength + "\n"
			+ "Update options were: " + type + "\n"
			+ "Ignoring update");
	};

	this.textureManager = function ()
	{
		return mTextureManager;
	};
}

// Used to distinguish between different renderers, so we can have sets of them.
RendererObjectManager.sIndex = 0;

