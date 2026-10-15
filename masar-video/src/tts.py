import asyncio, ssl, sys, os
import edge_tts, edge_tts.communicate as C
C._SSL_CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')
voice, rate, pitch, src, outdir = sys.argv[1:6]
lines=[l.strip() for l in open(src,encoding='utf-8') if l.strip()]
async def main():
    for i,l in enumerate(lines,1):
        await edge_tts.Communicate(l, voice, rate=rate, pitch=pitch, proxy=os.environ.get('HTTPS_PROXY')).save(f'{outdir}/p{i}.mp3')
        print('ok',i)
asyncio.run(main())
