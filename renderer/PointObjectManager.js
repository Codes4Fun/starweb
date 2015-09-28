
function PointObjectManager(layer, textureManager)
{
	RendererObjectManager.call(this, layer, textureManager);

	var NUM_STARS_IN_TEXTURE = 2;
	// Small sets of point aren't worth breaking up into regions.
	// Right now, I'm arbitrarily setting the threshold to 200.
	var MINIMUM_NUM_POINTS_FOR_REGIONS = 200;

	function RegionData ()
	{
		// TODO(jpowell): This is a convenient hack until the catalog tells us the
		// region for all of its sources.  Remove this once we add that.
		this.sources = [];

		this.mVertexBuffer = new VertexBuffer(true);
		this.mColorBuffer = new NightVisionColorBuffer(true);
		this.mTexCoordBuffer = new TexCoordBuffer(true);
		this.mIndexBuffer = new IndexBuffer(true);
	}
	// Should we compute the regions for the points?
	// If false, we just put them in the catchall region.
	var COMPUTE_REGIONS = true;
	var mNumPoints = 0;

	var mSkyRegions = []; // new SkyRegionMap<RegionData>();

	var mTextureRef = null;

	// We want to initialize the labels of a sky region to an empty set of data.
	/*mSkyRegions.setRegionDataFactory(
		new SkyRegionMap.RegionDataFactory<RegionData>() {
			public RegionData construct() { return new RegionData(); }
	});*/

	this.updateObjects = function (points, updateType) 
	{
		var onlyUpdatePoints = true;
		// We only care about updates to positions, ignore any other updates.
		if (updateType.Reset) 
		{
			onlyUpdatePoints = false;
		}
		else if (updateType.UpdatePositions) 
		{
			// Sanity check: make sure the number of points is unchanged.
			if (points.length != mNumPoints) 
			{
				Log.e("PointObjectManager",
					"Updating PointObjectManager a different number of points: update had " +
					points.length + " vs " + mNumPoints + " before");
				return;
			}
		}
		else 
		{
			return;
		}

		mNumPoints = points.length;

		mSkyRegions = [new RegionData()];//.clear();
		mSkyRegions[0].sources = points;
		gSkyRegions = mSkyRegions;

		/*if (COMPUTE_REGIONS) 
		{
			// Find the region for each point, and put it in a separate list
			// for that region.
			points.forEach(function (point)
			{
				var region = points.length < MINIMUM_NUM_POINTS_FOR_REGIONS
					? SkyRegionMap.CATCHALL_REGION_ID
					: SkyRegionMap.getObjectRegion(point.getLocation());
				mSkyRegions.getRegionData(region).sources.add(point);
			});
		}
		else
		{
			mSkyRegions.getRegionData(SkyRegionMap.CATCHALL_REGION_ID).sources = points;
		}*/

		// Generate the resources for all of the regions.
		mSkyRegions./*getDataForAllRegions().*/forEach(function (data)
		{
			var numVertices = 4 * data.sources.length;
			var numIndices = 6 * data.sources.length;

			data.mVertexBuffer.reset(numVertices);
			data.mColorBuffer.reset(numVertices);
			data.mTexCoordBuffer.reset(numVertices);
			data.mIndexBuffer.reset(numIndices);

			var up = new Vector3(0, 1, 0);

			// By inspecting the perspective projection matrix, you can show that,
			// to have a quad at the center of the screen to be of size k by k
			// pixels, the width and height are both:
			// k * tan(fovy / 2) / screenHeight
			// This is not difficult to derive.  Look at the transformation matrix
			// in SkyRenderer if you're interested in seeing why this is true.
			// I'm arbitrarily deciding that at a 60 degree field of view, and 480
			// pixels high, a size of 1 means "1 pixel," so calculate sizeFactor
			// based on this.  These numbers mostly come from the fact that that's
			// what I think looks reasonable.
			var fovyInRadians = 60 * MathUtil.PI / 180.0;
			var sizeFactor = MathUtil.tan(fovyInRadians * 0.5) / 480;

			var bottomLeftPos = new Vector3(0, 0, 0);
			var topLeftPos = new Vector3(0, 0, 0);
			var bottomRightPos = new Vector3(0, 0, 0);
			var topRightPos = new Vector3(0, 0, 0);

			var su = new Vector3(0, 0, 0);
			var sv = new Vector3(0, 0, 0);

			var index = 0;

			var starWidthInTexels = 1.0 / NUM_STARS_IN_TEXTURE;

			data.sources.forEach(function (p)
			{
				var color = 0xff000000 | p.getColor();  // Force alpha to 0xff
				var bottomLeft = index++;
				var topLeft = index++;
				var bottomRight = index++;
				var topRight = index++;

				// First triangle
				data.mIndexBuffer.addIndex(bottomLeft);
				data.mIndexBuffer.addIndex(topLeft);
				data.mIndexBuffer.addIndex(bottomRight);

				// Second triangle
				data.mIndexBuffer.addIndex(topRight);
				data.mIndexBuffer.addIndex(bottomRight);
				data.mIndexBuffer.addIndex(topLeft);

				var starIndex = p.getPointShape();//.getImageIndex();

				var texOffsetU = starWidthInTexels * starIndex;

				data.mTexCoordBuffer.addTexCoords(texOffsetU, 1);
				data.mTexCoordBuffer.addTexCoords(texOffsetU, 0);
				data.mTexCoordBuffer.addTexCoords(texOffsetU + starWidthInTexels, 1);
				data.mTexCoordBuffer.addTexCoords(texOffsetU + starWidthInTexels, 0);

				var pos = p.getLocation();
				var u = VectorUtil.normalized(VectorUtil.crossProduct(pos, up));
				var v = VectorUtil.crossProduct(u, pos);

				var s = p.getSize() * sizeFactor;

				su.assign(s*u.x, s*u.y, s*u.z);
				sv.assign(s*v.x, s*v.y, s*v.z);

				bottomLeftPos.assign(pos.x - su.x - sv.x, pos.y - su.y - sv.y, pos.z - su.z - sv.z);
				topLeftPos.assign(pos.x - su.x + sv.x, pos.y - su.y + sv.y, pos.z - su.z + sv.z);
				bottomRightPos.assign(pos.x + su.x - sv.x, pos.y + su.y - sv.y, pos.z + su.z - sv.z);
				topRightPos.assign(pos.x + su.x + sv.x, pos.y + su.y + sv.y, pos.z + su.z + sv.z);

				// Add the vertices
				data.mVertexBuffer.addPoint(bottomLeftPos);
				data.mColorBuffer.addColor(color);

				data.mVertexBuffer.addPoint(topLeftPos);
				data.mColorBuffer.addColor(color);

				data.mVertexBuffer.addPoint(bottomRightPos);
				data.mColorBuffer.addColor(color);

				data.mVertexBuffer.addPoint(topRightPos);
				data.mColorBuffer.addColor(color);
			});
			Log.i("PointObjectManager",
				"Vertices: " + data.mVertexBuffer.size() + ", Indices: " + data.mIndexBuffer.size());
			data.sources = null;
		});
	}

	this.reload = function (gl, fullReload) 
	{
		mTextureRef = this.textureManager().getTextureFromResource(gl, R.drawable.stars_texture);
		mSkyRegions./*getDataForAllRegions().*/forEach( function (data) 
		{
			data.mVertexBuffer.reload();
			data.mColorBuffer.reload();
			data.mTexCoordBuffer.reload();
			data.mIndexBuffer.reload();
		});
	}

	this.drawInternal = function (gl) 
	{
		var shader = this.getRenderState().getTCVShader();
		gl.useProgram(shader.sp);
		gl.uniformMatrix4fv(shader.matrix, false, this.getRenderState().getTransformToDeviceMatrix().getFloatArray());
		
		//gl.glEnableClientState(GL10.GL_VERTEX_ARRAY);
		//gl.glEnableClientState(GL10.GL_COLOR_ARRAY);
		//gl.glEnableClientState(GL10.GL_TEXTURE_COORD_ARRAY);

		//gl.glEnable(GL10.GL_CULL_FACE);
		//gl.glFrontFace(GL10.GL_CW);
		//gl.glCullFace(GL10.GL_BACK);

		//gl.glEnable(GL10.GL_ALPHA_TEST);
		//gl.glAlphaFunc(GL10.GL_GREATER, 0.5);
		gl.enable(gl.BLEND);
		gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

		//gl.glEnable(GL10.GL_TEXTURE_2D);
		
		mTextureRef.bind(gl);

		//gl.glTexEnvf(GL10.GL_TEXTURE_ENV, GL10.GL_TEXTURE_ENV_MODE, GL10.GL_MODULATE);

		// Render all of the active sky regions.
		var nightVisionMode = this.getRenderState().getNightVisionMode();
		var activeRegions = this.getRenderState().getActiveSkyRegions();
		var activeRegionData = mSkyRegions;//.getDataForActiveRegions(activeRegions);
		activeRegionData.forEach (function (data) 
		{
			if (data.mVertexBuffer.size() == 0) 
			{
				return;
			}

			gl.enableVertexAttribArray(shader.pos);
			data.mVertexBuffer.set(gl);
			gl.vertexAttribPointer(shader.pos, 3, gl.FLOAT, false, 0, 0);

			gl.enableVertexAttribArray(shader.color);
			data.mColorBuffer.set(gl, nightVisionMode);
			gl.vertexAttribPointer(shader.color, 4, gl.FLOAT, false, 0, 0);
			
			gl.enableVertexAttribArray(shader.texCoord);
			data.mTexCoordBuffer.set(gl);
			gl.vertexAttribPointer(shader.texCoord, 2, gl.FLOAT, false, 0, 0);
			
			data.mIndexBuffer.draw(gl, gl.TRIANGLES);
		});

		gl.disable(gl.BLEND);

		//gl.glDisableClientState(GL10.GL_TEXTURE_COORD_ARRAY);
		//gl.glDisable(GL10.GL_TEXTURE_2D);
		//gl.glDisable(GL10.GL_ALPHA_TEST);
	}
}

