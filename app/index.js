/**
 * Available audio file formats in order of preference.
 * The first format that the browser says is can support will be used.
 * Matching audio clips must be available in `clips/`.
*/
const CLIP_FORMATS = [
    // !! must be mirrored in the service worker for offline use to work
    "ogg",
    "mp3"
];

/** List of noise colour names; also the base file names for audio clips. */
const NOISE_TYPES = [
    "silence",
    "white",
    "grey",
    "red",
    "pink",
    "green",
    "blue",
    "purple",
    "custom"
];

/** The `NOISE_TYPES` index that stops sound instead of playing it. */
const TYPE_SILENCE = 0;
/** The `NOISE_TYPES` index of the custom audio option. */
const TYPE_CUSTOM = NOISE_TYPES.length - 1;
/** The `NOISE_TYPES` index of the base sound for the custom audio option. */
const TYPE_CUSTOM_BASE_NOISE = 1;

/** The Web Audio context; created on first use. */
let audioCtx = null;
/** File extension of the `CLIP_FORMAT` to use for the preferred audio format. */
let audioFormat = null;
/** Tracks the currently playing audio source, if any. */
let source = null;
/** Cache of decoded audio samples for each type of noise. */
let buffers = new Array(NOISE_TYPES.length).fill(null);


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

    // start playing the new noise type, if any
    if (i !== TYPE_SILENCE) {
        // destination for the audio data; normally the default output (speakers),
        // but will be the head of the eq filter chain if using the custom option
        let dest = audioCtx.destination;
        if (i == TYPE_CUSTOM) {
            // custom plays white noise, but applies a user-controlled equalizer
            i = TYPE_CUSTOM_BASE_NOISE;
            createEqualizerFilters();
            dest = eqFilters[eqFilters.length - 1];
            document.querySelector("custom-eq").classList.add("open");
        }

        // load audio into cache if missing
        if (buffers[i] == null) {
            buffers[i] = await loadAudio(`clips/${NOISE_TYPES[i]}.${audioFormat}`);
            if (buffers[i] == null) {
                playAudio(TYPE_SILENCE);
                alert("A network problem kept the sound from playing.\nCheck your connection and try again.");
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

// handle opening/closing the About text block
const aboutText = document.querySelector("about-text");
document.querySelector("footer > a").addEventListener("click", (ev) => {
    ev.preventDefault();
    aboutText.classList.toggle("open");
});
document.querySelector("hero-icon").addEventListener("click", (ev) => aboutText.classList.remove("open"));

// Compatibility check:
// an incompatible browser will stop app startup and show an error message
try {
    if (!window.AudioContext) {
        throw new Error();
    }
    const audioEl = document.createElement("audio");
    for (let format of CLIP_FORMATS) {
        if (audioEl.canPlayType(`audio/${format}`).length > 0) {
            audioFormat = format;
            break;
        }
    }
    if (audioFormat == null) {
        throw new Error();
    }
    console.log(`Web Audio detected; using ${audioFormat} audio`);
} catch (ex) {
    alert([
        "Sorry, but the Miso Mask app won't work in this browser.",
        `Web Audio support for one of ${CLIP_FORMATS.join(", ")} is required.`,
        'Choose the "About this app" link for more information.'
    ].join("\n"));
    throw new Error("app not supported");
}

// create a button for each noise type
let audioControlEl = document.querySelector("audio-controls");
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

// extra setup for the "Silence" option
audioControlEl.firstChild.classList.add("active");
audioControlEl.firstChild.innerText = "";

// extra setup for the "Custom" option and its filter controls
const EQ_NUM_BANDS = 10;
const EQ_Q = Math.SQRT2;
const EQ_MIN_DB = -48;
const EQ_MAX_DB = 0;
const EQ_BANDS = new Array(EQ_NUM_BANDS).fill(0).map((e, i) => 31.25 * 2**i);
let eqFilters = null;
let eqVals = new Array(EQ_NUM_BANDS).fill(0);
audioControlEl.lastChild.innerText = "";

/**
 * Create filters that will apply custom audio equalizer settings.
 * The filter nodes will chain to each other as their destination,
 * with the first connected to the default audio context destination.
 * To apply the effect, connect the audio clip source to the last
 * filter element in the chain (array).
 */
function createEqualizerFilters() {
    if (eqFilters != null) {
        destroyEqualizerFilters();
    }
    let prevNode = audioCtx.destination;
    eqFilters = new Array(EQ_NUM_BANDS);
    for (let i=0; i<EQ_NUM_BANDS; ++i) {
        const f = audioCtx.createBiquadFilter();
        f.frequency.value = EQ_BANDS[i];
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

/**
 * Removes the custom audio filters from the audio graph.
 * Safe to call even if the filters have not currently in use.
 */
function destroyEqualizerFilters() {
    if (eqFilters == null) return;
    eqFilters.forEach(f => f.disconnect());
    eqFilters = null;
}

/** Formats the dB adjustment readout of an equalizer band. */
function formatBandValue(dbVal) {
    return `${dbVal >= 0 ? "+" : ""}${dbVal} dB`;
}

// create the equalizer controls
const eqControls = document.querySelector("custom-eq");
for (let i=0; i<EQ_NUM_BANDS; ++i) {
    const id = `custom${i}`;
    let val = Number(localStorage.getItem(id) || 0);
    if (val !== val || val < EQ_MIN_DB || val > EQ_MAX_DB ) {
        val = 0;
    }
    eqVals[i] = val;

    const bandLabel = document.createElement("label");
    bandLabel.innerText = `${EQ_BANDS[i]} Hz`;
    bandLabel.setAttribute("for", id);

    const valueLabel = document.createElement("span");
    valueLabel.innerText = formatBandValue(val);

    const slider = document.createElement("input");
    slider.id = id;
    slider.type = "range";
    slider.min = EQ_MIN_DB;
    slider.max = EQ_MAX_DB;
    slider.value = val;
    slider.setAttribute("list", "dB-ticks");
    slider.addEventListener("input", ev => {
        const val = Number(slider.value);
        eqVals[i] = val;
        localStorage.setItem(id, String(val));
        if (eqFilters != null) {
            eqFilters[i].gain.value = val;
        }
        valueLabel.innerText = formatBandValue(val);
    });

    let block = document.createElement("eq-band");
    block.appendChild(bandLabel);
    block.appendChild(slider);
    block.appendChild(valueLabel);
    eqControls.appendChild(block);
}

/**
 * Adds an extra control beneath the EQ bands that modifies the current
 * settings using an arbitrary function when clicked. The function is
 * passed the current band dB value and index, and returns the new dB
 * value for that band.
 */
function addEqFeature(label, fn) {
    let eqCtrl = document.createElement("a");
    eqCtrl.innerText = label;
    eqCtrl.href = "#!";
    eqCtrl.draggable = false;
    eqCtrl.addEventListener("click", ev => {
        ev.preventDefault();
        if (eqFilters != null) {
            for (let i=0; i<EQ_NUM_BANDS; ++i) {
                const newValue = Math.min(EQ_MAX_DB, Math.max(EQ_MIN_DB, fn(eqVals[i], i)));
                const slider = document.getElementById(`custom${i}`);
                slider.value = newValue;
                slider.parentNode.lastChild.innerText = formatBandValue(newValue);
                eqFilters[i].gain.value = newValue;
                eqVals[i] = newValue;
            }
        }
    });
    eqControls.appendChild(eqCtrl);
}

addEqFeature("White Noise", (dB, i) => 0);
addEqFeature("Silence", (dB, i) => EQ_MIN_DB);


// Web app support

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