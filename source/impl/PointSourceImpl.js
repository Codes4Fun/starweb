/**
 * This class represents a astronomical point source, such as a star, or a distant galaxy.
 *
 * @author Brent Bryan
 */

function PointSourceImpl (a1, a2, a3, a4)
{
	this.size;
	var pointShape;

	this.getSize = function ()
	{
		return this.size;
	};

	this.getPointShape = function ()
	{
		return pointShape;
	};

	// constructor
	{
		if (a1.constructor == GeocentricCoordinates)
		{
			AbstractSource.call(this, a1, a2);
			this.size = a3;
			if (a4 != undefined)
			{
				pointShape = a4;
			}
			else
			{
				pointShape = PointSource.Shape.CIRCLE;
			}
		}
		else
		{
			AbstractSource.call(this, GeocentricCoordinates.getInstance(a1, a2), a3);
			pointShape = a4;
		}
	}
}

var PointSource = PointSourceImpl;



PointSource.Shape = {
	CIRCLE : 0,
	STAR : 1,
	ELLIPTICAL_GALAXY : 2,
	SPIRAL_GALAXY : 3,
	IRREGULAR_GALAXY : 4,
	LENTICULAR_GALAXY : 3,
	GLOBULAR_CLUSTER : 5,
	OPEN_CLUSTER : 6,
	NEBULA : 7,
	HUBBLE_DEEP_FIELD : 8
};

