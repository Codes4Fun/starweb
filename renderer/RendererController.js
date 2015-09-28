/**
 * Allows the rest of the program to communicate with the SkyRenderer by queueing
 * events.
 * @author James Powell
 */
function RendererController(renderer, view)
{
	RendererControllerBase.call(this, renderer);

	var mQueuer = {
		queueEvent : function (r)
		{
			view.queueEvent(r);
		}
	};

	this.getQueuer = function ()
	{
		return mQueuer;
	};
}


