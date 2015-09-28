
function TexCoordBuffer (a, b)
{
	var mNumVertices = 0;
	var mUseVBO = false;
	if (a != undefined)
	{
		if (b != undefined)
		{
			mNumVertices = a;
			mUseVBO = b;
		}
		else if (a.constructor == Boolean)
		{
			mUseVBO = a;
		}
		else
		{
			mNumVertices = a;
		}
	}

	var mGLBuffer = new GLBuffer(gl.ARRAY_BUFFER);

	var mTexCoordBuffer = null;
	var mIndex = 0;

	this.regenerateBuffer = function ()
	{
		if (mNumVertices == 0)
		{
			return;
		}

		mTexCoordBuffer = new Float32Array(mNumVertices * 2);
		mIndex = 0;
	}

	this.size = function ()
	{
		return mNumVertices;
	};
	
	this.reset = function (numVertices)
	{
		mNumVertices = numVertices;
		this.regenerateBuffer();
	};

	this.reload = function ()
	{
		mGLBuffer.reload();
	};

	this.addTexCoords = function (x, y)
	{
		mTexCoordBuffer[mIndex++] = x;
		mTexCoordBuffer[mIndex++] = y;
	};

	this.set = function (gl)
	{
		if (mNumVertices == 0)
		{
			return;
		}

		mIndex = 0;

		if (mUseVBO && GLBuffer.canUseVBO())
		{
			mGLBuffer.bind(gl, mTexCoordBuffer);
		}
		else
		{
			mGLBuffer.bindDynamic(gl, mTexCoordBuffer);
		}
	};

	if (mNumVertices > 0)
	{
		this.reset(mNumVertices);
	}
}
