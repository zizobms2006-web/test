import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile
SR=44100; DUR=56.1; N=int(SR*DUR); t=np.arange(N)/SR
rng=np.random.default_rng(7)
def midi(m): return 440*2**((m-69)/12)
def lp(x,fc,o=2): return sosfilt(butter(o,fc,'low',fs=SR,output='sos'),x)
def env(n,a,r):
    e=np.ones(n); a=min(int(a*SR),n); r=min(int(r*SR),n)
    e[:a]=np.linspace(0,1,a)**2; e[-r:]*=np.linspace(1,0,r)**2; return e
BPM=72; beat=60/BPM; bar=4*beat           # 2.5s per bar
chords=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]  # Am F C G
pad=np.zeros(N); bass=np.zeros(N); arp=np.zeros(N)
nb=int(np.ceil(DUR/bar))+1
for b in range(nb):
    ch=chords[(b//2)%4]; st=b*bar
    if b%2==0:  # pad lasts 2 bars
        s=int(st*SR); L=int(2*bar*SR)+int(1.5*SR); e=min(N,s+L)
        if s>=N: break
        tt=np.arange(e-s)/SR; v=np.zeros(e-s)
        for m in ch+[ch[0]+12]:
            for d in (-0.08,0.0,0.08):
                f=midi(m)*2**(d/12)
                ph=rng.uniform(0,1)
                v+=2*((tt*f+ph)%1)-1   # saw
        v=lp(v,900)*env(e-s,1.2,1.5)/12
        pad[s:e]+=v
        # sub bass
        f=midi(ch[0]-24); bv=np.sin(2*np.pi*f*tt)+0.3*np.sin(4*np.pi*f*tt)
        bass[s:e]+=bv*env(e-s,0.6,1.2)*0.35
    # arpeggio 8ths
    notes=[ch[0]+12,ch[1]+12,ch[2]+12,ch[1]+24]
    for k in range(8):
        s=int((st+k*beat/2)*SR)
        if s>=N: break
        L=min(int(1.2*SR),N-s); tt=np.arange(L)/SR; f=midi(notes[k%4])
        v=(np.sin(2*np.pi*f*tt)+0.25*np.sin(4*np.pi*f*tt))*np.exp(-tt*5)
        arp[s:s+L]+=v*(0.9 if k%2==0 else 0.6)
# intensity curve: arp enters at 7.3s, swell 36.8-48.5 (AI), lift at 57.6
inten=np.interp(t,[0,6,8,45,47,DUR],[0,0,.35,.4,.6,.6])
mix=pad*0.9+bass*(0.4+0.6*np.interp(t,[0,6,8,DUR],[0.2,0.2,1,1]))+lp(arp,3500)*0.22*inten
# soft kick-ish pulse in swell sections
pulse=np.zeros(N)
for i in range(int(DUR/beat)):
    s=int(i*beat*SR); L=min(int(0.35*SR),N-s); tt=np.arange(L)/SR
    pulse[s:s+L]+=np.sin(2*np.pi*(55+60*np.exp(-tt*30))*tt)*np.exp(-tt*9)
mix+=pulse*0.35*np.interp(t,[0,DUR],[0,0])
# reverb
ir_t=np.arange(int(2.8*SR))/SR; ir=rng.standard_normal(len(ir_t))*np.exp(-ir_t*2.2); ir=lp(ir,4000); ir/=np.sqrt((ir**2).sum())
wetL=fftconvolve(mix,ir)[:N]; ir2=np.roll(ir,331); wetR=fftconvolve(mix,ir2)[:N]
L=mix*0.7+wetL*0.45; R=mix*0.7+wetR*0.45
fade=np.interp(t,[0,1.5,DUR-2.5,DUR],[0,1,1,0]); L*=fade; R*=fade
st=np.stack([L,R],1); st/=np.abs(st).max()/0.89
wavfile.write('music.wav',SR,(st*32767).astype(np.int16))
print('ok')
