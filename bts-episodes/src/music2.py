import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile
SR=44100; DUR=40.0; N=int(SR*DUR); rng=np.random.default_rng(3)
BPM=140; B=60/BPM; S16=B/4
def bp(x,lo,hi): return sosfilt(butter(2,[lo,hi],'band',fs=SR,output='sos'),x)
def lp(x,f): return sosfilt(butter(2,f,'low',fs=SR,output='sos'),x)
def hp(x,f): return sosfilt(butter(2,f,'high',fs=SR,output='sos'),x)
def add(buf,sig,t,g=1.0):
    a=int(t*SR); b=min(N,a+len(sig))
    if a<N and b>a: buf[a:b]+=sig[:b-a]*g
def midi(m): return 440*2**((m-69)/12)
kick=np.zeros(N);snare=np.zeros(N);hat=np.zeros(N);bass=np.zeros(N);lead=np.zeros(N);fx=np.zeros(N)
tt=np.arange(int(.45*SR))/SR
K=np.sin(2*np.pi*(45*tt+ (160-45)*(1-np.exp(-tt*30))/30))*np.exp(-tt*7); K+=0.3*np.sin(2*np.pi*3000*tt)*np.exp(-tt*200)
tc=np.arange(int(.3*SR))/SR
CL=bp(rng.standard_normal(len(tc)),900,5000)*(np.exp(-tc*25)+0.5*np.exp(-np.maximum(0,tc-0.012)*40)*(tc>0.012))
th=np.arange(int(.06*SR))/SR; HH=hp(rng.standard_normal(len(th)),7000)*np.exp(-th*70)
roots=[45,41,48,43] # A F C G (bass)
mel=[69,72,76,74,72,69,67,69]
bars=int(DUR/(4*B))+1
def active(t): # sections
    return not (t<1.29)  # intro: only riser + hats light
for bar in range(bars):
    t0=bar*4*B; root=roots[bar%4]
    for s in range(16):
        t=t0+s*S16
        if t>=DUR: break
        intro=t<1.29
        if s in (0,6,10) and not intro: add(kick,K,t)
        if s in (4,12) and not intro: add(snare,CL,t)
        roll=(bar%2==1 and s>=12)
        if s%2==0 or roll: add(hat,HH,t,0.5 if s%4 else 0.8)
        if roll and s>=12:
            add(hat,HH,t+S16/2,0.4)
    # 808 per bar: notes on 0 and 10
    for s,ln in ((0,1.6*B),(10,1.4*B)):
        t=t0+s*S16
        if t>=DUR or t<1.29: continue
        n=int(ln*SR); x=np.arange(n)/SR; f=midi(root)*(1+0.0*x)
        sig=np.tanh(2.5*np.sin(2*np.pi*f*x))*np.exp(-x*1.2)
        add(bass,sig,t,0.55)
    # lead pluck 8ths
    for i,m in enumerate(mel):
        t=t0+i*2*S16
        if t>=DUR or t<1.29: continue
        n=int(.35*SR); x=np.arange(n)/SR; f=midi(m+(0 if bar%4<2 else -2))
        sig=(2*((x*f)%1)-1+0.5*np.sin(2*np.pi*f*2*x))*np.exp(-x*9)
        add(lead,lp(sig,2600),t,0.22)
# riser intro + impacts
n=int(1.29*SR); x=np.arange(n)/SR; r=hp(rng.standard_normal(n),800)*(x/1.29)**2*0.5
add(fx,r,0)
for ti in (1.29,9.43,26.0,34.7):
    n=int(1.6*SR); x=np.arange(n)/SR
    boom=np.sin(2*np.pi*(38+60*np.exp(-x*8))*x)*np.exp(-x*2.5)*0.9 + lp(rng.standard_normal(n),3000)*np.exp(-x*6)*0.25
    add(fx,boom,ti)
# whooshes before impacts
for ti in (9.43,15.43,22.43,26.0,34.7):
    n=int(.5*SR); x=np.arange(n)/SR; w=bp(rng.standard_normal(n),600,6000)*np.sin(np.pi*x/.5)**2*0.35
    add(fx,w,ti-0.5)
mix=kick*0.9+snare*0.55+hat*0.35+bass+lead+fx
ir_t=np.arange(int(1.2*SR))/SR; ir=rng.standard_normal(len(ir_t))*np.exp(-ir_t*5); ir/=np.sqrt((ir**2).sum())
wet=fftconvolve(snare*0.55+lead,ir)[:N]*0.35
L=mix+wet; R=mix+np.roll(wet,400)
t=np.arange(N)/SR; fade=np.interp(t,[0,0.05,DUR-1.5,DUR],[0,1,1,0]); L*=fade;R*=fade
st=np.stack([L,R],1); st=np.tanh(st/np.abs(st).max()*1.4)/np.tanh(1.4)*0.9
wavfile.write('music.wav',SR,(st*32767).astype(np.int16)); print('ok')
