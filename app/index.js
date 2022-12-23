const NOISE_TYPES = [
    "black",
    "white",
    "grey",
    "red",
    "pink",
    "green",
    "blue",
    "purple",
    "custom"
];

const TYPE_SILENCE = 0;
const TYPE_WHITE = 1;
const TYPE_CUSTOM = NOISE_TYPES.length - 1;

// file extension of a supported audio format
let audioFormat = "ogg";

// the WebAudio context (created on first user gesture)
let audioCtx = null;

// tracks the currently playing audio source, if any
let source = null;

// cache of decoded audio samples for each type of noise, or null
let buffers = new Array(NOISE_TYPES.length).fill(null);

// equalizer config for custom audio option
const EQ_NUM_BANDS = 10;
const EQ_Q = Math.SQRT2;
const EQ_MIN_DB = -24;
const EQ_MAX_DB = 24;
let eqVals = new Array(EQ_NUM_BANDS).fill(0);
let eqBands = eqVals.map((e, i) => 31.25 * 2 ** i);
let eqFilters = null;

/**
 * Create filters that will apply custom audio equalizer settings.
 * The filter nodes will chain to each other as their destination,
 * with the first connected to the default audio context destination.
 * To apply the effect, connect the audio source to the last filter element.
 */
function createEqualizerFilters() {
    if (eqFilters != null) {
        destroyEqualizerFilters();
    }
    let prevNode = audioCtx.destination;
    eqFilters = new Array(EQ_NUM_BANDS);
    for (let i=0; i<EQ_NUM_BANDS; ++i) {
        const f = audioCtx.createBiquadFilter();
        f.frequency.value = eqBands[i];
        f.Q.value = EQ_Q;
        f.gain.value = eqVals[i];
        f.type = "peaking";
        f.connect(prevNode);
        prevNode = f;
        eqFilters[i] = f;
    }
    eqFilters[0].type = "lowshelf";
    eqFilters[EQ_NUM_BANDS-1].type = "highshelf";
}

function destroyEqualizerFilters() {
    if (eqFilters == null) return;
    eqFilters.forEach(f => f.disconnect());
    eqFilters = null;
}


/**
 * Informs the user of a network issue and resets the selected
 * sound so that they can try again later.
 */
function handleNetworkError() {
    // reset selected sound to "silence"
    document.querySelector("audio-controls").firstChild.click();
    alert("A network problem prevented the sound from playing.\nCheck your connection and try again.");
}

/**
 * Loads an audio clip, returning a promise that resolves to
 * an AudioBuffer of sound data. Resolves to null if the clip
 * could not be downloaded.
 * 
 * @param url audio clip URL
 */
async function loadAudio(url) {
    try {
        let res = await fetch(url);
        let rawBuff = await res.arrayBuffer();
        return await audioCtx.decodeAudioData(rawBuff);
    } catch (ex) {
        console.error(ex);
        return null;
    }
}

/**
 * Plays the colour of noise indicated by the specified index into
 * `NOISE_TYPES`. An index of 0 requests silence. Sound data for
 * each type is downloaded the first time it is played.
 * 
 * Must be called as part of a user gesture.
 */
async function playAudio(i) {
    if (audioCtx == null) {
        audioCtx = new AudioContext();
    }

    // stop current noise type, if any
    if (source != null) {
        source.stop();
        source.disconnect();
        source = null;
        destroyEqualizerFilters();
        document.querySelector("custom-eq").classList.remove("open");
    }

    // if type is other than black (silence), start playing that type of noise
    if (i !== TYPE_SILENCE) {
        // destination for the audio data; normally the default output (speakers),
        // but will be the head of the eq filter chain if using the custom option
        let dest = audioCtx.destination;
        if (i == TYPE_CUSTOM) {
            // custom plays white noise, but applies a user controlled equalizer
            i = TYPE_WHITE;
            createEqualizerFilters();
            dest = eqFilters[eqFilters.length - 1];
            document.querySelector("custom-eq").classList.add("open");
        }

        // load audio into cache if missing
        if (buffers[i] == null) {
            buffers[i] = await loadAudio(`clips/${NOISE_TYPES[i]}.${audioFormat}`);
            if (buffers[i] == null) {
                handleNetworkError();
                return;
            }
        }

        // create source and connect to speakers or eq
        source = audioCtx.createBufferSource();
        source.connect(dest);
        source.loop = true;
        source.buffer = buffers[i];
        source.start(0);
    }
}

// compatibility check: stops script with an error message on failure
try {
    if (!window.AudioContext) {
        throw new Error();
    }
    let a = document.createElement("audio");
    if (a.canPlayType("audio/ogg").length === 0) {
        if (a.canPlayType("audio/mp3").length === 0) {
            throw new Error();
        }
        audioFormat = "mp3";
    }
    console.log(`Web Audio detected; using ${audioFormat} audio`);
} catch (ex) {
    alert("Your browser is missing required features:\nWeb Audio with ogg or mp3 support.");
    throw new Error("app not supported");
}

