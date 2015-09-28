/**
 * A Source which consists of only a text label (no point will be drawn).
 *
 * @author Brent Bryan
 */
function TextSourceImpl(a1,a2,a3,a4,a5)
{
	this.label;
	this.offset;
	this.fontSize;

	this.getText = function ()
	{
		return this.label;
	}

	this.getFontSize = function ()
	{
		return this.fontSize;
	}

	this.getOffset = function ()
	{
		return this.offset;
	}

	this.setText = function (newText)
	{
		this.label = newText;
	}

	// constructor
	{
		if (a1.constructor == GeocentricCoordinates)
		{
			AbstractSource.call(this, a1, a3);
			this.label = a2;
			if (a4 != undefined)
			{
				this.offset = a4;
				this.fontSize = a5;
			}
			else
			{
				this.offset = 0.2;
				this.fontSize = 15;
			}
		}
		else
		{
			AbstractSource.call(this, GeocentricCoordinates.getInstance(a1,a2), a4);
			this.label = a3;
			this.offset = 0.2;
			this.fontSize = 15;
		}
	}
}

var TextSource = TextSourceImpl;
