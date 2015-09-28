/**
 * An implementation of the {@link Layer} interface for displaying planets in
 * the Renderer.
 *
 * @author John Taylor
 * @author Brent Bryan
 */
function PlanetsLayer(model, resources, preferences)
{
	AbstractSourceLayer.call(this, resources, true);

	this.initializeAstroSources = function (sources)
	{
		Planet.values().forEach(function (planet)
		{
			sources.push(new PlanetSource(planet, this.getResources(), model, preferences));
		}, this);
	};

	// TODO(brent): Remove this.
	this.getPreferenceId = function ()
	{
		return "source_provider.3";
	};

	this.getLayerId = function ()
	{
		// TODO(brent): refactor these to a common location.
		return -103;
	};

	this.getLayerNameId = function ()
	{
		return R.string.show_planets_pref;  // TODO(johntaylor): rename the string id.
	};
}
