"use strict";var sjcl={cipher:{},hash:{},keyexchange:{},mode:{},misc:{},codec:{},exception:{corrupt:function(a){this.toString=function(){return"CORRUPT: "+this.message};this.message=a},invalid:function(a){this.toString=function(){return"INVALID: "+this.message};this.message=a},bug:function(a){this.toString=function(){return"BUG: "+this.message};this.message=a},notReady:function(a){this.toString=function(){return"NOT READY: "+this.message};this.message=a}}};
sjcl.cipher.aes=function(a){this.s[0][0][0]||this.O();var b,c,d,e,f=this.s[0][4],g=this.s[1];b=a.length;var h=1;if(4!==b&&6!==b&&8!==b)throw new sjcl.exception.invalid("invalid aes key size");this.b=[d=a.slice(0),e=[]];for(a=b;a<4*b+28;a++){c=d[a-1];if(0===a%b||8===b&&4===a%b)c=f[c>>>24]<<24^f[c>>16&255]<<16^f[c>>8&255]<<8^f[c&255],0===a%b&&(c=c<<8^c>>>24^h<<24,h=h<<1^283*(h>>7));d[a]=d[a-b]^c}for(b=0;a;b++,a--)c=d[b&3?a:a-4],e[b]=4>=a||4>b?c:g[0][f[c>>>24]]^g[1][f[c>>16&255]]^g[2][f[c>>8&255]]^g[3][f[c&
255]]};
sjcl.cipher.aes.prototype={encrypt:function(a){return t(this,a,0)},decrypt:function(a){return t(this,a,1)},s:[[[],[],[],[],[]],[[],[],[],[],[]]],O:function(){var a=this.s[0],b=this.s[1],c=a[4],d=b[4],e,f,g,h=[],k=[],l,n,m,p;for(e=0;0x100>e;e++)k[(h[e]=e<<1^283*(e>>7))^e]=e;for(f=g=0;!c[f];f^=l||1,g=k[g]||1)for(m=g^g<<1^g<<2^g<<3^g<<4,m=m>>8^m&255^99,c[f]=m,d[m]=f,n=h[e=h[l=h[f]]],p=0x1010101*n^0x10001*e^0x101*l^0x1010100*f,n=0x101*h[m]^0x1010100*m,e=0;4>e;e++)a[e][f]=n=n<<24^n>>>8,b[e][m]=p=p<<24^p>>>8;for(e=
0;5>e;e++)a[e]=a[e].slice(0),b[e]=b[e].slice(0)}};
function t(a,b,c){if(4!==b.length)throw new sjcl.exception.invalid("invalid aes block size");var d=a.b[c],e=b[0]^d[0],f=b[c?3:1]^d[1],g=b[2]^d[2];b=b[c?1:3]^d[3];var h,k,l,n=d.length/4-2,m,p=4,r=[0,0,0,0];h=a.s[c];a=h[0];var q=h[1],v=h[2],w=h[3],x=h[4];for(m=0;m<n;m++)h=a[e>>>24]^q[f>>16&255]^v[g>>8&255]^w[b&255]^d[p],k=a[f>>>24]^q[g>>16&255]^v[b>>8&255]^w[e&255]^d[p+1],l=a[g>>>24]^q[b>>16&255]^v[e>>8&255]^w[f&255]^d[p+2],b=a[b>>>24]^q[e>>16&255]^v[f>>8&255]^w[g&255]^d[p+3],p+=4,e=h,f=k,g=l;for(m=
0;4>m;m++)r[c?3&-m:m]=x[e>>>24]<<24^x[f>>16&255]<<16^x[g>>8&255]<<8^x[b&255]^d[p++],h=e,e=f,f=g,g=b,b=h;return r}
sjcl.bitArray={bitSlice:function(a,b,c){a=sjcl.bitArray.$(a.slice(b/32),32-(b&31)).slice(1);return void 0===c?a:sjcl.bitArray.clamp(a,c-b)},extract:function(a,b,c){var d=Math.floor(-b-c&31);return((b+c-1^b)&-32?a[b/32|0]<<32-d^a[b/32+1|0]>>>d:a[b/32|0]>>>d)&(1<<c)-1},concat:function(a,b){if(0===a.length||0===b.length)return a.concat(b);var c=a[a.length-1],d=sjcl.bitArray.getPartial(c);return 32===d?a.concat(b):sjcl.bitArray.$(b,d,c|0,a.slice(0,a.length-1))},bitLength:function(a){var b=a.length;return 0===
b?0:32*(b-1)+sjcl.bitArray.getPartial(a[b-1])},clamp:function(a,b){if(32*a.length<b)return a;a=a.slice(0,Math.ceil(b/32));var c=a.length;b=b&31;0<c&&b&&(a[c-1]=sjcl.bitArray.partial(b,a[c-1]&2147483648>>b-1,1));return a},partial:function(a,b,c){return 32===a?b:(c?b|0:b<<32-a)+0x10000000000*a},getPartial:function(a){return Math.round(a/0x10000000000)||32},equal:function(a,b){if(sjcl.bitArray.bitLength(a)!==sjcl.bitArray.bitLength(b))return!1;var c=0,d;for(d=0;d<a.length;d++)c|=a[d]^b[d];return 0===
c},$:function(a,b,c,d){var e;e=0;for(void 0===d&&(d=[]);32<=b;b-=32)d.push(c),c=0;if(0===b)return d.concat(a);for(e=0;e<a.length;e++)d.push(c|a[e]>>>b),c=a[e]<<32-b;e=a.length?a[a.length-1]:0;a=sjcl.bitArray.getPartial(e);d.push(sjcl.bitArray.partial(b+a&31,32<b+a?c:d.pop(),1));return d},i:function(a,b){return[a[0]^b[0],a[1]^b[1],a[2]^b[2],a[3]^b[3]]},byteswapM:function(a){var b,c;for(b=0;b<a.length;++b)c=a[b],a[b]=c>>>24|c>>>8&0xff00|(c&0xff00)<<8|c<<24;return a}};
sjcl.codec.utf8String={fromBits:function(a){var b="",c=sjcl.bitArray.bitLength(a),d,e;for(d=0;d<c/8;d++)0===(d&3)&&(e=a[d/4]),b+=String.fromCharCode(e>>>8>>>8>>>8),e<<=8;return decodeURIComponent(escape(b))},toBits:function(a){a=unescape(encodeURIComponent(a));var b=[],c,d=0;for(c=0;c<a.length;c++)d=d<<8|a.charCodeAt(c),3===(c&3)&&(b.push(d),d=0);c&3&&b.push(sjcl.bitArray.partial(8*(c&3),d));return b}};
sjcl.codec.hex={fromBits:function(a){var b="",c;for(c=0;c<a.length;c++)b+=((a[c]|0)+0xf00000000000).toString(16).substr(4);return b.substr(0,sjcl.bitArray.bitLength(a)/4)},toBits:function(a){var b,c=[],d;a=a.replace(/\s|0x/g,"");d=a.length;a=a+"00000000";for(b=0;b<a.length;b+=8)c.push(parseInt(a.substr(b,8),16)^0);return sjcl.bitArray.clamp(c,4*d)}};
sjcl.codec.base32={B:"ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",X:"0123456789ABCDEFGHIJKLMNOPQRSTUV",BITS:32,BASE:5,REMAINING:27,fromBits:function(a,b,c){var d=sjcl.codec.base32.BASE,e=sjcl.codec.base32.REMAINING,f="",g=0,h=sjcl.codec.base32.B,k=0,l=sjcl.bitArray.bitLength(a);c&&(h=sjcl.codec.base32.X);for(c=0;f.length*d<l;)f+=h.charAt((k^a[c]>>>g)>>>e),g<d?(k=a[c]<<d-g,g+=e,c++):(k<<=d,g-=d);for(;f.length&7&&!b;)f+="=";return f},toBits:function(a,b){a=a.replace(/\s|=/g,"").toUpperCase();var c=sjcl.codec.base32.BITS,
d=sjcl.codec.base32.BASE,e=sjcl.codec.base32.REMAINING,f=[],g,h=0,k=sjcl.codec.base32.B,l=0,n,m="base32";b&&(k=sjcl.codec.base32.X,m="base32hex");for(g=0;g<a.length;g++){n=k.indexOf(a.charAt(g));if(0>n){if(!b)try{return sjcl.codec.base32hex.toBits(a)}catch(p){}throw new sjcl.exception.invalid("this isn't "+m+"!");}h>e?(h-=e,f.push(l^n>>>h),l=n<<c-h):(h+=d,l^=n<<c-h)}h&56&&f.push(sjcl.bitArray.partial(h&56,l,1));return f}};
sjcl.codec.base32hex={fromBits:function(a,b){return sjcl.codec.base32.fromBits(a,b,1)},toBits:function(a){return sjcl.codec.base32.toBits(a,1)}};
sjcl.codec.base64={B:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",fromBits:function(a,b,c){var d="",e=0,f=sjcl.codec.base64.B,g=0,h=sjcl.bitArray.bitLength(a);c&&(f=f.substr(0,62)+"-_");for(c=0;6*d.length<h;)d+=f.charAt((g^a[c]>>>e)>>>26),6>e?(g=a[c]<<6-e,e+=26,c++):(g<<=6,e-=6);for(;d.length&3&&!b;)d+="=";return d},toBits:function(a,b){a=a.replace(/\s|=/g,"");var c=[],d,e=0,f=sjcl.codec.base64.B,g=0,h;b&&(f=f.substr(0,62)+"-_");for(d=0;d<a.length;d++){h=f.indexOf(a.charAt(d));
if(0>h)throw new sjcl.exception.invalid("this isn't base64!");26<e?(e-=26,c.push(g^h>>>e),g=h<<32-e):(e+=6,g^=h<<32-e)}e&56&&c.push(sjcl.bitArray.partial(e&56,g,1));return c}};sjcl.codec.base64url={fromBits:function(a){return sjcl.codec.base64.fromBits(a,1,1)},toBits:function(a){return sjcl.codec.base64.toBits(a,1)}};sjcl.hash.sha256=function(a){this.b[0]||this.O();a?(this.F=a.F.slice(0),this.A=a.A.slice(0),this.l=a.l):this.reset()};sjcl.hash.sha256.hash=function(a){return(new sjcl.hash.sha256).update(a).finalize()};
sjcl.hash.sha256.prototype={blockSize:512,reset:function(){this.F=this.Y.slice(0);this.A=[];this.l=0;return this},update:function(a){"string"===typeof a&&(a=sjcl.codec.utf8String.toBits(a));var b,c=this.A=sjcl.bitArray.concat(this.A,a);b=this.l;a=this.l=b+sjcl.bitArray.bitLength(a);if(0x1fffffffffffff<a)throw new sjcl.exception.invalid("Cannot hash more than 2^53 - 1 bits");if("undefined"!==typeof Uint32Array){var d=new Uint32Array(c),e=0;for(b=512+b-(512+b&0x1ff);b<=a;b+=512)u(this,d.subarray(16*e,
16*(e+1))),e+=1;c.splice(0,16*e)}else for(b=512+b-(512+b&0x1ff);b<=a;b+=512)u(this,c.splice(0,16));return this},finalize:function(){var a,b=this.A,c=this.F,b=sjcl.bitArray.concat(b,[sjcl.bitArray.partial(1,1)]);for(a=b.length+2;a&15;a++)b.push(0);b.push(Math.floor(this.l/0x100000000));for(b.push(this.l|0);b.length;)u(this,b.splice(0,16));this.reset();return c},Y:[],b:[],O:function(){function a(a){return 0x100000000*(a-Math.floor(a))|0}for(var b=0,c=2,d,e;64>b;c++){e=!0;for(d=2;d*d<=c;d++)if(0===c%d){e=
!1;break}e&&(8>b&&(this.Y[b]=a(Math.pow(c,.5))),this.b[b]=a(Math.pow(c,1/3)),b++)}}};
function u(a,b){var c,d,e,f=a.F,g=a.b,h=f[0],k=f[1],l=f[2],n=f[3],m=f[4],p=f[5],r=f[6],q=f[7];for(c=0;64>c;c++)16>c?d=b[c]:(d=b[c+1&15],e=b[c+14&15],d=b[c&15]=(d>>>7^d>>>18^d>>>3^d<<25^d<<14)+(e>>>17^e>>>19^e>>>10^e<<15^e<<13)+b[c&15]+b[c+9&15]|0),d=d+q+(m>>>6^m>>>11^m>>>25^m<<26^m<<21^m<<7)+(r^m&(p^r))+g[c],q=r,r=p,p=m,m=n+d|0,n=l,l=k,k=h,h=d+(k&l^n&(k^l))+(k>>>2^k>>>13^k>>>22^k<<30^k<<19^k<<10)|0;f[0]=f[0]+h|0;f[1]=f[1]+k|0;f[2]=f[2]+l|0;f[3]=f[3]+n|0;f[4]=f[4]+m|0;f[5]=f[5]+p|0;f[6]=f[6]+r|0;f[7]=
f[7]+q|0}
sjcl.mode.ccm={name:"ccm",G:[],listenProgress:function(a){sjcl.mode.ccm.G.push(a)},unListenProgress:function(a){a=sjcl.mode.ccm.G.indexOf(a);-1<a&&sjcl.mode.ccm.G.splice(a,1)},fa:function(a){var b=sjcl.mode.ccm.G.slice(),c;for(c=0;c<b.length;c+=1)b[c](a)},encrypt:function(a,b,c,d,e){var f,g=b.slice(0),h=sjcl.bitArray,k=h.bitLength(c)/8,l=h.bitLength(g)/8;e=e||64;d=d||[];if(7>k)throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");for(f=2;4>f&&l>>>8*f;f++);f<15-k&&(f=15-k);c=h.clamp(c,
8*(15-f));b=sjcl.mode.ccm.V(a,b,c,d,e,f);g=sjcl.mode.ccm.C(a,g,c,b,e,f);return h.concat(g.data,g.tag)},decrypt:function(a,b,c,d,e){e=e||64;d=d||[];var f=sjcl.bitArray,g=f.bitLength(c)/8,h=f.bitLength(b),k=f.clamp(b,h-e),l=f.bitSlice(b,h-e),h=(h-e)/8;if(7>g)throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");for(b=2;4>b&&h>>>8*b;b++);b<15-g&&(b=15-g);c=f.clamp(c,8*(15-b));k=sjcl.mode.ccm.C(a,k,c,l,e,b);a=sjcl.mode.ccm.V(a,k.data,c,d,e,b);if(!f.equal(k.tag,a))throw new sjcl.exception.corrupt("ccm: tag doesn't match");
return k.data},na:function(a,b,c,d,e,f){var g=[],h=sjcl.bitArray,k=h.i;d=[h.partial(8,(b.length?64:0)|d-2<<2|f-1)];d=h.concat(d,c);d[3]|=e;d=a.encrypt(d);if(b.length)for(c=h.bitLength(b)/8,65279>=c?g=[h.partial(16,c)]:0xffffffff>=c&&(g=h.concat([h.partial(16,65534)],[c])),g=h.concat(g,b),b=0;b<g.length;b+=4)d=a.encrypt(k(d,g.slice(b,b+4).concat([0,0,0])));return d},V:function(a,b,c,d,e,f){var g=sjcl.bitArray,h=g.i;e/=8;if(e%2||4>e||16<e)throw new sjcl.exception.invalid("ccm: invalid tag length");
if(0xffffffff<d.length||0xffffffff<b.length)throw new sjcl.exception.bug("ccm: can't deal with 4GiB or more data");c=sjcl.mode.ccm.na(a,d,c,e,g.bitLength(b)/8,f);for(d=0;d<b.length;d+=4)c=a.encrypt(h(c,b.slice(d,d+4).concat([0,0,0])));return g.clamp(c,8*e)},C:function(a,b,c,d,e,f){var g,h=sjcl.bitArray;g=h.i;var k=b.length,l=h.bitLength(b),n=k/50,m=n;c=h.concat([h.partial(8,f-1)],c).concat([0,0,0]).slice(0,4);d=h.bitSlice(g(d,a.encrypt(c)),0,e);if(!k)return{tag:d,data:[]};for(g=0;g<k;g+=4)g>n&&(sjcl.mode.ccm.fa(g/
k),n+=m),c[3]++,e=a.encrypt(c),b[g]^=e[0],b[g+1]^=e[1],b[g+2]^=e[2],b[g+3]^=e[3];return{tag:d,data:h.clamp(b,l)}}};
sjcl.mode.ocb2={name:"ocb2",encrypt:function(a,b,c,d,e,f){if(128!==sjcl.bitArray.bitLength(c))throw new sjcl.exception.invalid("ocb iv must be 128 bits");var g,h=sjcl.mode.ocb2.S,k=sjcl.bitArray,l=k.i,n=[0,0,0,0];c=h(a.encrypt(c));var m,p=[];d=d||[];e=e||64;for(g=0;g+4<b.length;g+=4)m=b.slice(g,g+4),n=l(n,m),p=p.concat(l(c,a.encrypt(l(c,m)))),c=h(c);m=b.slice(g);b=k.bitLength(m);g=a.encrypt(l(c,[0,0,0,b]));m=k.clamp(l(m.concat([0,0,0]),g),b);n=l(n,l(m.concat([0,0,0]),g));n=a.encrypt(l(n,l(c,h(c))));
d.length&&(n=l(n,f?d:sjcl.mode.ocb2.pmac(a,d)));return p.concat(k.concat(m,k.clamp(n,e)))},decrypt:function(a,b,c,d,e,f){if(128!==sjcl.bitArray.bitLength(c))throw new sjcl.exception.invalid("ocb iv must be 128 bits");e=e||64;var g=sjcl.mode.ocb2.S,h=sjcl.bitArray,k=h.i,l=[0,0,0,0],n=g(a.encrypt(c)),m,p,r=sjcl.bitArray.bitLength(b)-e,q=[];d=d||[];for(c=0;c+4<r/32;c+=4)m=k(n,a.decrypt(k(n,b.slice(c,c+4)))),l=k(l,m),q=q.concat(m),n=g(n);p=r-32*c;m=a.encrypt(k(n,[0,0,0,p]));m=k(m,h.clamp(b.slice(c),p).concat([0,
0,0]));l=k(l,m);l=a.encrypt(k(l,k(n,g(n))));d.length&&(l=k(l,f?d:sjcl.mode.ocb2.pmac(a,d)));if(!h.equal(h.clamp(l,e),h.bitSlice(b,r)))throw new sjcl.exception.corrupt("ocb: tag doesn't match");return q.concat(h.clamp(m,p))},pmac:function(a,b){var c,d=sjcl.mode.ocb2.S,e=sjcl.bitArray,f=e.i,g=[0,0,0,0],h=a.encrypt([0,0,0,0]),h=f(h,d(d(h)));for(c=0;c+4<b.length;c+=4)h=d(h),g=f(g,a.encrypt(f(h,b.slice(c,c+4))));c=b.slice(c);128>e.bitLength(c)&&(h=f(h,d(h)),c=e.concat(c,[-2147483648,0,0,0]));g=f(g,c);
return a.encrypt(f(d(f(h,d(h))),g))},S:function(a){return[a[0]<<1^a[1]>>>31,a[1]<<1^a[2]>>>31,a[2]<<1^a[3]>>>31,a[3]<<1^135*(a[0]>>>31)]}};
sjcl.mode.gcm={name:"gcm",encrypt:function(a,b,c,d,e){var f=b.slice(0);b=sjcl.bitArray;d=d||[];a=sjcl.mode.gcm.C(!0,a,f,d,c,e||128);return b.concat(a.data,a.tag)},decrypt:function(a,b,c,d,e){var f=b.slice(0),g=sjcl.bitArray,h=g.bitLength(f);e=e||128;d=d||[];e<=h?(b=g.bitSlice(f,h-e),f=g.bitSlice(f,0,h-e)):(b=f,f=[]);a=sjcl.mode.gcm.C(!1,a,f,d,c,e);if(!g.equal(a.tag,b))throw new sjcl.exception.corrupt("gcm: tag doesn't match");return a.data},ka:function(a,b){var c,d,e,f,g,h=sjcl.bitArray.i;e=[0,0,
0,0];f=b.slice(0);for(c=0;128>c;c++){(d=0!==(a[Math.floor(c/32)]&1<<31-c%32))&&(e=h(e,f));g=0!==(f[3]&1);for(d=3;0<d;d--)f[d]=f[d]>>>1|(f[d-1]&1)<<31;f[0]>>>=1;g&&(f[0]^=-0x1f000000)}return e},j:function(a,b,c){var d,e=c.length;b=b.slice(0);for(d=0;d<e;d+=4)b[0]^=0xffffffff&c[d],b[1]^=0xffffffff&c[d+1],b[2]^=0xffffffff&c[d+2],b[3]^=0xffffffff&c[d+3],b=sjcl.mode.gcm.ka(b,a);return b},C:function(a,b,c,d,e,f){var g,h,k,l,n,m,p,r,q=sjcl.bitArray;m=c.length;p=q.bitLength(c);r=q.bitLength(d);h=q.bitLength(e);
g=b.encrypt([0,0,0,0]);96===h?(e=e.slice(0),e=q.concat(e,[1])):(e=sjcl.mode.gcm.j(g,[0,0,0,0],e),e=sjcl.mode.gcm.j(g,e,[0,0,Math.floor(h/0x100000000),h&0xffffffff]));h=sjcl.mode.gcm.j(g,[0,0,0,0],d);n=e.slice(0);d=h.slice(0);a||(d=sjcl.mode.gcm.j(g,h,c));for(l=0;l<m;l+=4)n[3]++,k=b.encrypt(n),c[l]^=k[0],c[l+1]^=k[1],c[l+2]^=k[2],c[l+3]^=k[3];c=q.clamp(c,p);a&&(d=sjcl.mode.gcm.j(g,h,c));a=[Math.floor(r/0x100000000),r&0xffffffff,Math.floor(p/0x100000000),p&0xffffffff];d=sjcl.mode.gcm.j(g,d,a);k=b.encrypt(e);
d[0]^=k[0];d[1]^=k[1];d[2]^=k[2];d[3]^=k[3];return{tag:q.bitSlice(d,0,f),data:c}}};sjcl.misc.hmac=function(a,b){this.W=b=b||sjcl.hash.sha256;var c=[[],[]],d,e=b.prototype.blockSize/32;this.w=[new b,new b];a.length>e&&(a=b.hash(a));for(d=0;d<e;d++)c[0][d]=a[d]^909522486,c[1][d]=a[d]^1549556828;this.w[0].update(c[0]);this.w[1].update(c[1]);this.R=new b(this.w[0])};
sjcl.misc.hmac.prototype.encrypt=sjcl.misc.hmac.prototype.mac=function(a){if(this.aa)throw new sjcl.exception.invalid("encrypt on already updated hmac called!");this.update(a);return this.digest(a)};sjcl.misc.hmac.prototype.reset=function(){this.R=new this.W(this.w[0]);this.aa=!1};sjcl.misc.hmac.prototype.update=function(a){this.aa=!0;this.R.update(a)};sjcl.misc.hmac.prototype.digest=function(){var a=this.R.finalize(),a=(new this.W(this.w[1])).update(a).finalize();this.reset();return a};
sjcl.misc.pbkdf2=function(a,b,c,d,e){c=c||1E4;if(0>d||0>c)throw new sjcl.exception.invalid("invalid params to pbkdf2");"string"===typeof a&&(a=sjcl.codec.utf8String.toBits(a));"string"===typeof b&&(b=sjcl.codec.utf8String.toBits(b));e=e||sjcl.misc.hmac;a=new e(a);var f,g,h,k,l=[],n=sjcl.bitArray;for(k=1;32*l.length<(d||1);k++){e=f=a.encrypt(n.concat(b,[k]));for(g=1;g<c;g++)for(f=a.encrypt(f),h=0;h<f.length;h++)e[h]^=f[h];l=l.concat(e)}d&&(l=n.clamp(l,d));return l};
sjcl.prng=function(a){this.c=[new sjcl.hash.sha256];this.m=[0];this.P=0;this.H={};this.N=0;this.U={};this.Z=this.f=this.o=this.ha=0;this.b=[0,0,0,0,0,0,0,0];this.h=[0,0,0,0];this.L=void 0;this.M=a;this.D=!1;this.K={progress:{},seeded:{}};this.u=this.ga=0;this.I=1;this.J=2;this.ca=0x10000;this.T=[0,48,64,96,128,192,0x100,384,512,768,1024];this.da=3E4;this.ba=80};
sjcl.prng.prototype={randomWords:function(a,b){var c=[],d;d=this.isReady(b);var e;if(d===this.u)throw new sjcl.exception.notReady("generator isn't seeded");if(d&this.J){d=!(d&this.I);e=[];var f=0,g;this.Z=e[0]=(new Date).valueOf()+this.da;for(g=0;16>g;g++)e.push(0x100000000*Math.random()|0);for(g=0;g<this.c.length&&(e=e.concat(this.c[g].finalize()),f+=this.m[g],this.m[g]=0,d||!(this.P&1<<g));g++);this.P>=1<<this.c.length&&(this.c.push(new sjcl.hash.sha256),this.m.push(0));this.f-=f;f>this.o&&(this.o=
f);this.P++;this.b=sjcl.hash.sha256.hash(this.b.concat(e));this.L=new sjcl.cipher.aes(this.b);for(d=0;4>d&&(this.h[d]=this.h[d]+1|0,!this.h[d]);d++);}for(d=0;d<a;d+=4)0===(d+1)%this.ca&&y(this),e=z(this),c.push(e[0],e[1],e[2],e[3]);y(this);return c.slice(0,a)},setDefaultParanoia:function(a,b){if(0===a&&"Setting paranoia=0 will ruin your security; use it only for testing"!==b)throw new sjcl.exception.invalid("Setting paranoia=0 will ruin your security; use it only for testing");this.M=a},addEntropy:function(a,
b,c){c=c||"user";var d,e,f=(new Date).valueOf(),g=this.H[c],h=this.isReady(),k=0;d=this.U[c];void 0===d&&(d=this.U[c]=this.ha++);void 0===g&&(g=this.H[c]=0);this.H[c]=(this.H[c]+1)%this.c.length;switch(typeof a){case "number":void 0===b&&(b=1);this.c[g].update([d,this.N++,1,b,f,1,a|0]);break;case "object":c=Object.prototype.toString.call(a);if("[object Uint32Array]"===c){e=[];for(c=0;c<a.length;c++)e.push(a[c]);a=e}else for("[object Array]"!==c&&(k=1),c=0;c<a.length&&!k;c++)"number"!==typeof a[c]&&
(k=1);if(!k){if(void 0===b)for(c=b=0;c<a.length;c++)for(e=a[c];0<e;)b++,e=e>>>1;this.c[g].update([d,this.N++,2,b,f,a.length].concat(a))}break;case "string":void 0===b&&(b=a.length);this.c[g].update([d,this.N++,3,b,f,a.length]);this.c[g].update(a);break;default:k=1}if(k)throw new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string");this.m[g]+=b;this.f+=b;h===this.u&&(this.isReady()!==this.u&&A("seeded",Math.max(this.o,this.f)),A("progress",this.getProgress()))},
isReady:function(a){a=this.T[void 0!==a?a:this.M];return this.o&&this.o>=a?this.m[0]>this.ba&&(new Date).valueOf()>this.Z?this.J|this.I:this.I:this.f>=a?this.J|this.u:this.u},getProgress:function(a){a=this.T[a?a:this.M];return this.o>=a?1:this.f>a?1:this.f/a},startCollectors:function(){if(!this.D){this.a={loadTimeCollector:B(this,this.ma),mouseCollector:B(this,this.oa),keyboardCollector:B(this,this.la),accelerometerCollector:B(this,this.ea),touchCollector:B(this,this.qa)};if(window.addEventListener)window.addEventListener("load",
this.a.loadTimeCollector,!1),window.addEventListener("mousemove",this.a.mouseCollector,!1),window.addEventListener("keypress",this.a.keyboardCollector,!1),window.addEventListener("devicemotion",this.a.accelerometerCollector,!1),window.addEventListener("touchmove",this.a.touchCollector,!1);else if(document.attachEvent)document.attachEvent("onload",this.a.loadTimeCollector),document.attachEvent("onmousemove",this.a.mouseCollector),document.attachEvent("keypress",this.a.keyboardCollector);else throw new sjcl.exception.bug("can't attach event");
this.D=!0}},stopCollectors:function(){this.D&&(window.removeEventListener?(window.removeEventListener("load",this.a.loadTimeCollector,!1),window.removeEventListener("mousemove",this.a.mouseCollector,!1),window.removeEventListener("keypress",this.a.keyboardCollector,!1),window.removeEventListener("devicemotion",this.a.accelerometerCollector,!1),window.removeEventListener("touchmove",this.a.touchCollector,!1)):document.detachEvent&&(document.detachEvent("onload",this.a.loadTimeCollector),document.detachEvent("onmousemove",
this.a.mouseCollector),document.detachEvent("keypress",this.a.keyboardCollector)),this.D=!1)},addEventListener:function(a,b){this.K[a][this.ga++]=b},removeEventListener:function(a,b){var c,d,e=this.K[a],f=[];for(d in e)e.hasOwnProperty(d)&&e[d]===b&&f.push(d);for(c=0;c<f.length;c++)d=f[c],delete e[d]},la:function(){C(this,1)},oa:function(a){var b,c;try{b=a.x||a.clientX||a.offsetX||0,c=a.y||a.clientY||a.offsetY||0}catch(d){c=b=0}0!=b&&0!=c&&this.addEntropy([b,c],2,"mouse");C(this,0)},qa:function(a){a=
a.touches[0]||a.changedTouches[0];this.addEntropy([a.pageX||a.clientX,a.pageY||a.clientY],1,"touch");C(this,0)},ma:function(){C(this,2)},ea:function(a){a=a.accelerationIncludingGravity.x||a.accelerationIncludingGravity.y||a.accelerationIncludingGravity.z;if(window.orientation){var b=window.orientation;"number"===typeof b&&this.addEntropy(b,1,"accelerometer")}a&&this.addEntropy(a,2,"accelerometer");C(this,0)}};
function A(a,b){var c,d=sjcl.random.K[a],e=[];for(c in d)d.hasOwnProperty(c)&&e.push(d[c]);for(c=0;c<e.length;c++)e[c](b)}function C(a,b){"undefined"!==typeof window&&window.performance&&"function"===typeof window.performance.now?a.addEntropy(window.performance.now(),b,"loadtime"):a.addEntropy((new Date).valueOf(),b,"loadtime")}function y(a){a.b=z(a).concat(z(a));a.L=new sjcl.cipher.aes(a.b)}function z(a){for(var b=0;4>b&&(a.h[b]=a.h[b]+1|0,!a.h[b]);b++);return a.L.encrypt(a.h)}
function B(a,b){return function(){b.apply(a,arguments)}}sjcl.random=new sjcl.prng(6);
a:try{var D,E,F,G;if(G="undefined"!==typeof module&&module.exports){var H;try{H=require("crypto")}catch(a){H=null}G=E=H}if(G&&E.randomBytes)D=E.randomBytes(128),D=new Uint32Array((new Uint8Array(D)).buffer),sjcl.random.addEntropy(D,1024,"crypto['randomBytes']");else if("undefined"!==typeof window&&"undefined"!==typeof Uint32Array){F=new Uint32Array(32);if(window.crypto&&window.crypto.getRandomValues)window.crypto.getRandomValues(F);else if(window.msCrypto&&window.msCrypto.getRandomValues)window.msCrypto.getRandomValues(F);
else break a;sjcl.random.addEntropy(F,1024,"crypto['getRandomValues']")}}catch(a){"undefined"!==typeof window&&window.console&&(console.log("There was an error collecting entropy from the browser:"),console.log(a))}
sjcl.json={defaults:{v:1,iter:1E4,ks:128,ts:64,mode:"ccm",adata:"",cipher:"aes"},ja:function(a,b,c,d){c=c||{};d=d||{};var e=sjcl.json,f=e.g({iv:sjcl.random.randomWords(4,0)},e.defaults),g;e.g(f,c);c=f.adata;"string"===typeof f.salt&&(f.salt=sjcl.codec.base64.toBits(f.salt));"string"===typeof f.iv&&(f.iv=sjcl.codec.base64.toBits(f.iv));if(!sjcl.mode[f.mode]||!sjcl.cipher[f.cipher]||"string"===typeof a&&100>=f.iter||64!==f.ts&&96!==f.ts&&128!==f.ts||128!==f.ks&&192!==f.ks&&0x100!==f.ks||2>f.iv.length||
4<f.iv.length)throw new sjcl.exception.invalid("json encrypt: invalid parameters");"string"===typeof a?(g=sjcl.misc.cachedPbkdf2(a,f),a=g.key.slice(0,f.ks/32),f.salt=g.salt):sjcl.ecc&&a instanceof sjcl.ecc.elGamal.publicKey&&(g=a.kem(),f.kemtag=g.tag,a=g.key.slice(0,f.ks/32));"string"===typeof b&&(b=sjcl.codec.utf8String.toBits(b));"string"===typeof c&&(f.adata=c=sjcl.codec.utf8String.toBits(c));g=new sjcl.cipher[f.cipher](a);e.g(d,f);d.key=a;f.ct="ccm"===f.mode&&sjcl.arrayBuffer&&sjcl.arrayBuffer.ccm&&
b instanceof ArrayBuffer?sjcl.arrayBuffer.ccm.encrypt(g,b,f.iv,c,f.ts):sjcl.mode[f.mode].encrypt(g,b,f.iv,c,f.ts);return f},encrypt:function(a,b,c,d){var e=sjcl.json,f=e.ja.apply(e,arguments);return e.encode(f)},ia:function(a,b,c,d){c=c||{};d=d||{};var e=sjcl.json;b=e.g(e.g(e.g({},e.defaults),b),c,!0);var f,g;f=b.adata;"string"===typeof b.salt&&(b.salt=sjcl.codec.base64.toBits(b.salt));"string"===typeof b.iv&&(b.iv=sjcl.codec.base64.toBits(b.iv));if(!sjcl.mode[b.mode]||!sjcl.cipher[b.cipher]||"string"===
typeof a&&100>=b.iter||64!==b.ts&&96!==b.ts&&128!==b.ts||128!==b.ks&&192!==b.ks&&0x100!==b.ks||!b.iv||2>b.iv.length||4<b.iv.length)throw new sjcl.exception.invalid("json decrypt: invalid parameters");"string"===typeof a?(g=sjcl.misc.cachedPbkdf2(a,b),a=g.key.slice(0,b.ks/32),b.salt=g.salt):sjcl.ecc&&a instanceof sjcl.ecc.elGamal.secretKey&&(a=a.unkem(sjcl.codec.base64.toBits(b.kemtag)).slice(0,b.ks/32));"string"===typeof f&&(f=sjcl.codec.utf8String.toBits(f));g=new sjcl.cipher[b.cipher](a);f="ccm"===
b.mode&&sjcl.arrayBuffer&&sjcl.arrayBuffer.ccm&&b.ct instanceof ArrayBuffer?sjcl.arrayBuffer.ccm.decrypt(g,b.ct,b.iv,b.tag,f,b.ts):sjcl.mode[b.mode].decrypt(g,b.ct,b.iv,f,b.ts);e.g(d,b);d.key=a;return 1===c.raw?f:sjcl.codec.utf8String.fromBits(f)},decrypt:function(a,b,c,d){var e=sjcl.json;return e.ia(a,e.decode(b),c,d)},encode:function(a){var b,c="{",d="";for(b in a)if(a.hasOwnProperty(b)){if(!b.match(/^[a-z0-9]+$/i))throw new sjcl.exception.invalid("json encode: invalid property name");c+=d+'"'+
b+'":';d=",";switch(typeof a[b]){case "number":case "boolean":c+=a[b];break;case "string":c+='"'+escape(a[b])+'"';break;case "object":c+='"'+sjcl.codec.base64.fromBits(a[b],0)+'"';break;default:throw new sjcl.exception.bug("json encode: unsupported type");}}return c+"}"},decode:function(a){a=a.replace(/\s/g,"");if(!a.match(/^\{.*\}$/))throw new sjcl.exception.invalid("json decode: this isn't json!");a=a.replace(/^\{|\}$/g,"").split(/,/);var b={},c,d;for(c=0;c<a.length;c++){if(!(d=a[c].match(/^\s*(?:(["']?)([a-z][a-z0-9]*)\1)\s*:\s*(?:(-?\d+)|"([a-z0-9+\/%*_.@=\-]*)"|(true|false))$/i)))throw new sjcl.exception.invalid("json decode: this isn't json!");
null!=d[3]?b[d[2]]=parseInt(d[3],10):null!=d[4]?b[d[2]]=d[2].match(/^(ct|adata|salt|iv)$/)?sjcl.codec.base64.toBits(d[4]):unescape(d[4]):null!=d[5]&&(b[d[2]]="true"===d[5])}return b},g:function(a,b,c){void 0===a&&(a={});if(void 0===b)return a;for(var d in b)if(b.hasOwnProperty(d)){if(c&&void 0!==a[d]&&a[d]!==b[d])throw new sjcl.exception.invalid("required parameter overridden");a[d]=b[d]}return a},sa:function(a,b){var c={},d;for(d in a)a.hasOwnProperty(d)&&a[d]!==b[d]&&(c[d]=a[d]);return c},ra:function(a,
b){var c={},d;for(d=0;d<b.length;d++)void 0!==a[b[d]]&&(c[b[d]]=a[b[d]]);return c}};sjcl.encrypt=sjcl.json.encrypt;sjcl.decrypt=sjcl.json.decrypt;sjcl.misc.pa={};sjcl.misc.cachedPbkdf2=function(a,b){var c=sjcl.misc.pa,d;b=b||{};d=b.iter||1E3;c=c[a]=c[a]||{};d=c[d]=c[d]||{firstSalt:b.salt&&b.salt.length?b.salt.slice(0):sjcl.random.randomWords(2,0)};c=void 0===b.salt?d.firstSalt:b.salt;d[c]=d[c]||sjcl.misc.pbkdf2(a,c,b.iter);return{key:d[c].slice(0),salt:c.slice(0)}};
"undefined"!==typeof module&&module.exports&&(module.exports=sjcl);"function"===typeof define&&define([],function(){return sjcl});

/**
 * E-LOGBOOK PROGRAM STUDI PROFESI DOKTER
 * Fakultas Kedokteran Universitas Murni Teguh
 * Rumah sakit pendidikan utama: RS Murni Teguh Methodist Susanna Wesley
 *
 * Backend Google Apps Script. Data disimpan di Google Sheets yang terikat pada skrip ini.
 * Petunjuk pemasangan lengkap ada di berkas PDF "Petunjuk Penggunaan E-Logbook".
 *
 * LANGKAH SINGKAT
 *  1. Ubah ADMIN_EMAIL dan ADMIN_NAME di bawah ini.
 *  2. Pilih fungsi "setup" lalu klik Jalankan. Setujui izin akses. Lihat sandi awal admin di "Log eksekusi".
 *  3. Terapkan > Deployment baru > Aplikasi web. Jalankan sebagai: Saya. Akses: Siapa saja.
 *  4. Salin URL aplikasi web ke berkas config.js pada aplikasi (API_URL).
 */

/* ======== PENGATURAN YANG PERLU DIUBAH ======== */
const ADMIN_EMAIL = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL') || 'ganti-dengan-email-admin@contoh.com';
const ADMIN_NAME = 'Admin Program Studi';

/* ======== KONSTANTA ======== */
const SERVER = true;
const PW_ROUNDS = 120;
const TOKEN_TTL = 21600;      // detik, 6 jam
const BG_MENIT = 15;
const MAX_FAIL = 5;           // gagal masuk berturut-turut sebelum dikunci sementara
const LOCK_TTL = 900;         // detik
const ROLES = ['mahasiswa', 'dosen', 'preseptor', 'kaprodi', 'admin'];
const HEAD = ['id', 'sid', 'pid', 'json', 'upd'];
const SHEETS = ['users', 'students', 'cases', 'asms', 'epaLog', 'nilai', 'ews', 'events', 'periods', 'wahana', 'epa', 'replies', 'cfg', 'stases', 'audit', 'regs', 'assignments'];

/* ======== PEMASANGAN ======== */
function setup() {
  IDX = {}; TOUCH = {}; DELR = {}; MEM = {};
  if (!/^\S+@\S+\.\S+$/.test(ADMIN_EMAIL) || ADMIN_EMAIL.indexOf('contoh.com') >= 0) throw new Error('Ubah ADMIN_EMAIL di bagian atas skrip dengan email admin yang sebenarnya, lalu jalankan setup lagi.');
  SHEETS.forEach(function (n) { sheet_(n); });
  const P = PropertiesService.getScriptProperties();
  if (!P.getProperty('ENC_KEY')) {
    const k = Utilities.getUuid() + Utilities.getUuid() + Utilities.getUuid();
    P.setProperty('ENC_KEY', Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, k)));
  }
  MEM = {};
  const us = readAll_('users');
  if (!us.some(function (r) { return r.d.email === ADMIN_EMAIL.toLowerCase(); })) {
    const pw = tempPw_();
    const salt = Utilities.getUuid();
    put_('users', gid_('u'), '', '', { nama: ADMIN_NAME, email: ADMIN_EMAIL.toLowerCase(), roles: ['admin'], unit: 'Program Studi Profesi Dokter', sid: '', aktif: true, must: true, salt: salt, hash: hashPw_(pw, salt), tv: 1, created: now_() });
    Logger.log('==============================================');
    Logger.log('AKUN ADMIN DIBUAT');
    Logger.log('Email : ' + ADMIN_EMAIL.toLowerCase());
    Logger.log('Sandi sementara : ' + pw);
    Logger.log('Anda akan diminta menggantinya saat masuk pertama kali.');
    Logger.log('==============================================');
  } else Logger.log('Akun admin sudah ada. Gunakan menu Reset sandi dari aplikasi bila lupa.');
  if (!readAll_('wahana').length) {
    put_('wahana', 'w0', '', '', { id: 'w0', nama: 'RS Murni Teguh Methodist Susanna Wesley', jenis: 'RS Pendidikan Utama' });
  }
  flush_();
  Logger.log('Setup selesai. Lanjutkan dengan Terapkan > Deployment baru > Aplikasi web.');
}

/* ======== PINTU MASUK WEB ======== */
function doGet(e) {
  const tok = e && e.parameter && e.parameter.consent;
  if (tok) return consentPage_(String(tok));
  return json_({ ok: true, name: 'E-Logbook Profesi Dokter FK UMT', version: 2 });
}
function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (x) { return json_({ ok: false, err: 'bad_request' }); }
  MEM = {}; IDX = {}; TOUCH = {}; DELR = {};
  const act = String(req.action || '');
  const writes = { login: 1, sync: 1, register: 1, chpw: 1, admin: 1, bg: 1, bgEnd: 1 };
  let lock = null;
  try {
    if (writes[act]) { lock = LockService.getScriptLock(); lock.waitLock(25000); }
    const H = { login: login_, logout: logout_, register: register_, chpw: chpw_, load: load_, sync: sync_, bg: bg_, bgGet: bgGet_, bgEnd: bgEnd_, admin: admin_ };
    if (!H[act]) return json_({ ok: false, err: 'unknown_action' });
    const out = H[act](req);
    flush_();
    return json_(out);
  } catch (x) {
    if (x && x.code) return json_({ ok: false, err: x.code, msg: x.msg || '' });
    console.error(x && x.stack || x);
    return json_({ ok: false, err: 'server', msg: 'Gangguan server. Hubungi admin dengan waktu kejadian.' });
  } finally { if (lock) { try { lock.releaseLock(); } catch (y) { } } }
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function fail_(code, msg) { const e = new Error(code); e.code = code; e.msg = msg || ''; throw e; }

/* ======== LEMBAR DATA (satu lembar per koleksi: id | sid | pid | json | upd) ======== */
var MEM = {}, IDX = {}, TOUCH = {}, DELR = {};
function sheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.getRange(1, 1, 1, 5).setValues([HEAD]); sh.setFrozenRows(1); }
  return sh;
}
function readAll_(name) {
  if (MEM[name]) return MEM[name];
  const sh = sheet_(name), n = sh.getLastRow() - 1, out = [];
  if (n > 0) {
    const v = sh.getRange(2, 1, n, 5).getValues();
    for (let i = 0; i < n; i++) {
      if (v[i][0] === '' || v[i][0] == null) continue;
      try { out.push({ id: String(v[i][0]), sid: String(v[i][1]), pid: String(v[i][2]), d: JSON.parse(v[i][3]), row: i + 2, dirty: false }); } catch (x) { }
    }
  }
  MEM[name] = out; IDX[name] = {}; out.forEach(function (r) { IDX[name][r.id] = r; });
  return out;
}
function get_(name, id) { readAll_(name); return IDX[name][id] || null; }
function put_(name, id, sid, pid, d) {
  const all = readAll_(name); let r = IDX[name][id];
  const s = JSON.stringify(d); if (s.length > 45000) fail_('too_big');
  if (r) { r.sid = sid || ''; r.pid = pid || ''; r.d = d; r.dirty = true; }
  else { r = { id: id, sid: sid || '', pid: pid || '', d: d, row: 0, dirty: true }; all.push(r); IDX[name][id] = r; }
  TOUCH[name] = true; return r;
}
function del_(name, id) {
  const all = readAll_(name); const r = IDX[name][id]; if (!r) return;
  all.splice(all.indexOf(r), 1); delete IDX[name][id];
  if (r.row) (DELR[name] = DELR[name] || []).push(r.row);
  TOUCH[name] = true;
}
function flush_() {
  Object.keys(TOUCH).forEach(function (name) {
    const all = MEM[name], sh = sheet_(name), dels = (DELR[name] || []).slice().sort(function (a, b) { return b - a; });
    const stamp = now_() + ' ' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'HH:mm:ss');
    const dirty = all.filter(function (r) { return r.dirty; });
    if (dels.length > 5 || dirty.length > 30) {
      const last = sh.getLastRow();
      if (last > 1) sh.getRange(2, 1, last - 1, 5).clearContent();
      if (all.length) sh.getRange(2, 1, all.length, 5).setValues(all.map(function (r) { return [r.id, r.sid, r.pid, JSON.stringify(r.d), stamp]; }));
      all.forEach(function (r, i) { r.row = i + 2; r.dirty = false; });
    } else {
      dels.forEach(function (row) { sh.deleteRow(row); all.forEach(function (r) { if (r.row > row) r.row--; }); });
      const adds = [];
      dirty.forEach(function (r) {
        if (r.row) sh.getRange(r.row, 1, 1, 5).setValues([[r.id, r.sid, r.pid, JSON.stringify(r.d), stamp]]);
        else adds.push(r);
      });
      if (adds.length) {
        const start = sh.getLastRow() + 1;
        sh.getRange(start, 1, adds.length, 5).setValues(adds.map(function (r) { return [r.id, r.sid, r.pid, JSON.stringify(r.d), stamp]; }));
        adds.forEach(function (r, i) { r.row = start + i; });
      }
      dirty.forEach(function (r) { r.dirty = false; });
    }
  });
  TOUCH = {}; DELR = {};
}

/* ======== UTILITAS ======== */
function now_() { return Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd'); }
function ts_() { return Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm'); }
function gid_(p) { return p + new Date().getTime().toString(36) + Utilities.getUuid().replace(/-/g, '').slice(0, 6); }
function b64_(bytes) { return Utilities.base64Encode(bytes); }
function str_(v, max) { v = v == null ? '' : String(v); return v.length > max ? v.slice(0, max) : v; }
function int_(v, lo, hi, def) { const n = parseInt(v, 10); return isNaN(n) ? def : Math.max(lo, Math.min(hi, n)); }
function num_(v, lo, hi) { const n = parseFloat(v); if (isNaN(n) || n < lo || n > hi) return null; return Math.round(n * 10) / 10; }
function enum_(v, list, def) { return list.indexOf(v) >= 0 ? v : def; }
function date_(v, def) { v = String(v || ''); return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : (def === undefined ? now_() : def); }
function idok_(v) { return !['__proto__','prototype','constructor'].includes(String(v)) && /^[A-Za-z0-9_:|-]{2,80}$/.test(String(v || '')); }
function tempPw_() {
  const cs = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = '';
  const u = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  for (let i = 0; i < 10; i++) s += cs.charAt(parseInt(u.substr(i * 2, 2), 16) % cs.length);
  return s;
}
function hashPw_(pw, salt) {
  let h = salt + '|' + pw;
  for (let i = 0; i < PW_ROUNDS; i++) h = b64_(Utilities.computeHmacSha256Signature(h, salt + ':' + i));
  return h;
}
function same_(a, b) { a = String(a); b = String(b); if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
function rolesOf_(u) { const r = {}; (u.d.roles || []).forEach(function (x) { r[x] = 1; }); return r; }

/* Enkripsi identitas pasien: aliran kunci HMAC-SHA256 mode penghitung, disertai MAC. Kunci ada di Script Properties. */
function key_() { const k = PropertiesService.getScriptProperties().getProperty('ENC_KEY'); if (!k) fail_('not_setup', 'Jalankan setup terlebih dahulu.'); return k; }
function xor_(bytes, nonce, key) {
  const out = []; let blk = null;
  for (let i = 0; i < bytes.length; i++) {
    if (i % 32 === 0) blk = Utilities.computeHmacSha256Signature(nonce + ':' + Math.floor(i / 32), key);
    out.push(((bytes[i] & 255) ^ (blk[i % 32] & 255)) & 255);
  }
  return out.map(function (x) { return x > 127 ? x - 256 : x; });
}
function enc_(s) {
  s = String(s == null ? '' : s); if (!s) return '';
  const key = key_(), nonce = Utilities.getUuid();
  const ct = b64_(xor_(Utilities.newBlob(s).getBytes(), nonce, key));
  const mac = b64_(Utilities.computeHmacSha256Signature(nonce + '.' + ct, key));
  return nonce + '.' + ct + '.' + mac;
}
function dec_(t) {
  if (!t) return '';
  const p = String(t).split('.'); if (p.length !== 3) return '';
  const key = key_();
  if (!same_(b64_(Utilities.computeHmacSha256Signature(p[0] + '.' + p[1], key)), p[2])) return '';
  return Utilities.newBlob(xor_(Utilities.base64Decode(p[1]), p[0], key)).getDataAsString();
}

/* ======== AUTENTIKASI ======== */
function userByEmail_(email) { email = String(email || '').trim().toLowerCase(); return readAll_('users').filter(function (r) { return r.d.email === email; })[0] || null; }
function auth_(req) {
  const tk = String(req.token || ''); if (!/^[A-Za-z0-9]{40,100}$/.test(tk)) fail_('auth');
  const v = CacheService.getScriptCache().get('tk:' + tk); if (!v) fail_('auth');
  const p = v.split('|'); const u = get_('users', p[0]);
  if (!u || u.d.aktif === false || String(u.d.tv) !== p[1]) fail_('auth');
  return u;
}
function login_(req) {
  const email = String(req.email || '').trim().toLowerCase(), pw = String(req.pw || '');
  const C = CacheService.getScriptCache(), lk = 'lf:' + email;
  const fails = parseInt(C.get(lk) || '0', 10);
  if (fails >= MAX_FAIL) fail_('locked', 'Terlalu banyak percobaan. Coba lagi sekitar 15 menit.');
  const u = userByEmail_(email);
  const ok = !!u && u.d.aktif !== false && verifyPw_(pw, u.d.salt, u.d.hash);
  if (!ok) { C.put(lk, String(fails + 1), LOCK_TTL); fail_('cred', 'Email atau kata sandi tidak cocok.'); }
  if (!u.d.roles || !u.d.roles.length) fail_('norole', 'Peran Anda belum ditetapkan oleh admin program studi.');
  C.remove(lk);
  const tok = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  C.put('tk:' + tok, u.id + '|' + u.d.tv, TOKEN_TTL);
  return { ok: true, token: tok, must: !!u.d.must };
}
function logout_(req) { try { CacheService.getScriptCache().remove('tk:' + String(req.token || '')); } catch (x) { } return { ok: true }; }
function register_(req) {
  const email = String(req.email || '').trim().toLowerCase(), nama = str_(String(req.nama || '').trim(), 80), pw = String(req.pw || '');
  if (!nama || !/^\S+@\S+\.\S+$/.test(email) || email.length > 120) fail_('invalid', 'Nama atau email tidak valid.');
  if (pw.length < 8) fail_('weak', 'Kata sandi minimal 8 karakter.');
  const C = CacheService.getScriptCache(); const n = parseInt(C.get('rg:n') || '0', 10);
  if (n >= 30) fail_('busy', 'Terlalu banyak pendaftaran dalam satu jam. Coba lagi nanti.');
  if (userByEmail_(email) || readAll_('regs').some(function (r) { return r.d.email === email; })) fail_('exists', 'Email ini sudah terdaftar atau sedang menunggu penetapan peran.');
  C.put('rg:n', String(n + 1), 3600);
  const salt = Utilities.getUuid();
  put_('regs', gid_('r'), '', '', { nama: nama, email: email, unit: str_(req.unit, 30), harap: enum_(String(req.harap || '').toLowerCase(), ['mahasiswa', 'dosen', 'preseptor'], 'mahasiswa'), salt: salt, hash: hashPw_(pw, salt), tgl: now_() });
  return { ok: true };
}
function chpw_(req) {
  const u = auth_(req); const nw = String(req.nw || '');
  if (nw.length < 8) fail_('weak', 'Kata sandi baru minimal 8 karakter.');
  if (!verifyPw_(String(req.old || ''), u.d.salt, u.d.hash)) fail_('cred', 'Kata sandi lama tidak cocok.');
  if (nw === String(req.old)) fail_('same', 'Kata sandi baru harus berbeda dari yang lama.');
  u.d.salt = Utilities.getUuid(); u.d.hash = hashPw_(nw, u.d.salt); u.d.must = false; u.d.tv = (u.d.tv || 1) + 1;
  put_('users', u.id, u.sid || '', '', u.d);
  const tok = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  CacheService.getScriptCache().put('tk:' + tok, u.id + '|' + u.d.tv, TOKEN_TTL);
  return { ok: true, token: tok };
}

/* ======== MUAT DATA SESUAI PERAN ======== */
function maskCase_(d, own) {
  const o = {}; Object.keys(d).forEach(function (k) { if (k !== 'ini_e' && k !== 'rm_e') o[k] = d[k]; });
  if (!own) delete o.tok;
  o.ini = ''; o.rm = '';
  return o;
}
function readableSids_(u) {
  const R = rolesOf_(u); const sids = {};
  if (R.mahasiswa && u.d.sid) sids[u.d.sid] = 1;
  if (R.preseptor) {
    readAll_('cases').forEach(function (r) { if (r.pid === u.id) sids[r.sid] = 1; });
    readAll_('asms').forEach(function (r) { if (r.pid === u.id) sids[r.sid] = 1; });
  }
  return sids;
}
function canReadCase_(u, r) {
  const R = rolesOf_(u);
  if (R.admin || R.kaprodi || R.dosen) return true;
  if (R.mahasiswa && u.d.sid && r.sid === u.d.sid) return true;
  return !!R.preseptor && r.pid === u.id;
}
function load_(req) {
  const u = auth_(req), R = rolesOf_(u), full = !!(R.admin || R.kaprodi || R.dosen);
  let cases = readAll_('cases'), asms = readAll_('asms'), students = readAll_('students');
  let sids = null;
  if (!full) {
    sids = readableSids_(u);
    cases = cases.filter(function (r) { return (R.mahasiswa && r.sid === u.d.sid) || (R.preseptor && r.pid === u.id); });
    asms = asms.filter(function (r) { return (R.mahasiswa && r.sid === u.d.sid) || (R.preseptor && r.pid === u.id); });
    students = students.filter(function (r) { return sids[r.id]; });
  }
  const inS = function (r) { return full || sids[r.sid]; };
  const st = {
    ok: true, today: now_(),
    me: { id: u.id, nama: u.d.nama, email: u.d.email, roles: u.d.roles, unit: u.d.unit || '', sid: u.d.sid || '', must: !!u.d.must },
    students: students.map(function (r) { return r.d; }),
    cases: cases.map(function (r) { return maskCase_(r.d, r.sid === u.d.sid); }),
    asms: asms.map(function (r) { return r.d; }),
    epaLog: readAll_('epaLog').filter(inS).map(function (r) { return r.d; }),
    nilai: readAll_('nilai').filter(inS).map(function (r) { return r.d; }),
    epa: {}, replies: {}, events: readAll_('events').map(function (r) { return r.d; }), periods: readAll_('periods').map(function (r) { return r.d; }), wahana: readAll_('wahana').map(function (r) { return r.d; }),
    stases: readAll_('stases').map(function (r) { return r.d; }), cfg: {}, regs: [], audit: [], ews: []
  };
  readAll_('epa').forEach(function (r) { if (inS(r)) st.epa[r.id] = r.d.l; });
  readAll_('replies').forEach(function (r) { if (R.mahasiswa && r.sid === u.d.sid) st.replies[r.id] = r.d.t; });
  readAll_('cfg').forEach(function (r) { st.cfg[r.id] = r.d; });
  st.ews = readAll_('ews').filter(function (r) { return R.kaprodi || r.d.oleh === u.id; }).map(function (r) { return r.d; });
  st.audit = readAll_('audit').filter(function (r) { return R.admin || R.kaprodi || r.d.uid === u.id; }).map(function (r) { return r.d; });
  if (R.admin) st.regs = readAll_('regs').map(function (r) { const d = r.d; return { id: r.id, nama: d.nama, email: d.email, unit: d.unit, harap: d.harap, tgl: d.tgl }; });
  st.users = readAll_('users').filter(function (r) {
    if (R.admin || r.id === u.id) return true;
    const rr = r.d.roles || []; return rr.indexOf('dosen') >= 0 || rr.indexOf('preseptor') >= 0 || rr.indexOf('kaprodi') >= 0;
  }).map(function (r) { const d = r.d; const o = { id: r.id, nama: d.nama, roles: d.roles, unit: d.unit || '', sid: d.sid || '', aktif: d.aktif !== false }; if (R.admin || r.id === u.id) { o.email = d.email; o.last = d.last || ''; o.must = !!d.must; } return o; });
  st.bgAktif = st.audit.filter(function (a) { return a.uid === u.id && a.status === 'Aktif' && a.until > new Date().getTime(); }).map(function (a) { return { cid: a.cid, until: a.until }; });
  if (R.mahasiswa && u.d.sid && !R.admin && !R.kaprodi && !R.dosen) st.pct = pct_(u.d.sid);
  return st;
}
/* Persentil kohort dihitung di server agar mahasiswa tidak perlu menerima data teman sekelas. */
function pct_(sid) {
  const C = CacheService.getScriptCache(); let all = null;
  try { const c = C.get('pct'); if (c) all = JSON.parse(c); } catch (x) { }
  if (!all) {
    const keep = S;
    S = { students: readAll_('students').map(function (r) { return r.d; }), cases: readAll_('cases').map(function (r) { return { sid: r.sid, st: r.d.st, jenis: r.d.jenis, stat: r.d.stat, kat: r.d.kat }; }), asms: readAll_('asms').filter(function (r) { return r.d.stat === 'dinilai'; }).map(function (r) { return r.d; }), nilai: readAll_('nilai').map(function (r) { return r.d; }), epa: {}, pct: null };
    cfg_(S); inval();
    all = {};
    S.students.forEach(function (s) { all[s.id] = { PSSK: pctRank('PSSK', s.id), PSPD: pctRank('PSPD', s.id) }; });
    S = keep; inval();
    try { C.put('pct', JSON.stringify(all), 600); } catch (x) { }
  }
  const o = {}; if (all[sid]) o[sid] = all[sid]; return o;
}
function cfg_(Sx) {
  Sx.bobotStase = Object.assign({}, BS); Sx.bobotBlok = Object.assign({}, BB);
  readAll_('cfg').forEach(function (r) { if (r.id === 'bs') Sx.bobotStase = r.d.v; if (r.id === 'bb') Sx.bobotBlok = r.d.v; });
  Sx.stases = STASES.map(function (x) { return Object.assign({}, x); });
  readAll_('stases').forEach(function (r) { const s = Sx.stases.filter(function (x) { return x.id === r.id; })[0]; if (s) { s.minggu = r.d.minggu; s.tf = r.d.tf; s.tr = r.d.tr; } });
  Sx.wahana = readAll_('wahana').map(function (r) { return r.d; });
}

/* ======== SINKRONISASI TULIS DENGAN OTORISASI TIAP BARIS ======== */
function stIds_() { return STASES.map(function (s) { return s.id; }); }
function pidOk_(pid) { const r = get_('users', pid); return !!r && r.d.aktif !== false && (r.d.roles || []).some(function (x) { return x === 'preseptor' || x === 'dosen' || x === 'kaprodi'; }); }
function sync_(req) {
  const u = auth_(req), R = rolesOf_(u);
  if (u.d.must) fail_('must_change', 'Ganti kata sandi terlebih dahulu.');
  const ops = Array.isArray(req.ops) ? req.ops.slice(0, 400) : [];
  const rej = [];
  ops.forEach(function (op) {
    let ok = false;
    try {
      const f = Object.prototype.hasOwnProperty.call(W, op.c) ? W[op.c] : null; if (f && idok_(op.id)) ok = f(u, R, op) === true;
    } catch (x) { if (x && x.code === 'too_big') ok = false; else throw x; }
    if (!ok) rej.push([op.c, op.id]);
  });
  return { ok: true, rej: rej };
}
const W = {};
W.cases = function (u, R, op) {
  const ex = get_('cases', op.id);
  if (op.del) {
    if (!ex || !R.mahasiswa || ex.sid !== u.d.sid || ex.d.stat !== 'draf') return false;
    del_('cases', op.id); return true;
  }
  const d = op.d || {};
  const common = function () {
    return { tgl: date_(d.tgl), jenis: enum_(d.jenis, ['Kasus', 'Kegiatan', 'Refleksi'], 'Kasus'), st: enum_(d.st, stIds_(), stIds_()[0]), wah: str_(d.wah, 20), dx: str_(d.dx, 200), kat: enum_(d.kat, ['FKTP', 'FKRTL', ''], ''), sis: str_(d.sis, 60), usia: str_(d.usia, 4), jk: enum_(d.jk, ['L', 'P'], 'L'), ter: str_(d.ter, 60), pid: str_(d.pid, 40), sum: str_(d.sum, 4000), ref: str_(d.ref, 3000) };
  };
  const idn = function (o, cur) {
    const ini = str_(d.ini, 30).trim(), rm = str_(d.rm, 30).trim();
    o.ini_e = ini ? enc_(ini) : (cur ? cur.ini_e || '' : ''); o.rm_e = rm ? enc_(rm) : (cur ? cur.rm_e || '' : '');
    o.rm2 = rm ? rm.slice(-2) : (cur ? cur.rm2 || '' : '');
  };
  // Mahasiswa pemilik
  if (R.mahasiswa && u.d.sid && (!ex || ex.sid === u.d.sid) && (!ex || ex.d.stat === 'draf' || ex.d.stat === 'kembali')) {
    const o = common(); if (o.pid && !pidOk_(o.pid)) return false;
    let stat = enum_(d.stat, ['draf', 'menunggu', 'valid'], 'draf');
    if (o.jenis === 'Kasus' && stat === 'valid') stat = 'menunggu';
    if (o.jenis !== 'Kasus' && stat === 'menunggu') stat = 'valid';
    if (o.jenis !== 'Kasus') { o.kat = ''; o.sis = ''; }
    const cur = ex ? ex.d : null;
    const out = Object.assign({ id: op.id, sid: u.d.sid }, o, { stat: stat, fb: cur ? cur.fb || '' : '', fbTgl: cur ? cur.fbTgl || '' : '', cons: cur ? !!cur.cons : false, tok: cur ? cur.tok : (/^[a-z0-9]{12,40}$/.test(String(d.tok || '')) ? d.tok : Utilities.getUuid().replace(/-/g, '').slice(0, 24)) });
    idn(out, cur);
    // Additional patient identifiers are optional; pseudonymous case IDs are preferred.
    put_('cases', op.id, u.d.sid, out.pid, out); return true;
  }
  // Validator
  if (ex && ex.d.stat === 'menunggu' && ex.sid !== u.d.sid && (R.dosen || R.preseptor) && (ex.pid === u.id || R.dosen)) {
    const stat = enum_(d.stat, ['valid', 'kembali'], null); if (!stat) return false;
    const out = Object.assign({}, ex.d, { stat: stat, fb: str_(d.fb, 2000), fbTgl: date_(d.fbTgl) });
    if (stat === 'kembali' && !out.fb.trim()) return false;
    put_('cases', op.id, ex.sid, ex.pid, out); return true;
  }
  return false;
};
W.asms = function (u, R, op) {
  const ex = get_('asms', op.id); const d = op.d || {}; if (op.del) return false;
  if (!ex) {
    if (!R.mahasiswa || !u.d.sid) return false;
    const jenis = enum_(d.jenis, ['DOPS', 'Mini-CEX', 'CBD', 'Presentasi Kasus', 'MSF'], null); if (!jenis || !pidOk_(d.pid)) return false;
    put_('asms', op.id, u.d.sid, d.pid, { id: op.id, sid: u.d.sid, jenis: jenis, judul: str_(d.judul, 200), tgl: date_(d.tgl), st: enum_(d.st, stIds_(), stIds_()[0]), pid: d.pid, stat: 'menunggu', sk: null, kek: '', perlu: '', renc: '' }); return true;
  }
  if (ex.d.stat !== 'menunggu' || ex.sid === u.d.sid || !(R.dosen || R.preseptor) || !(ex.pid === u.id || R.dosen)) return false;
  const n = ex.d.jenis === 'DOPS' ? DP_DOM.length : MC_DOM.length;
  if (!Array.isArray(d.sk) || d.sk.length !== n) return false;
  const sk = d.sk.map(function (x) { return int_(x, 1, 9, 6); });
  put_('asms', op.id, ex.sid, ex.pid, Object.assign({}, ex.d, { sk: sk, kek: str_(d.kek, 1500), perlu: str_(d.perlu, 1500), renc: str_(d.renc, 1500), stat: 'dinilai' })); return true;
};
W.epaLog = function (u, R, op) {
  if (op.del || get_('epaLog', op.id)) return false;
  if (!(R.dosen || R.preseptor || R.kaprodi)) return false;
  const d = op.d || {}; const s = get_('students', d.sid); if (!s) return false;
  const epa = int_(d.epa, 0, EPAS.length - 1, -1), level = int_(d.level, 1, 5, 0); if (epa < 0 || !level) return false;
  put_('epaLog', op.id, s.id, u.id, { id: op.id, sid: s.id, epa: epa, level: level, tgl: date_(d.tgl), pid: u.id, cm: str_(d.cm, 1500) });
  const cur = get_('epa', s.id); const l = cur ? cur.d.l.slice() : EPAS.map(function () { return 1; }); l[epa] = level;
  put_('epa', s.id, s.id, '', { l: l }); return true;
};
W.nilai = function (u, R, op) {
  if (op.del || !(R.dosen || R.kaprodi || R.admin)) return false;
  const d = op.d || {}; const s = get_('students', d.sid); if (!s) return false;
  const tahap = enum_(d.tahap, ['PSPD', 'PSSK'], null); if (!tahap) return false;
  const unit = tahap === 'PSPD' ? enum_(d.unit, stIds_(), null) : enum_(d.unit, PSSK_BLOK, null); if (!unit) return false;
  const komp = tahap === 'PSPD' ? enum_(d.komp, ['CBT', 'OSCE', 'CBD', 'MSF'], null) : enum_(d.komp, Object.keys(BB), null); if (!komp) return false;
  const v = num_(d.v, 0, 100); if (v == null) return false;
  const id = [s.id, tahap, unit, komp].join('|').replace(/[^A-Za-z0-9|_-]/g, '_'); if (id !== op.id) return false;
  put_('nilai', id, s.id, '', { id: id, sid: s.id, tahap: tahap, unit: unit, komp: komp, v: v, tgl: date_(d.tgl), oleh: u.id }); return true;
};
W.ews = function (u, R, op) {
  if (op.del || !R.kaprodi) return false;
  const ex = get_('ews', op.id); const d = op.d || {};
  if (!ex) {
    const s = get_('students', d.sid); if (!s) return false;
    put_('ews', op.id, s.id, u.id, { id: op.id, sid: s.id, kat: enum_(d.kat, ['Akademik', 'Profesionalisme', 'Kesejahteraan', 'Kehadiran', 'Lainnya'], 'Lainnya'), oleh: u.id, tgl: date_(d.tgl), txt: str_(d.txt, 2000), stat: 'antrean', rek: [] }); return true;
  }
  const rek = (Array.isArray(d.rek) ? d.rek : []).slice(0, 20).map(function (r) { return { jenis: str_(r.jenis, 80), txt: str_(r.txt, 1500), target: date_(r.target), tgl: date_(r.tgl) }; });
  put_('ews', op.id, ex.sid, ex.pid, Object.assign({}, ex.d, { stat: enum_(d.stat, ['antrean', 'dilaporkan', 'selesai'], ex.d.stat), rek: rek })); return true;
};
W.events = function (u, R, op) {
  if (!R.admin) return false; if (op.del) { del_('events', op.id); return true; }
  const d = op.d || {};
  put_('events', op.id, '', '', { id: op.id, jenis: enum_(d.jenis, JENIS_ASESMEN.map(function (j) { return j.k; }), 'OSCE'), judul: str_(d.judul, 200), st: enum_(d.st, stIds_().concat(['']), ''), tgl: date_(d.tgl), lokasi: str_(d.lokasi, 200), penguji: str_(d.penguji, 40), kuota: int_(d.kuota, 1, 2000, 1), status: enum_(d.status, ['Dijadwalkan', 'Selesai', 'Dibatalkan'], 'Dijadwalkan') }); return true;
};
W.periods = function (u, R, op) {
  if (!R.admin) return false; if (op.del) { del_('periods', op.id); return true; }
  const d = op.d || {};
  put_('periods', op.id, '', '', { id: op.id, nama: str_(d.nama, 120), mulai: date_(d.mulai), selesai: date_(d.selesai), aktif: !!d.aktif }); return true;
};
W.wahana = function (u, R, op) {
  if (!R.admin || op.del) return false; const d = op.d || {};
  put_('wahana', op.id, '', '', { id: op.id, nama: str_(d.nama, 160), jenis: enum_(d.jenis, ['FKTP', 'RS Jejaring', 'RS Pendidikan Utama'], 'FKTP') }); return true;
};
W.stases = function (u, R, op) {
  if (!R.admin || op.del || stIds_().indexOf(op.id) < 0) return false; const d = op.d || {};
  put_('stases', op.id, '', '', { id: op.id, minggu: int_(d.minggu, 1, 30, 4), tf: int_(d.tf, 0, 500, 0), tr: int_(d.tr, 0, 500, 0) }); return true;
};
W.cfg = function (u, R, op) {
  if (!R.admin || op.del || (op.id !== 'bs' && op.id !== 'bb')) return false;
  const v = op.d && op.d.v || {}; const base = op.id === 'bs' ? BS : BB; const out = {}; let sum = 0;
  Object.keys(base).forEach(function (k) { out[k] = Math.max(0, Math.min(100, parseFloat(v[k]) || 0)); sum += out[k]; });
  if (Math.round(sum) !== 100) return false;
  put_('cfg', op.id, '', '', { id: op.id, v: out }); return true;
};
W.replies = function (u, R, op) {
  if (!R.mahasiswa || !u.d.sid || op.del) return false;
  const m = /^([cae]):(.+)$/.exec(String(op.id)); if (!m) return false;
  const src = get_(m[1] === 'c' ? 'cases' : m[1] === 'a' ? 'asms' : 'epaLog', m[2]);
  if (!src || src.sid !== u.d.sid) return false;
  put_('replies', op.id, u.d.sid, '', { id: op.id, t: str_(op.d && op.d.t, 2000) }); return true;
};

/* ======== BREAK GLASS ======== */
function bg_(req) {
  const u = auth_(req); const c = get_('cases', String(req.cid || '')); if (!c || !canReadCase_(u, c)) fail_('forbidden');
  const alasan = str_(String(req.alasan || '').trim(), 400); if (alasan.length < 15) fail_('invalid', 'Alasan minimal 15 karakter.');
  const until = new Date().getTime() + BG_MENIT * 60000;
  const aid = gid_('b');
  put_('audit', aid, c.sid, u.id, { id: aid, ts: ts_(), uid: u.id, cid: c.id, alasan: alasan, menit: BG_MENIT, status: 'Aktif', until: until });
  return { ok: true, ini: dec_(c.d.ini_e), rm: dec_(c.d.rm_e), until: until };
}
function bgGet_(req) {
  const u = auth_(req); const c = get_('cases', String(req.cid || '')); if (!c || !canReadCase_(u, c)) fail_('forbidden');
  const a = readAll_('audit').filter(function (r) { return r.d.uid === u.id && r.d.cid === c.id && r.d.status === 'Aktif' && r.d.until > new Date().getTime(); })[0];
  if (!a) fail_('expired');
  return { ok: true, ini: dec_(c.d.ini_e), rm: dec_(c.d.rm_e), until: a.d.until };
}
function bgEnd_(req) {
  const u = auth_(req); const R = rolesOf_(u); const cid = String(req.cid || '');
  readAll_('audit').forEach(function (r) {
    if (r.d.cid === cid && r.d.status === 'Aktif' && (r.d.uid === u.id || R.admin)) { r.d.status = 'Selesai'; put_('audit', r.id, r.sid, r.pid, r.d); }
  });
  return { ok: true };
}

/* ======== ADMIN ======== */
function admin_(req) {
  const u = auth_(req); const R = rolesOf_(u); if (!R.admin) fail_('forbidden');
  if (u.d.must) fail_('must_change');
  const f = ADM[req.op]; if (!f) fail_('unknown_op');
  return f(u, req);
}
const ADM = {};
function cleanUser_(p) {
  const roles = (Array.isArray(p.roles) ? p.roles : []).filter(function (r, i, a) { return ROLES.indexOf(r) >= 0 && a.indexOf(r) === i; });
  let g = p.g; if (typeof g === 'string' && /^[A-Da-d]$/.test(g)) g = g.toUpperCase().charCodeAt(0) - 65;
  return { nama: str_(String(p.nama || '').trim(), 80), email: String(p.email || '').trim().toLowerCase(), roles: roles, unit: str_(p.unit, 120), nim: str_(String(p.nim || '').trim(), 20), g: int_(g, 0, 3, 0), angk: str_(p.angk, 4) || String(new Date().getFullYear()), mulai: date_(p.mulai, '') };
}
function ensureStudent_(uid, c, sidKnown) {
  let sid = sidKnown;
  let s = sid ? get_('students', sid) : null;
  if (!s) {
    sid = gid_('s');
    put_('students', sid, sid, '', { id: sid, nama: c.nama, nim: c.nim || ('NIM' + sid.slice(-5).toUpperCase()), g: c.g, angk: c.angk, mulai: c.mulai, mu: 0, rate: 0, uid: uid });
    put_('epa', sid, sid, '', { l: EPAS.map(function () { return 1; }) });
  } else {
    const d = Object.assign({}, s.d, { nama: c.nama, g: c.g, angk: c.angk, mulai: c.mulai }); if (c.nim) d.nim = c.nim;
    put_('students', sid, sid, '', d);
  }
  return sid;
}
function createUser_(c, hash, salt, must) {
  if (!c.nama || !/^\S+@\S+\.\S+$/.test(c.email)) return { err: 'Nama atau email tidak valid' };
  if (userByEmail_(c.email)) return { err: 'Email sudah terdaftar' };
  const id = gid_('u'); let sid = '';
  if (c.roles.indexOf('mahasiswa') >= 0) sid = ensureStudent_(id, c, '');
  put_('users', id, sid, '', { nama: c.nama, email: c.email, roles: c.roles, unit: c.unit, sid: sid, aktif: true, must: must, salt: salt, hash: hash, tv: 1, created: now_() });
  return { id: id };
}
ADM.userCreate = function (u, req) {
  const c = cleanUser_(req); const pw = tempPw_(); const salt = Utilities.getUuid();
  const r = createUser_(c, hashPw_(pw, salt), salt, true); if (r.err) fail_('invalid', r.err);
  return { ok: true, id: r.id, pw: pw };
};
ADM.userImport = function (u, req) {
  const rows = Array.isArray(req.rows) ? req.rows.slice(0, 300) : []; const out = [], skip = [];
  rows.forEach(function (p, i) {
    const c = cleanUser_(p); const pw = tempPw_(); const salt = Utilities.getUuid();
    const r = createUser_(c, hashPw_(pw, salt), salt, true);
    if (r.err) skip.push({ i: i + 1, email: c.email, err: r.err }); else out.push({ nama: c.nama, email: c.email, pw: pw });
  });
  return { ok: true, made: out, skip: skip };
};
ADM.userUpdate = function (u, req) {
  const r = get_('users', String(req.id || '')); if (!r) fail_('notfound');
  const c = cleanUser_(Object.assign({}, r.d, req, { email: r.d.email }));
  if (!c.nama) fail_('invalid', 'Nama wajib diisi.');
  const aktif = req.aktif !== false;
  if (r.id === u.id && (!aktif || c.roles.indexOf('admin') < 0)) fail_('self', 'Anda tidak dapat menonaktifkan akun sendiri atau melepas peran admin Anda.');
  const d = Object.assign({}, r.d, { nama: c.nama, roles: c.roles, unit: c.unit, aktif: aktif });
  if (c.roles.indexOf('mahasiswa') >= 0) d.sid = ensureStudent_(r.id, c, r.d.sid || '');
  if (!aktif || c.roles.length !== (r.d.roles || []).length) d.tv = (d.tv || 1) + 1;
  put_('users', r.id, d.sid || '', '', d);
  return { ok: true };
};
ADM.userReset = function (u, req) {
  const r = get_('users', String(req.id || '')); if (!r) fail_('notfound');
  const pw = tempPw_(); const salt = Utilities.getUuid();
  r.d.salt = salt; r.d.hash = hashPw_(pw, salt); r.d.must = true; r.d.tv = (r.d.tv || 1) + 1; put_('users', r.id, r.d.sid || '', '', r.d);
  CacheService.getScriptCache().remove('lf:' + r.d.email);
  return { ok: true, pw: pw };
};
ADM.regApprove = function (u, req) {
  const r = get_('regs', String(req.id || '')); if (!r) fail_('notfound');
  const c = cleanUser_(Object.assign({}, req, { nama: r.d.nama, email: r.d.email, nim: req.nim || r.d.unit }));
  if (!c.roles.length) fail_('invalid', 'Pilih minimal satu peran.');
  const x = createUser_(c, r.d.hash, r.d.salt, false); if (x.err) fail_('invalid', x.err);
  del_('regs', r.id); return { ok: true };
};
ADM.regReject = function (u, req) { del_('regs', String(req.id || '')); return { ok: true }; };

/* ======== PERSETUJUAN PASIEN (halaman publik tanpa data kasus) ======== */
function consentPage_(tok) {
  const ok = /^[a-z0-9]{12,40}$/.test(tok);
  const html = '<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_top"><title>Persetujuan Pasien</title><style>body{font:16px/1.6 system-ui,sans-serif;margin:0;background:#f3f8fb;color:#16303f}main{max-width:560px;margin:0 auto;padding:28px 20px}h1{font-size:22px;color:#006AB0;margin:0 0 6px}p{margin:12px 0}.card{background:#fff;border-radius:14px;padding:22px;box-shadow:0 1px 6px rgba(0,60,100,.12)}button{font:inherit;font-weight:600;border:0;border-radius:10px;padding:12px 18px;cursor:pointer;margin:6px 8px 0 0}#ya{background:#006AB0;color:#fff}#tdk{background:#e4edf3;color:#16303f}small{color:#5b7280}.ok{color:#0b7a4b;font-weight:600}</style></head><body><main><div class="card"><small>Fakultas Kedokteran Universitas Murni Teguh &middot; RS Murni Teguh Methodist Susanna Wesley</small><h1>Persetujuan penggunaan data kasus untuk pembelajaran</h1>' +
    (ok ? '<div id="isi"><p>Mahasiswa kedokteran yang ikut merawat Anda memohon izin untuk mencatat informasi kesehatan Anda sebagai bahan pembelajaran dalam e-logbook. Nama lengkap Anda tidak dicatat, hanya inisial dan nomor rekam medis yang disimpan terenkripsi.</p><p>Persetujuan ini sukarela. Menolak tidak memengaruhi pelayanan yang Anda terima.</p><button id="ya">Saya setuju</button><button id="tdk">Saya tidak setuju</button></div><p id="hasil"></p>' : '<p>Tautan tidak valid.</p>') +
    '</div></main><script>var t=' + JSON.stringify(tok) + ';function s(m,c){document.getElementById("isi").style.display="none";var h=document.getElementById("hasil");h.textContent=m;h.className=c||""}' +
    (ok ? 'document.getElementById("ya").onclick=function(){google.script.run.withSuccessHandler(function(r){s(r?"Terima kasih. Persetujuan Anda telah tercatat.":"Tautan sudah tidak berlaku.",r?"ok":"")}).withFailureHandler(function(){s("Terjadi kesalahan. Coba lagi.")}).consentApprove(t)};document.getElementById("tdk").onclick=function(){s("Baik, tidak ada data yang dicatat. Terima kasih.")};' : '') + '</script></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle('Persetujuan Pasien');
}
function consentApprove(tok) {
  tok = String(tok || ''); if (!/^[a-z0-9]{12,40}$/.test(tok)) return false;
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = sheet_('cases'); const n = sh.getLastRow() - 1; if (n < 1) return false;
    const f = sh.getRange(2, 4, n, 1).createTextFinder('"tok":"' + tok + '"').matchEntireCell(false).findNext();
    if (!f) return false;
    const row = f.getRow(); const d = JSON.parse(sh.getRange(row, 4).getValue());
    if (d.tok !== tok) return false;
    d.cons = true; d.consTgl = ts_();
    sh.getRange(row, 4).setValue(JSON.stringify(d)); sh.getRange(row, 5).setValue(ts_());
    return true;
  } finally { lock.releaseLock(); }
}


/* ======== LOGIKA SKOR BERSAMA (dari src/core.js) ======== */
/* ================= DATA, SEED, SKOR ================= */
const DEMO_PW = 'password123';
const isSrv = () => typeof SERVER !== 'undefined' && SERVER;
const T0 = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
const pad = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parseD = s => { const p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
const addD = (d, n) => { const x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; };
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const dfmt = s => { if (!s) return '-'; const d = parseD(s); return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); };
const n1 = x => (x == null || isNaN(x)) ? '-' : (Math.round(x * 10) / 10).toFixed(1).replace('.', ',');
const n0 = x => (x == null || isNaN(x)) ? '-' : String(Math.round(x));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const mean = a => a.length ? a.reduce((t, x) => t + x, 0) / a.length : null;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function RNG(seed) { let a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const dayDiff = (a, b) => Math.round((a.getTime() - b.getTime()) / 86400000);

const RSPU = 'RS Murni Teguh Methodist Susanna Wesley';
const LS_KEY = 'elogbook-umt-profesi-v1';

/* ---------- Master ---------- */
const STASES = [
  { id: 'ikm', nama: 'Ilmu Kesehatan Masyarakat dan Kedokteran Komunitas', pendek: 'IKM', smf: 'Kedokteran Komunitas', minggu: 8, tf: 30, tr: 0 },
  { id: 'anak', nama: 'Ilmu Kesehatan Anak', pendek: 'Anak', smf: 'Ilmu Kesehatan Anak', minggu: 10, tf: 28, tr: 12 },
  { id: 'obgyn', nama: 'Obstetri dan Ginekologi', pendek: 'Obgyn', smf: 'Obstetri dan Ginekologi', minggu: 10, tf: 24, tr: 14 },
  { id: 'ipd', nama: 'Ilmu Penyakit Dalam', pendek: 'IPD', smf: 'Ilmu Penyakit Dalam', minggu: 10, tf: 25, tr: 15 },
  { id: 'bedah', nama: 'Ilmu Bedah', pendek: 'Bedah', smf: 'Ilmu Bedah', minggu: 10, tf: 20, tr: 14 },
  { id: 'neuro', nama: 'Neurologi', pendek: 'Neuro', smf: 'Neurologi', minggu: 4, tf: 10, tr: 6 },
  { id: 'jiwa', nama: 'Psikiatri', pendek: 'Jiwa', smf: 'Psikiatri', minggu: 4, tf: 12, tr: 4 },
  { id: 'tht', nama: 'Telinga Hidung Tenggorok Kepala Leher', pendek: 'THT', smf: 'THT-KL', minggu: 3, tf: 10, tr: 4 },
  { id: 'mata', nama: 'Ilmu Kesehatan Mata', pendek: 'Mata', smf: 'Ilmu Kesehatan Mata', minggu: 3, tf: 10, tr: 4 },
  { id: 'kulit', nama: 'Dermatologi dan Venereologi', pendek: 'Kulit', smf: 'Dermatovenereologi', minggu: 3, tf: 14, tr: 2 },
  { id: 'forensik', nama: 'Ilmu Kedokteran Forensik dan Medikolegal', pendek: 'Forensik', smf: 'Kedokteran Forensik', minggu: 3, tf: 6, tr: 4 },
  { id: 'anestesi', nama: 'Anestesiologi dan Terapi Intensif', pendek: 'Anestesi', smf: 'Anestesiologi', minggu: 3, tf: 6, tr: 8 },
  { id: 'radiologi', nama: 'Radiologi', pendek: 'Radiologi', smf: 'Radiologi', minggu: 2, tf: 6, tr: 6 }
];
const ROT_BASE = ['ikm', 'anak', 'obgyn', 'ipd', 'bedah', 'neuro', 'jiwa', 'tht', 'mata', 'kulit', 'forensik', 'anestesi', 'radiologi'];
const ROT_SHIFT = [0, 3, 6, 9];
const SISTEM = ['Kardiovaskular', 'Respirasi', 'Gastrohepatobilier', 'Ginjal dan saluran kemih', 'Endokrin dan metabolik', 'Hematologi dan imunologi', 'Saraf', 'Psikiatri', 'Indra', 'Integumen', 'Reproduksi', 'Muskuloskeletal', 'Kedokteran forensik'];
const DX = {
  ikm: [['Hipertensi esensial', 'FKTP', 'Kardiovaskular'], ['Diabetes melitus tipe 2', 'FKTP', 'Endokrin dan metabolik'], ['Infeksi saluran napas akut', 'FKTP', 'Respirasi'], ['Diare akut', 'FKTP', 'Gastrohepatobilier'], ['Skabies', 'FKTP', 'Integumen'], ['Tuberkulosis paru', 'FKTP', 'Respirasi'], ['Osteoartritis', 'FKTP', 'Muskuloskeletal'], ['Konjungtivitis', 'FKTP', 'Indra']],
  anak: [['Infeksi saluran napas akut', 'FKTP', 'Respirasi'], ['Diare akut dengan dehidrasi', 'FKTP', 'Gastrohepatobilier'], ['Demam berdarah dengue', 'FKTP', 'Hematologi dan imunologi'], ['Kejang demam', 'FKTP', 'Saraf'], ['Bronkiolitis', 'FKRTL', 'Respirasi'], ['Gizi buruk', 'FKRTL', 'Endokrin dan metabolik']],
  obgyn: [['Antenatal care normal', 'FKTP', 'Reproduksi'], ['Persalinan normal', 'FKTP', 'Reproduksi'], ['Hiperemesis gravidarum', 'FKTP', 'Reproduksi'], ['Pelayanan kontrasepsi', 'FKTP', 'Reproduksi'], ['Infeksi saluran kemih', 'FKTP', 'Ginjal dan saluran kemih'], ['Preeklamsia', 'FKRTL', 'Reproduksi'], ['Perdarahan pascapersalinan', 'FKRTL', 'Reproduksi']],
  ipd: [['Hipertensi esensial', 'FKTP', 'Kardiovaskular'], ['Diabetes melitus tipe 2', 'FKTP', 'Endokrin dan metabolik'], ['Dispepsia', 'FKTP', 'Gastrohepatobilier'], ['Gastritis', 'FKTP', 'Gastrohepatobilier'], ['Demam tifoid', 'FKTP', 'Gastrohepatobilier'], ['Anemia defisiensi besi', 'FKTP', 'Hematologi dan imunologi'], ['Pneumonia komunitas', 'FKTP', 'Respirasi'], ['Sindrom koroner akut', 'FKRTL', 'Kardiovaskular'], ['Gagal jantung kronik', 'FKRTL', 'Kardiovaskular'], ['Sirosis hepatis', 'FKRTL', 'Gastrohepatobilier'], ['Penyakit ginjal kronik', 'FKRTL', 'Ginjal dan saluran kemih']],
  bedah: [['Abses kulit', 'FKTP', 'Integumen'], ['Luka laserasi', 'FKTP', 'Integumen'], ['Cedera kepala ringan', 'FKTP', 'Saraf'], ['Appendisitis akut', 'FKRTL', 'Gastrohepatobilier'], ['Hernia inguinalis', 'FKRTL', 'Gastrohepatobilier'], ['Batu saluran kemih', 'FKRTL', 'Ginjal dan saluran kemih'], ['Fraktur tertutup', 'FKRTL', 'Muskuloskeletal']],
  neuro: [['Cephalgia', 'FKTP', 'Saraf'], ['Vertigo perifer', 'FKTP', 'Saraf'], ['Epilepsi', 'FKTP', 'Saraf'], ['Stroke iskemik', 'FKRTL', 'Saraf']],
  jiwa: [['Gangguan cemas', 'FKTP', 'Psikiatri'], ['Gangguan depresi', 'FKTP', 'Psikiatri'], ['Skizofrenia', 'FKTP', 'Psikiatri'], ['Gangguan penggunaan zat', 'FKRTL', 'Psikiatri']],
  tht: [['Otitis media akut', 'FKTP', 'Indra'], ['Rinosinusitis akut', 'FKTP', 'Indra'], ['Faringitis akut', 'FKTP', 'Respirasi'], ['Epistaksis', 'FKTP', 'Indra']],
  mata: [['Konjungtivitis', 'FKTP', 'Indra'], ['Hordeolum', 'FKTP', 'Indra'], ['Katarak', 'FKRTL', 'Indra'], ['Glaukoma akut', 'FKRTL', 'Indra']],
  kulit: [['Dermatitis atopik', 'FKTP', 'Integumen'], ['Skabies', 'FKTP', 'Integumen'], ['Tinea korporis', 'FKTP', 'Integumen'], ['Urtikaria akut', 'FKTP', 'Integumen']],
  forensik: [['Visum et repertum korban hidup (luka)', 'FKTP', 'Kedokteran forensik'], ['Pemeriksaan jenazah', 'FKRTL', 'Kedokteran forensik'], ['Penentuan usia forensik', 'FKRTL', 'Kedokteran forensik']],
  anestesi: [['Manajemen jalan napas', 'FKTP', 'Respirasi'], ['Resusitasi jantung paru', 'FKTP', 'Kardiovaskular'], ['Persiapan pra-anestesi', 'FKRTL', 'Kardiovaskular'], ['Anestesi spinal', 'FKRTL', 'Saraf']],
  radiologi: [['Interpretasi foto toraks', 'FKTP', 'Respirasi'], ['Foto polos abdomen', 'FKRTL', 'Gastrohepatobilier'], ['CT scan kepala dasar', 'FKRTL', 'Saraf']]
};
const KEGIATAN = ['Visite bangsal', 'Jaga IGD', 'Presentasi kasus', 'Penyuluhan kesehatan', 'Posyandu dan imunisasi', 'Kunjungan rumah', 'Diskusi klinis'];
const KETERLIBATAN = ['Mengamati', 'Membantu', 'Melakukan dengan supervisi', 'Melakukan mandiri'];
const PROSEDUR = ['Pemasangan infus', 'Pemasangan kateter urin', 'Pemasangan pipa nasogastrik', 'Injeksi intramuskular dan intravena', 'Penjahitan luka laserasi', 'Resusitasi jantung paru', 'Pengambilan darah vena', 'Pemeriksaan EKG 12 sadapan', 'Nebulisasi'];
const MC_DOM = ['Anamnesis', 'Pemeriksaan fisik', 'Profesionalisme', 'Penalaran klinis', 'Komunikasi dan konseling', 'Organisasi dan efisiensi', 'Kompetensi klinis keseluruhan'];
const DP_DOM = ['Persiapan dan indikasi', 'Informed consent dan komunikasi', 'Teknik prosedur', 'Asepsis dan keselamatan', 'Penanganan komplikasi', 'Profesionalisme', 'Kompetensi keseluruhan'];
const CBD_DOM = ['Representasi masalah', 'Interpretasi data klinis', 'Diagnosis banding', 'Dasar ilmiah keputusan', 'Rencana tata laksana', 'Keselamatan dan refleksi'];
const PRESENT_DOM = ['Struktur presentasi', 'Ketepatan data', 'Penalaran klinis', 'Penggunaan bukti', 'Komunikasi', 'Respons diskusi'];
const MSF_DOM = ['Komunikasi', 'Kerja sama tim', 'Keandalan', 'Profesionalisme', 'Keselamatan pasien'];
function assessmentDomains(j) { return j === 'DOPS' ? DP_DOM : j === 'CBD' ? CBD_DOM : j === 'Presentasi Kasus' ? PRESENT_DOM : j === 'MSF' ? MSF_DOM : MC_DOM; }
const ONKO_TAGS = ['Promosi kesehatan', 'Pencegahan kanker', 'Deteksi dini kanker', 'Konseling faktor risiko', 'Tanda bahaya dan rujukan'];
const EPAS = [
  ['Anamnesis', 'Menggali riwayat pasien secara terarah dan lengkap'],
  ['Pemeriksaan fisik', 'Melakukan pemeriksaan fisik sistematis sesuai keluhan'],
  ['Penalaran klinis', 'Menyusun diagnosis kerja dan diagnosis banding'],
  ['Usulan pemeriksaan penunjang', 'Memilih dan menginterpretasi pemeriksaan penunjang'],
  ['Tata laksana', 'Menyusun rencana terapi farmakologis dan nonfarmakologis'],
  ['Edukasi dan komunikasi', 'Menjelaskan kondisi dan rencana kepada pasien dan keluarga'],
  ['Dokumentasi rekam medis', 'Mencatat temuan dan rencana secara akurat'],
  ['Kegawatdaruratan awal', 'Mengenali dan menstabilkan pasien gawat darurat'],
  ['Rujukan dan serah terima', 'Menentukan kebutuhan rujukan dan menyampaikan serah terima']
];
const EPA_LEVEL = [
  'Level 1: Hanya mengamati',
  'Level 2: Bertindak dengan supervisi langsung di tempat',
  'Level 3: Bertindak dengan supervisi tidak langsung, supervisor mudah dihubungi',
  'Level 4: Bertindak mandiri, supervisi dari jauh atau atas permintaan',
  'Level 5: Bertindak mandiri dan dapat menyupervisi mahasiswa lain'
];
const JENIS_ASESMEN = [
  { k: 'DOPS', n: 'Direct Observation of Procedural Skills', g: 'Tempat kerja', miller: 'Does' },
  { k: 'Mini-CEX', n: 'Mini Clinical Evaluation Exercise', g: 'Tempat kerja', miller: 'Does' },
  { k: 'CBD', n: 'Case-Based Discussion', g: 'Tempat kerja', miller: 'Knows how' },
  { k: 'Long Case', n: 'Ujian kasus panjang', g: 'Akademik', miller: 'Shows how' },
  { k: 'Short Case', n: 'Ujian kasus pendek', g: 'Akademik', miller: 'Shows how' },
  { k: 'CBT', n: 'Computer-Based Test', g: 'Akademik', miller: 'Knows' },
  { k: 'OSCE', n: 'Objective Structured Clinical Examination', g: 'Akademik', miller: 'Shows how' },
  { k: 'MSF', n: 'Multisource Feedback 360 derajat', g: 'Tempat kerja', miller: 'Does' },
  { k: 'Ujian Lisan', n: 'Ujian lisan', g: 'Akademik', miller: 'Knows how' },
  { k: 'Presentasi Kasus', n: 'Presentasi kasus', g: 'Tempat kerja', miller: 'Knows how' },
  { k: 'Journal Reading', n: 'Telaah jurnal (EBCR)', g: 'Akademik', miller: 'Knows how' },
  { k: 'Referat', n: 'Referat', g: 'Akademik', miller: 'Knows' },
  { k: 'Tutorial', n: 'Tutorial dan diskusi (tahap sarjana)', g: 'Akademik', miller: 'Knows how' },
  { k: 'Praktikum', n: 'Praktikum (tahap sarjana)', g: 'Akademik', miller: 'Shows how' }
];
const AREA_SKDI = ['Profesionalitas yang luhur', 'Mawas diri dan pengembangan diri', 'Komunikasi efektif', 'Pengelolaan informasi', 'Landasan ilmiah ilmu kedokteran', 'Keterampilan klinis', 'Pengelolaan masalah kesehatan'];
const BS = { CBT: 25, OSCE: 15, 'Mini-CEX': 20, DOPS: 15, CBD: 15, Logbook: 5, MSF: 5 };
const BB = { CBT: 40, OSCE: 30, Tutorial: 15, Praktikum: 15 };
const PSSK_BLOK = ['Blok Kardiovaskular', 'Blok Respirasi', 'Blok Gastrohepatobilier', 'Blok Endokrin dan Metabolik', 'Blok Neurosains', 'Blok Reproduksi'];
const WAH = [
  { id: 'w0', nama: RSPU, jenis: 'RS Pendidikan Utama' },
  { id: 'w1', nama: 'FKTP Jejaring A', jenis: 'FKTP' },
  { id: 'w2', nama: 'FKTP Jejaring B', jenis: 'FKTP' },
  { id: 'w3', nama: 'FKTP Jejaring C', jenis: 'FKTP' },
  { id: 'w4', nama: 'FKTP Jejaring D', jenis: 'FKTP' }
];
const PRES_EXTRA = [
  { id: 'p4', nama: 'Preseptor Obgyn 1', smf: 'Obstetri dan Ginekologi' },
  { id: 'p5', nama: 'Preseptor Neurologi 1', smf: 'Neurologi' },
  { id: 'p6', nama: 'Preseptor Psikiatri 1', smf: 'Psikiatri' },
  { id: 'p7', nama: 'Preseptor Dermatologi 1', smf: 'Dermatovenereologi' },
  { id: 'p8', nama: 'Preseptor Komunitas 1', smf: 'Kedokteran Komunitas' },
  { id: 'p9', nama: 'Preseptor Anestesi 1', smf: 'Anestesiologi' }
];
const POOL_REF = ['Saya perlu memperdalam penalaran diagnosis banding sebelum mengusulkan pemeriksaan penunjang.', 'Komunikasi dengan keluarga pasien terasa lebih lancar setelah penjelasan disusun bertahap.', 'Saya belum percaya diri menentukan kebutuhan rujukan dan akan membaca pedoman nasional.', 'Pemeriksaan fisik menjadi lebih efisien setelah saya membuat urutan tetap.'];
const POOL_FB = ['Anamnesis sudah runtut. Tambahkan faktor risiko dan riwayat pengobatan sebelumnya.', 'Penalaran klinis baik. Pertimbangkan diagnosis banding lain sebelum menetapkan diagnosis kerja.', 'Tata laksana sesuai pedoman. Cantumkan edukasi dan rencana kontrol secara eksplisit.', 'Pemeriksaan fisik sudah terarah. Dokumentasi tanda vital perlu dilengkapi.'];
const POOL_RET = ['Ringkasan SOAP belum lengkap pada bagian penilaian dan rencana. Lengkapi lalu ajukan kembali.', 'Persetujuan pasien belum tercatat. Mohon kirim tautan atau pindai QR persetujuan.', 'Diagnosis kerja perlu disesuaikan dengan temuan pemeriksaan fisik.'];
const POOL_KEK = ['Anamnesis runtut dan empatik.', 'Pemeriksaan fisik sistematis dan percaya diri.', 'Komunikasi dengan pasien jelas dan menenangkan.', 'Teknik prosedur sesuai langkah baku.', 'Penalaran klinis terarah dengan diagnosis banding yang masuk akal.'];
const POOL_PERLU = ['Belum menggali kepatuhan obat dan hambatan biaya.', 'Manajemen waktu perlu dipercepat tanpa mengurangi ketelitian.', 'Penjelasan kepada keluarga masih terlalu teknis.', 'Asepsis perlu dijaga pada langkah akhir prosedur.', 'Rencana tata laksana belum menyebut kriteria rujukan.'];
const POOL_RENC = ['Dua kasus serupa dengan fokus kepatuhan, observasi ulang minggu depan.', 'Latihan prosedur di skills lab sebelum observasi berikutnya.', 'Presentasikan satu kasus dengan format SOAP lengkap.', 'Observasi ulang oleh preseptor yang sama dalam dua minggu.', 'Susun ringkasan kriteria rujukan untuk tiga diagnosis tersering.'];

let S = null;
const memo = {};
function inval() { for (const k in memo) delete memo[k]; }
function M(k, f) { if (!(k in memo)) memo[k] = f(); return memo[k]; }

/* ---------- Akses data ---------- */
const stase = id => (S ? S.stases : STASES).find(x => x.id === id);
const studentById = id => S.students.find(x => x.id === id);
const userById = id => S.users.find(x => x.id === id);
function pname(id) { const u = userById(id); if (u) return u.nama; const p = PRES_EXTRA.find(x => x.id === id); return p ? p.nama : '-'; }
const presList = () => isSrv() ? S.users.filter(u => u.roles.indexOf('preseptor') >= 0 || u.roles.indexOf('dosen') >= 0).map(u => ({ id: u.id, nama: u.nama })) : [{ id: 'u-pre' }, { id: 'u-multi' }, { id: 'u-dosen' }].concat(PRES_EXTRA).map(p => ({ id: p.id, nama: pname(p.id) }));
const casesOf = sid => M('co' + sid, () => S.cases.filter(c => c.sid === sid));
const asmsOf = sid => M('ao' + sid, () => S.asms.filter(a => a.sid === sid));
const wahanaOf = id => S.wahana.find(w => w.id === id) || { nama: '-', jenis: '' };

function ikmWah(st) {
  if (/^s\d+$/.test(st.id)) return 'w' + (1 + (parseInt(st.id.slice(1), 10) % 4));
  const f = S.wahana.filter(w => w.jenis === 'FKTP'); if (!f.length) return 'w0';
  let h = 0; for (let i = 0; i < st.id.length; i++) h = (h * 31 + st.id.charCodeAt(i)) >>> 0;
  return f[h % f.length].id;
}
function sched(st) {
  return M('sc' + st.id, () => {
    const shift = ROT_SHIFT[st.g % 4];
    const rot = ROT_BASE.slice(shift).concat(ROT_BASE.slice(0, shift));
    let cur = st.mulai ? parseD(st.mulai) : (isSrv() ? T0 : addD(T0, -241 + (st.off || 0)));
    const out = [];
    for (const id of rot) {
      const s = stase(id); const start = cur; const end = addD(start, s.minggu * 7 - 1);
      out.push({ id, start, end, wah: id === 'ikm' ? ikmWah(st) : 'w0' });
      cur = addD(end, 1);
    }
    return out;
  });
}
function curItem(st) { const s = sched(st); return s.find(x => x.start <= T0 && T0 <= x.end) || s.filter(x => x.end < T0).pop() || s[0]; }
function itemStatus(it) { return it.end < T0 ? 'selesai' : (it.start <= T0 ? 'berjalan' : 'akan datang'); }

/* ---------- Skor dan statistik ---------- */
function nilaiRec(sid, tahap, unit, komp) { const r = S.nilai.find(n => n.sid === sid && n.tahap === tahap && n.unit === unit && n.komp === komp); return r ? r.v : null; }
function stScore(sid, stId) {
  return M('ss' + sid + stId, () => {
    const st = studentById(sid), s = stase(stId), B = S.bobotStase;
    const item = sched(st).find(x => x.id === stId); const started = !!item && item.start <= T0;
    const avgA = j => { const l = asmsOf(sid).filter(a => a.jenis === j && a.st === stId && a.stat === 'dinilai'); return l.length ? mean(l.map(a => mean(a.sk))) / 9 * 100 : null; };
    const logb = () => { if (!started) return null; const t = s.tf + s.tr; if (!t) return null; return Math.min(100, casesOf(sid).filter(c => c.st === stId && c.jenis === 'Kasus' && c.stat === 'valid').length / t * 100); };
    const vals = { CBT: nilaiRec(sid, 'PSPD', stId, 'CBT'), OSCE: nilaiRec(sid, 'PSPD', stId, 'OSCE'), 'Mini-CEX': avgA('Mini-CEX'), DOPS: avgA('DOPS'), CBD: nilaiRec(sid, 'PSPD', stId, 'CBD') ?? avgA('CBD'), Logbook: logb(), MSF: nilaiRec(sid, 'PSPD', stId, 'MSF') ?? avgA('MSF') };
    let sw = 0, sv = 0; const rows = [];
    Object.keys(B).forEach(k => { const v = vals[k] == null ? null : vals[k]; rows.push({ k, v, w: B[k] }); if (v != null) { sw += B[k]; sv += v * B[k]; } });
    return { rows, total: sw ? sv / sw : null, started };
  });
}
function blokScore(sid, blok) {
  return M('bs' + sid + blok, () => {
    const B = S.bobotBlok; let sw = 0, sv = 0; const rows = [];
    Object.keys(B).forEach(k => { const v = nilaiRec(sid, 'PSSK', blok, k); rows.push({ k, v, w: B[k] }); if (v != null) { sw += B[k]; sv += v * B[k]; } });
    return { rows, total: sw ? sv / sw : null };
  });
}
function psskScore(sid) { return M('pk' + sid, () => { const l = PSSK_BLOK.map(b => blokScore(sid, b).total).filter(x => x != null); return l.length ? mean(l) : null; }); }
function pspdScore(sid) { return M('pp' + sid, () => { let sw = 0, sv = 0; S.stases.forEach(s => { const t = stScore(sid, s.id).total; if (t != null) { sw += s.minggu; sv += t * s.minggu; } }); return sw ? sv / sw : null; }); }
function pctRank(tahap, sid) {
  if (S.pct && S.pct[sid]) return S.pct[sid][tahap];
  return M('pr' + tahap + sid, () => {
    const f = tahap === 'PSSK' ? psskScore : pspdScore;
    const all = S.students.map(s => f(s.id)).filter(x => x != null); const me = f(sid);
    if (me == null || !all.length) return null;
    let lo = 0, eq = 0; all.forEach(x => { if (x < me) lo++; else if (x === me) eq++; });
    return (lo + eq * .5) / all.length * 100;
  });
}
function miniAvg(sid) { const l = asmsOf(sid).filter(a => a.jenis === 'Mini-CEX' && a.stat === 'dinilai'); return l.length ? mean([].concat.apply([], l.map(a => a.sk))) : null; }
function stats(sid) {
  return M('st' + sid, () => {
    const st = studentById(sid); const all = casesOf(sid); const cs = all.filter(c => c.jenis === 'Kasus');
    const mStart = iso(new Date(T0.getFullYear(), T0.getMonth(), 1));
    const it = curItem(st); const sd = stase(it.id);
    const fv = cs.filter(c => c.stat === 'valid' && c.st === it.id && c.kat === 'FKTP').length;
    const rv = cs.filter(c => c.stat === 'valid' && c.st === it.id && c.kat === 'FKRTL').length;
    const epa = S.epa[sid] || [];
    const exp = Math.max(2.2, (Math.max(7, dayDiff(T0, sched(st)[0].start)) / 7) * 2.2);
    const miniA = miniAvg(sid);
    const pend = asmsOf(sid).filter(a => a.stat === 'menunggu').length;
    const out = {
      total: cs.length, entri: all.length, bulan: cs.filter(c => c.tgl >= mStart).length,
      valid: cs.filter(c => c.stat === 'valid').length, menunggu: cs.filter(c => c.stat === 'menunggu').length, draf: cs.filter(c => c.stat === 'draf').length, kembali: cs.filter(c => c.stat === 'kembali').length,
      cur: it, curS: sd, fktpVal: fv, fkrtlVal: rv, pctF: sd.tf ? clamp(fv / sd.tf * 100, 0, 100) : 100, pctR: sd.tr ? clamp(rv / sd.tr * 100, 0, 100) : 100,
      mini: miniA, epaAvg: epa.length ? mean(epa) : null, pssk: psskScore(sid), pspd: pspdScore(sid), pendAsm: pend
    };
    const pace = clamp(out.valid / exp * 100, 0, 100);
    const parts = [[miniA == null ? null : miniA / 9 * 100, .35], [pace, .25], [out.epaAvg == null ? null : out.epaAvg / 5 * 100, .2], [out.pspd, .2]].filter(x => x[0] != null);
    out.health = parts.reduce((t, x) => t + x[1], 0) ? parts.reduce((t, x) => t + x[0] * x[1], 0) / parts.reduce((t, x) => t + x[1], 0) : null;
    out.risk = out.health == null ? 'stabil' : out.health < 58 ? 'berisiko' : out.health < 68 ? 'perhatian' : 'stabil';
    return out;
  });
}
function genId(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }

/* Live hardening v3.0.0. Generated Code.gs includes SJCL (BSD/GPL dual license). */
const CONSENT_VERSION = 'FKUMT-2026-01';
function database_() {
  const P = PropertiesService.getScriptProperties(), id = P.getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  const bound = SpreadsheetApp.getActiveSpreadsheet();
  if (bound) return bound;
  fail_('not_setup', 'Jalankan setupLive untuk membuat basis data.');
}
sheet_ = function(name) {
  const ss = database_(); let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.getRange(1,1,1,5).setValues([HEAD]); sh.setFrozenRows(1); }
  return sh;
};
function setupLive() {
  const P = PropertiesService.getScriptProperties();
  if (!P.getProperty('SPREADSHEET_ID')) {
    const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('E-Portofolio FK UMT - Data Live');
    P.setProperty('SPREADSHEET_ID', ss.getId());
  }
  setup();
  Logger.log('Basis data live: ' + database_().getUrl());
}
function backupDatabase() {
  const copy = database_().copy('Cadangan E-Portofolio FK UMT ' + ts_());
  Logger.log('Cadangan dibuat: ' + copy.getUrl());
  return copy.getId();
}
const oldHash_ = hashPw_, oldDec_ = dec_;
hashPw_ = function(pw,salt) {
  return 'pbkdf2-sha256$600000$' + sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(String(pw),String(salt),600000,256));
};
function verifyPw_(pw,salt,hash) {
  return same_(hash.indexOf('pbkdf2-sha256$') === 0 ? hashPw_(pw,salt) : oldHash_(pw,salt),hash);
}
enc_ = function(value) {
  if(!value)return '';
  const iv=sjcl.codec.hex.toBits(Utilities.getUuid().replace(/-/g,'').slice(0,24));
  const cipher=new sjcl.cipher.aes(sjcl.codec.base64.toBits(key_()));
  const ct=sjcl.mode.ccm.encrypt(cipher,sjcl.codec.utf8String.toBits(String(value)),iv,[],128);
  return 'aesccm$'+JSON.stringify({v:1,iv:sjcl.codec.base64.fromBits(iv),ct:sjcl.codec.base64.fromBits(ct)});
};
dec_ = function(value) {
  if(!value)return '';
  if(String(value).indexOf('aesccm$')!==0)return oldDec_(value);
  try{const p=JSON.parse(String(value).slice(7));return sjcl.codec.utf8String.fromBits(sjcl.mode.ccm.decrypt(new sjcl.cipher.aes(sjcl.codec.base64.toBits(key_())),sjcl.codec.base64.toBits(p.ct),sjcl.codec.base64.toBits(p.iv),[],128));}catch(e){return '';}
};
function assignmentOk_(uid,sid,st,wah,day) {
  day = day || now_();
  return readAll_('assignments').some(function(r) {
    const a=r.d; return a.uid===uid && a.sid===sid && a.aktif!==false &&
      (!st || !a.st || a.st===st) && (!wah || !a.wah || a.wah===wah) &&
      (!a.mulai || (a.mulai<=day && a.mulai<=now_())) && (!a.selesai || (a.selesai>=day && a.selesai>=now_()));
  });
}
function staffOk_(u,sid,st,wah,day) {
  const R=rolesOf_(u);
  return !!(R.kaprodi || ((R.dosen || R.preseptor) && assignmentOk_(u.id,sid,st,wah,day)));
}
canReadCase_ = function(u,r) {
  const R=rolesOf_(u);
  return !!(R.admin || R.kaprodi || (R.mahasiswa && r.sid===u.d.sid) ||
    ((R.dosen || R.preseptor) && r.pid===u.id && assignmentOk_(u.id,r.sid,r.d.st,r.d.wah,r.d.tgl)));
};
const legacyLoad_ = load_;
load_ = function(req) {
  const out=legacyLoad_(req),u=auth_(req),R=rolesOf_(u);
  out.assignments=readAll_('assignments').filter(function(r){return R.admin||R.kaprodi||r.d.uid===u.id||r.sid===u.d.sid;}).map(function(r){return r.d;});
  if (!(R.admin||R.kaprodi)) {
    out.cases=out.cases.filter(function(d){return canReadCase_(u,{sid:d.sid,pid:d.pid,d:d});});
    out.asms=out.asms.filter(function(d){return d.sid===u.d.sid || (d.pid===u.id && staffOk_(u,d.sid,d.st,'',d.tgl));});
    const sids={}; if(u.d.sid)sids[u.d.sid]=true;
    out.assignments.forEach(function(a){if(a.uid===u.id&&assignmentOk_(u.id,a.sid,a.st,a.wah))sids[a.sid]=true;});
    out.students=readAll_('students').filter(function(r){return sids[r.id];}).map(function(r){return r.d;});
    ['nilai','epaLog'].forEach(function(k){out[k]=out[k].filter(function(d){return d.sid===u.d.sid||staffOk_(u,d.sid,d.st||d.unit);});});
    const epa={};Object.keys(out.epa||{}).forEach(function(s){if(sids[s])epa[s]=out.epa[s];});out.epa=epa;
    out.ews=[];
    out.replies={};
    readAll_('replies').filter(function(r){return r.sid===u.d.sid;}).forEach(function(r){out.replies[r.id]=r.d.t;});
  }
  out.version='3.0.0'; return out;
};
const rawPut_=put_;
put_=function(name,id,sid,pid,d) {
  const ex=get_(name,id); d._rev=(ex&&ex.d._rev||0)+1;
  return rawPut_(name,id,sid,pid,d);
};
const originalSync_=sync_;
sync_=function(req) {
  const u=auth_(req); if(!Array.isArray(req.ops)||req.ops.length>120)fail_('invalid','Maksimal 120 perubahan per permintaan.');
  req.ops.forEach(function(op){
    if(['cases','asms','nilai','ews','epaLog','assignments'].indexOf(op.c)>=0){
      const ex=get_(op.c,op.id),rev=ex&&ex.d._rev||0;
      if(Number(op.rev||0)!==rev)fail_('conflict','Data telah berubah. Tinjau data server sebelum mengirim ulang.');
    }
  });
  const result=originalSync_(req);
  if(result.rej.length)fail_('forbidden','Perubahan ditolak. Periksa penugasan, persetujuan, dan status data.');
  result.revisions={};
  req.ops.forEach(function(op){const r=get_(op.c,op.id);if(r)result.revisions[op.c+':'+op.id]=r.d._rev||0;});
  CacheService.getScriptCache().remove('pct');
  return result;
};
function auditChange_(u,c,id,action) {
  const aid=gid_('audit');put_('audit',aid,'',u.id,{id:aid,ts:ts_(),uid:u.id,cid:id,
    alasan:action+' '+c,action:action,collection:c,status:'Tercatat'});
}
const originalCases_=W.cases;
W.cases=function(u,R,op) {
  // Keep a snapshot: originalCases_ replaces the mutable stored row in place.
  const stored=get_('cases',op.id),ex=stored?Object.assign({},stored,{d:Object.assign({},stored.d)}):null,d=op.d||{};
  if(!op.del && R.mahasiswa && (!ex||ex.sid===u.d.sid)) {
    if(d.jenis==='Kasus' && !assignmentOk_(d.pid,u.d.sid,d.st,d.wah,d.tgl))return false;
    if(d.tgl && !validDate_(d.tgl))return false;
    if(d.jenis==='Kasus' && ex && (ex.d.consStatus==='menolak'||ex.d.consStatus==='ditarik') && d.stat!=='draf')return false;
  }
  if(ex && ex.d.stat==='menunggu' && ex.sid!==u.d.sid) {
    if(ex.pid!==u.id || !staffOk_(u,ex.sid,ex.d.st,ex.d.wah,ex.d.tgl))return false;
    if(d.stat==='valid' && ex.d.jenis==='Kasus' && !ex.d.cons)return false;
  }
  const previous=ex?Object.assign({},ex.d):null;
  const accepted=originalCases_(u,R,op);if(!accepted)return false;
  const r=get_('cases',op.id);
  if(r){
    r.d.tags=R.mahasiswa&&r.sid===u.d.sid&&Array.isArray(d.tags)?d.tags.filter(function(t){return ONKO_TAGS.indexOf(t)>=0;}):(previous&&previous.tags||[]);
    r.d.consStatus=previous&&previous.consStatus||(r.d.cons?'setuju':'menunggu');
    r.d.consVersion=previous&&previous.consVersion||CONSENT_VERSION;
    r.d.createdAt=previous&&previous.createdAt||new Date().toISOString();
    r.d.submittedAt=previous&&previous.submittedAt||'';
    if(r.d.stat==='menunggu'&&(!previous||previous.stat!=='menunggu'))r.d.submittedAt=new Date().toISOString();
    if(previous&&previous.stat==='menunggu'&&r.d.stat!=='menunggu')r.d.respondedAt=new Date().toISOString();
    r.d.followup=str_(R.mahasiswa&&r.sid===u.d.sid&&Object.prototype.hasOwnProperty.call(d,'followup')?d.followup:previous&&previous.followup,2000);
    r.d.followupDue=date_(d.followupDue||previous&&previous.followupDue,'');
    auditChange_(u,'cases',op.id,r.d.stat);
  }
  return true;
};
function validDate_(s) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(s)))return false;
  const d=new Date(s+'T00:00:00Z');return !isNaN(d.getTime())&&d.toISOString().slice(0,10)===s;
}
W.assignments=function(u,R,op) {
  if(!R.admin||op.del)return false;
  const d=op.d||{};
  if(!get_('students',d.sid)||!pidOk_(d.uid)||!validDate_(d.mulai)||!validDate_(d.selesai)||d.mulai>d.selesai)return false;
  if(d.st&&stIds_().indexOf(d.st)<0)return false;
  if(d.wah&&!get_('wahana',d.wah))return false;
  put_('assignments',op.id,d.sid,d.uid,{id:op.id,sid:d.sid,uid:d.uid,st:d.st||'',wah:d.wah||'',
    mulai:d.mulai,selesai:d.selesai,aktif:d.aktif!==false});
  auditChange_(u,'assignments',op.id,'penugasan');return true;
};

