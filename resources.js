var Log =
{
	d: function() {},
	e: function (a,b) {console.log(a + b); console.trace()},
	i: function () {},
	w: function (a,b) {},//console.log(a + b); console.trace()},
};
var TAG = "";

var R = {
	drawable: {
		jupiter : 'drawable/jupiter.png',
		mars : 'drawable/mars.png',
		mercury : 'drawable/mercury.png',
		moon0 : 'drawable/moon0.png',
		moon1 : 'drawable/moon1.png',
		moon2 : 'drawable/moon2.png',
		moon3 : 'drawable/moon3.png',
		moon4 : 'drawable/moon4.png',
		moon5 : 'drawable/moon5.png',
		moon6 : 'drawable/moon6.png',
		moon7 : 'drawable/moon7.png',
		neptune : 'drawable/neptune.png',
		pluto : 'drawable/pluto.png',
		saturn : 'drawable/saturn.png',
		sun : 'drawable/sun.png',
		uranus : 'drawable/uranus.png',
		venus : 'drawable/venus.png',
		
		line : 'drawable/line.png',
		
		stars_texture : 'drawable/stars_texture.png',
	},
	string: {
		show_sky_gradient : 36 + 0x7f0a0000,
		
		ecliptic : 41 + 0x7f0a0000,
		north_pole : 138 + 0x7f0a0000,
		south_pole : 139 + 0x7f0a0000,
		zenith : 54 + 0x7f0a0000,
		nadir : 55 + 0x7f0a0000,
		north : 56 + 0x7f0a0000,
		east : 57 + 0x7f0a0000,
		west : 58 + 0x7f0a0000,
		south : 59 + 0x7f0a0000,

		time_travel_stopped : 81 + 0x7f0a0000,
		time_travel_second_speed : 82 + 0x7f0a0000,
		time_travel_minute_speed : 83 + 0x7f0a0000,
		time_travel_10minute_speed : 84 + 0x7f0a0000,
		time_travel_hour_speed : 85 + 0x7f0a0000,
		time_travel_day_speed : 86 + 0x7f0a0000,
		time_travel_week_speed : 87 + 0x7f0a0000,
		time_travel_second_speed_back : 88 + 0x7f0a0000,
		time_travel_minute_speed_back : 89 + 0x7f0a0000,
		time_travel_10minute_speed_back : 90 + 0x7f0a0000,
		time_travel_hour_speed_back : 91 + 0x7f0a0000,
		time_travel_day_speed_back : 92 + 0x7f0a0000,
		time_travel_week_speed_back : 93 + 0x7f0a0000,
		
		sun : 107 + 0x7f0a0000,
		moon : 108 + 0x7f0a0000,
		mercury : 109 + 0x7f0a0000,
		venus : 110 + 0x7f0a0000,

		mars : 112 + 0x7f0a0000,
		jupiter : 113 + 0x7f0a0000,
		saturn : 114 + 0x7f0a0000,
		uranus : 115 + 0x7f0a0000,
		neptune : 116 + 0x7f0a0000,
		pluto : 117 + 0x7f0a0000,
	}
};

var ResourceManager = new (function()
{
	var peak = 1;
	var pendingResources = [];

	this.getProgress = function ()
	{
		if (pendingResources.length == 0)
		{
			return 1.0;
		};
		return 1.0 - pendingResources.length / peak;
	};

	this.loadImage = function (src, onload)
	{
		var img = document.createElement('img');
		img.onload = function ()
		{
			var index = pendingResources.indexOf(img);
			if (index != -1)
			{
				pendingResources.splice(index, 1);
			}
			else
			{
				console.log('Error:' + img.src + ' not in pendingResources');
			}
			onload(img);
		};
		pendingResources.push(img);
		peak = pendingResources.length;
		img.src = src;
		return img;
	};

	this.getString = function (id)
	{
		var index = id - 0x7f0a0001;
		if (index < 0 || index > strings.length)
		{
			throw new Error('id ' + id.toString(16)
						+ ' : index ' + index
						+ ' exceeds ' + strings.length + ', failed to get string');
		}
		return strings[index].string;
	}
})();

