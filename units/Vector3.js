
function Vector3(a, b, c)
{
	this.x = 0;
	this.y = 0;
	this.z = 0;

	if (a != undefined)
	{
		if (a.constructor == Number)
		{
			this.x = a;
			this.y = b;
			this.z = c;
		}
		else if (a.constructor == Array)
		{
			if (a.length != 3)
			{
				throw new Error("Trying to create 3 vector from array of length: " + a.length);
			}
			this.x = a[0];
			this.y = a[1];
			this.z = a[2];
		}
	}

	this.copy = function ()
	{
		return new Vector3(this.x, this.y, this.z);
	};

	this.assign = function (x, y, z)
	{
		if (x instanceof Vector3)
		{
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
			return;
		}
		this.x = x;
		this.y = y;
		this.z = z;
	}

	this.length = function ()
	{
		return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
	}

	/**
	 * Normalize the vector in place, i.e., map it to the corresponding unit vector.
	 */
	this.normalize = function ()
	{
		var norm = this.length();
		this.x = this.x / norm;
		this.y = this.y / norm;
		this.z = this.z / norm;
	}

	/**
	 * Scale the vector in place.
	 */
	this.scale = function (scale)
	{
		this.x = this.x * scale;
		this.y = this.y * scale;
		this.z = this.z * scale;
	}

	this.toFloatArray = function ()
	{
		return [x, y, z];
	}

	this.equals = function (object)
	{
		if (!(object instanceof Vector3))
		{
			return false;
		}
		// float equals is a bit of a dodgy concept
		return other.x == this.x && other.y == this.y && other.z == this.z;
	}
}


