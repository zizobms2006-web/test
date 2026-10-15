import sys, numpy as np
from scipy.io import wavfile
from faster_whisper import WhisperModel
sr,x=wavfile.read(sys.argv[1]); x=x.astype(np.float32)/32768
m=WhisperModel(sys.argv[2],device='cpu',compute_type='int8')
segs,_=m.transcribe(x,language='ar',beam_size=5,word_timestamps=True)
for s in segs:
    print(f"{s.start:6.2f}-{s.end:6.2f} {s.text}")
    print('   ', ' '.join(f"{w.word.strip()}@{w.start:.2f}" for w in s.words))
