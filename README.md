Sky Map for the Web
===

## starweb

starweb is a port of [stardroid] to html/javascript/webgl. In addition it provides support for [WebVR] and it has been tested to work with:

  - Oculus Rift DK1/DK2
  - [Firefox MozVR]
  - [Chromium WebVR] (geolocation service broken)

It should also work with Google Cardboard with WebVR browser but that is untested, but it has been tested on Mobile Chrome and Firefox browsers without WebVR, but there may still be issues with that.

Give it a Try! (maybe read usage instructions below) http://codes4fun.github.io/starweb/

[stardroid] is the project for the [Sky Map] android app, written in Java with the Android SDK.

### Version
0.7.0

### NOTES

#### USAGE

With WebVR and an HMD on the desktop:

1. Turn on your HMD.
2. Start your [WebVR] enabled browser.
3. Navigate to http://codes4fun.github.io/starweb/
3. If the HMD is detected you will see the HMD icon on the bottom right as orange or white if it is disabled.
4. If using ChromeVR set your real longitude/latitude by pressing the top right location button (hint:you can get your long/lat from maps.google.com URL).
5. Face your HMD north and press the set north compass button on the right.
6. Press the resize arrows button on the lower right and it will show up in your HMD.
7. Put on your HMD and find the planets!

Web browser (Chrome or Firefox) without WebVR on a mobile device:

1. Start the browser.
2. Navigate to http://codes4fun.github.io/starweb/
3. Click the HMD icon to turn it orange.
4. Press the resize arrows button on the lower right and it should go fullscreen with left and right images.
5. Place inside a google cardboard case and put it on!

Buttons on the left hide/show layers:
 - stars
 - constellations
 - messier (currently not implemented)
 - planets
 - meteor showers (not implemented)
 - grid
 - horizon

Buttons on the right:
 - set location manually
 - set current direction as north
 - enable/disable stereoscopic 3d/vr in fullscreen
 - show full screen.

#### MISC

I originally intended this to be a 1 week project and it is already going past that.

Things that I may not complete given how much time I have:
 - Layers for Meteor Showers, Messier Objects. Need know what to look for to test them.
 - multi-language support
 - fix text aliasing issues, introduced to get full 3d text in VR.
 - searching
 - night vision mode

Improvements for VR:
 - Small space option (room size distance for example), need head position tracking to be integrated.
 - maybe try to used fixed labels instead of rotating them by head orientation.

I accept bitcoins!
[17Mqj42oV1xtMWt16MBPyveZZXKUaJFH1H]

#### LICENSE
----

Apache License, Version 2.0


[WebVR]:http://webvr.info/
[stardroid]:https://github.com/sky-map-team/stardroid
[Sky Map]:https://play.google.com/store/apps/details?id=com.google.android.stardroid&hl=en
[Firefox MozVR]:http://mozvr.com/downloads/
[Chromium WebVR]:https://drive.google.com/folderview?id=0BzudLt22BqGRbW9WTHMtOWMzNjQ&usp=sharing#list
[17Mqj42oV1xtMWt16MBPyveZZXKUaJFH1H]:https://blockchain.info/address/17Mqj42oV1xtMWt16MBPyveZZXKUaJFH1H
