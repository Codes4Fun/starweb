
function SkyBox (layer, textureManager)
{
	RendererObjectManager.call(this, layer, textureManager);

	var mVertexBuffer = new VertexBuffer(true);
	var mColorBuffer = new ColorBuffer(true);
	var mIndexBuffer = new IndexBuffer(true);
	var mSunPos = new GeocentricCoordinates(0, 1, 0);
	var mSunMatrix = Matrix4x4.createIdentity();
	
	var NUM_VERTEX_BANDS = 8;
	// This number MUST be even
	var NUM_STEPS_IN_BAND = 10;

	// Used to make sure rounding error doesn't make us have off-by-one errors in our iterations.
	var EPSILON = 1e-3;

	{
		var numVertices = NUM_VERTEX_BANDS * NUM_STEPS_IN_BAND;
		var numIndices = (NUM_VERTEX_BANDS-1) * NUM_STEPS_IN_BAND * 6;
		mVertexBuffer.reset(numVertices);
		mColorBuffer.reset(numVertices);
		mIndexBuffer.reset(numIndices);

		var sinAngles = new Float32Array(NUM_STEPS_IN_BAND);
		var cosAngles = new Float32Array(NUM_STEPS_IN_BAND);

		var angleInBand = 0;
		var dAngle = MathUtil.TWO_PI / (NUM_STEPS_IN_BAND - 1);
		for (var i = 0; i < NUM_STEPS_IN_BAND; i++) 
		{
			sinAngles[i] = MathUtil.sin(angleInBand);
			cosAngles[i] = MathUtil.cos(angleInBand);
			angleInBand += dAngle;
		}

		var bandStep = 2.0 / (NUM_VERTEX_BANDS-1) + EPSILON;

		var vb = mVertexBuffer;
		var cb = mColorBuffer;
		var bandPos = 1;
		for (var band = 0; band < NUM_VERTEX_BANDS; band++, bandPos -= bandStep) 
		{
			var color;
			if (bandPos > 0) 
			{
				// TODO(jpowell): This isn't really intensity, name it more appropriately.
				// I=70 at bandPos = 1, I=50 at bandPos = 0
				var intensity = (Math.trunc(bandPos * 20 + 50)) & 0xff;
				color = (intensity << 16) | 0xff000000;
			} else 
			{
				// I=40 at bandPos = -1, I=0 at bandPos = 0
				var intensity = Math.trunc(bandPos * 40 + 40) & 0xff;
				color = (intensity << 16) | (intensity << 8) | intensity | 0xff000000;
			}

			var sinPhi = bandPos > -1 ? MathUtil.sqrt(1 - bandPos*bandPos) : 0; 
			for (var i = 0; i < NUM_STEPS_IN_BAND; i++) 
			{
				vb.addPoint(cosAngles[i] * sinPhi, bandPos, sinAngles[i] * sinPhi);
				cb.addColor(color);
			}
		}
		Log.d("SkyBox", "Vertices: " + vb.size());

		var ib = mIndexBuffer;

		// Set the indices for the first band.
		var topBandStart = 0;
		var bottomBandStart = NUM_STEPS_IN_BAND;
		for (var triangleBand = 0; triangleBand < NUM_VERTEX_BANDS-1; triangleBand++) 
		{
			for (var offsetFromStart = 0; offsetFromStart < NUM_STEPS_IN_BAND-1; offsetFromStart++) 
			{
				// Draw one quad as two triangles.
				var topLeft = topBandStart + offsetFromStart;
				var topRight = topLeft + 1;

				var bottomLeft = bottomBandStart + offsetFromStart;
				var bottomRight = bottomLeft + 1;

				// First triangle
				ib.addIndex(topLeft);
				ib.addIndex(bottomRight);
				ib.addIndex(bottomLeft);

				// Second triangle
				ib.addIndex(topRight);
				ib.addIndex(bottomRight);
				ib.addIndex(topLeft);
			}

			// Last quad: connect the end with the beginning.

			// Top left, bottom right, bottom left
			ib.addIndex(topBandStart + NUM_STEPS_IN_BAND - 1);
			ib.addIndex(bottomBandStart);
			ib.addIndex(bottomBandStart + NUM_STEPS_IN_BAND - 1);

			// Top right, bottom right, top left
			ib.addIndex(topBandStart);
			ib.addIndex(bottomBandStart);
			ib.addIndex(topBandStart + NUM_STEPS_IN_BAND - 1);


			topBandStart += NUM_STEPS_IN_BAND;
			bottomBandStart += NUM_STEPS_IN_BAND;
		}
		Log.d("SkyBox", "Indices: " + ib.size());
	}

	this.reload = function (gl, fullReload) 
	{
		mVertexBuffer.reload();
		mColorBuffer.reload();
		mIndexBuffer.reload();
	}

	this.setSunPosition = function (pos) 
	{
		mSunPos = pos.copy();
		//Log.d("SkyBox", "SunPos: " + pos.toString());

		// Rotate the sky box to the position of the sun.
		var cp = VectorUtil.crossProduct(new Vector3(0, 1, 0), mSunPos);
		cp = VectorUtil.normalized(cp);
		var angle = MathUtil.acos(mSunPos.y);
		mSunMatrix = Matrix4x4.createRotation(angle, cp);
	}

	this.drawInternal = function (gl) 
	{
		if (this.getRenderState().getNightVisionMode()) 
		{
			return;
		}
		
		var shader = this.getRenderState().getColorVertexShader();

		//gl.glEnableClientState(GL10.GL_VERTEX_ARRAY);
		//gl.glEnableClientState(GL10.GL_COLOR_ARRAY);
		//gl.glDisableClientState(GL10.GL_TEXTURE_COORD_ARRAY);

		//gl.glEnable(GL10.GL_CULL_FACE);
		//gl.glFrontFace(GL10.GL_CW);
		//gl.glCullFace(GL10.GL_BACK);

		//gl.glShadeModel(GL10.GL_SMOOTH);

		//gl.glPushMatrix();

		gl.useProgram(shader.sp);
		
		var matrix2 = Matrix4x4.multiplyMM(this.getRenderState().getTransformToDeviceMatrix(), mSunMatrix);
		gl.uniformMatrix4fv(shader.matrix, false, matrix2.getFloatArray());
		
		gl.enableVertexAttribArray(shader.pos);
		mVertexBuffer.set(gl);
		gl.vertexAttribPointer(shader.pos, 3, gl.FLOAT, false, 0, 0);
		
		gl.enableVertexAttribArray(shader.color);
		mColorBuffer.set(gl);
		gl.vertexAttribPointer(shader.color, 4, gl.FLOAT, false, 0, 0);

		mIndexBuffer.draw(gl, gl.TRIANGLES);

		//gl.glPopMatrix();
	}
}
