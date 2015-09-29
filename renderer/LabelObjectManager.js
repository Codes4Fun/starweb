/**
 * Manages rendering of text labels.
 * 
 * @author James Powell
 *
 */
function LabelObjectManager(layer, textureManager)
{
	// call parent constructor
	RendererObjectManager.call(this, layer, textureManager);

	// Should we compute the regions for the labels?
	// If false, we just put them in the catchall region.
	var COMPUTE_REGIONS = true;

	var mLabelCanvas = document.createElement('canvas');
	mLabelCanvas.width = 1;
	mLabelCanvas.height = 1;
	var mLabelPaint = mLabelCanvas.getContext('2d');
	var mLabelMaker = null;
	var mLabels = [];
	var mSkyRegions = [];//new SkyRegionMap<ArrayList<Label>>(); 

    // We want to initialize the labels of a sky region to an empty list.
    /*mSkyRegions.setRegionDataFactory(
        new SkyRegionMap.RegionDataFactory<ArrayList<Label>>() {
          public ArrayList<Label> construct() { return new ArrayList<Label>(); }
        });*/

    // A quad with size 1 on each size, so we just need to multiply
    // by the label's width and height to get it to the right size for each
    // label.
	var mQuadBuffer = new VertexBuffer(4);
	mQuadBuffer.addPoint(-0.5, -0.5, 0); // lower left
	mQuadBuffer.addPoint(-0.5,  0.5, 0); // upper left
	mQuadBuffer.addPoint( 0.5, -0.5, 0); // lower right
	mQuadBuffer.addPoint( 0.5,  0.5, 0); // upper right

	var mLabelOffset = new Vector3(0, 0, 0);
	var mDotProductThreshold;
	var mMatrix = null;

	var mTexture = null;

	var mShader = null;

	/**
	 * A private class which extends the LabelMaker's label data with an xyz position and rgba color values.
	 * For the red-eye mode, it's easier to set the color in the texture to white and set the color when we render
	 * the label than to have two textures, one with red labels and one without. 
	 */
	function Label(ts)
	{
		LabelMaker.LabelData.call(this, ts.getText(), 0xffffffff, ts.getFontSize());

		if (ts.getText() == null || ts.getText() == "")
		{
			throw new Error("Bad Label: " + ts.getClass());
		}

		this.x = ts.getLocation().x;
		this.y = ts.getLocation().y;
		this.z = ts.getLocation().z;

		// The distance this should be rendered underneath the specified position, in world coordinates.
		this.offset = ts.getOffset();

		// color values
		{
			var rgb = ts.getColor();
			var r = (rgb >> 16) & 0xff;
			var g = (rgb >> 8) & 0xff;
			var b = rgb & 0xff;
			this.a = 1.0;
			this.b = b / 255.0;
			this.g = g / 255.0;
			this.r = r / 255.0;
		}
	}

	this.reload = function (gl, fullReload)
	{
		// We need to regenerate the texture.  If we're re-creating the surface 
		// (fullReload=true), all resources were automatically released by OpenGL,
		// so we don't want to try to release it again.  Otherwise, we need to
		// release it to avoid a resource leak (mLabelMaker.shutdown takes
		// care of freeing the texture).
		// 
		// TODO(jpowell): This whole reload interface is horrendous, and I should
		// make a better way of scheduling reloads.
		//
		// TODO(jpowell): LabelMaker and textures have gone through some changes 
		// since they were originally created, and I feel like it might not make
		// sense for it to own the texture anymore.  I should see if I can just
		// let it create but not own it.
		if (!fullReload && mLabelMaker != null)
		{
			mLabelMaker.shutdown(gl);
		}

		mLabelMaker = new LabelMaker(true);
		mTexture = mLabelMaker.initialize(gl, mLabelPaint, mLabels,
										this.getRenderState().getResources(),
										this.textureManager());
	};

	this.updateObjects = function (labels, updateType)
	{
		if (updateType.Reset)
		{
			mLabels = [];
			for (var i = 0; i < labels.length; i++)
			{
				mLabels[i] = new Label(labels[i]);
			}
			this.queueForReload(false);
		}
		else if (updateType.UpdatePositions)
		{
			if (labels.length != mLabels.length)
			{
				this.logUpdateMismatch("LabelObjectManager", mLabels.length, labels.length, updateType);
				return;
			}
			// Since we don't store the positions in any GPU memory, and do the
			// transformations manually, we can just update the positions stored
			// on the label objects.
			for (var i = 0; i < mLabels.length; i++)
			{
				var pos = labels[i].getLocation();
				mLabels[i].x = pos.x;
				mLabels[i].y = pos.y;
				mLabels[i].z = pos.z;
			}
		}

		// Put all of the labels in their sky regions.
		// TODO(jpowell): Get this from the label source itself once it supports
		// this.
		mSkyRegions = [];//.clear();
		mLabels.forEach( function (l)
		{
			/*int region;
			if (COMPUTE_REGIONS)
			{
				region = SkyRegionMap.getObjectRegion(new GeocentricCoordinates(l.x, l.y, l.z));
			}
			else
			{
				region = SkyRegionMap.CATCHALL_REGION_ID;
			}
			mSkyRegions.getRegionData(region).add(l);*/
			mSkyRegions.push(l);
		});
	};

	this.drawInternal = function (gl)
	{
		this.beginDrawing(gl);

		// Draw the labels for the active sky regions.
		/*SkyRegionMap.ActiveRegionData activeRegions = getRenderState().getActiveSkyRegions();
		ArrayList<ArrayList<Label>> allActiveLabels =
			mSkyRegions.getDataForActiveRegions(activeRegions);

		for (ArrayList<Label> labelsInRegion : allActiveLabels) 
		{
			for (Label l : labelsInRegion) 
			{
				drawLabel(gl, l);
			}
		}*/
		mSkyRegions.forEach(function (l)
		{
			this.drawLabel(gl, l);
		}, this);

		this.endDrawing(gl);
	};

	/**
	* Begin drawing labels. Sets the OpenGL state for rapid drawing.
	* 
	* @param gl
	*/
	this.beginDrawing = function (gl)
	{
		var rs = this.getRenderState();

		mShader = rs.getTextureColorShader();
		gl.useProgram(mShader.sp);

		gl.activeTexture(gl.TEXTURE0);
		mTexture.bind(gl);
		gl.uniform1i(mShader.tex, 0);
		//gl.glAlphaFunc(GL10.GL_GREATER, 0.5f);
		//gl.glEnable(GL10.GL_TEXTURE_2D);

		gl.enable(gl.BLEND);
		gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		
		var viewWidth = rs.getScreenWidth();
		var viewHeight = rs.getScreenHeight();
		var lookDir = this.getRenderState().getLookDir();
		var upDir = this.getRenderState().getUpDir();

		var rotation = Matrix4x4.createRotation(rs.getUpAngle(), lookDir);
		mLabelOffset = Matrix4x4.multiplyMV(rotation, rs.getUpDir());

		// If a label isn't within the field of view angle from the target vector, it can't
		// be on the screen.  Compute the cosine of this angle so we can quickly identify these.
		// TODO(jpowell): I know I can make this tighter - do so.
		var DEGREES_TO_RADIANS = MathUtil.PI / 180.0;
		mDotProductThreshold = MathUtil.cos(rs.getRadiusOfView() * DEGREES_TO_RADIANS * 
			(1 + viewWidth / viewHeight) * 0.5);

		var rightDir = VectorUtil.crossProduct(lookDir, upDir);
		mMatrix = new Matrix4x4([
			rightDir.x, rightDir.y, rightDir.z, 0,
			upDir.x, upDir.y, upDir.z, 0,
			lookDir.x, lookDir.y, lookDir.z, 0,
			0, 0, 0, 1,
		]);
	};

	/**
	* Ends the drawing and restores the OpenGL state.
	* 
	* @param gl
	*/
	this.endDrawing = function (gl)
	{
		gl.disable(gl.BLEND);
	};

	var matrix = Matrix4x4.createIdentity();

	this.drawLabel = function (gl, label)
	{
		var lookDir = this.getRenderState().getLookDir();
		if (lookDir.x * label.x + lookDir.y * label.y + lookDir.z * label.z < mDotProductThreshold) 
		{
			return;
		}

		var translate = mMatrix.getFloatArray();
		translate[12] = label.x - mLabelOffset.x * label.offset;
		translate[13] = label.y - mLabelOffset.y * label.offset;
		translate[14] = label.z - mLabelOffset.z * label.offset;
		var scale = Matrix4x4.createScaling(label.getWidthInPixels()*0.02/15, label.getHeightInPixels()*0.02/15, 1);
		var m1 = Matrix4x4.multiplyMM(mMatrix, scale);
		var matrix = Matrix4x4.multiplyMM(this.getRenderState().getTransformToDeviceMatrix(), m1);

		gl.uniformMatrix4fv(mShader.matrix, false, matrix.getFloatArray());

		gl.enableVertexAttribArray(mShader.pos);
		mQuadBuffer.set(gl);
		gl.vertexAttribPointer(mShader.pos, 3, gl.FLOAT, false, 0, 0);
		
		gl.enableVertexAttribArray(mShader.texCoord);
		label.getTexCoords().set(gl);
		gl.vertexAttribPointer(mShader.texCoord, 2, gl.FLOAT, false, 0, 0);

		if (this.getRenderState().getNightVisionMode()) 
		{
			gl.uniform4f(mShader.color, 1, 0, 0, label.a);
		}
		else 
		{
			gl.uniform4f(mShader.color, label.r, label.g, label.b, label.a);
		}

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	};
}

