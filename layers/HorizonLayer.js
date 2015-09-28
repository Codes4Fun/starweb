/**
 * Creates a mark at the zenith, nadir and cardinal point and a horizon.
 *
 * @author Brent Bryan
 * @author John Taylor
 */
function HorizonLayer(model, resources) 
{
	AbstractSourceLayer.call(this, resources, true);


	/** Implementation of {@link AstronomicalSource} for the horizon source. */
	function HorizonSource(model, res) 
	{
		AbstractAstronomicalSource.call(this);

		// Due to a bug in the G1 rendering code text and lines render in different
		// colors.
		var LINE_COLOR = Color.argb(120, 86, 176, 245);
		var LABEL_COLOR = Color.argb(120, 245, 176, 86);
		var UPDATE_FREQ_MS = 1 * TimeConstants.MILLISECONDS_PER_SECOND;

		var zenith = new GeocentricCoordinates(0, 0, 0);
		var nadir = new GeocentricCoordinates(0, 0, 0);
		var north = new GeocentricCoordinates(0, 0, 0);
		var south = new GeocentricCoordinates(0, 0, 0);
		var east = new GeocentricCoordinates(0, 0, 0);
		var west = new GeocentricCoordinates(0, 0, 0);

		var lineSources = [];
		var textSources = [];

		var lastUpdateTimeMs = 0;

		{
			var vertices = [north, east, south, west, north];
			lineSources.push(new LineSourceImpl(LINE_COLOR, vertices, 1.5));

			textSources.push(new TextSourceImpl(zenith, res.getString(R.string.zenith), LABEL_COLOR));
			textSources.push(new TextSourceImpl(nadir, res.getString(R.string.nadir), LABEL_COLOR));
			textSources.push(new TextSourceImpl(north, res.getString(R.string.north), LABEL_COLOR));
			textSources.push(new TextSourceImpl(south, res.getString(R.string.south), LABEL_COLOR));
			textSources.push(new TextSourceImpl(east, res.getString(R.string.east), LABEL_COLOR));
			textSources.push(new TextSourceImpl(west, res.getString(R.string.west), LABEL_COLOR));
		}

		this.updateCoords = function () 
		{
			// Blog.d(this, "Updating Coords: " + (model.getTime().getTime() - lastUpdateTimeMs));

			lastUpdateTimeMs = model.getTime().getTime();
			zenith.assign(model.getZenith());
			nadir.assign(model.getNadir());
			north.assign(model.getNorth());
			south.assign(model.getSouth());
			east.assign(model.getEast());
			west.assign(model.getWest());
		}

		this.initialize = function () 
		{
			this.updateCoords();
			return this;
		}

		this.update = function () 
		{
			var updateTypes = {};

			// TODO(brent): Add distance here.
			if (Math.abs(model.getTime().getTime() - lastUpdateTimeMs) > UPDATE_FREQ_MS) 
			{
				this.updateCoords();
				updateTypes.UpdatePositions = true;
			}
			return updateTypes;
		}

		this.getLabels = function () 
		{
			return textSources;
		}

		this.getLines = function () 
		{
			return lineSources;
		}
	}

	this.initializeAstroSources = function (sources) 
	{
		sources.push(new HorizonSource(model, this.getResources()));
	};

	this.getLayerId = function () 
	{
		return -105;
	};

	// TODO(brent): Remove this.
	this.getPreferenceId = function () 
	{
		return "source_provider.5";
	};

	this.getLayerName = function () 
	{
		// TODO(johntaylor): i18n
		return "Horizon";
	};

	this.getLayerNameId = function () 
	{
		return R.string.show_horizon_pref;  // TODO(johntaylor): rename this string id
	};
}
