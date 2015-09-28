var Log =
{
	d: function() {},
	e: function (a,b) {console.log(a + b); console.trace()},
	i: function () {},
	w: function (a,b) {console.log(a + b); console.trace()},
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
		jupiter : 'Jupiter',
		mars : 'Mars',
		mercury : 'Mercury',
		moon : 'Moon',
		neptune : 'Neptune',
		pluto : 'Pluto',
		saturn : 'Saturn',
		sun : 'Sun',
		uranus : 'Uranus',
		venus : 'Venus',

		time_travel_stopped : "Time travel frozen",
		time_travel_second_speed : "Traveling > @ 1 sec/sec",
		time_travel_minute_speed : "Traveling > @ 1 min/sec",
		time_travel_10minute_speed : "Traveling > @ 10 min/sec",
		time_travel_hour_speed : "Traveling > @ 1 hour/sec",
		time_travel_day_speed : "Traveling > @ 1 day/sec",
		time_travel_week_speed : "Traveling > @ 1 week/sec",
		time_travel_second_speed_back : "Traveling < @ 1 sec/sec",
		time_travel_minute_speed_back : "Traveling < @ 1 min/sec",
		time_travel_10minute_speed_back : "Traveling < @ 10 min/sec",
		time_travel_hour_speed_back : "Traveling < @ 1 hour/sec",
		time_travel_day_speed_back : "Traveling < @ 1 day/sec",
		time_travel_week_speed_back : "Traveling < @ 1 week/sec",
	}
};
