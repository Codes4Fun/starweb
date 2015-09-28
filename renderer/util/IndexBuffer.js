function IndexBuffer(a, b)
{
	var mIndexBuffer = null;
	var mIndex = 0;
	var mNumIndices = 0;
	var mGLBuffer = new GLBuffer(gl.ELEMENT_ARRAY_BUFFER);
	var mUseVbo = false;

	this.size = function () 
	{
		return mNumIndices;
	};

	this.reset = function (numVertices) 
	{
		mNumIndices = numVertices;
		this.regenerateBuffer();
	};

	// Call this when we have to re-create the surface and reloading all OpenGL resources.
	this.reload = function () 
	{
		mGLBuffer.reload();
	};

	this.regenerateBuffer = function () 
	{
		if (mNumIndices == 0) 
		{
			return;
		}

		mIndex = 0;
		mIndexBuffer = new Uint16Array(mNumIndices);
	};

	this.addIndex = function (index) 
	{
		mIndexBuffer[mIndex++] = index;
	};

	this.draw = function (gl, primitiveType) 
	{
		if (mNumIndices == 0) 
		{
			return;
		}
		mIndex = 0;
		if (mUseVbo && GLBuffer.canUseVBO()) 
		{
			mGLBuffer.bind(gl, mIndexBuffer);
			gl.drawElements(primitiveType, this.size(), gl.UNSIGNED_SHORT, 0);
		}
		else 
		{
			mGLBuffer.bindDynamic(gl, mIndexBuffer);
			gl.drawElements(primitiveType, this.size(), gl.UNSIGNED_SHORT, 0);
		}
	};

	if (a != undefined)
	{
		if (a.constructor == Number)
		{
			if (b != undefined)
			{
				mUseVbo = b;
			}
			this.reset(a);
		}
		else
		{
			mUseVbo = a;
		}
	}
}
