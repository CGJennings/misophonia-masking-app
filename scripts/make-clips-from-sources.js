const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { exit } = require("process");

const DIR_SOURCE_CLIPS = path.resolve(__dirname, "..", "clip-sources");

function timestamp(path) {
    return fs.existsSync(path) ? fs.statSync(path).mtimeMs : 0;
}

function outpath(wavfile, ext) {
    const name = path.parse(wavfile).name;
    return path.resolve(DIR_SOURCE_CLIPS, "..", "app", "clips", `${name}.${ext}`);
}

function ffmpeg(infile, outext) {
    const outfile = outpath(infile, outext);
    if (timestamp(infile) < timestamp(outfile)) {
        console.log(`  skipping ${outext}, already up to date`);
        return;
    }

    const extraArgs = {
        flac: ["-af", "aformat=s16:44100"],
        mp3: ["-c:a", "libmp3lame", "-q:a", "0"],
        ogg: ["-c:a", "libopus", "-b:a", "100000"],
    }[outext] || [];

    const args = ["-v", "error", "-i", infile, ...extraArgs, "-map_metadata", "-1", "-y", outfile];
    try {
        let po = spawnSync(
            "ffmpeg", args,
            {
                stdio: ["ignore", "ignore", "pipe"]
            }
        );
        if (po.error) throw error;
        if (po.stderr && po.stderr.byteLength > 0) {
            throw {
                status: 20,
                message: "conversion error",
                stderr: po.stderr
            }
        }
    } catch (error) {
        console.log(`${error.status} ${error.message}\n${error.stderr.toString()}`);
        console.log(args);
        exit(1);
    }

    console.log(`  wrote ${outext} format clip`);
}

function convert(wavfile) {
    console.log(`converting ${wavfile}...`);
    ffmpeg(wavfile, "ogg");
    ffmpeg(wavfile, "mp3");
}

fs.readdirSync(DIR_SOURCE_CLIPS)
.filter(n => n.endsWith(".wav"))
.forEach(convert);

console.log("done");