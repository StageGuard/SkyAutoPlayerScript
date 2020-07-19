"ui";
"use strict";
var emitter = events.emitter(threads.currentThread());
threads.start(function() {
	emitter.emit("evaluate", http.get("https://cdn.jsdelivr.net/gh/StageGuard/SkyAutoPlayerScript@" + http.get("https://gitee.com/stageguard/SkyAutoPlayerScript/raw/master/gitVersion").body.string() + "/source/SkyAutoplayer.js").body.string());
});
emitter.on('evaluate', function(s){eval(s);});