import sys, numpy as np
from scipy.io import wavfile
inp,out,maxgap=sys.argv[1],sys.argv[2],float(sys.argv[3])
sr,x=wavfile.read(inp); x=x.astype(np.float32)
if x.ndim>1: x=x.mean(1)
win=int(sr*0.02); n=len(x)//win
rms=np.sqrt(np.mean(x[:n*win].reshape(n,win)**2,1)+1e-9); db=20*np.log10(rms/32768)
quiet=db<-38
keep=np.ones(len(x),bool); i=0
while i<n:
    if quiet[i]:
        j=i
        while j<n and quiet[j]: j+=1
        dur=(j-i)*win/sr
        if dur>maxgap:
            cut=int((dur-maxgap)*sr); mid=(i+j)//2*win
            keep[mid-cut//2:mid-cut//2+cut]=False
        i=j
    else: i+=1
wavfile.write(out,sr,x[keep].astype(np.int16))
print(out,len(x)/sr,keep.sum()/sr)
