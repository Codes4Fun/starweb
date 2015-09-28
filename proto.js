
var definitions = 
{
	GeocentricCoordinatesProto :
	{
		1 : { name : 'right_ascension', type : 'float', rule : 'optional' },
		2 : { name : 'declination', type : 'float', rule : 'optional' },
	},
	PointElementProto :
	{
		1 : { name : 'location', type : 'GeocentricCoordinatesProto', rule : 'optional' },
		2 : { name : 'color', type : 'uint32', rule : 'optional' },
		3 : { name : 'size', type : 'int32', rule : 'optional' },
		4 : { name : 'shape', type : 'enum', rule : 'optional' },
	},
	LabelElementProto :
	{
		1 : { name : 'location', type : 'GeocentricCoordinatesProto', rule : 'optional' },
		2 : { name : 'color', type : 'uint32', rule : 'optional' },
		3 : { name : 'string_index', type : 'int32', rule : 'optional' },
		4 : { name : 'font_size', type : 'int32', rule : 'optional' },
		5 : { name : 'offset', type : 'float', rule : 'optional' },
	},
	LineElementProto :
	{
		1 : { name : 'color', type : 'uint32', rule : 'optional' },
		2 : { name : 'line_width', type : 'float', rule : 'optional' },
		3 : { name : 'vertex', type : 'GeocentricCoordinatesProto', rule : 'repeated' },
	},
	AstronomicalSourceProto :
	{
		1 : { name : 'name_ids', type : 'uint32', rule : 'repeated' },
		2 : { name : 'search_location', type : 'GeocentricCoordinatesProto', rule : 'optional' },
		3 : { name : 'search_level', type : 'float', rule : 'optional' },
		4 : { name : 'level', type : 'float', rule : 'optional' },
		5 : { name : 'point', type : 'PointElementProto', rule : 'repeated' },
		6 : { name : 'label', type : 'LabelElementProto', rule : 'repeated' },
		7 : { name : 'line', type : 'LineElementProto', rule : 'repeated' },
	},
	AstronomicalSourcesProto : 
	{
		1 : { name : 'source', type : 'AstronomicalSourceProto', rule : 'repeated' }
	},
};

var primitives =
{
	'int32' : { wireType : 0 },
	'int64' : { wireType : 0 },
	'uint32' : { wireType : 0 },
	'uint64' : { wireType : 0 },
	'sint32' : { wireType : 0 },
	'sint64' : { wireType : 0 },
	'bool' : { wireType : 0 },
	'enum' : { wireType : 0 },

	'fixed64' : { wireType : 1 },
	'sfixed64' : { wireType : 1 },
	'double' : { wireType : 1 },

	'string' : { wireType : 2 },

	'fixed32' : { wireType : 5 },
	'sfixed32' : { wireType : 5 },
	'float' : { wireType : 5 },
};


function skipVarInt(data, end)
{
	while (true)
	{
		if (data.offset + 1 > end) throw new Error('stream smaller than expected');
		b = data.getUint8(data.offset++);
		if ((b & 0x80) == 0)
		{
			break;
		}
	}
}

function decodeVarUint(data, end)
{
	// avoid bitwise operators for unsigned values
	var result = 0;
	var scale = 1;
	var b;
	while (true)
	{
		if (data.offset + 1 > end) throw new Error('stream smaller than expected');
		b = data.getUint8(data.offset++);
		if ((b & 0x80) == 0)
		{
			result += Number(b) * scale;
			break;
		}
		result += (b & 0x7f) * scale;
		scale *= 128;
	}
	return result;
}

function decodeVarInt(data, end)
{
	var result = 0;
	var shift = 0;
	var b;
	while (true)
	{
		if (data.offset + 1 > end) throw new Error('stream smaller than expected');
		b = data.getUint8(data.offset++);
		if ((b & 0x80) == 0)
		{
			result |= b << shift;
			break;
		}
		result |= (b & 0x7f) << shift;
		shift += 7;
	}
	return result;
}
var db;
function decodeMessage(definitions, type, data, end)
{
	var messageProto = definitions[type];
	var message = {};
	var b, field, wireType;
	while (data.offset < end)
	{
		b = data.getUint8(data.offset++);
		field = messageProto[b >> 3];
		wireType = b & 0x7;
		if (field == undefined)
		{
			console.log('unexpected field ' + field + ' for ' + type +' was skipped');
			if (wireType == 1)
			{
				if (data.offset + 8 > end) throw new Error('stream smaller than expected');
				data.offset += 8;
				continue;
			}
			if (wireType == 5)
			{
				if (data.offset + 4 > end) throw new Error('stream smaller than expected');
				data.offset += 4;
				continue;
			}
			if (wireType == 0)
			{
				skipVarInt(data, end);
				continue;
			}
			if (wireType == 2)
			{
				var length = decodeVarInt(data, end);
				if (data.offset + length > end) throw new Error('stream smaller than expected');
				data.offset += length;
				continue;
			}
			throw new Error ('unhandled wire type ' + wireType + ' at ' + data.offset);
			continue;
		}
		var value;
		if (definitions[field.type])
		{
			var length = decodeVarInt(data, end);
			if (data.offset + length > end) throw new Error('stream smaller than expected');
			value = decodeMessage(definitions, field.type, data, data.offset + length);
		}
		else
		{
			var prim = primitives[field.type];
			if (!prim)
			{
				throw new Error('unknown field type ' + field.type);
			}
			if (wireType == 2)
			{
				if (field.rule != 'repeated')
				{
					throw new Error('packed ' + field.type + ' is not to be repeated in ' + type);
				}
				throw new Error('packed ' + field.type + ' decoding not implemented yet!!!!');
			}
			else if (prim.wireType != wireType)
			{
				throw new Error('field ' + field.name + ' mismatch in wireTypes');
			}
			else
			{
				if (wireType == 0)
				{
					if (field.type == 'int32')
					{
						value = decodeVarInt(data, end);
					}
					else if (field.type == 'uint32' || field.type == 'enum')
					{
						if (db == undefined && field.name == 'color') db = data.offset;
						value = decodeVarUint(data, end);
					}
					else
					{
						throw new Error('decoding ' + field.type + ' not implemented yet!!!!');
					}
				}
				else if (wireType == 1)
				{
					throw new Error('decoding ' + field.type + ' not implemented yet!!!!');
				}
				else if (wireType == 5)
				{
					if (field.type == 'float')
					{
						if (data.offset + 4 > end) throw new Error('stream smaller than expected');
						value = data.getFloat32(data.offset, true);
						data.offset += 4;
					}
					else
					{
						throw new Error('decoding ' + field.type + ' not implemented yet!!!!');
					}
				}
			}
		}
		if (field.rule == 'repeated')
		{
			if (!message[field.name])
			{
				message[field.name] = [];
			}
			message[field.name].push(value);
		}
		else
		{
			if (message[field.name])
			{
				console.log('field ' + field.name + ' repeated in ' + type + ' replacing entry');
			}
			message[field.name] = value;
		}
	}
	if (data.offset != end)
	{
		console.log('message stream for ' + type + ' was ' + (end - data.offset) + ' bytes bigger than expected');
		data.offset = end;
	}
	return message;
}
