
/**
 * A simple struct for latitude and longitude.
 * 
 */
function LatLong (latitude, longitude)
{
	this.latitude = latitude;
	this.longitude = longitude;

	/**
	 * Angular distance between the two points.
	 * @param other
	 * @return degrees
	 */
	this.distanceFrom = function (other)
	{
		// Some misuse of the astronomy math classes
		var otherPnt = GeocentricCoordinates.getInstance(other.longitude,
														other.latitude);
		var thisPnt = GeocentricCoordinates.getInstance(this.longitude,
														this.latitude);
		var cosTheta = Geometry.cosineSimilarity(thisPnt, otherPnt);
		return Math.acos(cosTheta) * 180 / Math.PI;
	}
}
