function NightVisionColorBuffer (a)
{
	var mNormalBuffer = new ColorBuffer(a);
	var mRedBuffer = new ColorBuffer(a);

	this.size = function () 
	{
		return mNormalBuffer.size();
	};

	this.reset = function (numVertices) 
	{
		mNormalBuffer.reset(numVertices);
		mRedBuffer.reset(numVertices);
	};

	// Call this when we have to re-create the surface and reloading all OpenGL resources.
	this.reload = function () 
	{
		mNormalBuffer.reload();
		mRedBuffer.reload();
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
		mNormalBuffer.addColor(a, r, g, b);
		// I tried luminance here first, but many objects we care a lot about weren't very noticable because they were
		// bluish.  An average gets a better result.
		var avg = (r + g + b) / 3;
		mRedBuffer.addColor(a, avg, 0, 0);
	};

	this.set = function (gl, nightVisionMode) 
	{
		if (nightVisionMode)
		{
			mRedBuffer.set(gl);
		}
		else
		{
			mNormalBuffer.set(gl);
		}
	};
}
