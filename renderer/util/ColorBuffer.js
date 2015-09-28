function ColorBuffer (a)
{
	var mColorBuffer = null;
	var mIndex = 0;
	var mNumVertices;
	var mGLBuffer = new GLBuffer(gl.ARRAY_BUFFER);
	var mUseVBO;

	this.size = function () 
	{
		return mNumVertices;
	};

	this.reset = function (numVertices) 
	{
		mNumVertices = numVertices;
		this.regenerateBuffer();
	};

	// Call this when we have to re-create the surface and reloading all OpenGL resources.
	this.reload = function () 
	{
		mGLBuffer.reload();
	};

	this.addColor = function (a, r, g, b)
	{
		if (r == undefined)
		{
			r = (a&0xff)/255;
			g = ((a>>8)&0xff)/255;
			b = ((a>>16)&0xff)/255;
			a = ((a>>24)&0xff)/255;
		}
		mColorBuffer[mIndex++] = r;
		mColorBuffer[mIndex++] = g;
		mColorBuffer[mIndex++] = b;
		mColorBuffer[mIndex++] = a;
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
			mGLBuffer.bind(gl, mColorBuffer);
		}
		else 
		{
			mGLBuffer.bindDynamic(gl, mColorBuffer);
		}
	};

	this.regenerateBuffer = function () 
	{
		if (mNumVertices == 0) 
		{
			return;
		}

		mColorBuffer = new Float32Array(4 * mNumVertices);
		mIndex = 0;
	};

	if (a != undefined)
	{
		if (a.constructor == Number)
		{
			this.reset(a);
		}
		else
		{
			mNumVertices = 0;
			mUseVBO = a;
		}
	}
	else
	{
		mNumVertices = 0;
	}
}
