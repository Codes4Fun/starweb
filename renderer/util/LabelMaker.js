function LabelMaker(fullColor)
{
	/**
	 * Create a label maker or maximum compatibility with various OpenGL ES
	 * implementations, the strike width and height must be powers of two, We want
	 * the strike width to be at least as wide as the widest window.
	 * 
	 * @param fullColor true if we want a full color backing store (4444),
	 *        otherwise we generate a grey L8 backing store.
	 */

	var mStrikeWidth = 512;
	var mStrikeHeight = -1;
	var mFullColor = fullColor;
	var mCanvas;
	var mRes;

	var mTexture = null;

	var mTexelWidth; // Convert texel to U
	var mTexelHeight; // Convert texel to V

	/**
	 * Call to initialize the class. Call whenever the surface has been created.
	 * 
	 * @param gl
	 */
	this.initialize = function (gl, textPaint, labels, res,  textureManager) 
	{
		mRes = res;
		mTexture = textureManager.createTexture(gl);
		mTexture.bind(gl);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		var minHeight = this.addLabelsInternal(gl, textPaint, false, labels);

		// Round up to the nearest power of two, since textures have to be a power of two in size.
		var roundedHeight = 1;
		while (roundedHeight < minHeight)
			roundedHeight <<= 1;

		mStrikeHeight = roundedHeight;

		mTexelWidth = 1.0 / mStrikeWidth;
		mTexelHeight = 1.0 / mStrikeHeight;

		this.beginAdding(gl);
		this.addLabelsInternal(gl, textPaint, true, labels);
		this.endAdding(gl);

		return mTexture;
	}

	/**
	 * Call when the surface has been destroyed
	 */
	this.shutdown = function (gl) 
	{
		if (mTexture != null) 
		{
			mTexture.delete(gl);
		}
	}

	/**
	 * Call to add a list of labels
	 * 
	 * @param gl
	 * @param textPaint the paint of the label
	 * @param labels the array of labels being added
	 * @return the required height
	 */
	this.addLabelsInternal = function (gl, textPaint, drawToCanvas,  labels) 
	{
		var u = 0;
		var v = 0;
		var lineHeight = 0;
		var ctx = drawToCanvas? mCanvas.getContext('2d') : textPaint;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		labels.forEach(function (label)
		{
			var ascent = 0;
			var descent = 0;
			var measuredTextWidth = 0;

			var height = 0;
			var width = 0;

			// TODO(jpowell): This is a hack to deal with text that's too wide to
			// fit on the screen.  We should really split this up among multiple lines,
			// but just making the text smaller is much easier.

			var fontSize = label.getFontSize();
			do {
				ctx.fillStyle = '#' + (label.getColor()&0xffffff).toString(16);
				ctx.font = fontSize + 'px Verdana';

				measuredTextWidth = ctx.measureText(label.getText()).width;

				height = fontSize;
				width = measuredTextWidth + 1;

				fontSize--;
			} while (fontSize > 0 && width > mStrikeWidth);

			var nextU;

			// Is there room for this string on the current line?
			if (u + width > mStrikeWidth) 
			{
				// No room, go to the next line:
				u = 0;
				nextU = width;
				v += lineHeight + 1;
				lineHeight = 0;
			}
			else 
			{
				nextU = u + width;
			}

			lineHeight = Math.max(lineHeight, height);
			if (v + lineHeight > mStrikeHeight && drawToCanvas) 
			{
				throw new Error("Out of texture space.");
			}

			if (drawToCanvas) 
			{
				ctx.fillText(label.getText(), u, v);

				label.setTextureData(width, height, u, v + height, width, -height,
					mTexelWidth, mTexelHeight);
			}

			u = nextU;
		});

		return v + lineHeight;
	}

	this.beginAdding = function (gl) 
	{
		mCanvas = document.createElement('canvas');
		mCanvas.width = mStrikeWidth;
		mCanvas.height = mStrikeHeight;
	}

	this.endAdding = function (gl) 
	{
		mTexture.bind(gl);
		if (fullColor)
		{
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mCanvas);
		}
		else
		{
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, gl.ALPHA, gl.UNSIGNED_BYTE, mCanvas);
		}
		// Reclaim storage used by bitmap and canvas.
		mCanvas = null;
	}
}


/**
 * A class which contains data that describes a label and its position in the texture.
 */
LabelMaker.LabelData = function(text, color, fontSize) 
{
	var mText = text;
	var mColor = color;
	var mFontSize = fontSize;

	var mWidthInPixels = 0;
	var mHeightInPixels = 0;
	var mTexCoords = null;
	var mCrop = null;

	// Sets data about the label's position in the texture.
	this.setTextureData = function (widthInPixels, heightInPixels,
		cropU, cropV, cropW, cropH, texelWidth, texelHeight)
	{
		mWidthInPixels = widthInPixels;
		mHeightInPixels = heightInPixels;

		mTexCoords = new TexCoordBuffer(4);
		// lower left
		mTexCoords.addTexCoords(cropU * texelWidth, cropV * texelHeight);

		// upper left
		mTexCoords.addTexCoords(cropU * texelWidth, (cropV + cropH) * texelHeight);

		// lower right
		mTexCoords.addTexCoords((cropU + cropW) * texelWidth, cropV * texelHeight);

		// upper right
		mTexCoords.addTexCoords((cropU + cropW) * texelWidth, (cropV + cropH) * texelHeight);

		mCrop = [cropU, cropV, cropW, cropH];
	};

	this.getText = function () 
	{
		return mText;
	};

	this.getColor = function () 
	{
		return mColor;
	};

	this.getFontSize = function () 
	{
		return mFontSize;
	};

	this.getWidthInPixels = function () 
	{
		return mWidthInPixels;
	};

	this.getHeightInPixels = function () 
	{
		return mHeightInPixels;
	};

	this.getTexCoords = function () 
	{
		return mTexCoords;
	};

	this.getCrop = function () 
	{
		return mCrop;
	};
};