// container to hold the audio buttons
let audioControlEl = document.querySelector("audio-controls");

// create a button for each noise type
for (let i=0; i<NOISE_TYPES.length; ++i) {
    let btn = document.createElement("button");
    btn.innerText = String(i);
    btn.setAttribute("aria-label", NOISE_TYPES[i]);
    btn.addEventListener("click", () => {
        audioControlEl.querySelector("button.active").classList.remove("active");
        btn.classList.add("active");
        playAudio(i);
    });
    audioControlEl.appendChild(btn);
}

// extra setup for the silence button
let blackBtn = audioControlEl.firstChild;
blackBtn.classList.add("active");
blackBtn.setAttribute("aria-label", "silence");
blackBtn.innerHTML = `<svg viewBox="0 0 24 24">
  <path fill="#fff" d="M3 9h4l5-5v16l-5-5H3V9m13.59 3L14 9.41L15.41 8L18 10.59L20.59 8L22
                       9.41L19.41 12L22 14.59L20.59 16L18 13.41L15.41 16L14 14.59L16.59 12Z"/>
</svg>`;

// extra setup for the custom button
blackBtn = audioControlEl.lastChild;
blackBtn.innerHTML = `<svg viewBox="0 0 24 24">
<path fill="#fff" d="M8 13C6.14 13 4.59 14.28 4.14 16H2V18H4.14C4.59 19.72 6.14 21 8 21S11.41
                       19.72 11.86 18H22V16H11.86C11.41 14.28 9.86 13 8 13M8 19C6.9 19 6 18.1
                       6 17C6 15.9 6.9 15 8 15S10 15.9 10 17C10 18.1 9.1 19 8 19M19.86 6C19.41
                       4.28 17.86 3 16 3S12.59 4.28 12.14 6H2V8H12.14C12.59 9.72 14.14 11 16
                       11S19.41 9.72 19.86 8H22V6H19.86M16 9C14.9 9 14 8.1 14 7C14 5.9 14.9
                       5 16 5S18 5.9 18 7C18 8.1 17.1 9 16 9Z"/>
</svg>`;

// handle opening/closing the About text block
const aboutText = document.querySelector("about-text");
document.querySelector("footer > a").addEventListener("click", (ev) => {
    ev.preventDefault();
    aboutText.classList.toggle("open");
});
document.querySelector("hero-icon").addEventListener("click", (ev) => aboutText.classList.remove("open"));

// create the equalizer controls
const eqControls = document.querySelector("custom-eq");
for (let i=0; i<EQ_NUM_BANDS; ++i) {
    const id = `custom${i}`;
    let val = Number(localStorage.getItem(id) || 0);
    if (val !== val || val < EQ_MIN_DB || val > EQ_MAX_DB ) {
        val = 0;
    }
    eqVals[i] = val;
    let slider = document.createElement("input");
    slider.id = id;
    slider.type = "range";
    slider.value = val;
    slider.min = EQ_MIN_DB;
    slider.max = EQ_MAX_DB;
    slider.setAttribute("list", "db-ticks");
    slider.addEventListener("input", ev => {
        const val = Number(slider.value);
        eqVals[i] = val;
        localStorage.setItem(id, String(val));
        if (eqFilters != null) {
            eqFilters[i].gain.value = val;
        }
    });

    const bandLabel = document.createElement("label");
    bandLabel.innerText = ` ${eqBands[i]} Hz`;
    bandLabel.setAttribute("for", id);

    let block = document.createElement("eq-band");
    block.appendChild(slider);
    block.appendChild(bandLabel);
    eqControls.appendChild(block);
}

let eqReset = document.createElement("a");
eqReset.innerText = "Reset";
eqReset.href = "#!";
eqReset.draggable = false;
eqReset.addEventListener("click", ev => {
    ev.preventDefault();
    if (eqFilters != null) {
        for (let i=0; i<EQ_NUM_BANDS; ++i) {
            document.getElementById(`custom${i}`).value = 0;
            eqVals[i] = 0;
            eqFilters[i].gain.value = 0;
        }
    }
});
eqControls.appendChild(eqReset);


//
// Web app support
//

const installBtn = document.querySelector("install-button");
let webAppInstaller = null;

/**
 * Install as PWA if possible, or report an error otherwise.
 */
function installWebApp() {
    if (webAppInstaller == null) {
        alert("Can’t install app with this browser:\nEither Web apps are not supported, or it is already installed.");
    } else {
        webAppInstaller.prompt();
    }
}
installBtn.addEventListener("click", installWebApp);

// make install icon visible when app installation is supported
window.addEventListener("beforeinstallprompt", (ev) => {
    ev.preventDefault();
    webAppInstaller = ev;
    installBtn.style.display = "block";
});

// remove install icon when app is installed
window.addEventListener("appinstalled", (ev) => {
    webAppInstaller = null;
    installBtn.style.display = null;
});

// install service worker to make app files available offline
if (navigator.serviceWorker) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("appServiceWorker.js")
        .catch((err) => console.error("failed to register worker", err))
    });
} else {
    console.error("service workers not supported");
}