/**
 * An implementation of the {@link AbstractFileBasedLayer} for displaying stars
 * in the Renderer.
 *
 * @author John Taylor
 * @author Brent Bryan
 */
function NewStarsLayer(assetManager, resources)
{
	AbstractFileBasedLayer.call(this, assetManager, resources, "stars.binary");

	this.getLayerId = function ()
	{
		return -100;
	};

	this.getLayerNameId = function ()
	{
		return R.string.show_stars_pref;  // TODO(johntaylor): rename this Id
	};

	// TODO(brent): Remove this.
	this.getPreferenceId = function ()
	{
		return "source_provider.0";
	};
}
