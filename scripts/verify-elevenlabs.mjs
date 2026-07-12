import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

function parseEnv(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

const env = parseEnv(await readFile(".env", "utf8"));
const apiKey = env.ELEVENLABS_API_KEY;
if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not configured in .env");

const input = await readFile("/tmp/cleanaudio-noisy-input.mp3");
const form = new FormData();
form.append("audio", new Blob([input], { type: "audio/mpeg" }), "verification-input.mp3");
form.append("file_format", "other");

const response = await fetch("https://api.elevenlabs.io/v1/audio-isolation", {
  method: "POST",
  headers: { "xi-api-key": apiKey },
  body: form,
});
if (!response.ok) {
  throw new Error(`ElevenLabs verification failed with HTTP ${response.status}`);
}

const output = Buffer.from(await response.arrayBuffer());
if (output.length === 0) throw new Error("ElevenLabs returned an empty output");
await writeFile("/tmp/cleanaudio-enhanced-output.mp3", output);

const digest = (value) => createHash("sha256").update(value).digest("hex").slice(0, 16);
console.log(JSON.stringify({
  status: response.status,
  contentType: response.headers.get("content-type"),
  inputBytes: input.length,
  outputBytes: output.length,
  inputDigest: digest(input),
  outputDigest: digest(output),
  distinctOutput: digest(input) !== digest(output),
}));
