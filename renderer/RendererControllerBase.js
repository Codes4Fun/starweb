// Used only to allow logging different types of events.  The distinction
// can be somewhat ambiguous at times, so when in doubt, I tend to use
// "view" for those things that change all the time (like the direction
// the user is looking) and "data" for those that change less often
// (like whether a layer is visible or not).
var CommandType = {
	View : 0,  // The command only changes the user's view.
	Data : 1,  // The command changes what is actually rendered.
	Synchronization : 2  // The command relates to synchronization.
};

/**
 * Base class for all renderer managers.
 */
function RenderManager(mgr, msg)
{
	this.mManager = mgr;

	this.queueEnabled = function (enable, controller)
	{
		var msg = (enable ? "Enabling" : "Disabling") + " manager " + this.mManager;
		controller.queueRunnable(msg, CommandType.Data, { run : (function (mManager) { return function () {
			mManager.enable(enable);
		}})(this.mManager)});
	};

	this.queueMaxFieldOfView = function (fov, controller)
	{
		var msg = "Setting manager max field of view: " + fov;
		controller.queueRunnable(msg, CommandType.Data, { run : (function (mManager) { return function () {
			mManager.setMaxRadiusOfView(fov);
		}})(this.mManager)});
	};

	this.queueObjects = function (objects, updateType, controller)
	{
		controller.queueRunnable(msg, CommandType.Data, { run : (function (mManager) { return function () {
			mManager.updateObjects(objects, updateType);
		}})(this.mManager)});
	};
}

function RendererControllerBase(renderer)
{
	var mRenderer = renderer;

	var SHOULD_LOG_QUEUE = false;
	var SHOULD_LOG_RUN = false;
	var SHOULD_LOG_FINISH = false;

	this.createPointManager = function (layer) 
	{
		var manager = new RenderManager(mRenderer.createPointManager(layer), "Setting point objects");
		this.queueAddManager(manager);
		return manager;
	};

	this.createLineManager = function (layer) 
	{
		var manager = new RenderManager(mRenderer.createPolyLineManager(layer), "Setting line objects");
		this.queueAddManager(manager);
		return manager;
	};

	this.createLabelManager = function (layer) 
	{
		var manager = new RenderManager(mRenderer.createLabelManager(layer), "Setting label objects");
		this.queueAddManager(manager);
		return manager;
	};

	this.createImageManager = function (layer) 
	{
		var manager = new RenderManager(mRenderer.createImageManager(layer), "Setting image objects");
		this.queueAddManager(manager);
		return manager;
	};

	this.queueNightVisionMode = function (enable) 
	{
		var msg = "Setting night vision mode: " + enable;
		this.queueRunnable(msg, CommandType.View, { run : function () {
			mRenderer.setNightVisionMode(enable);
		}});
	};

	this.queueFieldOfView = function (fov) 
	{
		var msg = "Setting fov: " + fov;
		this.queueRunnable(msg, CommandType.View, { run : function () {
			mRenderer.setRadiusOfView(fov);
		}});
	};

	this.queueTextAngle = function (angleInRadians) 
	{
		var msg = "Setting text angle: " + angleInRadians;
		this.queueRunnable(msg, CommandType.View, { run : function () {
			mRenderer.setTextAngle(angleInRadians);
		}});
	};
	
	this.queueViewerUpDirection = function (up) 
	{
		var msg = "Setting up direction: " + up;
		this.queueRunnable(msg, CommandType.View, { run : function () {
			mRenderer.setViewerUpDirection(up);
		}});
	};

	this.queueSetViewOrientation = function (dirX, dirY, dirZ, upX, upY, upZ) 
	{
		var msg = "Setting view orientation";
		this.queueRunnable(msg, CommandType.Data, { run : function () {
			mRenderer.setViewOrientation(dirX, dirY, dirZ, upX, upY, upZ);
		}});
	};

	this.queueEnableSkyGradient = function (sunPosition) 
	{
		var msg = "Enabling sky gradient at: " + sunPosition;
		this.queueRunnable(msg, CommandType.Data, { run : function () {
			mRenderer.enableSkyGradient(sunPosition);
		}});
	};

	this.queueDisableSkyGradient = function () 
	{
		var msg = "Disabling sky gradient";
		this.queueRunnable(msg, CommandType.Data, { run : function () {
			mRenderer.disableSkyGradient();
		}});
	};

	this.queueEnableSearchOverlay = function (target, targetName) 
	{
		var msg = "Enabling search overlay";
		this.queueRunnable(msg, CommandType.Data, { run : function () {
			mRenderer.enableSearchOverlay(target, targetName);
		}});
	};

	this.queueDisableSearchOverlay = function () 
	{
		var msg = "Disabling search overlay";
		this.queueRunnable(msg, CommandType.Data, { run : function () {
			mRenderer.disableSearchOverlay();
		}});
	};

	this.addUpdateClosure = function (runnable) 
	{
		var msg = "Setting update callback";
		this.queueRunnable(msg, CommandType.Data, {
			run : function () {
				mRenderer.addUpdateClosure(runnable);
			}
		});
	};

	this.removeUpdateCallback = function (update) 
	{
		var msg = "Removing update callback";
		this.queueRunnable(msg, CommandType.Data, {
			run : function () {
				mRenderer.removeUpdateCallback(update);
			}
		});
	};

	/**
	* Must be called once to register an object manager to the renderer.
	* @param rom
	*/
	this.queueAddManager = function (rom) 
	{
		var msg = "Adding manager: " + rom;
		this.queueRunnable(msg, CommandType.Data, { run : function () {
			mRenderer.addObjectManager(rom.mManager);
		}});
	};

	/*this.waitUntilFinished = function () 
	{
		var cv = new ConditionVariable();
		var msg = "Waiting until operations have finished";
		this.queueRunnable(msg, CommandType.Synchronization, { run : function () {
			cv.open();
		}});
		cv.block();
	};*/


	this.queueRunnable = function (queuer, msg, type, r) 
	{
		if (queuer.constructor == String)
		{
			r = type;
			type = msg;
			msg = this.constructor.name + " - " + queuer;
			queuer = this.getQueuer();
		}
		// If we're supposed to log something, then wrap the runnable with the
		// appropriate logging statements.  Otherwise, just queue it.
		if (SHOULD_LOG_QUEUE || SHOULD_LOG_RUN || SHOULD_LOG_FINISH) 
		{
			this.logQueue(msg, type);
			queuer.queueEvent({ run : function () {
				this.logRun(msg, type);
				r.run();
				this.logFinish(msg, type);
			}});
		}
		else 
		{
			queuer.queueEvent(r);
		}
	};

	this.logQueue = function (description, type) 
	{
		if (SHOULD_LOG_QUEUE) 
		{
			Log.d("RendererController-" + type.toString(), "Queuing: " + description);
		}
	};

	this.logRun = function (description, type) 
	{
		if (SHOULD_LOG_RUN) 
		{
			Log.d("RendererController-" + type.toString(), "Running: " + description);
		}
	};

	this.logFinish = function (description, type) 
	{
		if (SHOULD_LOG_FINISH) 
		{
			Log.d("RendererController-" + type.toString(), "Finished: " + description);
		}
	};
}


