from pathlib import Path
import json,re
root=Path(__file__).resolve().parent
p=root/'catalog-runtime.js';runtime=p.read_text();manifest=json.loads((root/'logo-manifest.json').read_text())
runtime=re.sub(r'const manifest=.*?;\nconst key=', 'const manifest='+json.dumps(manifest,separators=(',',':'))+';\nconst key=',runtime,count=1)
p.write_text(runtime)
for name in ['script.js','vehicle-loans.js']:
 p=root/name;s=p.read_text();marker='})(globalThis);';end=s.index(marker)+len(marker);p.write_text(runtime+'\n'+s[end:].lstrip('\n'))
