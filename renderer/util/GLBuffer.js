
function GLBuffer(bufferType)
{
	var mBuffer = null;
	var mGLBufferID = -1;
	var mBufferType = bufferType;

	this.maybeRegenerateBuffer = function (gl, buffer)
	{
		if (buffer != mBuffer)
		{
			mBuffer = buffer;

			// Allocate the buffer ID if we don't already have one.
			if (mGLBufferID == -1)
			{
				mGLBufferID = gl.createBuffer();
			}
			
			gl.bindBuffer(mBufferType, mGLBufferID);
			gl.bufferData(mBufferType, buffer, gl.STATIC_DRAW);
		}
	}

	this.bind = function (gl, buffer)
	{
		this.maybeRegenerateBuffer(gl, buffer);
		gl.bindBuffer(mBufferType, mGLBufferID);
	};

	this.bindDynamic = function (gl, buffer)
	{
		if (mGLBufferID == -1)
		{
			mGLBufferID = gl.createBuffer();
		}

		gl.bindBuffer(mBufferType, mGLBufferID);
		gl.bufferData(mBufferType, buffer, gl.DYNAMIC_DRAW);
	};

	this.reload = function ()
	{
		mBuffer = null;
		mGLBufferID = -1;
	};
}

GLBuffer.canUseVBO = function ()
{
	return true;
};

GLBuffer.unbind = function ()
{
};
