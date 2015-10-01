

function SkyRenderer(res)
{
	var mSkyBox = null;
	var mOverlayManager = null;

	var mRenderState = new RenderState();

	var mProjectionMatrix = new Matrix4x4();
	var mViewMatrix = new Matrix4x4();

	// Indicates whether the transformation matrix has changed since the last
	// time we started rendering
	var mMustUpdateView = true;
	var mMustUpdateProjection = true;

	var mUpdateClosures = [];

	// A list of managers which need to be reloaded before the next frame is rendered.  This may
	// be because they haven't ever been loaded yet, or because their objects have changed since
	// the last frame.
	var mManagersToReload = [];
	var mUpdateListener = {
		queueForReload : function (rom, fullReload)
		{
			mManagersToReload.push({manager:rom, fullReload:fullReload});
		}
	};

	// All managers - we need to reload all of these when we recreate the surface.
	var mAllManagers = [];

	var mTextureManager;

	// Maps an integer indicating render order to a list of objects at that level.  The managers
	// will be rendered in order, with the lowest number coming first.
	var mLayersToManagersMap = {};
	
	var mStereoscopic = false;
	var mLeftEye = null;
	var mRightEye = null;
	
	this.enableStereoscopic = function (enable, leftEye, rightEye)
	{
		mStereoscopic = enable;
		mLeftEye = leftEye;
		mRightEye = rightEye;
	};
	
	this.drawLayers = function (gl)
	{
		for (var layer in mLayersToManagersMap)
		{
			var managers = mLayersToManagersMap[layer];
			managers.forEach( function (rom)
			{
				rom.draw(gl);
			});
		}
	}

	this.onDrawFrame = function (gl)
	{
		// Initialize any of the unloaded managers.
		for (var i = 0; i < mManagersToReload.length; i++)
		{
			mManagersToReload[i].manager.reload(gl, mManagersToReload[i].fullReload);
		}
		mManagersToReload = [];

		this.maybeUpdateMatrices(gl);

		// Determine which sky regions should be rendered.
		mRenderState.setActiveSkyRegions(
			SkyRegionMap.getActiveRegions(
				mRenderState.getLookDir(),
				mRenderState.getRadiusOfView(),
				mRenderState.getScreenWidth() / mRenderState.getScreenHeight()));

		gl.clear(gl.COLOR_BUFFER_BIT);

		if (mStereoscopic)
		{
			gl.enable(gl.SCISSOR_TEST);
			
			var width = mRenderState.getScreenWidth();
			var height = mRenderState.getScreenHeight();
			var halfWidth = width/2;

			var x = mViewMatrix.getFloatArray()[12];
			var eyeShift = 0.001;
			
			gl.viewport(0,0,halfWidth,height);
			gl.scissor(0,0,halfWidth,height);
			mViewMatrix.getFloatArray()[12] = x + eyeShift;
			var transformToDevice = Matrix4x4.multiplyMM(mLeftEye, mViewMatrix);
			mRenderState.setTransformToDeviceMatrix(transformToDevice);
			this.drawLayers(gl);

			gl.viewport(halfWidth,0,halfWidth,height);
			gl.scissor(halfWidth,0,halfWidth,height);
			mViewMatrix.getFloatArray()[12] = x - eyeShift;
			var transformToDevice = Matrix4x4.multiplyMM(mRightEye, mViewMatrix);
			mRenderState.setTransformToDeviceMatrix(transformToDevice);
			this.drawLayers(gl);

			mViewMatrix.getFloatArray()[12] = x;

			gl.disable(gl.SCISSOR_TEST);
		}
		else
		{
			this.drawLayers(gl);
		}
		

		//checkForErrors(gl);

		// Queue updates for the next frame.
		mUpdateClosures.forEach( function (update)
		{
			update.run();
		});
	};

	this.onSurfaceCreated = function (gl)
	{
		Log.d("SkyRenderer", "surfaceCreated");

		//gl.enable(gl.DITHER);

		/*
		 * Some one-time OpenGL initialization can be made here
		 * probably based on features of this particular context
		 */

		gl.clearColor(0, 0, 0, 1);
		//gl.enable(gl.CULL_FACE);
		gl.disable(gl.DEPTH_TEST);

		// Release references to all of the old textures.
		mTextureManager.reset();

		mRenderState.setTextureShader(new Shader(gl,
			'vshTexture', 'fshTexture',
			['pos', 'texCoord'],
			['matrix', 'tex']));
		mRenderState.setTextureColorShader(new Shader(gl,
			'vshTextureColor', 'fshTextureColor',
			['pos', 'texCoord'],
			['matrix', 'tex', 'color']));
		mRenderState.setColorVertexShader(new Shader(gl,
			'vshColorVertex', 'fshColorVertex',
			['pos', 'color'],
			['matrix']));
		mRenderState.setTCVShader(new Shader(gl,
			'vshTCV', 'fshTCV',
			['pos', 'texCoord', 'color'],
			['matrix', 'tex']));

		// Reload all of the managers.
		for (var i = 0; i < mAllManagers.length; i++)
		{
			mAllManagers[i].reload(gl, true);
		}
		// Reload all of the managers.
		mAllManagers.forEach(function (rom)
		{
			rom.reload(gl, true);
		});
	};

	this.onSurfaceChanged = function (gl, width, height)
	{
		Log.d("SkyRenderer", "Starting sizeChanged, size = (" + width + ", " + height + ")");

		mRenderState.setScreenSize(width, height);
		//mOverlayManager.resize(gl, width, height);

		// Need to set the matrices.
		mMustUpdateView = true;
		mMustUpdateProjection = true;

		Log.d("SkyRenderer", "Changing viewport size");

		gl.viewport(0, 0, width, height);

		Log.d("SkyRenderer", "Done with sizeChanged");
	};

	this.setRadiusOfView = function (degrees)
	{
		// Log.d("SkyRenderer", "setRadiusOfView(" + degrees + ")");
		mRenderState.setRadiusOfView(degrees);
		mMustUpdateProjection = true;
	};

	this.addUpdateClosure = function (update)
	{
		mUpdateClosures.push(update);
	};

	this.removeUpdateCallback = function (update)
	{
		mUpdateClosures.slice(mUpdateClosures.indexOf(update),1);
	};

	// Sets up from the perspective of the viewer.
	// ie, the zenith in celestial coordinates.
	this.setViewerUpDirection = function (up)
	{
		//mOverlayManager.setViewerUpDirection(up);
	};

	this.addObjectManager = function (m)
	{
		m.setRenderState(mRenderState);
		m.setUpdateListener(mUpdateListener);
		mAllManagers.push(m);

		// It needs to be reloaded before we try to draw it.
		mManagersToReload.push({manager:m, fullReload:true});

		// Add it to the appropriate layer.
		var managers = mLayersToManagersMap[m.getLayer()];
		if (managers == null)
		{
			managers = [];
			mLayersToManagersMap[m.getLayer()] = managers;
		}
		managers.push(m);
	};

	this.removeObjectManager = function (m) 
	{
		mAllManagers.slice(mAllManagers.indexOf(m), 1);

		var managers = mLayersToManagersMap[m.getLayer()];
		// managers shouldn't ever be null, so don't bother checking.	Let it crash if it is so we
		// know there's a bug.
		managers.slice(managers.indexOf(m), 1);
	};

	this.enableSkyGradient = function (sunPosition) 
	{
		mSkyBox.setSunPosition(sunPosition);
		mSkyBox.enable(true);
	};

	this.disableSkyGradient = function () 
	{
		mSkyBox.enable(false);
	};

	this.enableSearchOverlay = function (target, targetName) 
	{
		//mOverlayManager.enableSearchOverlay(target, targetName);
	};

	this.disableSearchOverlay = function () 
	{
		//mOverlayManager.disableSearchOverlay();
	};
	
	this.setNightVisionMode = function (enabled) 
	{
		mRenderState.setNightVisionMode(enabled);
	};

	// Used to set the orientation of the text.	The angle parameter is the roll
	// of the phone.	This angle is rounded to the nearest multiple of 90 degrees
	// to keep the text readable.
	this.setTextAngle = function (angleInRadians) 
	{
		var TWO_OVER_PI = 2.0 / Math.PI;
		var PI_OVER_TWO = Math.PI / 2.0;

		var newAngle = Math.round(angleInRadians * TWO_OVER_PI) * PI_OVER_TWO;

		mRenderState.setUpAngle(newAngle);
	};

	this.setViewOrientation = function (dirX, dirY, dirZ, upX, upY, upZ) 
	{
		// Normalize the look direction
		var dirLen = Math.sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);
		var oneOverDirLen = 1.0 / dirLen;
		dirX *= oneOverDirLen;
		dirY *= oneOverDirLen;
		dirZ *= oneOverDirLen;

		// We need up to be perpendicular to the look direction, so we subtract
		// off the projection of the look direction onto the up vector
		var lookDotUp = dirX * upX + dirY * upY + dirZ * upZ;
		upX -= lookDotUp * dirX;
		upY -= lookDotUp * dirY;
		upZ -= lookDotUp * dirZ;

		// Normalize the up vector
		var upLen = Math.sqrt(upX*upX + upY*upY + upZ*upZ);
		var oneOverUpLen = 1.0 / upLen;
		upX *= oneOverUpLen;
		upY *= oneOverUpLen;
		upZ *= oneOverUpLen;
		
		var lookDir = new GeocentricCoordinates(dirX, dirY, dirZ);
		var upDir = new GeocentricCoordinates(upX, upY, upZ);
		var rightDir = VectorUtil.crossProduct(lookDir, upDir);

		mRenderState.setLookDir(lookDir);
		mRenderState.setUpDir(upDir);
		mRenderState.setRightDir(rightDir);

		mMustUpdateView = true;

		//mOverlayManager.setViewOrientation(new GeocentricCoordinates(dirX, dirY, dirZ),
		//	new GeocentricCoordinates(upX, upY, upZ));
	};

	this.getWidth = function () 
	{
		return mRenderState.getScreenWidth();
	};
	this.getHeight = function () 
	{
		return mRenderState.getScreenHeight();
	};


	this.updateView = function (gl) 
	{
		// Get a vector perpendicular to both, pointing to the right, by taking
		// lookDir cross up.
		var lookDir = mRenderState.getLookDir();
		var upDir = mRenderState.getUpDir();
		var right = VectorUtil.crossProduct(lookDir, upDir);

		mViewMatrix = Matrix4x4.createView(lookDir, upDir, right);

		//gl.glMatrixMode(GL10.GL_MODELVIEW);
		//gl.glLoadMatrixf(mViewMatrix.getFloatArray(), 0);
	};

	this.updatePerspective = function (gl) 
	{
		mProjectionMatrix = Matrix4x4.createPerspectiveProjection(
			mRenderState.getScreenWidth(),
			mRenderState.getScreenHeight(),
			mRenderState.getRadiusOfView() * 3.141593 / 360.0);

		//gl.glMatrixMode(GL10.GL_PROJECTION);
		//gl.glLoadMatrixf(mProjectionMatrix.getFloatArray(), 0);

		// Switch back to the model view matrix.
		//gl.glMatrixMode(GL10.GL_MODELVIEW);
	};

	this.maybeUpdateMatrices = function (gl) 
	{
		var updateTransform = mMustUpdateView || mMustUpdateProjection;
		if (mMustUpdateView) 
		{
			this.updateView(gl);
			mMustUpdateView = false;
		}
		if (mMustUpdateProjection) 
		{
			this.updatePerspective(gl);
			mMustUpdateProjection = false;
		}
		if (updateTransform) 
		{
			// Device coordinates are a square from (-1, -1) to (1, 1).	Screen
			// coordinates are (0, 0) to (width, height).	Both coordinates
			// are useful in different circumstances, so we'll pre-compute
			// matrices to do the transformations from world coordinates
			// into each of these.
			var transformToDevice = Matrix4x4.multiplyMM(mProjectionMatrix, mViewMatrix);

			var translate = Matrix4x4.createTranslation(1, 1, 0);
			var scale = Matrix4x4.createScaling(mRenderState.getScreenWidth() * 0.5,
				mRenderState.getScreenHeight() * 0.5, 1);

			var transformToScreen =
				Matrix4x4.multiplyMM(Matrix4x4.multiplyMM(scale, translate),
				transformToDevice);

			mRenderState.setTransformationMatrices(transformToDevice, transformToScreen);
		}
	};

	// WARNING!	These factory methods are invoked from another thread and
	// therefore cannot do any OpenGL operations or any nontrivial nontrivial
	// initialization.
	//
	// TODO(jpowell): This would be much safer if the renderer controller
	// schedules creation of the objects in the queue.
	this.createPointManager = function (layer) 
	{
		return new PointObjectManager(layer, mTextureManager);
	};

	this.createPolyLineManager = function (layer) 
	{
		return new PolyLineObjectManager(layer, mTextureManager);
	};

	this.createLabelManager = function (layer) 
	{
		return new LabelObjectManager(layer, mTextureManager);
	};

	this.createImageManager = function (layer) 
	{
		return new ImageObjectManager(layer, mTextureManager);
	};

    mRenderState.setResources(res);

    mLayersToManagersMap = {};

    mTextureManager = new TextureManager(res);

    // The skybox should go behind everything.
    mSkyBox = new SkyBox(Number.MIN_VALUE, mTextureManager);
    mSkyBox.enable(false);
    this.addObjectManager(mSkyBox);

    // The overlays go on top of everything.
    //mOverlayManager = new OverlayManager(Integer.MAX_VALUE, mTextureManager);
    //this.addObjectManager(mOverlayManager);

    Log.d("SkyRenderer", "SkyRenderer::SkyRenderer()");
}
