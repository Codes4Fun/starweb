/**
* Implementation of the
* {@link com.google.android.stardroid.source.AstronomicalSource} for planets.
*
* @author Brent Bryan
*/
function PlanetSource(planet, resources, model, prefs)
{
	AbstractAstronomicalSource.call(this);

	var PLANET_SIZE = 3;
	var PLANET_COLOR = Color.argb(20, 129, 126, 246);
	var PLANET_LABEL_COLOR = 0xf67e81;
	var SHOW_PLANETARY_IMAGES = "show_planetary_images";
	var UP = new Vector3(0.0, 1.0, 0.0);

	var pointSources = [];
	var imageSources = [];
	var labelSources = [];
	var name = planet.getNameResourceId();//resources.getString(planet.getNameResourceId());
	var preferences = prefs;
	var currentCoords = new GeocentricCoordinates(0, 0, 0);
	var sunCoords;
	var imageId = -1;

	var lastUpdateTimeMs  = 0;

	this.updateCoords = function (time) 
	{
		lastUpdateTimeMs = time.getTime();
		sunCoords = HeliocentricCoordinates.getInstance(Planet.Sun, time);
		currentCoords.updateFromRaDec(RaDec.getInstance(planet, time, sunCoords));
		for (var i = 0; i < imageSources.length; i++) 
		{
			imageSources[i].setUpVector(sunCoords);  // TODO(johntaylor): figure out why we do this.
		}
	}

	this.getNames = function () 
	{
		return [name];
	}

	this.getSearchLocation = function () 
	{
		return currentCoords;
	}

	this.initialize = function () 
	{
		var time = model.getTime();
		this.updateCoords(time);
		imageId = planet.getImageResourceId(time);

		if (planet == Planet.Moon) 
		{
			imageSources.push(new ImageSourceImpl(currentCoords, resources, imageId, sunCoords,
				planet.getPlanetaryImageSize()));
		}
		else
		{
			var usePlanetaryImages = preferences.getBoolean(SHOW_PLANETARY_IMAGES, true);
			if (usePlanetaryImages || planet == Planet.Sun) 
			{
				imageSources.push(new ImageSourceImpl(currentCoords, resources, imageId, UP,
					planet.getPlanetaryImageSize()));
			}
			else
			{
				pointSources.push(new PointSourceImpl(currentCoords, PLANET_COLOR, PLANET_SIZE));
			}
		}
		labelSources.push(new TextSourceImpl(currentCoords, name, PLANET_LABEL_COLOR));

		return this;
	}

	this.update = function () 
	{
		var updates = {};

		var modelTime = model.getTime();
		if (Math.abs(modelTime.getTime() - lastUpdateTimeMs) > planet.getUpdateFrequencyMs()) 
		{
			updates.UpdatePositions = true;
			// update location
			this.updateCoords(modelTime);

			// For moon only:
			if (planet == Planet.Moon && !imageSources.isEmpty()) 
			{
				// Update up vector.
				imageSources[0].setUpVector(sunCoords);

				// update image:
				var newImageId = planet.getImageResourceId(modelTime);
				if (newImageId != imageId) 
				{
					imageId = newImageId;
					imageSources[0].setImageId(imageId);
					updates.UpdateImages = true;
				}
			}
		}
		return updates;
	}

	this.getImages = function () 
	{
		return imageSources;
	}

	this.getLabels = function () 
	{
		return labelSources;
	}

	this.getPoints = function () 
	{
		return pointSources;
	}
}
