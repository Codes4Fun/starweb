
function TextureManager(res)
{
	var mRes = res;
	var mResourceIdToTextureMap = {};
	var mAllTextures = [];

	function TextureReferenceImpl(id)
	{
		var mTextureID = id;
		var mValid = true;

		this.bind = function (gl)
		{
			this.checkValid();
			gl.bindTexture(gl.TEXTURE_2D, mTextureID);
		};

		this.delete = function (gl)
		{
			this.checkValid();
			gl.deleteTexture(mTextureID);
			this.invalidate();
		};

		this.invalidate = function ()
		{
			mValid = false;
		};
		
		this.checkValid = function ()
		{
			if (!mValid)
			{
				Log.e("TextureManager", "Setting invalidated texture ID: " + mTextureID);
				var stack = (new Error()).stack;
				Log.e("TextureManager", stack);
			}
		}
	}

	this.createTextureInternal = function (gl)
	{
		var gltex = gl.createTexture();
		var tex = new TextureReferenceImpl(gltex);
		mAllTextures.push(tex);
		return tex;
	}

	this.createTextureFromResource = function (gl, resourceID)
	{
		// The texture hasn't been loaded yet, so load it.
		var tex = this.createTextureInternal(gl);
		mRes.loadImage(resourceID, function (img)
		{
			tex.bind(gl);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			try
			{
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			}
			catch (e)
			{
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,0,255,255]));
			}
		});

		return tex;
	}

	this.createTexture = function (gl)
	{
		return this.createTextureInternal(gl);
	};

	this.getTextureFromResource = function (gl, resourceID)
	{
		var texData = mResourceIdToTextureMap[resourceID];
		if (texData != null)
		{
			texData.refCount++;
			return texData.ref;
		}

		var tex = this.createTextureFromResource(gl, resourceID);

		// Add it to the map
		var data = {};
		data.ref = tex;
		data.refCount = 1;
		mResourceIdToTextureMap[resourceID] = data;

		return tex;
	};

	this.reset = function ()
	{
		mResourceIdToTextureMap = {};
		for (var i = 0; i < mAllTextures.length; i++)
		{
			mAllTextures[i].invalidate();
		}
		mAllTextures = [];
	}
}


