
/**
 * Implementation of the
 * {@link com.google.android.stardroid.source.AstronomicalSource} interface
 * from objects serialized as protocol buffers.
 *
 * @author Brent Bryan
 */
function ProtobufAstronomicalSource(proto, resources) 
{
	AbstractAstronomicalSource.call(this);

	var shapeMap = {};

	shapeMap[0] = PointSource.Shape.CIRCLE;
	shapeMap[1] = PointSource.Shape.CIRCLE;
	shapeMap[2] = PointSource.Shape.ELLIPTICAL_GALAXY;
	shapeMap[3] = PointSource.Shape.SPIRAL_GALAXY;
	shapeMap[4] = PointSource.Shape.IRREGULAR_GALAXY;
	shapeMap[5] = PointSource.Shape.LENTICULAR_GALAXY;
	shapeMap[6] = PointSource.Shape.GLOBULAR_CLUSTER;
	shapeMap[7] = PointSource.Shape.OPEN_CLUSTER;
	shapeMap[8] = PointSource.Shape.NEBULA;
	shapeMap[9] = PointSource.Shape.HUBBLE_DEEP_FIELD;
 
	// Lazily construct the names.
	var names = null;

	this.getNames = function () 
	{
		if (names == null) 
		{
			names = [];
			if (proto.names_ids)
			{
				proto.name_ids.forEach(function (id)
				{
					names.push(resources.getString(id));
				});
			}
		}
		return names;
	};

	function getCoords(proto) 
	{
		return GeocentricCoordinates.getInstance(proto.right_ascension, proto.declination);
	};

	this.getSearchLocation = function () 
	{
		return getCoords(proto.search_location);
	}

	this.getPoints = function ()
	{
		if (!proto.point || proto.point.length == 0) 
		{
			return [];
		}
		var points = [];
		proto.point.forEach(function (element)
		{
			points.push(new PointSourceImpl(getCoords(element.location),
				element.color, element.size, shapeMap[element.shape]));
		});
		return points;
	};

	this.getLabels = function () 
	{
		if (!proto.label || proto.label.length == 0) 
		{
			return [];
		}
		var points = [];
		proto.label.forEach(function (element)
		{
			points.push(new TextSourceImpl(getCoords(element.location),
				resources.getString(element.string_index),
				element.color, element.offset, element.font_size));
		});
		return points;
	};

	this.getLines = function () 
	{
		if (!proto.line || proto.line.length == 0) 
		{
			return [];
		}
		var points = [];
		proto.line.forEach(function (element)
		{
			var vertices = [];
			element.vertex.forEach(function (elementVertex)
			{
				vertices.push(getCoords(elementVertex));
			});
			var line_width = element.line_width || 1.5;
			points.push(new LineSourceImpl(element.color, vertices, line_width));
		});
		return points;
	};
}
