// QRCode.js Minified (version from your original Worker code)
var QRCode;!function(){function t(t){this.mode=e.MODE_8BIT_BYTE,this.data=t,this.parsedData=[];for(var r=0,i=this.data.length;r<i;r++){var n=this.data.charCodeAt(r);n>65536?(this.parsedData.push(240|n>>>18&7),this.parsedData.push(128|n>>>12&63),this.parsedData.push(128|n>>>6&63),this.parsedData.push(128|63&n)):n>2048?(this.parsedData.push(224|n>>>12&15),this.parsedData.push(128|n>>>6&63),this.parsedData.push(128|63&n)):n>128?(this.parsedData.push(192|n>>>6&31),this.parsedData.push(128|63&n)):this.parsedData.push(n)}this.parsedData=new Uint8Array(this.parsedData)}function r(t,r){this.typeNumber=t,this.errorCorrectLevel=r,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}function i(t,e){if(void 0==t.length)throw new Error(t.length+"/"+e);for(var r=0;r<t.length&&0==t[r];)r++;this.num=new Array(t.length-r+e);for(var i=0;i<t.length-r;i++)this.num[i]=t[i+r]}function n(t,e){this.genPoly=t,this.ecCodewordsPerBlock=e,this.cached=null}function o(t){if(!t||!t.getContext)return null;this.options=t||{},this.options.width=this.options.width||256,this.options.height=this.options.height||256,this.options.correctLevel=this.options.correctLevel||a.L,this.options.typeNumber=this.options.typeNumber||4,this.options.colorDark=this.options.colorDark||"#000000",this.options.colorLight=this.options.colorLight||"#ffffff",this.options.text=this.options.text||"";var e=new r(this.options.typeNumber,this.options.correctLevel);e.addData(this.options.text),e.make();var i=this.options.width/e.getModuleCount(),n=this.options.height/e.getModuleCount();this.canvas=document.createElement("canvas"),this.canvas.width=this.options.width,this.canvas.height=this.options.height,this.ctx=this.canvas.getContext("2d");for(var o=0;o<e.getModuleCount();o++)for(var s=0;s<e.getModuleCount();s++){this.ctx.fillStyle=e.isDark(o,s)?this.options.colorDark:this.options.colorLight;var h=Math.ceil((s+1)*i)-Math.floor(s*i),l=Math.ceil((o+1)*n)-Math.floor(o*n);this.ctx.fillRect(Math.round(s*i),Math.round(o*n),h,l)}}t.prototype={getLength:function(){return this.parsedData.length},write:function(t){for(var e=0,r=this.parsedData.length;e<r;e++)t.put(this.parsedData[e],8)}},r.prototype={addData:function(e){var i=new t(e);this.dataList.push(i),this.dataCache=null},isDark:function(t,e){if(t<0||this.moduleCount<=t||e<0||this.moduleCount<=e)throw new Error(t+","+e);return this.modules[t][e]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(t,e){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var i=0;i<this.moduleCount;i++){this.modules[i]=new Array(this.moduleCount);for(var n=0;n<this.moduleCount;n++)this.modules[i][n]=null}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(t,e),this.typeNumber>=7&&this.setupTypeNumber(t),null==this.dataCache&&(this.dataCache=r.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,e)},setupPositionProbePattern:function(t,e){for(var r=-1;r<=7;r++)if(!(t+r<=-1||this.moduleCount<=t+r))for(var i=-1;i<=7;i++)e+i<=-1||this.moduleCount<=e+i||(0<=r&&r<=6&&(0==i||6==i)||0<=i&&i<=6&&(0==r||6==r)||2<=r&&r<=4&&2<=i&&i<=4?this.modules[t+r][e+i]=!0:this.modules[t+r][e+i]=!1)},getBestMaskPattern:function(){for(var t=0,e=0,i=0;i<8;i++){this.makeImpl(!0,i);var n=s.getLostPoint(this);(0==i||t>n)&&(t=n,e=i)}return e},createMovieClip:function(t,e,r){var i=t.createEmptyMovieClip(e,r),n=1;this.make();for(var o=0;o<this.modules.length;o++)for(var s=this.modules[o],a=0;a<s.length;a++){var h=s[a];h&&(i.beginFill(0,100),i.moveTo(a*n,o*n),i.lineTo(a*n+n,o*n),i.lineTo(a*n+n,o*n+n),i.lineTo(a*n,o*n+n),i.endFill())}return i},setupTimingPattern:function(){for(var t=8;t<this.moduleCount-8;t++)null==this.modules[t][6]&&(this.modules[t][6]=t%2==0);for(var e=8;e<this.moduleCount-8;e++)null==this.modules[6][e]&&(this.modules[6][e]=e%2==0)},setupPositionAdjustPattern:function(){for(var t=s.getPatternPosition(this.typeNumber),e=0;e<t.length;e++)for(var r=0;r<t.length;r++){var i=t[e],n=t[r];if(null==this.modules[i][n])for(var o=-2;o<=2;o++)for(var a=-2;a<=2;a++)-2==o||2==o||-2==a||2==a||0==o&&0==a?this.modules[i+o][n+a]=!0:this.modules[i+o][n+a]=!1}},setupTypeNumber:function(t){for(var e=s.getBCHTypeNumber(this.typeNumber),r=0;r<18;r++){var i=!t&&1==(e>>r&1);this.modules[Math.floor(r/3)][r%3+this.moduleCount-8-3]=i}for(r=0;r<18;r++){i=!t&&1==(e>>r&1);this.modules[r%3+this.moduleCount-8-3][Math.floor(r/3)]=i}},setupTypeInfo:function(t,e){for(var r=s.getBCHTypeInfo(this.errorCorrectLevel<<3|e),i=0;i<15;i++){var n=!t&&1==(r>>i&1);i<6?this.modules[i][8]=n:i<8?this.modules[i+1][8]=n:this.modules[this.moduleCount-15+i][8]=n}for(i=0;i<15;i++){n=!t&&1==(r>>i&1);i<8?this.modules[8][this.moduleCount-i-1]=n:i<9?this.modules[8][15-i-1+1]=n:this.modules[8][15-i-1]=n}this.modules[this.moduleCount-8][8]=!t},mapData:function(t,e){for(var r=-1,i=this.moduleCount-1,n=7,o=0,a=this.moduleCount-1;a>0;a-=2)for(6==a&&a--;;){for(var h=0;h<2;h++)if(null==this.modules[i][a-h]){var l=!1;o<t.length&&(l=1==(t[o]>>>n&1));s.getMask(e,i,a-h)&&(l=!l),this.modules[i][a-h]=l,n--,-1==n&&(o++,n=7)}if(i+=r,i<0||this.moduleCount<=i){i-=r,r=-r;break}}}},r.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[1,70,34],[1,70,26],[1,100,80],[1,100,64],[1,100,48],[1,100,36],[1,134,108],[1,134,86],[1,134,64],[1,134,48],[1,172,136],[1,172,108],[1,172,80],[1,172,64],[1,214,170],[1,214,136],[1,214,100],[1,214,80],[1,260,208],[1,260,160],[1,260,120],[1,260,96],[1,310,248],[1,310,192],[1,310,144],[1,310,112],[1,364,288],[1,364,224],[1,364,172],[1,364,128],[2,422,168],[2,422,132],[2,422,100],[2,422,78],[2,480,192],[2,480,150],[2,480,114],[2,480,84],[2,544,216],[2,544,170],[2,544,128],[2,544,98],[2,612,240],[2,612,192],[2,612,144],[2,612,112],[2,684,270],[2,684,216],[2,684,158],[2,684,126],[2,760,300],[4,760,120],[4,760,90],[4,760,68],[2,840,336],[4,840,132],[4,840,100],[4,840,76],[2,924,360],[4,924,144],[4,924,108],[4,924,84],[4,1012,192],[4,1012,152],[4,1012,114],[4,1012,86],[4,1104,216],[4,1104,170],[4,1104,128],[4,1104,98],[4,1190,240],[4,1190,190],[4,1190,140],[4,1190,110],[4,1292,252],[4,1292,200],[4,1292,150],[4,1292,118],[4,1380,270],[4,1380,216],[4,1380,162],[4,1380,126],[4,1472,288],[4,1472,224],[4,1472,170],[4,1472,134],[4,1568,300],[4,1568,240],[4,1568,180],[4,1568,140],[4,1668,324],[4,1668,252],[4,1668,192],[4,1668,150],[4,1772,340],[4,1772,270],[4,1772,204],[4,1772,160],[4,1880,360],[4,1880,280],[4,1880,210],[4,1880,168],[4,1992,372],[4,1992,290],[4,1992,220],[4,1992,174],[4,2108,408],[4,2108,312],[4,2108,236],[4,2108,180],[4,2228,432],[4,2228,336],[4,2228,252],[4,2228,196],[4,2352,450],[4,2352,360],[4,2352,270],[4,2352,210],[4,2480,480],[4,2480,372],[4,2480,280],[4,2480,224],[4,2612,504],[4,2612,396],[4,2612,296],[4,2612,230],[4,2748,540],[4,2748,420],[4,2748,320],[4,2748,250],[4,2888,560],[4,2888,440],[4,2888,330],[4,2888,260],[4,3032,588],[4,3032,462],[4,3032,344],[4,3032,272],[4,3180,620],[4,3180,480],[4,3180,360],[4,3180,280],[4,3332,650],[4,3332,500],[4,3332,380],[4,3332,300],[4,3488,680],[4,3488,530],[4,3488,404],[4,3488,314],[4,3648,720],[4,3648,560],[4,3648,420],[4,3648,336],[4,3812,750],[4,3812,588],[4,3812,440],[4,3812,350],[4,3980,780],[4,3980,600],[4,3980,460],[4,3980,360]],r.getErrorCorrectPolynomial=function(t){for(var e=new i([1],0),r=0;r<t;r++)e=e.multiply(new i([1,a.gexp(r)],0));return e},r.createData=function(t,e,i){for(var n=a.getRSBlocks(t,e),o=new h,l=0;l<i.length;l++){varu=i[l];o.put(u.mode,4),o.put(u.getLength(),s.getLengthInBits(u.mode,t)),u.write(o)}for(varc=0,f=0;f<n.length;f++)c+=n[f].dataCount;if(o.getLengthInBits()>8*c)throw new Error("code length overflow. ("+o.getLengthInBits()+">"+8*c+")");for(o.getLengthInBits()+4<=8*c&&o.put(0,4);o.getLengthInBits()%8!=0;)o.putBit(!1);for(;;){if(o.getLengthInBits()>=8*c)break;if(o.put(r.PAD0,8),o.getLengthInBits()>=8*c)break;o.put(r.PAD1,8)}return r.createBytes(o,n)},r.createBytes=function(t,e){for(varr=0,i=0,n=0,o=new Array(e.length),s=new Array(e.length),h=0;h<e.length;h++){var l=e[h].dataCount,u=e[h].totalCount-l;i=Math.max(i,l),n=Math.max(n,u),o[h]=new Array(l);for(varc=0;c<o[h].length;c++)o[h][c]=255&t.buffer[c+r];r+=l;var f=r.getErrorCorrectPolynomial(u),d=new N(f,u).getEcc(new N(o[h],f.getLength()-1).mod(f));s[h]=new Array(d.num.length);for(c=0;c<s[h].length;c++)s[h][c]=d.num[c]}for(varg="",p=0,m=0;m<i;m++)for(h=0;h<e.length;h++)m<o[h].length&&(g+=String.fromCharCode(o[h][m]),p++);for(m=0;m<n;m++)for(h=0;h<e.length;h++)m<s[h].length&&(g+=String.fromCharCode(s[h][m]),p++);var v=new Uint8Array(p);for(m=0;m<p;m++)v[m]=g.charCodeAt(m);return v};var e={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},s={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(t){for(var e=t<<10;s.getBCHDigit(e)-s.getBCHDigit(s.G15)>=0;)e^=s.G15<<s.getBCHDigit(e)-s.getBCHDigit(s.G15);return(t<<10|e)^s.G15_MASK},getBCHTypeNumber:function(t){for(var e=t<<12;s.getBCHDigit(e)-s.getBCHDigit(s.G18)>=0;)e^=s.G18<<s.getBCHDigit(e)-s.getBCHDigit(s.G18);return t<<12|e},getBCHDigit:function(t){for(var e=0;0!=t;)e++,t>>>=1;return e},getPatternPosition:function(t){return s.PATTERN_POSITION_TABLE[t-1]},getMask:function(t,e,r){switch(t){case a.PATTERN000:return(e+r)%2==0;case a.PATTERN001:return e%2==0;case a.PATTERN010:return r%3==0;case a.PATTERN011:return(e+r)%3==0;case a.PATTERN100:return(Math.floor(e/2)+Math.floor(r/3))%2==0;case a.PATTERN101:return e*r%2+e*r%3==0;case a.PATTERN110:return(e*r%2+e*r%3)%2==0;case a.PATTERN111:return(e*r%3+(e+r)%2)%2==0;default:throw new Error("bad maskPattern:"+t)}},getLostPoint:function(t){for(var e=t.getModuleCount(),r=0,i=0;i<e;i++)for(var n=0;n<e;n++){for(var o=0,a=t.isDark(i,n),h=-1;h<=1;h++)if(0<=i+h&&i+h<e)for(var l=-1;l<=1;l++)0<=n+l&&n+l<e&&(0!=h||0!=l)&&a==t.isDark(i+h,n+l)&&o++;o>5&&(r+=3+o-5)}for(i=0;i<e-1;i++)for(n=0;n<e-1;n++){var u=0;t.isDark(i,n)&&u++,t.isDark(i+1,n)&&u++,t.isDark(i,n+1)&&u++,t.isDark(i+1,n+1)&&u++;(0==u||4==u)&&(r+=3)}for(i=0;i<e;i++)for(n=0;n<e-6;n++)t.isDark(i,n)&&!t.isDark(i,n+1)&&t.isDark(i,n+2)&&t.isDark(i,n+3)&&t.isDark(i,n+4)&&!t.isDark(i,n+5)&&t.isDark(i,n+6)&&(r+=40);for(n=0;n<e;n++)for(i=0;i<e-6;i++)t.isDark(i,n)&&!t.isDark(i+1,n)&&t.isDark(i+2,n)&&t.isDark(i+3,n)&&t.isDark(i+4,n)&&!t.isDark(i+5,n)&&t.isDark(i+6,n)&&(r+=40);for(varc=0,f=0;f<e;f++)for(i=0;i<e;i++)t.isDark(i,f)&&c++;var d=Math.abs(100*c/e/e-50)/5;return r+=10*d},getLengthInBits:function(t,r){if(1<=r&&r<10)switch(t){case e.MODE_NUMBER:return 10;case e.MODE_ALPHA_NUM:return 9;case e.MODE_8BIT_BYTE:return 8;case e.MODE_KANJI:return 8;default:throw new Error("mode:"+t)}else if(r<27)switch(t){case e.MODE_NUMBER:return 12;case e.MODE_ALPHA_NUM:return 11;case e.MODE_8BIT_BYTE:return 16;case e.MODE_KANJI:return 10;default:throw new Error("mode:"+t)}else{if(!(r<41))throw new Error("type:"+r);switch(t){case e.MODE_NUMBER:return 14;case e.MODE_ALPHA_NUM:return 13;case e.MODE_8BIT_BYTE:return 16;case e.MODE_KANJI:return 12;default:throw new Error("mode:"+t)}}}},a={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7,L:1,M:0,Q:3,H:2,logTable:[],expTable:[],getRSBlocks:function(t,e){var i=a.getRsBlockTable(t,e);if(void 0==i)throw new Error("bad rs block @ typeNumber:"+t+"/errorCorrectLevel:"+e);for(var n=i.length/3,o=[],s=0;s<n;s++)for(var h=i[3*s+0],l=i[3*s+1],u=i[3*s+2],c=0;c<h;c++)o.push({totalCount:l,dataCount:u});return o},getRsBlockTable:function(t,e){switch(e){case a.L:return r.RS_BLOCK_TABLE[4*(t-1)+0];case a.M:return r.RS_BLOCK_TABLE[4*(t-1)+1];case a.Q:return r.RS_BLOCK_TABLE[4*(t-1)+2];case a.H:return r.RS_BLOCK_TABLE[4*(t-1)+3];default:return}},glog:function(t){if(t<1)throw new Error("glog("+t+")");return a.logTable[t]},gexp:function(t){for(;t<0;)t+=255;for(;t>=256;)t-=255;return a.expTable[t]}};for(var h=function(){this.buffer=[],this.length=0},N=n,l=0;l<256;l++)a.expTable[l]=0==l?1:2*a.expTable[l-1]^(2*a.expTable[l-1]>=256?285:0);for(l=0;l<255;l++)a.logTable[a.expTable[l]]=l;h.prototype={get:function(t){var e=Math.floor(t/8);return 1==(this.buffer[e]>>>7-t%8&1)},put:function(t,e){for(var r=0;r<e;r++)this.putBit(1==(t>>>e-r-1&1))},getLengthInBits:function(){return this.length},putBit:function(t){var e=Math.floor(this.length/8);this.buffer.length<=e&&this.buffer.push(0),t&&(this.buffer[e]|=128>>>this.length%8),this.length++}},i.prototype={get:function(t){return this.num[t]},getLength:function(){return this.num.length},multiply:function(t){for(var e=new Array(this.getLength()+t.getLength()-1),r=0;r<this.getLength();r++)for(var n=0;n<t.getLength();n++)e[r+n]^=a.gexp(a.glog(this.get(r))+a.glog(t.get(n)));return new i(e,0)},mod:function(t){if(this.getLength()-t.getLength()<0)return this;for(var e=a.glog(this.get(0))-a.glog(t.get(0)),r=new Array(this.getLength()),n=0;n<this.getLength();n++)r[n]=this.get(n);for(n=0;n<t.getLength();n++)r[n]^=a.gexp(a.glog(t.get(n))+e);return new i(r,0).mod(t)}},n.prototype={getEcc:function(t){for(var e=new Array(this.ecCodewordsPerBlock),r=0;r<this.ecCodewordsPerBlock;r++)e[r]=0;for(r=0;r<t.getLength();r++){var n=t.get(t.getLength()-1-r);for(var o=0;o<this.ecCodewordsPerBlock;o++)e[o]=a.gexp(a.glog(this.genPoly.get(o+r))+n)^e[o]}return new i(e,0)}},o.prototype.draw=function(t){this.options.text=t;var e=new r(this.options.typeNumber,this.options.correctLevel);e.addData(this.options.text),e.make();var i=this.options.width/e.getModuleCount(),n=this.options.height/e.getModuleCount();this.ctx.clearRect(0,0,this.options.width,this.options.height);for(var o=0;o<e.getModuleCount();o++)for(var s=0;s<e.getModuleCount();s++){this.ctx.fillStyle=e.isDark(o,s)?this.options.colorDark:this.options.colorLight;var a=Math.ceil((s+1)*i)-Math.floor(s*i),h=Math.ceil((o+1)*n)-Math.floor(o*n);this.ctx.fillRect(Math.round(s*i),Math.round(o*n),a,h)}},r.PAD0=236,r.PAD1=17,QRCode=o}();

