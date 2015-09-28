/**
 * Creates a Layer which returns Sources which correspond to grid lines parallel
 * to the celestial equator and the hour angle. That is, returns a set of lines
 * with constant right ascension, and another set with constant declination.
 *
 * @author Brent Bryan
 * @author John Taylor
 */
function GridLayer(resources, numRightAscentionLines, numDeclinationLines) 
{
	AbstractSourceLayer.call(this, resources, false);

	var numRaSources = numRightAscentionLines;
	var numDecSources = numDeclinationLines;

	/** Implementation of the grid elements as an {@link AstronomicalSource} */
	function GridSource(res, numRaSources, numDecSources) 
	{
		AbstractAstronomicalSource.call(this);

		var LINE_COLOR = Color.argb(20, 248, 239, 188);
		/** These are great (semi)circles, so only need 3 points. */
		var NUM_DEC_VERTICES = 3;
		/** every 10 degrees */
		var NUM_RA_VERTICES = 36;

		var lineSources = [];
		var textSources = [];

		/**
		 * Constructs a single longitude line. These lines run from the north pole to
		 * the south pole at fixed Right Ascensions.
		 */
		function createRaLine(index, numRaSources) 
		{
			var line = new LineSourceImpl(LINE_COLOR);
			var ra = index * 360.0 / numRaSources;
			for (var i = 0; i < NUM_DEC_VERTICES - 1; i++) 
			{
				var dec = 90.0 - i * 180.0 / (NUM_DEC_VERTICES - 1);
				var raDec = new RaDec(ra, dec);
				line.raDecs.push(raDec);
				line.vertices.push(GeocentricCoordinates.getInstance(raDec));
			}
			var raDec = new RaDec(0.0, -90.0);
			line.raDecs.push(raDec);
			line.vertices.push(GeocentricCoordinates.getInstance(raDec));
			return line;
		}

		function createDecLine(index, numDecSources) 
		{
			var line = new LineSourceImpl(LINE_COLOR);
			var dec = 90.0 - (index + 1.0) * 180.0 / (numDecSources + 1.0);
			for (var i = 0; i < NUM_RA_VERTICES; i++) 
			{
				var ra = i * 360.0 / NUM_RA_VERTICES;
				var raDec = new RaDec(ra, dec);
				line.raDecs.push(raDec);
				line.vertices.push(GeocentricCoordinates.getInstance(raDec));
			}
			var raDec = new RaDec(0.0, dec);
			line.raDecs.push(raDec);
			line.vertices.push(GeocentricCoordinates.getInstance(raDec));
			return line;
		}

		{
			for (var r = 0; r < numRaSources; r++) 
			{
				lineSources.push(createRaLine(r, numRaSources));
			}
			for (var d = 0; d < numDecSources; d++) 
			{
				lineSources.push(createDecLine(d, numDecSources));
			}

			/** North & South pole, hour markers every 2hrs. */
			textSources.push(new TextSourceImpl(0, 90, res.getString(R.string.north_pole), LINE_COLOR));
			textSources.push(new TextSourceImpl(0, -90, res.getString(R.string.south_pole), LINE_COLOR));
			for (var index = 0; index < 12; index++) 
			{
				var ra = index * 30.0;
				var title = (2 * index) + 'h';
				textSources.push(new TextSourceImpl(ra, 0.0, title, LINE_COLOR));
			}
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
		sources.push(new GridSource(getResources(), numRaSources, numDecSources));
	};

	this.getLayerId = function () 
	{
		return -104;
	}

	this.getLayerNameId = function () 
	{
		return R.string.show_grid_pref;  // TODO(johntaylor): rename this string Id.
	}

	// TODO(brent): Remove this.
	this.getPreferenceId = function () 
	{
		return "source_provider.4";
	}
}
