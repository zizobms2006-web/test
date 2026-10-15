# MubarmiJ promo video source

- `index.html`: the animated 1080x1920 scenes. `render(t)` draws frame t; `window.SCENES` holds the 9 scene durations in seconds.
- Setup: `npm i @fontsource/cairo` in this folder.
- Render: `NODE_PATH=$(npm root -g) node render.js out.mp4 '[6,6,7,9,9,11,9,6,6]' voice.mp3`
- Voiceover: ElevenLabs flow SggaCr89It1i69OBsdop, voice Mamdoh (68MRVrnQAt8vLbu0FCzw), model eleven_v4.
