/**
 * For representing constellations, constellation boundaries etc.
 */
function LineSourceImpl (a1, a2, a3)
{
	this.vertices;
	this.raDecs;
	this.lineWidth;

	this.getLineWidth = function ()
	{
		return this.lineWidth;
	};
	this.getVertices = function ()
	{
		var result;
		if (this.vertices != null)
		{
			result = this.vertices;
		}
		else
		{
			result = [];
		}
		return result;
	};

	// constructor
	{
		if (a1 == undefined)
		{
			AbstractSource.call(this, Color.WHITE);
			this.vertices = [];
			this.lineWidth = 1.5;
		}
		else
		{
			AbstractSource.call(this, a1);
			if (a2 == undefined)
			{
				this.vertices = [];
				this.lineWidth = 1.5;
			}
			else
			{
				this.vertices = a2;
				this.lineWidth = a3;
			}
		}
		this.raDecs = [];
	}
}

var LineSource = LineSourceImpl;
