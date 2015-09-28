

function PolyLineObjectManager(layer, textureManager)
{
	var mVertexBuffer = new VertexBuffer(true);
	var mColorBuffer = new NightVisionColorBuffer(true);
	var mTexCoordBuffer = new TexCoordBuffer(true);
	var mIndexBuffer = new IndexBuffer(true);
	var mTexRef = null;
	var mOpaque = true;

	RendererObjectManager.call(this, layer, textureManager);

	this.updateObjects = function (lines,updateType) 
	{
		// We only care about updates to positions, ignore any other updates.
		if (!updateType.Reset && 
			!updateType.UpdatePositions) 
		{
			return;
		}
		var numLineSegments = 0;
		lines.forEach (function (l) 
		{
			numLineSegments += l.getVertices().length - 1;
		});

		// To render everything in one call, we render everything as a line list
		// rather than a series of line strips.
		var numVertices = 4 * numLineSegments;
		var numIndices = 6 * numLineSegments;

		var vb = mVertexBuffer;
		vb.reset(4 * numLineSegments);
		var cb = mColorBuffer;
		cb.reset(4 * numLineSegments);
		var tb = mTexCoordBuffer;
		tb.reset(numVertices);
		var ib = mIndexBuffer;
		ib.reset(numIndices);

		// See comment in PointObjectManager for justification of this calculation.
		var fovyInRadians = 60 * MathUtil.PI / 180.0; 
		var sizeFactor = MathUtil.tan(fovyInRadians * 0.5) / 480;

		var opaque = true;

		var vertexIndex = 0;
		lines.forEach (function (l) 
		{
			var coords = l.getVertices();
			if (coords.length < 2)
				return;

			// If the color isn't fully opaque, set opaque to false.
			var color = l.getColor();
			opaque &= (color & 0xff000000) == 0xff000000;

			// Add the vertices.
			for (var i = 0; i < coords.length - 1; i++) 
			{
				var p1 = coords[i];
				var p2 = coords[i+1];
				var u = VectorUtil.difference(p2, p1);
				// The normal to the quad should face the origin at its midpoint.
				var avg = VectorUtil.sum(p1, p2);
				avg.scale(0.5);
				// I'm assuming that the points will already be on a unit sphere.  If this is not the case,
				// then we should normalize it here.
				var v = VectorUtil.normalized(VectorUtil.crossProduct(u, avg));
				v.scale(sizeFactor * l.getLineWidth());


				// Add the vertices

				// Lower left corner
				vb.addPoint(VectorUtil.difference(p1, v));
				cb.addColor(color);
				tb.addTexCoords(0, 1);

				// Upper left corner
				vb.addPoint(VectorUtil.sum(p1, v));
				cb.addColor(color);
				tb.addTexCoords(0, 0);

				// Lower left corner
				vb.addPoint(VectorUtil.difference(p2, v));
				cb.addColor(color);
				tb.addTexCoords(1, 1);

				// Upper left corner
				vb.addPoint(VectorUtil.sum(p2, v));
				cb.addColor(color);
				tb.addTexCoords(1, 0);


				// Add the indices
				var bottomLeft = vertexIndex++;
				var topLeft = vertexIndex++;
				var bottomRight = vertexIndex++;
				var topRight = vertexIndex++;

				// First triangle
				ib.addIndex(bottomLeft);
				ib.addIndex(topLeft);
				ib.addIndex(bottomRight);

				// Second triangle
				ib.addIndex(bottomRight);
				ib.addIndex(topLeft);
				ib.addIndex(topRight);
			}
		});
		mOpaque = opaque;
	}

	this.reload = function (gl, fullReload) 
	{
		mTexRef = this.textureManager().getTextureFromResource(gl, R.drawable.line);
		mVertexBuffer.reload();
		mColorBuffer.reload();
		mTexCoordBuffer.reload();
		mIndexBuffer.reload();
	}

	this.drawInternal = function (gl) 
	{
		if (mIndexBuffer.size() == 0)
			return;

		var shader = this.getRenderState().getTCVShader();
		gl.useProgram(shader.sp);

		//gl.glEnableClientState(GL10.GL_VERTEX_ARRAY);
		//gl.glEnableClientState(GL10.GL_COLOR_ARRAY);
		//gl.glEnableClientState(GL10.GL_TEXTURE_COORD_ARRAY);

		//gl.glEnable(GL10.GL_TEXTURE_2D);
		mTexRef.bind(gl);

		//gl.glEnable(GL10.GL_CULL_FACE);
		//gl.glFrontFace(GL10.GL_CW);
		//gl.glCullFace(GL10.GL_BACK);

		if (!mOpaque) 
		{
			gl.enable(gl.BLEND);
			gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		}

		//gl.glTexEnvf(GL10.GL_TEXTURE_ENV, GL10.GL_TEXTURE_ENV_MODE, GL10.GL_MODULATE);

		gl.uniformMatrix4fv(shader.matrix, false, this.getRenderState().getTransformToDeviceMatrix().getFloatArray());
		
		gl.enableVertexAttribArray(shader.pos);
		mVertexBuffer.set(gl);
		gl.vertexAttribPointer(shader.pos, 3, gl.FLOAT, false, 0, 0);
		
		gl.enableVertexAttribArray(shader.texCoord);
		mTexCoordBuffer.set(gl);
		gl.vertexAttribPointer(shader.texCoord, 2, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(shader.color);
		mColorBuffer.set(gl, this.getRenderState().getNightVisionMode());
		gl.vertexAttribPointer(shader.color, 4, gl.FLOAT, false, 0, 0);

		mIndexBuffer.draw(gl, gl.TRIANGLES);

		if (!mOpaque) 
		{
			gl.disable(gl.BLEND);
		}

		//gl.glDisable(GL10.GL_TEXTURE_2D);
		//gl.glDisableClientState(GL10.GL_TEXTURE_COORD_ARRAY);
	}
}
