/**
 * Class for representing a 3x3 matrix explicitly, avoiding heap
 * allocation as far as possible.
 *
 * @author Dominic Widdows
 */
function Matrix33(xx, xy, xz, yx, yy, yz, zx, zy, zz)
{
	if (xx != undefined)
	{
		/**
		 * Construct a new matrix.
		 * @param xx row 1, col 1
		 * @param xy row 1, col 2
		 * @param xz row 1, col 3
		 * @param yx row 2, col 1
		 * @param yy row 2, col 2
		 * @param yz row 2, col 3
		 * @param zx row 3, col 1
		 * @param zy row 3, col 2
		 * @param zz row 3, col 3
		 */
		if (xx.constructor == Number)
		{
			this.xx = xx;
			this.xy = xy;
			this.xz = xz;
			this.yx = yx;
			this.yy = yy;
			this.yz = yz;
			this.zx = zx;
			this.zy = zy;
			this.zz = zz;
		}
		/**
		 * Construct a matrix from three column vectors.
		 */
		/**
		 * Construct a matrix from three vectors.
		 * @param columnVectors true if the vectors are column vectors, otherwise
		 * they're row vectors.
		 */
		else if(xx instanceof Vector3)
		{
			var v1 = xx;
			var v2 = xy;
			var v3 = xz;
			var columnVectors = (yx != undefined)? yx : true;
			if (columnVectors)
			{
				this.xx = v1.x;
				this.yx = v1.y;
				this.zx = v1.z;
				this.xy = v2.x;
				this.yy = v2.y;
				this.zy = v2.z;
				this.xz = v3.x;
				this.yz = v3.y;
				this.zz = v3.z;
			}
			else
			{
				this.xx = v1.x;
				this.xy = v1.y;
				this.xz = v1.z;
				this.yx = v2.x;
				this.yy = v2.y;
				this.yz = v2.z;
				this.zx = v3.x;
				this.zy = v3.y;
				this.zz = v3.z;
			}
		}
		else
		{
			throw Error('Matrix33 unknown parameter ' + xx.constructor.name);
		}
	}
	else
	{
		/**
		 * Create a zero matrix.
		 */
		this.xx = 0;
		this.xy = 0;
		this.xz = 0;
		this.yx = 0;
		this.yy = 0;
		this.yz = 0;
		this.zx = 0;
		this.zy = 0;
		this.zz = 0;
	}

	// TODO(widdows): rename this to something like copyOf().
	this.clone = function ()
	{
		return new Matrix33(this.xx, this.xy, this.xz,
							 this.yx, this.yy, this.yz,
							 this.zx, this.zy, this.zz);
	};

	this.getDeterminant = function ()
	{
		return this.xx*this.yy*this.zz
			  + this.xy*this.yz*this.zx
			  + this.xz*this.yx*this.zy
			  - this.xx*this.yz*this.zy
			  - this.yy*this.zx*this.xz
			  - this.zz*this.xy*this.yx;
	};

	this.getInverse = function ()
	{
		var det = this.getDeterminant();
		if (det == 0.0) return null;
		return new Matrix33(
				(this.yy*this.zz - this.yz*this.zy) / det,
				(this.xz*this.zy - this.xy*this.zz) / det,
				(this.xy*this.yz - this.xz*this.yy) / det,
				(this.yz*this.zx - this.yx*this.zz) / det,
				(this.xx*this.zz - this.xz*this.zx) / det,
				(this.xz*this.yx - this.xx*this.yz) / det,
				(this.yx*this.zy - this.yy*this.zx) / det,
				(this.xy*this.zx - this.xx*this.zy) / det,
				(this.xx*this.yy - this.xy*this.yx) / det);
	};

	/**
	 * Transpose the matrix, in place.
	 */
	this.transpose = function ()
	{
		var tmp;
		tmp = this.xy;
		this.xy = this.yx;
		this.yx = tmp;

		tmp = this.xz;
		this.xz = this.zx;
		this.zx = tmp;

		tmp = this.yz;
		this.yz = this.zy;
		this.zy = tmp;
	}

	this.getFloatArray = function ()
	{
		return [
			this.xx,
			this.xy,
			this.xz,
			this.yx,
			this.yy,
			this.yz,
			this.zx,
			this.zy,
			this.zz,
		];
	}
}

Matrix33.getIdMatrix = function ()
{
	return new Matrix33(1, 0, 0, 0, 1, 0, 0, 0, 1);
};
