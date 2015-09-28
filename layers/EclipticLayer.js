/**
 * Creates a Layer for the Ecliptic.
 *
 * @author John Taylor
 * @author Brent Bryan
 */

function EclipticLayer(resources) 
{
	AbstractSourceLayer.call(this, resources, false);

	/** Implementation of {@link AstronomicalSource} for the ecliptic source. */
	function EclipticSource (res)
	{
		AbstractAstronomicalSource.call(this);

		// Earth's Angular Tilt
		var EPSILON = 23.439281;
		var LINE_COLOR = Color.argb(20, 248, 239, 188);

		var lineSources = [];
		var textSources = [];

		{
			var title = res.getString(R.string.ecliptic);
			textSources.push(new TextSourceImpl(90.0, EPSILON, title, LINE_COLOR));
			textSources.push(new TextSourceImpl(270, -EPSILON, title, LINE_COLOR));

			// Create line source.
			var ra = [0, 90, 180, 270, 0];
			var dec = [0, EPSILON, 0, -EPSILON, 0];

			var vertices = [];
			for (var i = 0; i < ra.length; ++i) 
			{
				vertices.push(GeocentricCoordinates.getInstance(ra[i], dec[i]));
			}
			lineSources.push(new LineSourceImpl(LINE_COLOR, vertices, 1.5));
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
		sources.push(new EclipticSource(this.getResources()));
	}

	this.getLayerId = function () 
	{
		return -104;
	}

	this.getLayerNameId = function () 
	{
		return R.string.show_grid_pref;
	}

	this.getPreferenceId = function () 
	{
		return "source_provider.4";
	}
}

