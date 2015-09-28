/**
 * A clock that knows how to transition between a {@link TimeTravelClock}
 * and another {@link Clock}.	Usually this other
 * Clock will be a {@link RealClock}.
 *
 * @author John Taylor
 *
 */
/**
 * Constructor.
 *
 * The realClock parameter serves two purposes - both as the clock to query
 * when in realtime mode, and also to count the beats during the transition
 * between realtime and timetravel modes to ensure a smooth transition.
 */
function TransitioningCompositeClock(timeTravelClock, realClock)
{
	this.TRANSITION_TIME_MILLIS = 2500;
	var TAG = "TransitioningCompositeClock";
	var Mode = {REAL_TIME:0, TRANSITION:1, TIME_TRAVEL:2};
	var mode = Mode.REAL_TIME;
	var startTime;
	var endTime;
	var startTransitionWallTime;
	var transitionTo;

	this.goTimeTravel = function (targetDate)
	{
		startTime = getTimeInMillisSinceEpoch();
		endTime = targetDate.getTime();
		timeTravelClock.setTimeTravelDate(targetDate);
		mode = Mode.TRANSITION;
		transitionTo = Mode.TIME_TRAVEL;
		startTransitionWallTime = realClock.getTimeInMillisSinceEpoch();
	};

	this.returnToRealTime = function ()
	{
		startTime = getTimeInMillisSinceEpoch();
		endTime = realClock.getTimeInMillisSinceEpoch() + TRANSITION_TIME_MILLIS;
		mode = Mode.TRANSITION;
		transitionTo = Mode.REAL_TIME;
		startTransitionWallTime = realClock.getTimeInMillisSinceEpoch();
	};

	this.getTimeInMillisSinceEpoch = function ()
	{
		if (mode == Mode.TRANSITION)
		{
			var elapsedTimeMillis = realClock.getTimeInMillisSinceEpoch() - startTransitionWallTime;
			if (elapsedTimeMillis > this.TRANSITION_TIME_MILLIS)
			{
				mode = transitionTo;
			}
			else
			{
				return TransitioningCompositeClock.interpolate(
						startTime, endTime, elapsedTimeMillis / this.TRANSITION_TIME_MILLIS);
			}
		}
		switch(mode)
		{
		case Mode.REAL_TIME:
			return realClock.getTimeInMillisSinceEpoch();
		case Mode.TIME_TRAVEL:
			return timeTravelClock.getTimeInMillisSinceEpoch();
		}
		Log.e(TAG, "Mode is neither realtime or timetravel - this should never happen");
		// While this will never happen - if it does let's just return real time.
		return realClock.getTimeInMillisSinceEpoch();
	};
}

/**
 * An interpolation function to smoothly interpolate between start
 * at lambda = 0 and end at lambda = 1
 */
TransitioningCompositeClock.interpolate = function (start, end, lambda)
{
	return	(start + (3 * lambda * lambda - 2 * lambda * lambda * lambda) * (end - start));
}

