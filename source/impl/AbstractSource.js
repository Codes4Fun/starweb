/** This class represents the base of an astronomical object to be
 * displayed by the UI.	These object need not be only stars and
 * galaxies but also include labels (such as the name of major stars)
 * and constellation depictions.
 *
 * @author Brent Bryan
 */
function AbstractSource(a, b)
{
	var color;
	var xyz;
	var names;

	if (b == undefined)
	{
		xyz = GeocentricCoordinates.getInstance(0.0, 0.0);
		if (a == undefined)
		{
			color = Color.BLACK;
		}
		else
		{
			color = a;
		}
	}
	else
	{
		xyz = a;
		color = b;
	}

	this.getNames = function ()
	{
		return names;
	}

	this.setNames = function (names)
	{
		this.names = names;
	}

	this.getColor = function ()
	{
		return color;
	}

	this.getLocation = function ()
	{
		return xyz;
	}
}
