Sky Map for the Web
===

# starweb

starweb is a port of [stardroid] to html/javascript/webgl. In addition it provides support for [WebVR] and it has been tested to work with:

  - Oculus Rift DK1/DK2
  - [Firefox MozVR]
  - [Chromium WebVR] (geolocation service broken)

It should also work with Google Cardboard, it has been tested on Firefox Mobile without WebVR.

Give it a Try! http://codes4fun.github.io/starweb/

[stardroid] is the project for the [Sky Map] android app, written in Java with the Android SDK.

### Version
0.5.0

### NOTES

## USAGE

To enable fullscreen mode (which includes WebVR) click the webgl viewport. This is temporary until real UI is implemented.

## TODO

 - Fix rendering order (may not just-work in VR).
 - Implement UI for settings/preferences.
 - Support Google Cardboard mobile browsers without WebVR.
 - Port SkyRegionMap (optimization).
 - Lots more testing!

## MISC

I originally intended this to be a 1 week project and it is already going past that.

Things that I may not complete given how much time I have:
 - multi-language support
 - fix text aliasing issues, introduced to get full 3d text in VR.
 - searching

I accept bitcoins!
[17Mqj42oV1xtMWt16MBPyveZZXKUaJFH1H]

## LICENSE
----

Apache License, Version 2.0


[WebVR]:http://webvr.info/
[stardroid]:https://github.com/sky-map-team/stardroid
[Sky Map]:https://play.google.com/store/apps/details?id=com.google.android.stardroid&hl=en
[Firefox MozVR]:http://mozvr.com/downloads/
[Chromium WebVR]:https://drive.google.com/folderview?id=0BzudLt22BqGRbW9WTHMtOWMzNjQ&usp=sharing#list
[17Mqj42oV1xtMWt16MBPyveZZXKUaJFH1H]:https://blockchain.info/address/17Mqj42oV1xtMWt16MBPyveZZXKUaJFH1H
