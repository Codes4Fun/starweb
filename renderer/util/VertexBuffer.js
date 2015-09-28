
function VertexBuffer (a, b)
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

	var mPositionBuffer = null;
	var mIndex = 0;

	this.regenerateBuffer = function ()
	{
		if (mNumVertices == 0)
		{
			return;
		}

		mPositionBuffer = new Float32Array(mNumVertices * 3);
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

	this.addPoint = function (x, y, z)
	{
		if (x.constructor == Vector3)
		{
			mPositionBuffer[mIndex++] = x.x;
			mPositionBuffer[mIndex++] = x.y;
			mPositionBuffer[mIndex++] = x.z;
			return;
		}
		mPositionBuffer[mIndex++] = x;
		mPositionBuffer[mIndex++] = y;
		mPositionBuffer[mIndex++] = z;
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
			mGLBuffer.bind(gl, mPositionBuffer);
		}
		else
		{
			mGLBuffer.bindDynamic(gl, mPositionBuffer);
		}
	};

	if (mNumVertices > 0)
	{
		this.reset(mNumVertices);
	}
}
