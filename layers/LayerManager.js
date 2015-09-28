/**
* Allows a group of layers to be controlled together.
*/
function LayerManager(sharedPreferences, model)
{
	var TAG = "LayerManager";
	var layers = [];

	// TODO(johntaylor): delete the model parameter
	sharedPreferences.registerOnSharedPreferenceChangeListener(this);

	this.isLayerVisible = function (layer)
	{
		return sharedPreferences.getBoolean(layer.getPreferenceId(), true);
	}

	this.addLayer = function (layer) 
	{
		layers.push(layer);
	};

	this.initialize = function () 
	{
		layers.forEach( function (layer)
		{
			layer.initialize();
		});
	};

	this.registerWithRenderer = function (renderer) 
	{
		layers.forEach( function (layer)
		{
			layer.registerWithRenderer(renderer);
			var prefId = layer.getPreferenceId();
			var visible = sharedPreferences.getBoolean(prefId, true);
			layer.setVisible(visible);
		});
	};

	this.onSharedPreferenceChanged = function (prefs, key) 
	{
		layers.forEach( function (layer)
		{
			if (layer.getPreferenceId() == key) 
			{
				var visible = prefs.getBoolean(key, true);
				layer.setVisible(visible);
			}
		});
	};

	/**
	 * Returns the name of this object.
	 */
	this.getName = function () 
	{
		return "Layer Manager";
	};

	/**
	 * Search all visible layers for an object with the given name.
	 * @param name the name to search for
	 * @return a list of all matching objects.
	 */
	this.searchByObjectName = function (name) 
	{
		var all = [];
		layers.forEach( function (layer)
		{
			if (this.isLayerVisible(layer)) 
			{
				all = all.concat(layer.searchByObjectName(name));
			}
		});
		Log.d(TAG, "Got " + all.length + " results in total for " + name);
		return all;
	};

	/**
	 * Given a string prefix, find all possible queries for which we have a
	 * result in the visible layers.
	 * @param prefix the prefix to search for.
	 * @return a set of matching queries.
	 */
	this.getObjectNamesMatchingPrefix = function (prefix) 
	{
		var all = [];
		layers.forEach( function (layer)
		{
			if (this.isLayerVisible(layer)) 
			{
				layer.getObjectNamesMatchingPrefix(prefix).forEach(function (query)
				{
					var result = new SearchTerm(query, layer.getLayerName());
					all.push(result);
				});
			}
		});
		Log.d(TAG, "Got " + all.length + " results in total for " + prefix);
		return all;
	};
}
