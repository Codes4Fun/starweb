/**
* If enabled, keeps the sky gradient up to date.
*
* @author John Taylor
* @author Brent Bryan
*/
function SkyGradientLayer(model, resources)
{
	var TAG = "SkyGradientLayer";
	var UPDATE_FREQUENCY_MS = 5 * TimeConstants.MILLISECONDS_PER_MINUTE;

	var renderer;
	var lastUpdateTimeMs = 0;

	this.initialize = function () {};

	this.registerWithRenderer = function (controller) 
	{
		renderer = controller;
		this.redraw();
	};

	this.setVisible = function (visible) 
	{
		Log.d(TAG, "Setting showSkyGradient " + visible);
		if (visible) 
		{
			this.redraw();
		}
		else 
		{
			renderer.queueDisableSkyGradient();
		}
	};

	/** Redraws the sky shading gradient using the model's current time. */
	this.redraw = function () 
	{
		var modelTime = model.getTime();
		if (Math.abs(modelTime.getTime() - lastUpdateTimeMs) > UPDATE_FREQUENCY_MS) 
		{
			lastUpdateTimeMs = modelTime.getTime();

			var sunPosition = SolarPositionCalculator.getSolarPosition(modelTime);
			// Log.d(TAG, "Enabling sky gradient with sun position " + sunPosition);
			renderer.queueEnableSkyGradient(GeocentricCoordinates.getInstance(sunPosition));
		}
	};

	this.getLayerId = function () 
	{
		return 0;
	};

	this.getPreferenceId = function () 
	{
		return "source_provider." + this.getLayerNameId();
	};

	this.getLayerName = function () 
	{
		return resources.getString(this.getLayerNameId());
	};

	this.getLayerNameId = function () 
	{
		return R.string.show_sky_gradient;
	};

	this.searchByObjectName = function (name) 
	{
		return [];
	};

	this.getObjectNamesMatchingPrefix = function (prefix) 
	{
		return [];
	};
}
