exports.globalName = 'window';
exports.implicitTopLevel = 'window';
exports.builtins = {};

//
// Last updated: October 11, 2013
//   Chrome 30.0.1599.69 m
//   Firefox 24.0
//   IE 10.0.9200
//
var builtinsByBrowser = { chrome: ["top","window","location","external","chrome","document","webkitNotifications","localStorage","sessionStorage","applicationCache","webkitStorageInfo","indexedDB","webkitIndexedDB","crypto","CSS","performance","console","devicePixelRatio","styleMedia","parent","opener","frames","self","defaultstatus","defaultStatus","status","name","length","closed","pageYOffset","pageXOffset","scrollY","scrollX","screenTop","screenLeft","screenY","screenX","innerWidth","innerHeight","outerWidth","outerHeight","offscreenBuffering","frameElement","clientInformation","navigator","toolbar","statusbar","scrollbars","personalbar","menubar","locationbar","history","screen","postMessage","close","blur","focus","ondeviceorientation","ontransitionend","onwebkittransitionend","onwebkitanimationstart","onwebkitanimationiteration","onwebkitanimationend","onsearch","onreset","onwaiting","onvolumechange","onunload","ontimeupdate","onsuspend","onsubmit","onstorage","onstalled","onselect","onseeking","onseeked","onscroll","onresize","onratechange","onprogress","onpopstate","onplaying","onplay","onpause","onpageshow","onpagehide","ononline","onoffline","onmousewheel","onmouseup","onmouseover","onmouseout","onmousemove","onmouseleave","onmouseenter","onmousedown","onmessage","onloadstart","onloadedmetadata","onloadeddata","onload","onkeyup","onkeypress","onkeydown","oninvalid","oninput","onhashchange","onfocus","onerror","onended","onemptied","ondurationchange","ondrop","ondragstart","ondragover","ondragleave","ondragenter","ondragend","ondrag","ondblclick","oncontextmenu","onclick","onchange","oncanplaythrough","oncanplay","onblur","onbeforeunload","onabort","getSelection","print","stop","open","showModalDialog","alert","confirm","prompt","find","scrollBy","scrollTo","scroll","moveBy","moveTo","resizeBy","resizeTo","matchMedia","requestAnimationFrame","cancelAnimationFrame","webkitRequestAnimationFrame","webkitCancelAnimationFrame","webkitCancelRequestAnimationFrame","captureEvents","releaseEvents","atob","btoa","setTimeout","clearTimeout","setInterval","clearInterval","getComputedStyle","getMatchedCSSRules","webkitConvertPointFromPageToNode","webkitConvertPointFromNodeToPage","webkitRequestFileSystem","webkitResolveLocalFileSystemURL","openDatabase","TEMPORARY","PERSISTENT","addEventListener","removeEventListener","dispatchEvent"]
                        , firefox: ["window","document","InstallTrigger","console","getInterface","external","sidebar","performance","addEventListener","removeEventListener","dispatchEvent","dump","name","parent","top","self","sessionStorage","localStorage","onmouseenter","onmouseleave","getSelection","scrollByLines","getComputedStyle","location","history","locationbar","menubar","personalbar","scrollbars","statusbar","toolbar","status","close","stop","focus","blur","length","opener","frameElement","navigator","applicationCache","alert","confirm","prompt","print","showModalDialog","postMessage","atob","btoa","matchMedia","screen","innerWidth","innerHeight","scrollX","pageXOffset","scrollY","pageYOffset","scroll","scrollTo","scrollBy","screenX","screenY","outerWidth","outerHeight","getDefaultComputedStyle","scrollByPages","sizeToContent","content","closed","crypto","pkcs11","controllers","mozInnerScreenX","mozInnerScreenY","devicePixelRatio","scrollMaxX","scrollMaxY","fullScreen","back","forward","home","moveTo","moveBy","resizeTo","resizeBy","updateCommands","find","mozPaintCount","mozRequestAnimationFrame","requestAnimationFrame","mozCancelAnimationFrame","mozCancelRequestAnimationFrame","cancelAnimationFrame","mozAnimationStartTime","onafterprint","onbeforeprint","onbeforeunload","onhashchange","onmessage","onoffline","ononline","onpopstate","onpagehide","onpageshow","onresize","onunload","ondevicemotion","ondeviceorientation","ondeviceproximity","onuserproximity","ondevicelight","setTimeout","setInterval","clearTimeout","clearInterval","setResizable","captureEvents","releaseEvents","routeEvent","enableExternalCapture","disableExternalCapture","open","openDialog","frames","onabort","onblur","oncanplay","oncanplaythrough","onchange","onclick","oncontextmenu","ondblclick","ondrag","ondragend","ondragenter","ondragleave","ondragover","ondragstart","ondrop","ondurationchange","onemptied","onended","onerror","onfocus","oninput","oninvalid","onkeydown","onkeypress","onkeyup","onload","onloadeddata","onloadedmetadata","onloadstart","onmousedown","onmousemove","onmouseout","onmouseover","onmouseup","onmozfullscreenchange","onmozfullscreenerror","onmozpointerlockchange","onmozpointerlockerror","onpause","onplay","onplaying","onprogress","onratechange","onreset","onscroll","onseeked","onseeking","onselect","onshow","onstalled","onsubmit","onsuspend","ontimeupdate","onvolumechange","onwaiting","onwheel","oncopy","oncut","onpaste","onbeforescriptexecute","onafterscriptexecute","indexedDB","mozIndexedDB","speechSynthesis"]
                        , ie: ["__IE_DEVTOOLBAR_CONSOLE_COMMAND_LINE","document","styleMedia","indexedDB","msIndexedDB","clientInformation","clipboardData","closed","defaultStatus","event","external","maxConnectionsPerServer","offscreenBuffering","onfocusin","onfocusout","onhelp","onmouseenter","onmouseleave","onmsgesturechange","onmsgesturedoubletap","onmsgestureend","onmsgesturehold","onmsgesturestart","onmsgesturetap","onmsinertiastart","onmspointercancel","onmspointerdown","onmspointerhover","onmspointermove","onmspointerout","onmspointerover","onmspointerup","screenLeft","screenTop","status","innerHeight","innerWidth","outerHeight","outerWidth","pageXOffset","pageYOffset","screen","screenX","screenY","applicationCache","frameElement","frames","history","length","location","name","navigator","onabort","onafterprint","onbeforeprint","onbeforeunload","onblur","oncanplay","oncanplaythrough","onchange","onclick","oncontextmenu","ondblclick","ondrag","ondragend","ondragenter","ondragleave","ondragover","ondragstart","ondrop","ondurationchange","onemptied","onended","onerror","onfocus","onhashchange","oninput","onkeydown","onkeypress","onkeyup","onload","onloadeddata","onloadedmetadata","onloadstart","onmessage","onmousedown","onmousemove","onmouseout","onmouseover","onmouseup","onmousewheel","onoffline","ononline","onpause","onplay","onplaying","onpopstate","onprogress","onratechange","onreadystatechange","onreset","onresize","onscroll","onseeked","onseeking","onselect","onstalled","onstorage","onsubmit","onsuspend","ontimeupdate","onunload","onvolumechange","onwaiting","opener","parent","self","top","window","animationStartTime","msAnimationStartTime","console","localStorage","performance","sessionStorage","addEventListener","dispatchEvent","removeEventListener","attachEvent","detachEvent","createPopup","execScript","item","moveBy","moveTo","msIsStaticHTML","msWriteProfilerMark","navigate","resizeBy","resizeTo","showHelp","showModelessDialog","toStaticHTML","scroll","scrollBy","scrollTo","getComputedStyle","alert","blur","close","confirm","focus","getSelection","matchMedia","msMatchMedia","open","postMessage","print","prompt","showModalDialog","toString","cancelAnimationFrame","msCancelRequestAnimationFrame","msRequestAnimationFrame","requestAnimationFrame","atob","btoa","clearInterval","clearTimeout","setInterval","setTimeout","clearImmediate","msClearImmediate","msSetImmediate","setImmediate"]
                        };
