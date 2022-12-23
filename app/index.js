const NOISE_TYPES = [
    "black", // silence, must be first
    "white",
    "grey",
    "red",
    "pink",
    "green",
    "blue",
    "purple"
];

// file extension of a supported audio format
let audioFormat = "ogg";

// the WebAudio context (created on first user gesture)
let audioCtx = null;

// tracks the currently playing audio source, if any
let source = null;

// cache of decoded audio samples for each type of noise, or null
let buffers = new Array(NOISE_TYPES.length).fill(null);

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
    }

    // if type is other than black (silence), start playing that type of noise
    if (i > 0) {
        if (buffers[i] == null) {
            buffers[i] = await loadAudio(`clips/${NOISE_TYPES[i]}.${audioFormat}`);
            if (buffers[i] == null) {
                handleNetworkError();
                return;
            }
        }

        source = audioCtx.createBufferSource();
        source.connect(audioCtx.destination);
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

// extra setup for the black (silence) button
let blackBtn = audioControlEl.firstChild;
blackBtn.classList.add("active");
blackBtn.setAttribute("aria-label", "silence");
blackBtn.innerHTML = `<svg viewBox="0 0 24 24">
  <path fill="#fff" d="M3 9h4l5-5v16l-5-5H3V9m13.59 3L14 9.41L15.41 8L18 10.59L20.59 8L22
                       9.41L19.41 12L22 14.59L20.59 16L18 13.41L15.41 16L14 14.59L16.59 12Z"/>
</svg>`;

// handle opening/closing the About text block
const aboutText = document.querySelector("about-text");
document.querySelector("footer > a").addEventListener("click", (ev) => {
    ev.preventDefault();
    aboutText.classList.toggle("open");
});
document.querySelector("hero-icon").addEventListener("click", (ev) => aboutText.classList.remove("open"));



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