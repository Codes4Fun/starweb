
Color = {};

Color.BLACK = 0xff000000;
Color.CYAN = 0xff00ffff;
Color.WHITE = 0xffffffff;
Color.YELLOW = 0xffffff00;

Color.argb = function (alpha, red, green, blue)
{
	return (alpha<<24) | (red<<16) | (green<<8) | blue;
};

Color.alpha = function (color)
{
	return (color>>24)&0xff;
};

Color.blue = function (color)
{
	return color&0xff;
};

Color.green = function (color)
{
	return (color>>8)&0xff;
};

Color.red = function (color)
{
	return (color>>16)&0xff;
};
