/** Original QR Code Model 2 encoder, byte mode, ECC-M, versions 1–20. No CDN or network access. */
import {QR_TABLES} from './qr-tables.js';
const enc=new TextEncoder();
function gfMul(a,b){let r=0;for(let i=7;i>=0;i--){r=(r<<1)^((r&0x80)?0x11d:0);if((b>>>i)&1)r^=a;}return r;}
function rsRemainder(data, degree){
  let divisor=[1];let root=1;
  for(let i=0;i<degree;i++){
    const nxt=Array(divisor.length+1).fill(0);
    for(let j=0;j<divisor.length;j++){nxt[j]^=divisor[j];nxt[j+1]^=gfMul(divisor[j],root);}
    divisor=nxt;root=gfMul(root,2);
  }
  const out=Array(degree).fill(0);
  for(const b of data){const factor=b^out.shift();out.push(0);for(let k=0;k<degree;k++)out[k]^=gfMul(divisor[k+1],factor);}
  return out;
}
function groupsFor(v){const raw=QR_TABLES[v].blocks;const out=[];for(let i=0;i<raw.length;i+=3)for(let j=0;j<raw[i];j++)out.push({total:raw[i+1],data:raw[i+2]});return out;}
function formatBits(mask){const data=(0<<3)|mask;let rem=data;for(let i=0;i<10;i++)rem=(rem<<1)^(((rem>>>9)&1)?0x537:0);return ((data<<10)|rem)^0x5412;}
function versionBits(v){let rem=v;for(let i=0;i<12;i++)rem=(rem<<1)^(((rem>>>11)&1)?0x1f25:0);return (v<<12)|rem;}
function maskOn(mask,x,y){switch(mask){case 0:return (x+y)%2===0;case 1:return y%2===0;case 2:return x%3===0;case 3:return (x+y)%3===0;case 4:return (Math.floor(y/2)+Math.floor(x/3))%2===0;case 5:return ((x*y)%2+(x*y)%3)===0;case 6:return ((x*y)%2+(x*y)%3)%2===0;default:return ((x+y)%2+(x*y)%3)%2===0;}}
function penalty(m){const n=m.length;let p=0,dark=0;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){dark+=m[y][x]?1:0;if(x<n-1&&y<n-1&&m[y][x]===m[y][x+1]&&m[y][x]===m[y+1][x]&&m[y][x]===m[y+1][x+1])p+=3;}
 for(let axis=0;axis<2;axis++)for(let i=0;i<n;i++){
  const a=Array.from({length:n},(_,j)=>axis===0?m[i][j]:m[j][i]);
  let run=1;for(let j=1;j<n;j++){if(a[j]===a[j-1])run++;else{if(run>=5)p+=3+(run-5);run=1;}}if(run>=5)p+=3+run-5;
  for(let j=0;j<=n-11;j++){
   const s=a.slice(j,j+11).map(v=>v?1:0).join('');
   if(s==='00001011101'||s==='10111010000')p+=40;
  }
 }
 p+=Math.floor(Math.abs(dark*20-n*n*10)/(n*n))*10;return p;
}
export function encodeQR(text){
 const bytes=Array.from(enc.encode(String(text)));
 if(!bytes.length)throw new Error('Enter a URL or text to encode.');
 let v,blocks,capacity;
 for(let i=1;i<=20;i++){const b=groupsFor(i);const cap=b.reduce((a,x)=>a+x.data,0)*8;const bits=4+(i<10?8:16)+bytes.length*8;if(bits<=cap){v=i;blocks=b;capacity=cap;break;}}
 if(!v)throw new Error('Text too long for this QR generator (maximum version 20).');
 const bits=[];const push=(value,count)=>{for(let i=count-1;i>=0;i--)bits.push((value>>>i)&1);};
 push(4,4);push(bytes.length,v<10?8:16);for(const b of bytes)push(b,8);
 for(let i=0;i<Math.min(4,capacity-bits.length);i++)bits.push(0);
 while(bits.length%8)bits.push(0);
 let pad=0;while(bits.length<capacity){push(pad++%2===0?0xec:0x11,8);}
 const data=[];for(let i=0;i<bits.length;i+=8)data.push(bits.slice(i,i+8).reduce((a,b)=>(a<<1)|b,0));
 const chunks=[];let offset=0;
 for(const b of blocks){const part=data.slice(offset,offset+b.data);offset+=b.data;chunks.push({data:part,ecc:rsRemainder(part,b.total-b.data)});}
 const codewords=[];
 for(let i=0;i<Math.max(...chunks.map(x=>x.data.length));i++)for(const c of chunks)if(i<c.data.length)codewords.push(c.data[i]);
 for(let i=0;i<Math.max(...chunks.map(x=>x.ecc.length));i++)for(const c of chunks)if(i<c.ecc.length)codewords.push(c.ecc[i]);
 const n=v*4+17,grid=Array.from({length:n},()=>Array(n).fill(false)),func=Array.from({length:n},()=>Array(n).fill(false));
 function set(x,y,b){if(x>=0&&y>=0&&x<n&&y<n){grid[y][x]=!!b;func[y][x]=true;}}
 function finder(cx,cy){for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const d=Math.max(Math.abs(dx),Math.abs(dy));set(cx+dx,cy+dy,d!==2&&d!==4);}}
 finder(3,3);finder(n-4,3);finder(3,n-4);
 for(let i=8;i<n-8;i++){set(6,i,i%2===0);set(i,6,i%2===0);}
 const pos=QR_TABLES[v].alignment;
 for(const cy of pos)for(const cx of pos){if((cx===6&&(cy===6||cy===n-7))||(cx===n-7&&cy===6))continue;
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(cx+dx,cy+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1);
 }
 function drawFormat(mask){const f=formatBits(mask);
  for(let i=0;i<=5;i++)set(8,i,(f>>>i)&1);set(8,7,(f>>>6)&1);set(8,8,(f>>>7)&1);set(7,8,(f>>>8)&1);
  for(let i=9;i<15;i++)set(14-i,8,(f>>>i)&1);
  for(let i=0;i<8;i++)set(n-1-i,8,(f>>>i)&1);
  for(let i=8;i<15;i++)set(8,n-15+i,(f>>>i)&1);
  set(8,n-8,true);
 }
 drawFormat(0);
 if(v>=7){const ver=versionBits(v);for(let i=0;i<18;i++){const bit=(ver>>>i)&1;set(n-11+i%3,Math.floor(i/3),bit);set(Math.floor(i/3),n-11+i%3,bit);}}
 const dataBits=[];for(const b of codewords)for(let i=7;i>=0;i--)dataBits.push((b>>>i)&1);
 let index=0;
 for(let right=n-1;right>=1;right-=2){if(right===6)right=5;
  for(let vert=0;vert<n;vert++){const y=(((right+1)&2)===0)?n-1-vert:vert;
   for(let j=0;j<2;j++){const x=right-j;if(!func[y][x])grid[y][x]=!!(dataBits[index++]||0);}
  }
 }
 let best=null,lowest=Infinity;
 for(let mask=0;mask<8;mask++){
  const copy=grid.map(row=>row.slice());
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(!func[y][x]&&maskOn(mask,x,y))copy[y][x]=!copy[y][x];
  // Re-write format bits with chosen mask.
  const f=formatBits(mask),place=(x,y,b)=>{copy[y][x]=!!b;};
  for(let i=0;i<=5;i++)place(8,i,(f>>>i)&1);place(8,7,(f>>>6)&1);place(8,8,(f>>>7)&1);place(7,8,(f>>>8)&1);
  for(let i=9;i<15;i++)place(14-i,8,(f>>>i)&1);
  for(let i=0;i<8;i++)place(n-1-i,8,(f>>>i)&1);
  for(let i=8;i<15;i++)place(8,n-15+i,(f>>>i)&1);
  const score=penalty(copy);if(score<lowest){lowest=score;best=copy;}
 }
 return {modules:best,version:v,size:n,level:'M'};
}
export function qrToSvg(matrix,{scale=8,quiet=4,dark='#171717',light='#ffffff'}={}){
 const n=matrix.length,p=n+quiet*2,rects=[];
 for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(matrix[y][x])rects.push(`M${x+quiet} ${y+quiet}h1v1h-1z`);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${p*scale}" height="${p*scale}" viewBox="0 0 ${p} ${p}" shape-rendering="crispEdges"><rect width="${p}" height="${p}" fill="${light}"/><path d="${rects.join('')}" fill="${dark}"/></svg>`;
}
