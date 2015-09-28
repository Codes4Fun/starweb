/**
 * An implementation of the {@link AbstractFileBasedLayer} to display
 * Constellations in the renderer.
 *
 * @author John Taylor
 * @author Brent Bryan
 */
function NewConstellationsLayer(assetManager, resources)
{
	AbstractFileBasedLayer.call(this, assetManager, resources, "constellations.binary");

	this.getLayerId = function ()
	{
		return -101;
	};

	this.getLayerNameId = function ()
	{
		// TODO(johntaylor): rename this string id.
		return R.string.show_constellations_pref;
	};

	// TODO(brent): Remove this.
	this.getPreferenceId = function ()
	{
		return "source_provider.1";
	};
}