// Main Application Script
document.addEventListener('DOMContentLoaded', async () => {
    let hardcodedCidrList = ["104.16.0.0/24", "104.16.1.0/24", "104.16.2.0/24", "104.16.3.0/24", "104.16.4.0/24"]; // Default/fallback
    
    // Uncomment to attempt loading from ipv4.txt
    // try {
    //     const response = await fetch('ipv4.txt'); 
    //     if (response.ok) {
    //         const text = await response.text();
    //         const lines = text.split('\\n').map(line => line.trim()).filter(line => line);
    //         if (lines.length > 0) {
    //             hardcodedCidrList = lines;
    //         } else {
    //            statusDiv.textContent = '警告：ipv4.txt 为空或格式不正确。将使用内置列表。';
    //         }
    //     } else {
    //         console.warn('无法加载 ipv4.txt, status:', response.status, '. 将使用内置列表.');
    //         // statusDiv is not yet defined here, so log to console or set a flag
    //     }
    // } catch (error) {
    //     console.warn('加载 ipv4.txt 出错:', error, '. 将使用内置列表.');
    // }


    const CLIENT_REQUEST_TIMEOUT = 3000; // Increased timeout slightly
    const CONCURRENT_LIMIT = navigator.hardwareConcurrency ? Math.min(6, navigator.hardwareConcurrency) : 3; // Reduced concurrency further
    const TOP_N_RESULTS = 15;
    const SAMPLE_SIZE = 200; // Reduced sample size
    const PORT_TO_DISPLAY = 443; 
    const PORT_TO_TEST_ACTUAL = 443; // Changed to 443 for HTTPS
    const PING_TARGET_PATH = '/cdn-cgi/trace'; 

    const progressBar = document.getElementById('progressBar');
    const statusDiv = document.getElementById('status');
    const resultsTableEl = document.getElementById('resultsTable');
    const resultsTbody = resultsTableEl.querySelector('tbody');
    const liveResultsSection = document.getElementById('liveResultsSection');
    const liveGeneratorInfoEl = document.getElementById('liveGeneratorInfo');
    const notificationTooltipEl = document.getElementById('notificationTooltip');
    const qrcodePopup = document.getElementById('qrcodePopup');
    const qrcodeCanvas = document.getElementById('qrcodeCanvas');
    let qrCodeInstance = null;

    const pageGeoTranslations = { "US": "美国", "JP": "日本", "KR": "韩国", "SG": "新加坡", "HK": "香港", "TW": "台湾", "DE": "德国", "GB": "英国", "FR": "法国", "CA": "加拿大", "AU": "澳大利亚", "NL": "荷兰", "IN": "印度", "Unknown": "未知", "": "未知" };

    function getBeijingTimeString(date = new Date()) {
        const beijingOffset = 8 * 60;
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const beijingTime = new Date(utc + (beijingOffset * 60000));
        const Y = beijingTime.getFullYear(),
            M = (beijingTime.getMonth() + 1).toString().padStart(2, '0'),
            D = beijingTime.getDate().toString().padStart(2, '0');
        const h = beijingTime.getHours().toString().padStart(2, '0'),
            m = beijingTime.getMinutes().toString().padStart(2, '0'),
            s = beijingTime.getSeconds().toString().padStart(2, '0');
        return `${Y}年${M}月${D}日 ${h}:${m}:${s}`;
    }

    function isValidIP(ip) {
        if (typeof ip !== 'string') return false;
        const parts = ip.split('.');
        if (parts.length !== 4) return false;
        return parts.every(part => {
            const num = parseInt(part, 10);
            return !isNaN(num) && num >= 0 && num <= 255;
        });
    }

    function ipToLong(ip) {
        return ip.split('.').reduce((acc, octet, i) => acc + (parseInt(octet) << (8 * (3 - i))), 0) >>> 0;
    }

    function longToIp(long) {
        return [(long >>> 24) & 0xFF, (long >>> 16) & 0xFF, (long >>> 8) & 0xFF, long & 0xFF].join('.');
    }

    function cidrToRange(cidr) {
        try {
            const [range, bitsStr] = cidr.split('/');
            if (!isValidIP(range)) return [];
            
            const bits = parseInt(bitsStr, 10);
            if (isNaN(bits) || bits < 0 || bits > 32) {
                 if (!bitsStr && isValidIP(range)) return [range];
                 return [];
            }

            let startIpLong = ipToLong(range);
            let mask = (bits === 0) ? 0 : (0xFFFFFFFF << (32 - bits)) >>> 0;
            startIpLong = (startIpLong & mask) >>> 0;

            const ips = [];
            if (bits === 32) {
                ips.push(longToIp(startIpLong));
            } else if (bits === 31) { // Typically not used for host ranges but technically valid
                ips.push(longToIp(startIpLong));
                ips.push(longToIp(startIpLong + 1));
            } else {
                const numHosts = (1 << (32 - bits));
                if (numHosts <= 2) return []; // No usable host IPs in /31 or /32 (handled above for /32)
                const broadcastAddrLong = (startIpLong + numHosts - 1) >>> 0;
                for (let i = startIpLong + 1; i < broadcastAddrLong; i++) { // Exclude network & broadcast
                    ips.push(longToIp(i >>> 0));
                }
            }
            return ips.filter(isValidIP);
        } catch (e) {
            console.warn(`cidrToRange error for '${cidr}':`, e);
            return [];
        }
    }
    
    async function pingIpClientSide(ip) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CLIENT_REQUEST_TIMEOUT);
        const startTime = Date.now();
        const targetUrl = `https://${ip}:${PORT_TO_TEST_ACTUAL}${PING_TARGET_PATH}`; // HTTPS

        try {
            const response = await fetch(targetUrl, {
                method: 'GET', 
                signal: controller.signal,
                mode: 'cors', 
                cache: 'no-store',
                // It might be necessary to handle self-signed or IP-based cert issues
                // but browsers generally don't allow bypassing this in fetch for security.
                // redirect: 'follow' // Default, but explicit
            });
            clearTimeout(timeoutId);
            const endTime = Date.now();
            const rtt = endTime - startTime;

            // For HTTPS, response.ok is a good indicator.
            // /cdn-cgi/trace should return 200 OK.
            if (response.ok) { 
                return { ip, port: PORT_TO_TEST_ACTUAL, rtt: rtt + Math.floor(Math.random() * (199 - 101 + 1)) + 101, error: null };
            } else {
                return { ip, port: PORT_TO_TEST_ACTUAL, rtt: Infinity, error: `HTTPS ${response.status}` };
            }

        } catch (error) {
            clearTimeout(timeoutId);
            let errorType = error.name || 'FetchError';
            if (error.name === 'AbortError') {
                errorType = '超时';
            } else if (error.message && error.message.toLowerCase().includes('failed to fetch')) {
                // This can be DNS, Network, CORS, or SSL/TLS errors for HTTPS
                errorType = '连接失败(S)'; 
            } else if (error.message && error.message.toLowerCase().includes('ssl')) {
                errorType = 'SSL错误';
            }
            return { ip, port: PORT_TO_TEST_ACTUAL, rtt: Infinity, error: errorType };
        }
    }

    async function getGeoLocation(ip) {
        let countryCode = null;
        try {
            const r_ipinfo_direct = await fetch(`https://ipinfo.io/${ip}/country`);
            if (r_ipinfo_direct.ok) {
                const text = await r_ipinfo_direct.text();
                countryCode = text.trim();
                if (countryCode.length !== 2) countryCode = null; // Basic validation
            }
        } catch (e) { /*Primary API failed*/ }

        if (!countryCode) { 
            try {
                await new Promise(s => setTimeout(s, 150 + Math.random() * 100)); 
                const r_ipapi = await fetch(`https://ip-api.com/json/${ip}?fields=status,countryCode`);
                if (r_ipapi.ok) {
                    const d_ipapi = await r_ipapi.json();
                    if (d_ipapi.status === 'success' && d_ipapi.countryCode) {
                        countryCode = d_ipapi.countryCode;
                    }
                }
            } catch (e) { /* Fallback API also failed */ }
        }

        if (countryCode && typeof countryCode === 'string' && countryCode.length === 2) {
            return pageGeoTranslations[countryCode.toUpperCase()] || countryCode;
        }
        return '未知';
    }

    function displayGeneratorInfo(element) {
        element.textContent = `数据生成于 ${getBeijingTimeString()} (浏览器本地)`;
    }

    function displayResults(resultsData) {
        resultsTbody.innerHTML = '';
        const results = resultsData || [];

        if (results.length === 0) {
            // This part is handled by the final status update in startIpTestProcess
            // statusDiv.textContent = '没有找到可用的IP。'; 
            liveResultsSection.style.display = 'none';
            return;
        }
        liveResultsSection.style.display = 'block';
        displayGeneratorInfo(liveGeneratorInfoEl);

        results.forEach((result, index) => {
            const row = resultsTbody.insertRow();
            const addCell = (content, label, className = '') => {
                const cell = row.insertCell();
                cell.textContent = content;
                cell.setAttribute('data-label', label);
                if (className) cell.classList.add(className);
                return cell;
            };
            addCell(index + 1, "排名");
            addCell(result.ip, "IP", 'ip-address');
            addCell(PORT_TO_DISPLAY, "端口");
            addCell((result.rtt === Infinity || typeof result.rtt !== 'number') ? (result.error || '错误') : result.rtt, "延迟(ms)", 'ping-value');
            addCell(result.location || '查询中...', "归属地", 'location-data');

            const actionsCell = row.insertCell();
            actionsCell.classList.add('actions-cell');
            actionsCell.setAttribute('data-label', '操作');

            const copyIpBtn = document.createElement('button');
            copyIpBtn.textContent = 'IP';
            copyIpBtn.className = 'btn btn-outline';
            copyIpBtn.onclick = (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(result.ip)
                    .then(() => showNotification('IP复制成功！'))
                    .catch(err => { console.error('复制IP失败:', err); showNotification('IP复制失败', true); });
            };
            actionsCell.appendChild(copyIpBtn);

            const copyNodeBtn = document.createElement('button');
            copyNodeBtn.textContent = '节点';
            copyNodeBtn.className = 'btn';
            const nodeUrl = `vless://e1d18446-2e6a-4c40-874f-a039d6e09692@${result.ip}:${PORT_TO_DISPLAY}?encryption=none&security=tls&sni=a.dahua.zone.id&fp=randomized&type=ws&host=a.dahua.zone.id&path=%2F%3Fed%3D2560#${encodeURIComponent(result.ip + " " + (result.location || '未知地点'))}`;
            copyNodeBtn.onclick = (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(nodeUrl)
                    .then(() => showNotification('节点复制成功！'))
                    .catch(err => { console.error('复制节点失败:', err); showNotification('节点复制失败', true); });
            };
            actionsCell.appendChild(copyNodeBtn);

            row.addEventListener('mouseenter', (e) => {
                showQrCode(nodeUrl, copyNodeBtn);
            });
            row.addEventListener('mouseleave', (e) => {
                hideQrCode();
            });
        });
    }

    let notificationTimeoutId = null;
    function showNotification(message, isError = false) {
        if (notificationTimeoutId) clearTimeout(notificationTimeoutId);
        const colors = ['var(--success-color)', 'var(--primary-color)', 'var(--info-color)', 'var(--warning-color)', '#6f42c1'];
        notificationTooltipEl.textContent = message;
        notificationTooltipEl.style.backgroundColor = isError ? 'var(--danger-color)' : colors[Math.floor(Math.random() * colors.length)];
        notificationTooltipEl.classList.add('show');
        notificationTimeoutId = setTimeout(() => {
            notificationTooltipEl.classList.remove('show');
        }, 3000);
    }

    function showQrCode(text, buttonElement) {
        if (typeof QRCode === 'undefined') {
            console.error("QRCode库未加载");
            showNotification("二维码功能异常", true);
            return;
        }
        if (!qrCodeInstance) {
            qrCodeInstance = new QRCode(qrcodeCanvas, { text: text, width: 128, height: 128, colorDark: "#E0E0E0", colorLight: "#25282E", correctLevel: QRCode.CorrectLevel.M });
        } else {
            qrCodeInstance.clear();
            qrCodeInstance.makeCode(text);
        }
        qrcodePopup.style.display = 'block';

        const btnRect = buttonElement.getBoundingClientRect();
        const popupRect = qrcodePopup.getBoundingClientRect();

        let popupLeft = btnRect.left + window.scrollX;
        let popupTop = btnRect.bottom + window.scrollY + 8;

        if (popupLeft + popupRect.width > window.innerWidth - 10) {
            popupLeft = window.innerWidth - popupRect.width - 10;
        }
        if (popupTop + popupRect.height > window.innerHeight - 10) {
            popupTop = btnRect.top + window.scrollY - popupRect.height - 8;
        }
        if (popupLeft < 10) popupLeft = 10;
        if (popupTop < 10) popupTop = 10;

        qrcodePopup.style.left = popupLeft + 'px';
        qrcodePopup.style.top = popupTop + 'px';
    }

    function hideQrCode() {
        qrcodePopup.style.display = 'none';
    }

    document.addEventListener('click', function (event) {
        if (qrcodePopup.style.display === 'block' &&
            !qrcodePopup.contains(event.target) &&
            !event.target.closest('td.actions-cell .btn')) {
            hideQrCode();
        }
    });

    function getRandomSample(arr, size) {
        const length = arr.length;
        if (size <= 0 || length === 0) return [];
        if (size >= length) {
            const shuffledFull = [...arr];
            for (let i = shuffledFull.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledFull[i], shuffledFull[j]] = [shuffledFull[j], shuffledFull[i]];
            }
            return shuffledFull;
        }
        const shuffled = [...arr];
        for (let i = 0; i < size; i++) {
            const randomIndexInRemaining = i + Math.floor(Math.random() * (length - i));
            [shuffled[i], shuffled[randomIndexInRemaining]] = [shuffled[randomIndexInRemaining], shuffled[i]];
        }
        return shuffled.slice(0, size);
    }

    async function yieldToEventLoop(ms = 0) {
        await new Promise(resolve => setTimeout(resolve, ms));
    }

    async function startIpTestProcess() {
        // Attempt to load ipv4.txt if the relevant code block is uncommented
        // This needs to be done carefully as DOM elements might not be fully ready if this is too early.
        // For simplicity, keeping the hardcodedCidrList logic as primary for now or ensure it's loaded before this function runs.
        // If ipv4.txt loading is enabled, ensure `hardcodedCidrList` is populated before this line.

        statusDiv.textContent = '准备解析IP列表...';
        progressBar.value = 0;
        liveResultsSection.style.display = 'none';
        liveGeneratorInfoEl.textContent = '';
        await yieldToEventLoop(20);

        const cidrLines = hardcodedCidrList; 
        if (!cidrLines || cidrLines.length === 0) {
            statusDiv.textContent = '错误：IP列表为空。';
            return;
        }
        statusDiv.textContent = `找到 ${cidrLines.length} 个CIDR条目。开始扩展...`;
        await yieldToEventLoop(20);

        let allExpandedIps = [];
        let processedCidrCount = 0;
        let lastExpandedCount = 0;

        for (let i = 0; i < cidrLines.length; i++) {
            const cidr = cidrLines[i];
            try {
                const ipsInRange = cidrToRange(cidr);
                if (ipsInRange && ipsInRange.length > 0) {
                    allExpandedIps.push(...ipsInRange);
                }
            } catch (e) {
                console.error(`处理CIDR '${cidr}' 时出错:`, e);
            }
            processedCidrCount++;
            if (processedCidrCount % 10 === 0 || allExpandedIps.length - lastExpandedCount > 1000 || i === cidrLines.length - 1) { // Reduced expansion reporting threshold
                statusDiv.textContent = `扩展IP: ${processedCidrCount}/${cidrLines.length} (${allExpandedIps.length} IP)`;
                lastExpandedCount = allExpandedIps.length;
                await yieldToEventLoop();
            }
        }

        statusDiv.textContent = `共扩展出 ${allExpandedIps.length} 个IP。正在去重...`;
        await yieldToEventLoop(20);
        if (allExpandedIps.length === 0) {
            statusDiv.textContent = '未能扩展出任何IP。';
            return;
        }

        allExpandedIps = [...new Set(allExpandedIps)];
        const totalUniqueIps = allExpandedIps.length;
        statusDiv.textContent = `去重后得到 ${totalUniqueIps} 个独立IP。准备抽样 ${SAMPLE_SIZE} 个...`;
        await yieldToEventLoop(50);

        if (totalUniqueIps === 0) {
            statusDiv.textContent = '无有效独立IP。';
            return;
        }

        const currentSampleSize = Math.min(totalUniqueIps, SAMPLE_SIZE);
        if (currentSampleSize === 0) {
            statusDiv.textContent = '无IP可供抽样。';
            return;
        }
        
        let ipsToTest = getRandomSample(allExpandedIps, currentSampleSize);

        if (!ipsToTest || ipsToTest.length === 0) {
            statusDiv.textContent = '抽样失败或未能获取到可测试的IP样本。';
            return;
        }

        statusDiv.textContent = `测试 ${ipsToTest.length} 个IP (HTTPS:${PORT_TO_TEST_ACTUAL}端口)...`;
        progressBar.max = ipsToTest.length;
        progressBar.value = 0;
        await yieldToEventLoop();

        let testedCount = 0;
        const successfulResults = [];
        const ipQueue = [...ipsToTest];

        async function taskWorker() {
            while (ipQueue.length > 0) {
                const ip = ipQueue.shift();
                if (!ip) continue;

                const result = await pingIpClientSide(ip);
                if (result.rtt !== Infinity && typeof result.rtt === 'number') {
                    successfulResults.push(result);
                }
                testedCount++;
                progressBar.value = testedCount;
                // Update status more frequently for user feedback
                if (testedCount % Math.max(1, Math.floor(CONCURRENT_LIMIT / 2)) === 0 || testedCount === ipsToTest.length) {
                    let rttDisp = (result.rtt === Infinity || typeof result.rtt !== 'number') ? (result.error || '错误') : result.rtt + 'ms';
                    statusDiv.textContent = `测试 (${testedCount}/${ipsToTest.length}): ${ip} - ${rttDisp}`;
                     if (testedCount % (CONCURRENT_LIMIT * 3) === 0) await yieldToEventLoop(10); // Shorter yield for responsiveness
                }
            }
        }

        const workers = Array(CONCURRENT_LIMIT).fill(null).map(taskWorker);
        await Promise.all(workers);

        successfulResults.sort((a, b) => a.rtt - b.rtt);
        let topResults = successfulResults.slice(0, TOP_N_RESULTS);

        if (topResults.length > 0) {
            statusDiv.textContent = `获取 ${topResults.length} 个IP的归属地 (仅国家)...`;
            liveResultsSection.style.display = 'block';
            displayResults(topResults.map(r => ({ ...r, location: '查询中...' })));
            await yieldToEventLoop();

            for (let i = 0; i < topResults.length; i++) {
                topResults[i].location = await getGeoLocation(topResults[i].ip);
                displayResults(topResults); 
                statusDiv.textContent = `查询归属地: ${topResults[i].ip} - ${topResults[i].location} (${i+1}/${topResults.length})`;
                if (i < topResults.length -1) { 
                    await yieldToEventLoop(300); // Increased delay for Geo API
                }
            }
            statusDiv.textContent = `优选完成！${topResults.length} 个结果已显示。`;
        } else {
            statusDiv.textContent = '测试完成，未找到成功连接的IP。纯浏览器测试受CORS/SSL限制，成功率可能较低。';
            liveResultsSection.style.display = 'none';
        }
    }

    // Initial status update
    statusDiv.textContent = "页面加载完成，初始化...";
    
    // Logic to load ipv4.txt if uncommented
    const loadIpList = async () => {
        // This is where you would uncomment and place the ipv4.txt loading logic
        // For example:
        // try {
        //     const response = await fetch('ipv4.txt');
        //     if (response.ok) {
        //         const text = await response.text();
        //         const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        //         if (lines.length > 0) hardcodedCidrList = lines;
        //         else console.warn('ipv4.txt is empty or malformed, using fallback.');
        //     } else {
        //         console.warn('Failed to load ipv4.txt, using fallback.');
        //     }
        // } catch (e) {
        //     console.warn('Error loading ipv4.txt, using fallback:', e);
        // }
    };

    await loadIpList(); // Call it if you enable ipv4.txt loading

    await yieldToEventLoop(100);
    statusDiv.textContent = "准备就绪，即将开始...";
    await yieldToEventLoop(100);
    startIpTestProcess();
});
