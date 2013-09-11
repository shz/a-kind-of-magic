exports.globalName = 'window';
exports.implicitTopLevel = 'window';
exports.builtins = {};

var builtinsByBrowser = { chrome: ["top","window","location","external","chrome","Intl","v8Intl","document","webkitNotifications","localStorage","sessionStorage","applicationCache","webkitStorageInfo","indexedDB","webkitIndexedDB","crypto","CSS","performance","console","devicePixelRatio","styleMedia","parent","opener","frames","self","defaultstatus","defaultStatus","status","name","length","closed","pageYOffset","pageXOffset","scrollY","scrollX","screenTop","screenLeft","screenY","screenX","innerWidth","innerHeight","outerWidth","outerHeight","offscreenBuffering","frameElement","clientInformation","navigator","toolbar","statusbar","scrollbars","personalbar","menubar","locationbar","history","screen","postMessage","close","blur","focus","ondeviceorientation","ontransitionend","onwebkittransitionend","onwebkitanimationstart","onwebkitanimationiteration","onwebkitanimationend","onsearch","onreset","onwaiting","onvolumechange","onunload","ontimeupdate","onsuspend","onsubmit","onstorage","onstalled","onselect","onseeking","onseeked","onscroll","onresize","onratechange","onprogress","onpopstate","onplaying","onplay","onpause","onpageshow","onpagehide","ononline","onoffline","onmousewheel","onmouseup","onmouseover","onmouseout","onmousemove","onmousedown","onmessage","onloadstart","onloadedmetadata","onloadeddata","onload","onkeyup","onkeypress","onkeydown","oninvalid","oninput","onhashchange","onfocus","onerror","onended","onemptied","ondurationchange","ondrop","ondragstart","ondragover","ondragleave","ondragenter","ondragend","ondrag","ondblclick","oncontextmenu","onclick","onchange","oncanplaythrough","oncanplay","onblur","onbeforeunload","onabort","getSelection","print","stop","open","showModalDialog","alert","confirm","prompt","find","scrollBy","scrollTo","scroll","moveBy","moveTo","resizeBy","resizeTo","matchMedia","requestAnimationFrame","cancelAnimationFrame","webkitRequestAnimationFrame","webkitCancelAnimationFrame","webkitCancelRequestAnimationFrame","atob","btoa","addEventListener","removeEventListener","captureEvents","releaseEvents","setTimeout","clearTimeout","setInterval","clearInterval","getComputedStyle","getMatchedCSSRules","webkitConvertPointFromPageToNode","webkitConvertPointFromNodeToPage","dispatchEvent","webkitRequestFileSystem","webkitResolveLocalFileSystemURL","openDatabase","TEMPORARY","PERSISTENT"]

                        };

for (var i in builtinsByBrowser) {
  builtinsByBrowser[i].forEach(function(n) {
    exports.builtins[n] = true;
  });
}

// To generate this list per browser, go to about:blank and run
//   (function() { var list = '['; for (var i in window) list += '"' + i + '",'; list = list.substr(0, list.length - 1); list += '];'; console.log(list); })();