/* Rubrics and multisource feedback: server determines the rater and aggregate. */
W.asms=function(u,R,op) {
  if(op.del)return false;
  const ex=get_('asms',op.id),d=op.d||{};
  if(!ex) {
    if(!R.mahasiswa||!u.d.sid||!assessmentDomains(d.jenis)||['DOPS','Mini-CEX','CBD','Presentasi Kasus','MSF'].indexOf(d.jenis)<0)return false;
    if(!validDate_(d.tgl)||!assignmentOk_(d.pid,u.d.sid,d.st,'',d.tgl))return false;
    put_('asms',op.id,u.d.sid,d.pid,{id:op.id,sid:u.d.sid,jenis:d.jenis,judul:str_(d.judul,200),
      tgl:d.tgl,st:enum_(d.st,stIds_(),stIds_()[0]),pid:d.pid,stat:'menunggu',sk:null,kek:'',perlu:'',renc:'',
      requestedAt:new Date().toISOString(),ratings:[],rubricVersion:'FKUMT-2026-01'});
    auditChange_(u,'asms',op.id,'permintaan');return true;
  }
  if(ex.sid===u.d.sid||ex.d.stat!=='menunggu'||!staffOk_(u,ex.sid,ex.d.st,'',ex.d.tgl))return false;
  if(ex.d.jenis!=='MSF'&&ex.pid!==u.id)return false;
  const dom=assessmentDomains(ex.d.jenis);
  if(!Array.isArray(d.sk)||d.sk.length!==dom.length||d.sk.some(function(v){return typeof v!=='number'||!Number.isInteger(v)||v<1||v>9;}))return false;
  if(!str_(d.kek,1500).trim()||!str_(d.perlu,1500).trim()||!str_(d.renc,1500).trim())return false;
  const rating={uid:u.id,sk:d.sk.slice(),kek:str_(d.kek,1500),perlu:str_(d.perlu,1500),renc:str_(d.renc,1500),at:new Date().toISOString()};
  let out=Object.assign({},ex.d,{sk:rating.sk,kek:rating.kek,perlu:rating.perlu,renc:rating.renc,stat:'dinilai',assessedAt:rating.at,ratedBy:u.id});
  if(ex.d.jenis==='MSF') {
    const ratings=(ex.d.ratings||[]).slice();
    if(ratings.some(function(r){return r.uid===u.id;}))return false;
    ratings.push(rating);
    out.ratings=ratings;out.raterCount=ratings.length;out.stat=ratings.length>=3?'dinilai':'menunggu';
    out.sk=dom.map(function(_,i){return ratings.reduce(function(t,r){return t+r.sk[i];},0)/ratings.length;});
    out.kek=ratings.map(function(r,i){return 'Penilai '+(i+1)+': '+r.kek;}).join('\n');
    out.perlu=ratings.map(function(r,i){return 'Penilai '+(i+1)+': '+r.perlu;}).join('\n');
    out.renc=ratings.map(function(r,i){return 'Penilai '+(i+1)+': '+r.renc;}).join('\n');
  }
  put_('asms',op.id,ex.sid,ex.pid,out);auditChange_(u,'asms',op.id,'penilaian');return true;
};
['epaLog','nilai'].forEach(function(k){
  const original=W[k];
  W[k]=function(u,R,op){
    const d=op.d||{};
    if(!(R.admin&&k==='nilai')&&!staffOk_(u,d.sid,d.st||d.unit))return false;
    if(k==='epaLog'&&(!Number.isInteger(d.epa)||d.epa<0||d.epa>=EPAS.length||!Number.isInteger(d.level)||d.level<1||d.level>5))return false;
    if(k==='epaLog'&&(!str_(d.cm,1500).trim()||!Array.isArray(d.evidence)||!d.evidence.length))return false;
    if(k==='epaLog'&&d.evidence.some(function(id){const r=get_('asms',id);return !r||r.sid!==d.sid||r.d.stat!=='dinilai';}))return false;
    const ok=original(u,R,op);
    if(ok){const r=get_(k,op.id);if(k==='epaLog'){r.d.evidence=d.evidence.slice(0,30);r.d.st=d.st||'';}auditChange_(u,k,op.id,'penilaian');}
    return ok;
  };
});
/* Revocable consent; no patient details are displayed by the public page. */
consentPage_=function(tok) {
  if(!/^[a-z0-9]{12,40}$/.test(tok))return HtmlService.createHtmlOutput('<p>Tautan tidak valid.</p>');
  const html='<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Persetujuan pembelajaran FK UMT</title><style>body{font:16px/1.6 system-ui;background:#f3f8fb;color:#16303f;margin:0}main{max-width:600px;margin:30px auto;padding:24px;background:white;border-radius:14px}button{font:inherit;margin:8px 5px;padding:12px;border-radius:8px;border:1px solid #abc;cursor:pointer}button:first-of-type{background:#006ab0;color:white}</style></head><body><main><h1>Persetujuan penggunaan kasus untuk pembelajaran</h1><p>Fakultas Kedokteran Universitas Murni Teguh</p><p>Mahasiswa memohon izin menggunakan ringkasan kasus Anda untuk pembelajaran dan penilaian. Data terbatas mungkin sudah dicatat sebagai draf sebelum Anda membuka halaman ini. Nama lengkap tidak diperlukan. Pencatatan mengutamakan kode pasien; identitas tambahan, bila ada, dienkripsi.</p><p>Persetujuan bersifat sukarela. Penolakan atau penarikan persetujuan tidak memengaruhi pelayanan Anda. Akses dibatasi kepada pihak pendidikan yang berwenang. Untuk pertanyaan atau permintaan penghapusan, hubungi program studi melalui petugas yang mendampingi Anda.</p><p>Keputusan terbaru menggantikan keputusan sebelumnya. Jika menolak atau menarik persetujuan, identitas tambahan dihapus dan kasus tidak dihitung sebagai capaian tervalidasi.</p><p>Versi informasi '+CONSENT_VERSION+'.</p><div id="buttons"><button data-choice="setuju">Saya setuju</button><button data-choice="menolak">Saya tidak setuju</button><button data-choice="ditarik">Tarik persetujuan sebelumnya</button></div><p id="result" role="status"></p><script>var tok='+JSON.stringify(tok)+';document.querySelectorAll("button").forEach(function(b){b.onclick=function(){document.querySelectorAll("button").forEach(function(x){x.disabled=true});google.script.run.withSuccessHandler(function(r){document.getElementById("result").textContent=r.ok?r.message:"Tautan tidak berlaku.";document.querySelectorAll("button").forEach(function(x){x.disabled=false})}).withFailureHandler(function(){document.getElementById("result").textContent="Gagal menyimpan keputusan. Coba lagi.";document.querySelectorAll("button").forEach(function(x){x.disabled=false})}).consentRespond(tok,b.getAttribute("data-choice"))}});</script></main></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle('Persetujuan pembelajaran FK UMT');
};
function consentRespond(tok,choice) {
  if(!/^[a-z0-9]{12,40}$/.test(String(tok))||['setuju','menolak','ditarik'].indexOf(choice)<0)return {ok:false};
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try {
    MEM={};IDX={};TOUCH={};DELR={};
    const r=readAll_('cases').filter(function(r){return r.d.tok===tok;})[0];if(!r)return {ok:false};
    r.d.cons=choice==='setuju';r.d.consStatus=choice;r.d.consTgl=ts_();r.d.consVersion=CONSENT_VERSION;
    if(!r.d.cons){r.d.ini_e='';r.d.rm_e='';r.d.rm2='';r.d.stat='draf';}
    put_('cases',r.id,r.sid,r.pid,r.d);
    const aid=gid_('cons');put_('audit',aid,r.sid,'pasien',{id:aid,ts:ts_(),uid:'pasien',cid:r.id,
      action:'consent',status:choice,alasan:'Keputusan persetujuan '+choice,version:CONSENT_VERSION});
    flush_();return {ok:true,message:choice==='setuju'?'Persetujuan Anda tercatat. Anda dapat membuka tautan ini untuk menariknya kembali.':'Keputusan Anda tercatat. Kasus tidak dihitung sebagai capaian tervalidasi; identitas tambahan telah dihapus.'};
  }finally{lock.releaseLock();}
}
consentApprove=function(tok){return consentRespond(tok,'setuju').ok;};
const loadScoped_=load_;
load_=function(req){
  const out=loadScoped_(req),u=auth_(req),R=rolesOf_(u);
  if(!(R.admin||R.kaprodi)){
    readAll_('asms').forEach(function(r){if(r.d.jenis==='MSF'&&staffOk_(u,r.sid,r.d.st,'',r.d.tgl)&&!out.asms.some(function(a){return a.id===r.id;}))out.asms.push(r.d);});
  }
  return out;
};
const syncWithRevisions_=sync_;
sync_=function(req){
  const out=syncWithRevisions_(req),u=auth_(req);out.docs={};
  req.ops.forEach(function(op){const r=get_(op.c,op.id);if(r)out.docs[op.c+':'+op.id]=op.c==='cases'?maskCase_(r.d,r.sid===u.d.sid):r.d;});
  return out;
};

readableSids_=function(u) {
  const ids={};if(u.d.sid)ids[u.d.sid]=true;
  readAll_('assignments').forEach(function(r){if(r.d.uid===u.id&&assignmentOk_(u.id,r.sid,r.d.st,r.d.wah))ids[r.sid]=true;});
  return ids;
};
const loginV2_=login_;
login_=function(req){
  const result=loginV2_(req);
  if(result.ok){const u=userByEmail_(req.email);if(u.d.hash.indexOf('pbkdf2-sha256$')!==0){u.d.hash=hashPw_(req.pw,u.d.salt);put_('users',u.id,u.sid,'',u.d);}}
  return result;
};

const bgOriginal_=bg_;bg_=function(req){const u=auth_(req),r=get_("cases",req.cid),R=rolesOf_(u);if(!r||!r.d.cons||(!R.kaprodi&&!(R.mahasiswa&&r.sid===u.d.sid)&&!((R.dosen||R.preseptor)&&r.pid===u.id&&assignmentOk_(u.id,r.sid,r.d.st,r.d.wah,r.d.tgl))))fail_("forbidden");return bgOriginal_(req);};
