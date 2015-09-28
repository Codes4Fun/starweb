/**
 *	A celestial object represented by an image, such as a planet or a
 *	galaxy.
 */
function ImageSourceImpl(a1, a2, a3, a4, a5, a6)
{
	// These two vectors, along with Source.xyz, determine the position of the
	// image object.	The corners are as follows
	//
	//	xyz-u+v	 xyz+u+v
	//		 +---------+		 ^
	//		 |	 xyz	 |		 | v
	//		 |		.		|		 .
	//		 |				 |
	//		 +---------+
	//	xyz-u-v		xyz+u-v
	//
	//					.--->
	//						u
	this.ux;
	this.uy;
	this.uz;
	this.vx;
	this.vy;
	this.vz;

	this.image;

	//this.requiresBlending = false;

	var imageScale;
	var resources;

	this.setImageId = function (imageId)
	{
		this.image = resources.loadImage(imageId, function(img) {});
	};

	this.getImage = function ()
	{
		return this.image;
	}

	this.getHorizontalCorner = function ()
	{
		return [this.ux, this.uy, this.uz];
	}

	this.getVerticalCorner = function ()
	{
		return [this.vx, this.vy, this.vz];
	}

	this.requiresBlending = function ()
	{
		return false;//this.requiresBlending;
	}

	this.getResources = function ()
	{
		return resources;
	};

	this.setUpVector = function (upVec)
	{
		var p = this.getLocation();
		var u = VectorUtil.negate(VectorUtil.normalized(VectorUtil.crossProduct(p, upVec)));
		var v = VectorUtil.crossProduct(u, p);

		v.scale(imageScale);
		u.scale(imageScale);

		// TODO(serafini): Can we replace these with a float[]?
		this.ux = u.x;
		this.uy = u.y;
		this.uz = u.z;

		this.vx = v.x;
		this.vy = v.y;
		this.vz = v.z;
	}

	// constructor
	{
		var coords;
		var id;
		var upVec;

		if (a1.constructor == GeocentricCoordinates)
		{
			coords = a1;
			resources = a2;
			id = a3;
			upVec = a4;
			imageScale = a5;
		}
		else
		{
			coords = GeocentricCoordinates.getInstance(a1, a2);
			resources = a3;
			id = a4;
			upVec = (a5 != undefined)? a5 : new Vector(0, 1, 0);
			imageScale = (a6 != undefined)? a6 : 1;
		}

		AbstractSource.call(this, coords, Color.WHITE);

		this.setUpVector(upVec);
		this.setImageId(id);
	}
}

var ImageSource = ImageSourceImpl;
