/**
 * Controls time as selected / created by the user in Time Travel mode.
 * Includes control for "playing" through time in both directions at different
 * speeds.
 *
 * @author Dominic Widdows
 * @author John Taylor
 */
function TimeTravelClock()
{
// statics
	/**
	 * A data holder for the time stepping speeds.
	 */
	function Speed(rate, labelTag)
	{
		/** The speed in seconds per second. */
		this.rate = rate;
		/** The id of the Speed's string label. */
		this.labelTag = labelTag;
	}

	this.STOPPED = 0;

	var SPEEDS = [
		new Speed(-TimeConstants.SECONDS_PER_WEEK, R.string.time_travel_week_speed_back),
		new Speed(-TimeConstants.SECONDS_PER_DAY, R.string.time_travel_day_speed_back),
		new Speed(-TimeConstants.SECONDS_PER_HOUR, R.string.time_travel_hour_speed_back),
		new Speed(-TimeConstants.SECONDS_PER_10MINUTE, R.string.time_travel_10minute_speed_back),
		new Speed(-TimeConstants.SECONDS_PER_MINUTE, R.string.time_travel_minute_speed_back),
		new Speed(-TimeConstants.SECONDS_PER_SECOND, R.string.time_travel_second_speed_back),
		new Speed(STOPPED, R.string.time_travel_stopped),
		new Speed(TimeConstants.SECONDS_PER_SECOND, R.string.time_travel_second_speed),
		new Speed(TimeConstants.SECONDS_PER_MINUTE, R.string.time_travel_minute_speed),
		new Speed(TimeConstants.SECONDS_PER_10MINUTE, R.string.time_travel_10minute_speed),
		new Speed(TimeConstants.SECONDS_PER_HOUR, R.string.time_travel_hour_speed),
		new Speed(TimeConstants.SECONDS_PER_DAY, R.string.time_travel_day_speed),
		new Speed(TimeConstants.SECONDS_PER_WEEK, R.string.time_travel_week_speed),
	];

	var STOPPED_INDEX = SPEEDS.length / 2;

// non-statics
	var speedIndex = STOPPED_INDEX;

	var TAG = "TimeTravelClock";
	var timeLastSet;
	var simulatedTime;

	/**
	 * Sets the internal time.
	 * @param date Date to which the timeTravelDate will be set.
	 */
	this.setTimeTravelDate = function (date)
	{
		this.pauseTime();
		timeLastSet = (new Date).getTime();
		simulatedTime = date.getTime();
	}

	/*
	 * Controller logic for playing through time at different directions and
	 * speeds.
	 */

	/**
	 * Increases the rate of time travel into the future
	 * (or decreases the rate of time travel into the past.)
	 */
	this.accelerateTimeTravel = function ()
	{
		if (speedIndex < SPEEDS.length - 1)
		{
			Log.d(TAG, "Accelerating speed to: " + SPEEDS[speedIndex]);
			++speedIndex;
		}
		else
		{
			Log.d(TAG, "Already at max forward speed");
		}
	};

	/**
	 * Decreases the rate of time travel into the future
	 * (or increases the rate of time travel into the past.)
	 */
	this.decelerateTimeTravel = function ()
	{
		if (speedIndex > 0)
		{
			Log.d(TAG, "Decelerating speed to: " + SPEEDS[speedIndex]);
			--speedIndex;
		}
		else
		{
			Log.d(TAG, "Already at maximum backwards speed");
		}
	};

	/**
	 * Pauses time.
	 */
	this.pauseTime = function ()
	{
		Log.d(TAG, "Pausing time");
		//assert SPEEDS[STOPPED_INDEX].rate == 0.0;
		speedIndex = STOPPED_INDEX;
	};

	/**
	 * @return The current speed tag, a string describing the speed of time
	 * travel.
	 */
	this.getCurrentSpeedTag = function ()
	{
		return SPEEDS[speedIndex].labelTag;
	};

	this.getTimeInMillisSinceEpoch = function ()
	{
		var now = (new Date()).getTime();
		var elapsedTimeMillis = now - timeLastSet;
		var rate = SPEEDS[speedIndex].rate;
		var timeDelta = Math.trunc(rate * elapsedTimeMillis);
		if (Math.abs(rate) >= TimeConstants.SECONDS_PER_DAY)
		{
			// For speeds greater than or equal to 1 day/sec we want to move in
			// increments of 1 day so that the map isn't dizzyingly fast.
			// This shows the slow annual procession of the stars.
			var days = Math.trunc(timeDelta / TimeConstants.MILLISECONDS_PER_DAY);
			if (days == 0)
			{
				return simulatedTime;
			}
			// Note that this assumes that time requests will occur right on the
			// day boundary.	If they occur later then the next time jump
			// might be a bit shorter than it should be.	Nevertheless the refresh
			// rate of the renderer is high enough that this should be unnoticeable.
			timeDelta = Math.trunc(days * TimeConstants.MILLISECONDS_PER_DAY);
		}
		timeLastSet = now;
		simulatedTime += timeDelta;
		return simulatedTime;
	};
}