var jsBuiltins = [
  'undefined',
  'arguments',

  'eval',
  'isFinite',
  'isNaN',
  'parseFloat',
  'parseInt',
  'decodeURI',
  'decodeURIComponent',
  'encodeURI',
  'encodeURIComponent',
  'escape',
  'unescape',

  'Object',
  'Function',
  'Boolean',
  'Error',
  'EvalError',
  'InternalError',
  'RangeError',
  'ReferenceError',
  'StopIteration',
  'SyntaxError',
  'TypeError',
  'URIError',

  'String',
  'RegExp',
  'Number',
  'Date',
  'Array',
  'Float32Array',
  'Float64Array',
  'Int16Array',
  'Int32Array',
  'Int8Array',
  'Uint16Array',
  'Uint32Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'ArrayBuffer',
  'DataView',

  'JSON',
  'JSON.stringify',
  'JSON.parse',

  'Math',
  'Math.E',
  'Math.PI',
  'Math.LN2',
  'Math.LN10',
  'Math.LOG2E',
  'Math.LOG10E',
  'Math.SQRT1_2',
  'MAth.SQRT2',
  'Math.abs',
  'Math.acos',
  'Math.asin',
  'Math.atan',
  'Math.atan2',
  'Math.ceil',
  'Math.cos',
  'Math.exp',
  'Math.floor',
  'Math.imul',
  'Math.log',
  'Math.max',
  'Math.min',
  'Math.pow',
  'Math.random',
  'Math.round',
  'Math.sin',
  'Math.sqrt',
  'Math.tan'
];

for (var i in builtinsByBrowser) {
  builtinsByBrowser[i].forEach(function(n) {
    exports.builtins[n] = true;
  });
}
jsBuiltins.forEach(function(n) { exports.builtins[n] = true });

//
// To generate this list per browser, go to about:blank and run
//   (function() { var list = '['; for (var i in window) list += '"' + i + '",'; list = list.substr(0, list.length - 1); list += ']'; console.log(list); })();
//
