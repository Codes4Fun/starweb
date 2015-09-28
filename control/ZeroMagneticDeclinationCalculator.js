/**
 * A trivial calculator that returns zero magnetic declination.  Used when
 * the user does not want magnetic correction.
 *
 * @author John Taylor
 */
function ZeroMagneticDeclinationCalculator()
{
	this.getDeclination = function ()
	{
		return 0;
	};

	this.setLocationAndTime = function (location, timeInMills)
	{
		// Do nothing.
	};
}
