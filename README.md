# Misophonia Mask

<img src="app/icon.svg" width="128" alt="Icon for the masking app: a cartoon cat in a cape stands on its hind legs and strikes a heroic pose" />

**[Open the app in your browser](https://cgjennings.ca/live/misophonia-mask/)**

## What is misophonia?
Misophonia is a disorder characterized by decreased tolerance to the perception of certain sounds.
When these sounds are perceived by an individual with misophonia, they trigger an extreme emotional response.
This may manifest as extreme irritation, anger, disgust, or a fight-or-flight response.
The reaction is physiological rather than psychological; it is not possible to build up a tolerance to trigger sounds by repeated exposure.
Trigger sounds vary by individual and can change over time, but typical examples include chewing, loud breathing, finger tapping, or the sound caused by the friction of certain surfaces rubbing together (for example, skin or clothing).
Because trigger sounds are so commonly encountered, those with misophonia may have difficulty participating in everyday activities such as family meal time or school.
There are currently no evidenced-based treatments for misophonia.

## What is the Misophonia Mask app?
[Misophonia Mask](https://cgjennings.ca/live/misophonia-mask/) is a Web app that can play sound that may help mask out trigger sounds.
You can load it in your browser like a regular Web page.
You can also, if your device and browser support it, *install* it onto your device like a standard app.
There are two benefits to installing it: first, it is readily available when you want to use it, since you only need to open the app; and second, it will work even when your device is offline.

The app is designed to be discrete, to load quickly, to be fast and easy to activate, and to have a low impact on battery life.
It shows no ads or other external content, and it doesn't track users or take any similar action that might cause parents any concern about use by young children.
(Misophonia symptoms typically begin around ages 9&ndash;12.)

### How do I use it?
The app should be compatible with the current version of most popular browsers.

1. [Open the page.](https://cgjennings.ca/live/misophonia-mask/) Or, if you have installed it as an app, open the app on your device.
2. Choose one of the coloured circles to produce that "colour" of noise ([see below for details](#what-is-a-noise-colour)).
3. Once the sound starts playing, begin the potentially triggering task(s).
Headphones or earbuds will work better than playing the sound out of your device's built-in speaker.
For best results, use headphones with active noise cancelling technology.
4. Choose the black circle for silence.

You can also use the app to play masking background noise generally when in an environment where triggers (or focus distractions) are common or expected.

### What is a "noise colour"?

Each noise colour varies in how loud some pitch ranges (frequencies) within the noise are.
For some colours, lower frequencies may be louder, and for others, higher frequencies.
The list below describes each button colour in the order it appears:

**Black (silence)**  
The black button with the muted speaker icon stops playing noise.

**White (1)**  
White noise contains equal *energy* at all frequencies.
However, because human hearing is more sensitive to some frequencies than others, some frequencies will be *perceived* as being louder than others.

**Grey (2)**  
Grey noise is white noise that has been adjusted, using a *psychoacoustic model*, so that all frequencies sound equally loud.
(The grey noise produced by the app is approximate.
True grey noise is unique to each listener.)

**Red (3)**  
Red noise, also called brown noise, is progressively quieter at higher pitches.
It sounds softer than other colours, and is comparable to the sound of a distant waterfall.

**Pink (4)**  
Pink noise falls between white and red noise.
Like red noise it gets quieter at higher pitches, but not by as much.
The sound is comparable to the sound of a nearby, roaring waterfall.

**Green (5)**  
Green noise simulates the ambient background noise of nature without human-made sound sources.
It is similar to pink noise.

**Blue (6)**  
Blue noise is roughly the high frequency counterpart of pink noise.
Instead of getting quieter at higher pitches, it gets louder at high pitches, but not as as much louder as purple noise.
The sound is comparable to heavy rain.

**Purple (7)**  
Purple, or violet, noise is progressively louder at higher pitches.
It sounds harsher than other colours, and is comparable to the hiss of a spray can.

**Black (custom)**
The black button with the slider icon allows you to customize which frequency ranges are emphasized.
Choosing it will play white noise, but also display a set of sliders.
Each slider covers a different frequency band, from lowest (at the top) to highest (at the bottom).
When the slider knob for a band is set to +0 dB, that frequency band is at its maximum volume.
Moving the slider knob left will make the frequency band progressively quieter.
Choosing **Loudest** will set all the sliders to the maximum (+0 dB) position.
Choosing **Quietest** will set all the sliders to the minimum (-48 dB) position.

> **Note:** The effect of each slider overlaps with the sliders around it.
> For example, setting one slider to -48 dB and the next to +0 dB will make the +0 dB band much quieter than setting both to +0 dB.
> To counter this effect, arrange the sliders to form gentle curves that change slowly from band to band.
> Think rolling hills, not jagged cliffs.

### What colour should I use?
The colour that works best for a given listener, trigger, or environment may vary, so you should experiment.
The best colour is the one that is effective at the lowest volume.
Having made that clear, it can be daunting to have too many choices when you are not familiar with the 
Here are a few pointers to help you get started:

1. Good places to start are often red (3), pink (4), green (5), or grey (2).
All of these are often used for relaxation.
2. There are anecdotal reports that red may be the most effective at blocking many trigger sounds.
3. Pink noise may work better than red when using a small speaker rather than headphones.
4. Some people find green noise is more pleasant than pink when used for long periods of time.
5. Grey may make the best general purpose choice when you want to keep the volume low.

### How do I install it?
To install Misophonia Mask as an app on your device, look for an icon in the upper-right corner of the page.
In some browsers, this icon won't appear until you interact with the page at least once (just touch or click somewhere).
If the icon does not appear, then either the app is already installed or else your browser does not support installing Web sites as apps.
Note that on macOS (Mac desktops and notebooks), Safari does not support Web apps, but Chrome does.
Safari does support installing Web apps on iOS (iPhones and iPads).

You can also install the app by clicking on the "About this app" link, then the "install this page as an app" link.

Once installed, your browser may display a message stating that it was "added to your home screen".
This message is sometimes misleading.
It may or may not be added to your home screen, but it will be included in your device's apps.
For example, the Start menu on Windows, the "All Apps" page on Android, or the App Library on iOS.

**Note:** if your phone has antivirus software installed, you may get a notification about it having a "low reputation" or something similar.
This just means that the app is installed on a relatively small number of devices.
When installed as an app, Misophonia Mask is no more dangerous than it is when used as a Web page.
It still runs under all of the security protections provided by your browser, and its behaviour is the same.

# "Building" from source
This app is simple enough that there is no need for a build tool.
It is written in plain, modern JavaScript, CSS, and HTML and should run in about 90–95% of installed browsers at the time this was written.
You are free to add a build tool if you like, but for development it is sufficient to do something like the following (assumes Node.js is installed):

```bash
npx browser-sync app -w
```

## Modifying the audio clips
Editing and saving the contents of `app/clips/` directly would degrade the quality of the clips.
Instead, source clips using the lossless WAV format are included in `clip_sources`.
After modifying the source clips, run the included Node.js script `scripts/make-clips-from-sources.js` to generate clip files for the app automatically using `ffmpeg`.

## Service worker interactions
To support offline use, the code includes a [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) script.
The service worker caches all files used by the app, which can interfere with development if you are not aware of its presence.
Here are a couple of ways to work around this:

1. Disable the cache in the browser's developer tools. For example, in Chrome, open DevTools, choose the **Application** tab, then in the list on the side, under **Application**, choose **Service Workers**. Then check the **Bypass for network** box.
2. Reload the page bypassing the cache. For example, again in Chrome, open DevTools and then right click on the reload button and choose **Empty Cache and Hard Reload**.

When publishing the app to a server, be sure to change the version number in the service worker script.
This will allow app installations to detect the new version and update.
Since starting the app is what kicks off this process, the user will typically not get the updated version until the *second* launch of the app after the update is live.
(The update is detected but not used on the first launch, as the old version is already running.)

# Credits
Web app made (with ❤️ and a little ☕) by [Christopher Jennings](https://cgjennings.ca/contact/).

The [heroic cat icon](https://www.freepik.com/free-vector/cute-cat-super-hero-cartoon-icon-illustration-animal-hero-icon-concept-isolated-flat-cartoon-style_13874643.htm)
was adapted from an image by catalyststuff on Freepik.

Where possible, audio is played from clips rather than generated dynamically to consume less battery power.
Audio clips were constructed using [Audacity](https://www.audacityteam.org/).
White, pink, and red noise were generated directly using Audacity's *generate noise* command.
Grey noise was constructed from white noise by applying an inverted psychoacoustic curve based on [weighting filters](https://en.wikipedia.org/wiki/Weighting_filter).
Other colours were constructed from white noise using the relevant EQ curves.

# Disclaimer
Nothing on this page or in the app should be construed as medical advice or a medical claim.
If you have questions or concerns about your health, consult a qualified medical professional.