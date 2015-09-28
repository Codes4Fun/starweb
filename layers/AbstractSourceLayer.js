/**
 * Layer for objects which are {@link AstronomicalSource}s.
 *
 * @author Brent Bryan
 */
// TODO(brent): merge with AbstractLayer?
function AbstractSourceLayer(resources, shouldUpdate)
{
	var TAG = "AbstractSourceLayer";

	var textSources = [];
	var imageSources = [];
	var pointSources = [];
	var lineSources = [];
	var astroSources = [];

	var searchIndex = {};
	var prefixStore = new PrefixStore();
	var closure = null;

	AbstractLayer.call(this, resources);

	this.initialize = function () 
	{
		astroSources = [];

		this.initializeAstroSources(astroSources);

		for (var i = 0; i < astroSources.length; i++)
		{
			var sources = astroSources[i].initialize();

			textSources = textSources.concat(sources.getLabels());
			imageSources = imageSources.concat(sources.getImages());
			pointSources = pointSources.concat(sources.getPoints());
			lineSources = lineSources.concat(sources.getLines());

			var names = astroSources[i].getNames();
			if (name.length > 0) 
			{
				var searchLoc = astroSource.getSearchLocation();
				names.forEach (function (name)
				{
					searchIndex[name.toLowerCase()] = new SearchResult(name, searchLoc);
					prefixStore.add(name.toLowerCase());
				});
			}
		}

		// update the renderer
		this.updateLayerForControllerChange();
	};

	this.updateLayerForControllerChange = function () 
	{
		this.refreshSources({Reset:true});
		if (shouldUpdate) 
		{
			if (closure == null) 
			{
				closure = {
					run: (function (thisArg) { return function ()
					{
						thisArg.refreshSources();
					}})(this)
				};
			}
			this.addUpdateClosure(closure);
		}
	};

	this.redrawPrivate = function (updateTypes) 
	{
		this.redrawInternal(textSources, pointSources, lineSources, imageSources, updateTypes);
	};

	/**
	 * Redraws the sources on this layer, after first refreshing them based on
	 * the current state of the
	 * {@link com.google.android.stardroid.control.AstronomerModel}.
	 */
	this.refreshSources = function (updateTypes) 
	{
		if (updateTypes == undefined)
		{
			updateTypes = {};
		}

		astroSources.forEach(function (astroSource)
		{
			//Object.assign(updateTypes, astroSource.update());
			var sourceUpdate = astroSource.update();
			for (var k in sourceUpdate)
			{
				updateTypes[k] = sourceUpdate[k];
			}
		});

		if (Object.keys(updateTypes).length) 
		{
			this.redrawPrivate(updateTypes);
		}
	};

	/**
	 * Forcefully resets and redraws all sources on this layer everything on
	 * this layer.
	 */
	this.redraw = function (a,b,c,d,e) 
	{
		if (a != undefined)
		{
			this.redrawInternal(a,b,c,d,e);
			return;
		}
		this.refreshSources({Reset:true});
	};

	this.searchByObjectName = function (name) 
	{
		Log.d(TAG, "Search planets layer for " + name);
		var matches = [];
		var searchResult = searchIndex[name.toLowerCase()];
		if (searchResult != null) 
		{
			matches.push(searchResult);
		}
		Log.d(TAG, this.getLayerName() + " provided " + matches.size() + "results for " + name);
		return matches;
	};

	this.getObjectNamesMatchingPrefix = function (prefix) 
	{
		Log.d(TAG, "Searching planets layer for prefix " + prefix);
		var results = prefixStore.queryByPrefix(prefix);
		Log.d(TAG, "Got " + results.length + " results for prefix " + prefix + " in " + this.getLayerName());
		return results;
	};
}
