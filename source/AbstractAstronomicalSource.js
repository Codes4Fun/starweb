/**
* Base implementation of the 
{@link AstronomicalSource} and {@link Sources}
* interfaces.
*
* @author Brent Bryan
*/
function AbstractAstronomicalSource() 
{
	this.initialize = function () 
	{
		return this;
	};

	this.update = function ()
	{
		return {};
	};

	/** Implementors of this method must implement 
	{@link #getSearchLocation}. */
	this.getNames = function () 
	{
		return [];
	};

	this.getSearchLocation = function () 
	{
		throw new Error("Should not be called");
	};

	this.getImages = function ()
	{
		return [];
	};

	this.getLabels = function ()
	{
		return [];
	};

	this.getLines = function ()
	{
		return [];
	};

	this.getPoints = function ()
	{
		return [];
	};
}

