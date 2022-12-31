const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { exit } = require("process");

const DIR_SOURCE_CLIPS = __dirname;

function outpath(wavfile, ext) {
    const name = path.parse(wavfile).name;
    return path.join(DIR_SOURCE_CLIPS, "..", "app", "clips", `${name}.${ext}`);
}

function ffmpeg(infile, outfile) {
    try {
        let po = spawnSync(
            "ffmpeg", ["-v", "error", "-i", infile, "-map_metadata", "-1", "-y", outfile],
            {
                stdio: ["ignore", "ignore", "pipe"]
            }
        );
        if (po.stderr && po.stderr.byteLength > 0) {
            console.log(po.stderr.toString());
        }
        if (po.error) throw error;
    } catch (error) {
        console.log(`${error.status} ${error.message}\n${error.stderr.toString()}`);
        exit(1);
    }
}

function convert(wavfile) {
    console.log(`converting ${wavfile}...`);
    ffmpeg(wavfile, outpath(wavfile, "ogg"));
    ffmpeg(wavfile, outpath(wavfile, "mp3"));
}

fs.readdirSync(DIR_SOURCE_CLIPS)
.filter(n => n.endsWith(".wav"))
.forEach(convert);

console.log("done");