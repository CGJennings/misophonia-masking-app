const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { exit } = require("process");

const DIR_SOURCE_CLIPS = __dirname;

function outpath(wavfile, ext) {
    const name = path.parse(wavfile).name;
    return path.join(DIR_SOURCE_CLIPS, "..", "app", "clips", `${name}.${ext}`);
}

function ffmpeg(...args) {
    try {
        spawnSync("ffmpeg", args);
    } catch (error) {
        console.log(`${error.status} ${error.message}\n${error.stderr.toString()}`);
        exit(1);
    }
}

function convert(wavfile) {
    console.log(`converting ${wavfile}...`);
    ffmpeg("-i", wavfile, outpath(wavfile, "ogg"));
    ffmpeg("-i", wavfile, outpath(wavfile, "mp3"));
}

fs.readdirSync(DIR_SOURCE_CLIPS)
.filter(n => n.endsWith(".wav"))
.forEach(convert);

console.log("done");