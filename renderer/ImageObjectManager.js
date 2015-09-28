
function ImageObjectManager(layer, textureManager)
{
	RendererObjectManager.call(this, layer, textureManager);

	var mVertexBuffer = new VertexBuffer(false);
	var mTexCoordBuffer = new TexCoordBuffer(false);
	var mImages = [];
	var mTextures	= [];

	var mUpdates = {};

	this.updateObjects = function (imageSources, type)
	{
		if (!type.Reset && imageSources.length != mImages.length)
		{
			this.logUpdateMismatch("ImageObjectManager", imageSources.length, mImages.length, type);
			return;
		}
		for (var t in type) mUpdates[t] = true;

		var numVertices = imageSources.length * 4;
		var vertexBuffer = mVertexBuffer;
		vertexBuffer.reset(numVertices);

		var texCoordBuffer = mTexCoordBuffer;
		texCoordBuffer.reset(numVertices);

		var images = [];
		var reset = type.Reset == true || type.UpdateImages == true;
		if (!reset)
		{
			images = mImages;
		}

		if (reset)
		{
			for (var i = 0; i < imageSources.length; i++)
			{
				var is = imageSources[i];

				images[i] = {};
				//TODO(brent): Fix this method.
				images[i].name = "no url";
				images[i].useBlending = false;
				images[i].bitmap = is.getImage();
			}
		}

		// Update the positions in the position and tex coord buffers.
		if (reset || type.UpdatePositions)
		{
			for (var i = 0; i < imageSources.length; i++)
			{
				var is = imageSources[i];
				var xyz = is.getLocation();
				var px = xyz.x;
				var py = xyz.y;
				var pz = xyz.z;

				var u = is.getHorizontalCorner();
				var ux = u[0];
				var uy = u[1];
				var uz = u[2];

				var v = is.getVerticalCorner();
				var vx = v[0];
				var vy = v[1];
				var vz = v[2];

				// lower left
				vertexBuffer.addPoint(px - ux - vx, py - uy - vy, pz - uz - vz);
				texCoordBuffer.addTexCoords(0, 1);

				// upper left
				vertexBuffer.addPoint(px - ux + vx, py - uy + vy, pz - uz + vz);
				texCoordBuffer.addTexCoords(0, 0);

				// lower right
				vertexBuffer.addPoint(px + ux - vx, py + uy - vy, pz + uz - vz);
				texCoordBuffer.addTexCoords(1, 1);

				// upper right
				vertexBuffer.addPoint(px + ux + vx, py + uy + vy, pz + uz + vz);
				texCoordBuffer.addTexCoords(1, 0);
			}
		}

		// We already set the image in reset, so only set them here if we're
		// not doing a reset.
		if (type.UpdateImages)
		{
			for (var i = 0; i < imageSources.length; i++)
			{
				var is = imageSources[i];
				images[i].bitmap = is.getImage();
			}
		}

		mImages = images;
		this.queueForReload(false);
	}

	this.reload = function (gl, fullReload)
	{
		var images = mImages;
		var reloadBuffers = false;
		var reloadImages = false;

		if (fullReload)
		{
			reloadBuffers = true;
			reloadImages = true;
			// If this is a full reload, all the textures were automatically deleted,
			// so just create new arrays so we won't try to delete the old ones again.
			mTextures = [];
		}
		else
		{
			// Process any queued updates.
			var reset = mUpdates.Reset == true;
			reloadBuffers |=  reset || mUpdates.UpdatePositions == true;
			reloadImages |= reset || mUpdates.UpdateImages == true;
			mUpdates = {};
		}

		if (reloadBuffers)
		{
			mVertexBuffer.reload();
			mTexCoordBuffer.reload();
		}
		if (reloadImages)
		{
			for (var i = 0; i < mImages.length; i++)
			{
				// If the image is already allocated, delete it.
				if (mTextures[i] != null)
				{
					mTextures[i].delete(gl);
				}

				var bmp = mImages[i].bitmap;
				mTextures[i] = this.textureManager().createTexture(gl);
				mTextures[i].bind(gl);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				try
				{
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bmp);
				}
				catch (e)
				{
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,0,255,255]));
				}
			}
		}
	}

	this.drawInternal = function (gl)
	{
		if (mVertexBuffer.size() == 0) {
			return;
		}

		var shader = this.getRenderState().getTextureShader();
		if (this.getRenderState().getNightVisionMode())
		{
			// use red shader 
			//shader = mRedShader;
		}

		gl.useProgram(shader.sp);
		
		gl.uniformMatrix4fv(shader.matrix, false, this.getRenderState().getTransformToDeviceMatrix().getFloatArray());
		
		gl.enableVertexAttribArray(shader.pos);
		mVertexBuffer.set(gl);
		gl.vertexAttribPointer(shader.pos, 3, gl.FLOAT, false, 0, 0);
		
		gl.enableVertexAttribArray(shader.texCoord);
		mTexCoordBuffer.set(gl);
		gl.vertexAttribPointer(shader.texCoord, 2, gl.FLOAT, false, 0, 0);

		var textures = mTextures;
		for (var i = 0; i < textures.length; i++)
		{
			//if (mImages[i].useBlending)
			{
				gl.enable(gl.BLEND);
				gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
			}
			// need to add alpha test and discard in shader : if(gl_FragColor.a < 0.5) discard;
			//else
			//{
			//	gl.enable(gl.ALPHA_TEST);
			//	gl.alphaFunc(gl.GREATER, 0.5);
			//}

			gl.activeTexture(gl.TEXTURE0);
			textures[i].bind(gl);
			gl.uniform1i(shader.tex, 0);
			gl.drawArrays(gl.TRIANGLE_STRIP, 4 * i, 4);

			//if (mImages[i].useBlending)
			{
				gl.disable(gl.BLEND);
			}
			/*else
			{
				gl.disable(gl.ALPHA_TEST);
			}*/
		}
	}
}

