
function RealClock()
{
	this.getTimeInMillisSinceEpoch = function ()
	{
		return (new Date()).getTime();
	};
}

