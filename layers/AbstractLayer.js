
/**
 * Base implementation of the {@link Layer} interface.
 *
 * @author John Taylor
 * @author Brent Bryan
 */
function AbstractLayer(resources)
{
	var TAG = "AbstractLayer";

	var renderMap = {};

	var renderer;

	this.getResources = function () 
	{
		return resources;
	};

	this.registerWithRenderer = function (rendererController) 
	{
		renderMap = {};
		renderer = rendererController;
		this.updateLayerForControllerChange();
	};

	this.setVisible = function (visible) 
	{
		if (renderer == null) 
		{
			Log.w(TAG, "Renderer not set - aborting " + this.constructor.name);
			return;
		}

		for (var k in renderMap) 
		{
			renderMap[k].queueEnabled(visible, renderer);
		}
	};

	this.addUpdateClosure = function (closure) 
	{
		if (renderer != null) 
		{
			renderer.addUpdateClosure(closure);
		}
	};

	this.removeUpdateClosure = function (closure) 
	{
		if (renderer != null) 
		{
			renderer.removeUpdateCallback(closure);
		}
	};

	this.createRenderManager = function (clazz, controller) 
	{
		if (clazz == ImageSource.name) 
		{
			return controller.createImageManager(this.getLayerId());
		}
		else if (clazz == TextSource.name) 
		{
			return controller.createLabelManager(this.getLayerId());
		}
		else if (clazz == LineSource.name) 
		{
			return controller.createLineManager(this.getLayerId());
		}
		else if (clazz == PointSource.name) 
		{
			return controller.createPointManager(this.getLayerId());
		}
		throw new Error("Unknown source type: " + clazz);
	}

	/**
	 * Sets the objects on the {@link RenderManager} to the given values,
	 * creating (or disabling) the {@link RenderManager} if necessary.
	 */
	this.setSources = function (sources, updateType, clazz, atomic) 
	{
		var manager = renderMap[clazz];
		if (sources == null || sources.length == 0) 
		{
			if (manager != null) 
			{
				// TODO(brent): we should really just disable this layer, but in a
				// manner that it will automatically be reenabled when appropriate.
				Blog.d(this, "       " + clazz);
				manager.queueObjects([], updateType, atomic);
			}
			return;
		}

		if (manager == null) 
		{
			manager = this.createRenderManager(clazz, atomic);
			renderMap[clazz] = manager;
		}
		// Blog.d(this, "       " + clazz.getSimpleName() + " " + sources.size());
		manager.queueObjects(sources, updateType, atomic);
	}

	/**
	 * Updates the renderer (using the given {@link UpdateType}), with then given set of
	 * UI elements.  Depending on the value of {@link UpdateType}, current sources will
	 * either have their state updated, or will be overwritten by the given set
	 * of UI elements.
	 */
	this.redrawInternal = function (
		textSources,
		pointSources,
		lineSources,
		imageSources,
		updateTypes) 
	{
		if (updateTypes == undefined)
		{
			updateTypes = {Reset:true};
		}
		// Log.d(TAG, getLayerName() + " Updating renderer: " + updateTypes);
		if (renderer == null) 
		{
			Log.w(TAG, "Renderer not set - aborting: " + this.constructor.name);
			return;
		}

		this.setSources(textSources, updateTypes, TextSource.name, renderer);
		this.setSources(pointSources, updateTypes, PointSource.name, renderer);
		this.setSources(lineSources, updateTypes, LineSource.name, renderer);
		this.setSources(imageSources, updateTypes, ImageSource.name, renderer);
	};

	this.redraw = this.redrawInternal;

	this.searchByObjectName = function (name) 
	{
		// By default, layers will return no search results.
		// Override this if the layer should be searchable.
		return [];
	};

	this.getObjectNamesMatchingPrefix = function (prefix) 
	{
		// By default, layers will return no search results.
		// Override this if the layer should be searchable.
		return [];
	};

	this.getPreferenceId = function (layerNameId) 
	{
		if (layerNameId == undefined)
		{
			layerNameId = getLayerNameId();
		}
		return "source_provider." + layerNameId;
	};

	this.getLayerName = function () 
	{
		return this.getStringFromId(getLayerNameId());
	};

	/**
	 * Return an internationalized string from a string resource id.
	 */
	this.getStringFromId = function (resourceId) 
	{
		return resources.getString(resourceId);
	};
}
