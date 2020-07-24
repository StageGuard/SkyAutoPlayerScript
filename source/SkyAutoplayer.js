"ui";
"use strict";
/*
	Sky Auto Player (Auto.js script)
	Copyright © 2020 StageGuard
	Contact : 
		(QQ: 1355416608)
		(Email: beamiscool@qq.com)
		(BaiduTieba@拐角处_等你)
		(Weibo@StageGuard)
		(CoolApk@StageGuard)
		(Twiter@stageguardcn)
	
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>
*/

const user_agreements = 
	"请仔细阅读以下使用须知！\n\n" + 
	"未充分测试，若遇到BUG，请酷安私信@StageGuard或在github中的StageGuard/SkyAutoPlayerScript新建Issue来反馈BUG！\n\n" + 
	"1. SkyAutoPlayer(以下简称\"本脚本\")是完全免费且开源的软件/脚本(https://github.com/StageGuard/SkyAutoPlayerScript)，禁止使用本脚本作为盈利用途！\n若你是从其他渠道购买获得的本脚本，那么就说明你被骗了！\n\n" + 
	"2. 本脚本仅可用作娱乐用途，请不要在正规场合使用本脚本(请自行体会\"正规场合\"是什么意思)，若因使用本脚本所出现了一些不友好的问题，与脚本作者StageGuard(以下简称\"作者\")无关。\n\n" + 
	"3. 脚本只能给你一时满足感而不能使你进步，请适当使用，只有真正的技术才是王道，才能使你感到快乐。\n\n" + 
	"4. 本脚本的发行遵守GPLv3协议，若你不了解协议内容，请访问 https://www.gnu.org/licenses 查看"
;

//Script global scope
const scope = this;
//activity context
const ctx = activity;

//global gui
var gui = null;
//SimpleListAdapter(gitee@projectXero)
var RhinoListAdapter;
//sheets manager
var sheetmgr = null;
//sheets player
var sheetplayer = null;
//load config & resources
var config = null;
//display density
scope.dp = context.getResources().getDisplayMetrics().density;
//show error;
const error = function(text) {
	console.show();
	console.error("SkyAutoPlayer发生了一个错误，请酷安私信@StageGuard或在github中的StageGuard/SkyAutoPlayerScript新建Issue来反馈这个BUG！\n详细信息：" + text);
};

//Asynchronous load script
threads.start(function() {
	
sheetmgr = {
	rootDir: android.os.Environment.getExternalStorageDirectory() + "/Android/data/com.Maple.SkyStudio/files/Sheet/",
	encoding: "utf-16le",
	
	cachedLocalSheetList: [],
	cachedOnlineSharedSheetInfoList: [],
	
	getLocalSheetList: function(forceRefresh, listener) {
		if(this.cachedLocalSheetList.length == 0 || forceRefresh) {
			this.__internal_fetchLocalSheets(listener);
		}
		return this.cachedLocalSheetList;
	},
	getOnlineSharedSheetInfoList: function(forceRefresh) {
		if(this.cachedOnlineSharedSheetInfoList.length == 0 || forceRefresh) {
			this.__internal_fetchOnlineSharedSheets();
		}
		return this.cachedOnlineSharedSheetInfoList;
	},
	
	downloadAndLoad: function(file, listener) {
		listener({status:1});
		var remoteHost = "https://gitee.com/stageguard/SkyAutoPlayerScript/raw/master/shared_sheets/" + file;
		var resp = http.get(remoteHost);
		if(resp.statusCode >= 200 && resp.statusCode < 300) {
			var sheet = files.join(this.rootDir, files.getNameWithoutExtension(file) + (function(length) {
				var string = "0123456789abcde";
				var stringBuffer = new java.lang.StringBuffer();
				for (var i = 0; i < length; i++) {
					stringBuffer.append(string.charAt(Math.round(Math.random() * (string.length - 1))));
				}
				return stringBuffer.toString();
			} (7)) + ".txt");
			files.create(sheet);
			files.writeBytes(sheet, resp.body.bytes());
			listener({status:2});
			var readable = files.open(sheet, "r", this.encoding);
			var parsed = eval(readable.read())[0];
			readable.close();
			parsed.songNotes = this.parseSongNote(parsed.songNotes);
			this.cachedLocalSheetList.push(parsed);
			listener({status:3});
		} else {
			listener({status:-1, msg: "获取 " + remoteHost + " 失败，原因：" + resp.statusMessage});
		}
	},
	
	__internal_fetchLocalSheets: function(listener) {
		var sheets = files.listDir(this.rootDir, function(name){return name.endsWith(".txt");});
		this.cachedLocalSheetList.length = 0;
		for(var i in sheets) {
			if(listener != null) listener(i);
			var readable = files.open(files.join(this.rootDir, sheets[i]), "r", this.encoding);
			var parsed = eval(readable.read())[0];
			readable.close();
			parsed.songNotes = this.parseSongNote(parsed.songNotes);
			parsed.fileName = sheets[i];
			this.cachedLocalSheetList.push(parsed);
		}
	},
	__internal_fetchOnlineSharedSheets: function() {
		var remoteHost = "https://gitee.com/stageguard/SkyAutoPlayerScript/raw/master/shared_sheets.json";
		var data = http.get(remoteHost).body.json();
		this.cachedOnlineSharedSheetInfoList = data.sheets;
	},
	
	parseSongNote: function(raw) {
		var r = [];
		var t_time = 0;
		var t_sets = [];
		for(var i in raw) {
			var key = Number(raw[i].key.replace(/^(\d)Key(\d{1,})$/, "$2"));
			if(raw[i].time != t_time) {
				r.push({time: t_time, keys: t_sets});
				t_sets = [];
				t_time = raw[i].time;
			}
			if(t_sets.indexOf(key) == -1) t_sets.push(key);
		}
		r.push({time: t_time, keys: t_sets});
		return r;
	},
	
	pitch_suggestion: [{
		name: "C",
		places: ["境遇", "墓土四龙图", "雨林终点神庙音乐结束后" ]
	}, {
		name: "D♭",
		places: ["云野八人升降梯", "雨林鱼骨图水母升起前" ]
	}, {
		name: "D",
		places: ["云野球形洞(通过云洞)", "雨林起点(不飞下去)",
				"霞谷终点(一堆蜡烛)", "墓土远古战场"]
	}, {
		name: "E♭",
		places: ["雨林第一个门后右边的拱形洞内", "墓土破旧神庙" ]
	}, {
		name: "E",
		places: ["重生之路", "暴风眼起始位置" ]
	}, {
		name: "F",
		places: ["雨林右隐藏图", "霞谷霞光城", "禁阁一楼"]
	}, {
		name: "G♭",
		places: ["雨林鱼骨图释放被困海蜇或鳐后"]
	}, {
		name: "G",
		places: ["雨林鱼骨图水母升起后"]
	}, {
		name: "A♭",
		places: ["霞谷终点观众席"]
	}, {
		name: "A",
		places: ["禁阁四楼"]
	}, {
		name: "B♭",
		places: ["雨林起点(不飞下去)右边空地"]
	}, {
		name: "B",
		places: ["雨林鱼骨图水母升起后", "霞谷任意赛道中", "禁阁二楼"]
	}],
};

sheetplayer = {
	
	notes: [],
	bpm: [],
	noteCount: 0,
	name: "",
	pitch: 0,
	
	currentNote: 0,
	playing: false,
	nextInterval: 0,
	
	thread: null,
	
	play: function(listener) {
		if(this.playing == true) return;
		this.playing = true;
		this.thread = threads.start(function() {
			while(
				sheetplayer.playing && sheetplayer.currentNote < sheetplayer.noteCount
			) {
				
				if((sheetplayer.currentNote + 1) == sheetplayer.noteCount) {
					sheetplayer.nextInterval = sheetplayer.notes[sheetplayer.currentNote].time - sheetplayer.notes[sheetplayer.currentNote - 1].time;
				} else {
					sheetplayer.nextInterval = sheetplayer.notes[sheetplayer.currentNote + 1].time - sheetplayer.notes[sheetplayer.currentNote].time;
				}
				threads.start(function() {
					var gestureMap = [];
					sheetplayer.notes[sheetplayer.currentNote].keys.map(function(e, i) {
						gestureMap.push([
							0, 25, 
							[config.values.key_coordinates[e][0], config.values.key_coordinates[e][1]], 
							[config.values.key_coordinates[e][0], config.values.key_coordinates[e][1]]
						]);
					});
					gestureMap = sheetplayer.toSource(gestureMap);
					eval("gestures(" + gestureMap.slice(1, gestureMap.length - 1) + ");");
				});
				if(listener != null) listener();
				java.lang.Thread.sleep(sheetplayer.nextInterval);
				sheetplayer.currentNote ++;
			}
		});
		
	},
	
	stop: function() {
		this.playing = false;
		this.currentNote = 0;
		this.thread = null;
	},
	pause: function() {
		this.playing = false;
	},
	
	setProgress: function(p) {
		this.currentNote = p;
	},
	
	setSheet: function(j) {
		if(this.thread != null) this.stop();
		this.thread = null;
		this.name = j.name;
		this.notes = j.songNotes;
		this.pitch = j.pitchLevel;
		this.bpm = j.bpm;
		this.noteCount = j.songNotes.length;
	},
	
	toSource: function(obj) {
		var _toJSON = function toJSON(x, lev) {
			var p = "", r, i;
			if (typeof x == "string") {
				return x;
			} else if (Array.isArray(x)) {
				r = new Array();
				for (i = 0; i < x.length; i++) r.push(toJSON(x[i], lev - 1));
				p = "[" + r.join(",") + "]";
			}  else {
				p = String(x);
			}
			return p;
		}
		return _toJSON(obj, 32);
	},
}

config = {
	
	_global_storage: null,
	
	values: {
		key_coordinates: [],
		skipRunScriptTip: false,
		skipOpenWindowTip: false,
		skipOnlineUploadSkip: false,
		currentVersion: 5,
		gitVersion: "",
	},
	
	bitmaps: {},
	
	init: function() {
		this._global_storage = storages.create("StageGuard:SkyAutoPlayer:Config");
		this.values.key_coordinates = this._global_storage.get("key_coordinates", this.values.key_coordinates);
		this.values.skipRunScriptTip = this._global_storage.get("skip_run_script_tip", this.values.skipRunScriptTip);
		this.values.skipOpenWindowTip = this._global_storage.get("skip_open_window_tip", this.values.skipOpenWindowTip);
		this.values.skipOnlineUploadSkip = this._global_storage.get("skip_online_upload_skip", this.values.skipOnlineUploadSkip);
	},
	
	save: function(key, value) {
		this._global_storage.put(key, value == null ? this.values[key] : this.values[key] = value);
	},
	
	checkVersion: function() {
		this.values.gitVersion = http.get("https://gitee.com/stageguard/SkyAutoPlayerScript/raw/master/gitVersion").body.string();
		//this.values.gitVersion = "b8b694aa74de3bccfb2e0f432b49a16e9c8846bc";
		var periodVersion = this._global_storage.get("version", this.values.currentVersion);
		var currentVersion = this.values.currentVersion;
		if(periodVersion < currentVersion) {
			try {
				var updateInfo = http.get("https://cdn.jsdelivr.net/gh/StageGuard/SkyAutoPlayerScript@" + this.values.gitVersion + "/update_log.txt");
				gui.dialogs.showConfirmDialog({
					title: "SkyAutoPlayer已更新",
					text: "当前版本: " + currentVersion + " ← " + periodVersion + "\n\n更新日志: \n" + updateInfo.body.string(),
					canExit: false,
					buttons: ["确认"]
				});
			} catch(e) {
				error("获取版本信息失败！详细信息：" + e);
			}
		}
		this.save("version", currentVersion);
	},
	
	fetchResources: function(listener) {
		var remoteHost = "https://cdn.jsdelivr.net/gh/StageGuard/SkyAutoPlayerScript@" + this.values.gitVersion + "/resources/";
		var resourceList = ["local.png", "online.png", "play.png", "pause.png", "refresh.png", "settings.png", "info.png", "download.png", "bin.png"];
		var localRootDir = android.os.Environment.getExternalStorageDirectory() + "/Documents/SkyAutoPlayer/";
		var downloadQueue = [];
		var tryCount = 1;
		try {
			files.createWithDirs(localRootDir);
			listener("加载资源中...");
			resourceList.map(function(element, i) {
				var absolutePath = files.join(localRootDir, element);
				if(files.exists(absolutePath)) {
					try {
						listener("加载资源中: " + element);
						config.bitmaps[files.getNameWithoutExtension(absolutePath)] = android.graphics.Bitmap.createBitmap(android.graphics.BitmapFactory.decodeFile(absolutePath));
					} catch(e) {
						listener("加载失败: " + element);
						downloadQueue.push(element);
					}
				} else {
					listener("无本地资源，进入下载队列: " + element);
					downloadQueue.push(element);
				}
			});
			if(downloadQueue.length == 0) {
				listener("资源加载完成");
				java.lang.Thread.sleep(1000); //为了方便看清
				return;
			}
			
			while (downloadQueue.length != 0 && tryCount <= 5) {
				listener("第" + tryCount + "次尝试下载资源，共需下载" + downloadQueue.length + "项资源");
				java.lang.Thread.sleep(1500); //为了方便看清
				var tmpQueue = [];
				for(var i in downloadQueue) tmpQueue.push(downloadQueue[i]);
				var iterator = 0;
				tmpQueue.map(function(element, i) {
					try {
						listener("下载资源中: " + element);
						var absolutePath = files.join(localRootDir, element);
						var resp = http.get(remoteHost + element);
						files.create(absolutePath);
						files.writeBytes(absolutePath, resp.body.bytes());
						config.bitmaps[files.getNameWithoutExtension(absolutePath)] = android.graphics.Bitmap.createBitmap(android.graphics.BitmapFactory.decodeFile(absolutePath));
						downloadQueue.splice(iterator, 1);
					} catch(e) {
						iterator++;
						listener("资源" + element + "下载/加载失败: " + e);
						java.lang.Thread.sleep(1000); //为了方便看清
					}
				});
				tryCount ++;
			}
			//处理结果
			if(tryCount > 5) {
				listener(new Error("以下资源下载失败：" + downloadQueue))
			} else {
				listener("资源下载完成");
				java.lang.Thread.sleep(1000); //为了方便看清
			}
		} catch(error) {
			listener(new Error("资源下载时发生了问题" + error));
		}
		
	},
	
}


RhinoListAdapter = (function() {
	var r = function(arr, vmaker, params, preload) {
		var src = arr.slice(),
			views = new Array(arr.length),
			dso = [],
			controller;
		if (preload) {
			src.forEach(function(e, i, a) {
				views[i] = vmaker(e, i, a, params);
			});
		}
		controller = new RhinoListAdapter.Controller(src, views, dso, vmaker, params, preload);
		return new android.widget.ListAdapter({
			getCount: function() {
				return src.length;
			},
			getItem: function(pos) {
				if (pos == -1) return controller;
				return src[pos];
			},
			getItemId: function(pos) {
				return pos;
			},
			getItemViewType: function(pos) {
				return 0;
			},
			getView: function(pos, convert, parent) {
				try {
					return views[pos] ? views[pos] : (views[pos] = vmaker(src[pos], parseInt(pos), src, params));
				} catch (e) {
					var a = new android.widget.TextView(ctx);
					a.setText(e + "\n" + e.stack);
					return a;
				}
			},
			getViewTypeCount: function() {
				return 1;
			},
			hasStableIds: function() {
				return true;
			},
			isEmpty: function() {
				return src.length === 0;
			},
			areAllItemsEnabled: function() {
				return true;
			},
			isEnabled: function(pos) {
				return pos >= 0 && pos < src.length;
			},
			registerDataSetObserver: function(p) {
				if (dso.indexOf(p) >= 0) return;
				dso.push(p);
			},
			unregisterDataSetObserver: function(p) {
				var i = dso.indexOf(p);
				if (p >= 0) dso.splice(i, 1);
			}
		});
	}
	r.Controller = function(src, views, dso, vmaker, params, preload) {
		this.src = src;
		this.views = views;
		this.dso = dso;
		this.vmaker = vmaker;
		this.params = params;
		this.preload = preload;
	}
	r.Controller.prototype = {
		notifyChange: function() {
			this.dso.forEach(function(e) {
				if (e) e.onChanged();
			});
		},
		notifyInvalidate: function() {
			this.dso.forEach(function(e) {
				if (e) e.onInvalidated();
			});
		},
		add: function(e, isInv) {
			this.src.push(e);
			if (this.preload) this.views.push(this.vmaker(e, this.src.length - 1, this.src, this.params));
			if (isInv) this.notifyChange();
		},
		concat: function(arr) {
			arr.forEach(function(e) {
				this.src.push(e)
				if (this.preload) this.views.push(this.vmaker(e, this.src.length - 1, this.src, this.params));
			}, this);
			this.notifyChange();
		},
		filter: function(f, thisArg) {
			var i;
			for (i = 0; i < this.src.length; i++) {
				if (!f.call(thisArg, this.src[i], i, this.src)) {
					this.src.splice(i, 1);
					this.views.splice(i, 1);
					i--;
				}
			}
			this.notifyChange();
		},
		forEach: function(f, thisArg) {
			var i;
			for (i in this.src) {
				if (f.call(thisArg, this.src[i], i, this.src)) {
					this.views[i] = this.vmaker(this.src[i], i, this.src, this.params);
				}
			}
			this.notifyChange();
		},
		get: function(i) {
			if (typeof(i) == "number") {
				return this.src[i];
			} else {
				return this.src;
			}
		},
		insert: function(e, i, respawn) {
			this.src.splice(i, 0, e);
			if (respawn) {
				this.respawnAll();
			} else {
				this.views.splice(i, 0, this.preload ? this.vmaker(e, i, this.src, this.params) : null);
			}
			this.notifyChange();
		},
		getCount: function() {
			return this.src.length;
		},
		remove: function(e, respawn) {
			var i;
			for (i = this.src.length; i >= 0; i--) {
				if (this.src[i] != e) continue;
				this.src.splice(i, 1);
				this.views.splice(i, 1);
			}
			if (respawn) this.respawnAll();
			this.notifyChange();
		},
		removeByIndex: function(i, respawn) {
			this.src.splice(i, 1);
			this.views.splice(i, 1);
			if (respawn) this.respawnAll();
			this.notifyChange();
		},
		removeAll: function(respawn) {
			this.src.length = 0;
			this.views.length = 0;
			if (respawn) this.respawnAll();
		},
		replace: function(e, i) {
			this.src[i] = e;
			this.views[i] = this.preload ? this.vmaker(e, i, this.src, this.params) : null;
			this.notifyChange();
		},
		respawn: function(i) {
			this.views[i] = this.vmaker(this.src[i], i, this.src, this.params);
			this.notifyChange();
		},
		respawnAll: function(i) {
			this.src.forEach(function(e, i, a) {
				this.views[i] = this.vmaker(e, i, a, this.params);
			}, this);
			this.notifyChange();
		},
		slice: function(start, end) {
			return Array.prototype.slice.apply(this.src, arguments);
		},
		splice: function(index, len) {
			var i, z = [];
			for (i in arguments) z.push(arguments[i]);
			var r = Array.prototype.splice.apply(this.src, z);
			for (i = 2; i < z.length; i++) {
				z[i] = this.preload ? this.vmaker(z[i], i - 2 + index, this.src, this.params) : null;
			}
			Array.prototype.splice.apply(this.views, z);
			this.notifyChange();
		},
		getArray: function() {
			return this.src.slice();
		},
		setArray: function(a) {
			this.views.length = this.src.length = 0;
			for (var i in a) this.src.push(a[i]);
			this.views.length = this.src.length;
			if (this.preload) {
				this.respawnAll();
			} else {
				this.notifyChange();
			}
		},
	}
	r.getController = function(adapter) {
		var r = adapter.getItem(-1);
		r.self = adapter;
		return r;
	}
	return r;
}());

gui = {
	
	//run in ui thread
	run: function(obj) {
		ctx.runOnUiThread(new java.lang.Runnable({run:obj}));
	},
	
	winMgr: ctx.getSystemService(android.content.Context.WINDOW_SERVICE),
	
	config: {
		colors: {
			background: android.graphics.Color.parseColor("#212121"),
			text: android.graphics.Color.WHITE,
			dark_text: android.graphics.Color.BLACK,
			sec_text: android.graphics.Color.parseColor("#7B7B7B"),
		},
	},
	
	utils: {
		value_animation: function self(type, start, end, duration, interpolator, onUpdate) {
			self.anim = android.animation.ValueAnimator["of" + type](start, end);
			self.anim.setDuration(duration);
			self.anim.setInterpolator(interpolator);
			self.anim.addUpdateListener(new android.animation.ValueAnimator.AnimatorUpdateListener({
				onAnimationUpdate: onUpdate
			}));
			self.anim.start();
		},
		ripple_drawable: function(width, height, customshape) {
			var rs = null;
			switch(customshape) {
				case "oval": rs = new android.graphics.drawable.shapes.OvalShape(); break;
				case "rect": rs = new android.graphics.drawable.shapes.RectShape(); break;
				case "roundrect": rs = new android.graphics.drawable.shapes.RoundRectShape(
					[arguments[3], arguments[3], arguments[3], arguments[3], arguments[3], arguments[3], arguments[3], arguments[3]], 
					new android.graphics.RectF(0, 0, width, height), 
					null
				); break;
				default: rs = new android.graphics.drawable.shapes.OvalShape(); break;
			}
			rs.draw(new android.graphics.Canvas(), new android.graphics.Paint());
			var mask = new android.graphics.drawable.ShapeDrawable(rs);
			var gradientDrawable = new android.graphics.drawable.GradientDrawable();
			gradientDrawable.setColor(android.graphics.Color.TRANSPARENT);
			if (customshape == "roundrect") gradientDrawable.setCornerRadius(arguments[3]);
			gradientDrawable.setStroke(dp * 10, android.graphics.Color.TRANSPARENT);
			return new android.graphics.drawable.RippleDrawable(android.content.res.ColorStateList.valueOf(android.graphics.Color.argb(1, 0, 0, 0)), gradientDrawable, mask);
		},
	},
	
	dialogs: {
		showDialog: function(layout, width, height, onDismiss, canExit) {
					var frame, trans, params;
					frame = new android.widget.FrameLayout(ctx);
					frame.setBackgroundColor(android.graphics.Color.argb(0x80, 0, 0, 0));
					frame.setOnTouchListener(new android.view.View.OnTouchListener({
						onTouch: function touch(v, e) {
							try {
								if (e.getAction() == e.ACTION_DOWN && canExit) {
									frame.setEnabled(false);
									frame.setClickable(false);
									gui.utils.value_animation("Float", 1.0, 0, 75, new android.view.animation.LinearInterpolator(), function(anim) {
										frame.setAlpha(anim.getAnimatedValue());
										if(anim.getAnimatedValue() == 0) {
											if(onDismiss != null) onDismiss(frame);
											gui.winMgr.removeView(frame);
										}
									});
								}
								return false;
							} catch (e) {
								error(e);
								return false;
							}
						}
					}));
					layout.setLayoutParams(new android.widget.FrameLayout.LayoutParams(width, height, android.view.Gravity.CENTER));
					layout.getLayoutParams().setMargins(20 * dp, 20 * dp, 20 * dp, 20 * dp);
					frame.addView(layout);
					gui.utils.value_animation("Float", 0, 1, 75, new android.view.animation.LinearInterpolator(), function(anim) {
						frame.setAlpha(anim.getAnimatedValue());
					});
					layout.setElevation(16 * dp);
					params = new android.view.WindowManager.LayoutParams();
					params.type = android.view.WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
					if(!canExit) params.flags = android.view.WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;
					params.format = android.graphics.PixelFormat.TRANSLUCENT;
					params.width = -1;
					params.height = -1;
					gui.winMgr.addView(frame, params);
					return frame;
				},
				showProgressDialog: function self(f, isNoText, canExit) {
					self.init = function(o) {
						gui.run(function() {
							try {
								var layout = o.layout = new android.widget.LinearLayout(ctx);
								layout.setOrientation(android.widget.LinearLayout.VERTICAL);
								layout.setPadding(dp * 10, isNoText ? dp * 5 : dp * 10, dp * 10, isNoText ? dp * 5 : 0);
								layout.setBackgroundColor(gui.config.colors.background);
								if (!isNoText) {
									var text = o.text = new android.widget.TextView(ctx);
									text.setLayoutParams(new android.widget.FrameLayout.LayoutParams(-2, -2));
									text.setTextColor(gui.config.colors.text);
									text.setPadding(dp * 10, dp * 10, dp * 10, dp * 10);
									layout.addView(text);
								}
								var progress = o.progress = android.widget.ProgressBar(ctx, null, android.R.attr.progressBarStyleHorizontal);
								layout.addView(progress);
								o.popup = gui.dialogs.showDialog(layout, -2, -2, null, canExit);
							} catch (e) {
								error(e + " → " + e.lineNumber);
							}
						})
					}, self.controller = {
						setText: function(s) {
							if (isNoText) return;
							var o = this;
							gui.run(function() {
								try {
									o.text.setText(s);
								} catch (e) {
									error(e + " → " + e.lineNumber);
								}
							});
						},
						setIndeterminate: function(b) {
							var o = this;
							gui.run(function() {
								try {
									o.progress.setIndeterminate(b);
								} catch (e) {
									error(e + " → " + e.lineNumber);
								}
							});
						},
						setMax: function(max) {
							var o = this;
							gui.run(function() {
								try {
									o.progress.setMax(max);
								} catch (e) {
									error(e + " → " + e.lineNumber);
								}
							});
						},
						setProgress: function(prog) {
							var o = this;
							gui.run(function() {
								try {
									if (!o.progress.isIndeterminate()) {
										o.progress.setProgress(prog, true);
									}
								} catch (e) {
									error(e + " → " + e.lineNumber);
								}
							});
						},
						close: function() {
							var o = this;
							gui.run(function() {
								try {
									gui.utils.value_animation("Float", 1, 0, 75, new android.view.animation.LinearInterpolator(), function(anim) {
										o.popup.setAlpha(anim.getAnimatedValue());
										if(anim.getAnimatedValue() == 1) gui.winMgr.removeView(o.popup);
									});
								} catch (e) {
									error(e + " → " + e.lineNumber);
								}
							});
						},
						async: function(f) {
							var o = this;
							var t = threads.start(function() {
								try {
									f(o);
								} catch (e) {
									error(e + " → " + e.lineNumber);
								}
							});
						}
					};
					var o = Object.create(self.controller);
					self.init(o);
					if (f) o.async(f);
					return o;
				},
				showConfirmDialog: function(s) {
					gui.run(function() {
						try {
							var scr, layout, title, text, skip, onClick, dialog;
							scr = new android.widget.ScrollView(ctx);
							scr.setBackgroundColor(gui.config.colors.background);
							layout = new android.widget.LinearLayout(ctx);
							layout.setLayoutParams(new android.widget.FrameLayout.LayoutParams(-2, -2));
							layout.setOrientation(android.widget.LinearLayout.VERTICAL);
							layout.setPadding(15 * dp, 15 * dp, 15 * dp, 5 * dp);
							if (s.title) {
								title = new android.widget.TextView(ctx);
								title.setText(s.title);
								title.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
								title.setPadding(0, 0, 0, 10 * dp);
								title.setTextColor(gui.config.colors.text);
								title.setTextSize(16);
								layout.addView(title);
							}
							if (s.text) {
								text = new android.widget.TextView(ctx);
								text.setText(s.text);
								text.setPadding(0, 0, 0, 10 * dp);
								text.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
								text.setTextColor(gui.config.colors.sec_text);
								text.setTextSize(14);
								layout.addView(text);
							}
							if (s.skip) {
								skip = new android.widget.CheckBox(ctx);
								//skip.setChecked(Boolean(s.canSkip));
								skip.setLayoutParams(android.widget.LinearLayout.LayoutParams(-2, -2, 0));
								skip.getLayoutParams().setMargins(0, 0, 0, 10 * dp)
								skip.setText("不再提示");
								skip.setTextColor(gui.config.colors.sec_text)
								layout.addView(skip);
							}
							onClick = function(i) {
								if (s.skip) s.skip(skip.isChecked());
								if (s.callback && s.callback(i)) return;
							}
							var closed = false;
							s.buttons.map(function(e, i) {
								var b = android.widget.TextView(ctx);
								b.setId(i);
								b.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, -2));
								b.setText(String(e));
								b.setGravity(android.view.Gravity.CENTER);
								b.setPadding(10 * dp, 10 * dp, 10 * dp, 10 * dp);
								b.setTextColor(gui.config.colors.text);
								b.setTextSize(14);
								b.measure(0, 0);
								b.setBackgroundDrawable(gui.utils.ripple_drawable(b.getMeasuredWidth(), b.getMeasuredHeight(), "rect"));
								b.setOnClickListener(new android.view.View.OnClickListener({
									onClick: function f(v) {
										try {if(closed != true) {
											onClick(v.getId());
											closed = true;
											gui.winMgr.removeView(dialog);
											return true;
										}} catch (e) {
											error(e + " → " + e.lineNumber);
										}
									}
								}));
								layout.addView(b);
								return b;
							});
							scr.addView(layout);
							dialog = gui.dialogs.showDialog(scr, -2, -2, null, (s.canExit != true ? false : true));
						} catch (e) {
							error(e + " → " + e.lineNumber);
						}
					})
				},
				showOperateDialog: function self(s, callback, canExit) {
					gui.run(function() {
						try {
							var frame, list, dialog;
							if (!self.adapter) {
								self.adapter = function(e) {
									e.view = new android.widget.LinearLayout(ctx);
									e.view.setOrientation(android.widget.LinearLayout.VERTICAL);
									e.view.setPadding(15 * dp, 15 * dp, 15 * dp, 15 * dp);
									e.view.setLayoutParams(new android.widget.AbsListView.LayoutParams(-1, -2));
									e._title = new android.widget.TextView(ctx);
									e._title.setText(e.text);
									e._title.setGravity(android.view.Gravity.CENTER | android.view.Gravity.LEFT);
									e._title.setFocusable(false);
									e._title.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, -2));
									e._title.setTextSize(16);
									e._title.setTextColor(gui.config.colors.text);
									e.view.addView(e._title);
									if (e.description) {
										e._description = new android.widget.TextView(ctx);
										e._description.setText(e.description);
										e._description.setPadding(0, 3 * dp, 0, 0);
										e._description.setLayoutParams(android.widget.LinearLayout.LayoutParams(-1, -2));
										e._description.setTextSize(14);
										e._description.setTextColor(gui.config.colors.sec_text);
										e.view.addView(e._description);
									}
									return e.view;
								}
							}
							frame = new android.widget.FrameLayout(ctx);
							frame.setPadding(5 * dp, 5 * dp, 5 * dp, 5 * dp);
							frame.setBackgroundColor(gui.config.colors.background);
							list = new android.widget.ListView(ctx);
							list.setLayoutParams(new android.widget.FrameLayout.LayoutParams(-1, -2));
							list.setDividerHeight(0);
							list.setAdapter(new RhinoListAdapter(s, self.adapter));
							list.setOnItemClickListener(new android.widget.AdapterView.OnItemClickListener({
								onItemClick: function(parent, view, pos, id) {
									try {
										if (callback && !callback(pos, s[pos])) gui.utils.value_animation("Float", 1, 0, 75, new android.view.animation.LinearInterpolator(), function(anim) {
											dialog.setAlpha(anim.getAnimatedValue());
											if(anim.getAnimatedValue() == 1) gui.winMgr.removeView(dialog);
										});
										return true;
									} catch (e) {
										error(e + " → " + e.lineNumber);
									}
								}
							}));
							frame.addView(list);
							dialog = gui.dialogs.showDialog(frame, -1, -2, null, (canExit != true ? (typeof(canExit) != "boolean" ? true : false) : true));
						} catch (e) {
							error(e + " → " + e.lineNumber);
						}
					})
				},
	},
	
	
	main: {

		//window 
		window_width: 325,
		window_height: 275,
		status_bar_height: 32, 
		navigation_bar_height : 50,
		navigation_bar_updown_margin: 2.5,
		
		//_global_main_popup: null,
		_global_base: null,
		_global_content_container: null, 
		_global_content: null,
		_global_title: null,
		_global_navigation_bar: null,
		_global_close: null,
		
		isShowing: false,
		current_navigation_selection: NaN,
		func_showing: false,
		
		cx: dp * 10,
		cy: dp * 10,
		
		views: [],
		
		addPage: function(j) {
			for(var i in gui.main.views) {
				if(gui.main.views[i].index == j.index) {
					throw new Error("Index " + j.index + " is already exists, title is " + gui.main.views[i].title);
					return;
				} else if (j.index > 3){
					throw new Error("Page num should be lower than 4.");
					return;
				}
			}
			if(j instanceof Object) gui.main.views.push(j);
		},
		
		getPage: function(index) {
			for(var i in gui.main.views) {
				if(gui.main.views[i].index == index) {
					return gui.main.views[i];
				}
			}
		},
		
		removePage: function(index) {
			for(var i in gui.main.views) {
				if(gui.main.views[i].index == index) {
					gui.main.views.splice(i, 1);
				}
			}
		},
		
		show: function(index) {
			var valid = false;
			for(var i in gui.main.views) {
				if(gui.main.views[i].index == index) {
					gui.main.__internal_show(gui.main.views[i]);
					valid = true;
				}
			}
			if(valid == false) {
				throw new Error("Index " + index + " referenced a invalid view.");
				return;
			}
		},
		
		getPageInfo: function(index) {
			for(var i in gui.main.views) {
				if(gui.main.views[i].index == index) {
					return gui.main.views[i];
				}
			}
		},
		
		//internal methods
		__internal_show: function s(content) { gui.run(function(){
			s.index = content.index;
			s.initial = false;
			if(!gui.main.isShowing) { //create a new window and show content view
				gui.main._global_base = new android.widget.LinearLayout(ctx);
				gui.main._global_base.setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
				gui.main._global_base.setOrientation(android.widget.LinearLayout.VERTICAL);
				gui.main._global_base.setLayoutParams(new android.widget.LinearLayout.LayoutParams(dp * gui.main.window_width, dp * gui.main.window_height));
				gui.main._global_base.setBackgroundColor(gui.config.colors.background);
				
				s.statusBar = new android.widget.RelativeLayout(ctx);
				s.statusBar.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-1, dp * gui.main.status_bar_height));
				s.statusBar.setBackgroundColor(gui.config.colors.background);
				s.statusBar.setElevation(10 * dp);
				
				gui.main._global_title = new android.widget.TextView(ctx);
				gui.main._global_title.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
				gui.main._global_title.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -1));
				gui.main._global_title.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
				gui.main._global_title.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
				if(content.title != null) gui.main._global_title.setText(content.title);
				gui.main._global_title.setTextSize(15);
				gui.main._global_title.setShadowLayer(dp * 5, 0, 0, android.graphics.Color.BLACK);
				gui.main._global_title.setTextColor(gui.config.colors.text);
				gui.main._global_title.setOnTouchListener(new android.view.View.OnTouchListener({
					onTouch: function onTouchFunction(view, event) {
						switch (event.getAction()) {
							case event.ACTION_MOVE:
								onTouchFunction.lp = gui.main._global_base.getLayoutParams();
								onTouchFunction.lp.x = gui.main.cx = s.x = event.getRawX() + onTouchFunction.offsetX;
								onTouchFunction.lp.y = gui.main.cy = s.y = event.getRawY() + onTouchFunction.offsetY;
								gui.winMgr.updateViewLayout(gui.main._global_base, onTouchFunction.lp);
							break;
							case event.ACTION_DOWN:
								onTouchFunction.offsetX = s.x - event.getRawX();
								onTouchFunction.offsetY = s.y - event.getRawY();
							break;
							default: 
							return false;
						}
						return true;
					},
				}));
				s.statusBar.addView(gui.main._global_title);
				
				gui.main._global_close = new android.widget.TextView(ctx);
				gui.main._global_close.setId(23);
				gui.main._global_close.setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
				gui.main._global_close.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * gui.main.status_bar_height, dp * gui.main.status_bar_height));
				gui.main._global_close.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);
				gui.main._global_close.measure(0, 0);
				gui.main._global_close.setBackgroundDrawable(gui.utils.ripple_drawable(gui.main._global_close.getMeasuredWidth(), gui.main._global_close.getMeasuredHeight(), "rect"));
				gui.main._global_close.setText("×");
				gui.main._global_close.setTextSize(22);
				gui.main._global_close.setTextColor(gui.config.colors.text);
				gui.main._global_close.setOnClickListener(new android.view.View.OnClickListener({
					onClick: function() {
						gui.main.__internal_dismiss();
						gui.suspension.show();
					}
				}));
				s.func = new android.widget.ImageView(ctx);
				s.func.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * gui.main.status_bar_height, dp * gui.main.status_bar_height));
				s.func.setPadding(dp * 1, dp * 1, dp * 1, dp * 1);
				s.func.getLayoutParams().addRule(android.widget.RelativeLayout.LEFT_OF, 23);
				s.func.measure(0, 0);
				s.func.setBackgroundDrawable(gui.utils.ripple_drawable(s.func.getMeasuredWidth(), s.func.getMeasuredHeight(), "rect"));
				s.func.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
				s.statusBar.addView(s.func);
				s.statusBar.addView(gui.main._global_close);
				
				gui.main._global_base.addView(s.statusBar);
				
				gui.main._global_content_container = new android.widget.RelativeLayout(ctx);
				gui.main._global_content_container.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, dp * (gui.main.window_height - gui.main.status_bar_height - gui.main.navigation_bar_height)));
				gui.main._global_content_container.setBackgroundColor(gui.config.colors.background);
				
				s._content_height = dp * (gui.main.window_height - gui.main.status_bar_height - gui.main.navigation_bar_height);
				gui.main._global_content_container.measure(0, 0);
				s._content_width = gui.main._global_content_container.getMeasuredWidth();
				
				s["contentViewLayout" + s.index] = new android.widget.LinearLayout(ctx);
				s["contentViewLayout" + s.index].setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, s._content_height));
				s["contentViewLayout" + s.index].setId(s.index);
				
				if(content.view != null) {
					s.initial = true;
					var v = content.view(s);
					v.setId(15);
					s["contentViewLayout" + s.index].addView(v);
				}
				gui.main._global_content_container.addView(s["contentViewLayout" + s.index]);
				
				gui.main._global_base.addView(gui.main._global_content_container);
				
				gui.main._global_navigation_bar = new android.widget.LinearLayout(ctx);
				gui.main._global_navigation_bar.setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
				gui.main._global_navigation_bar.setOrientation(android.widget.LinearLayout.HORIZONTAL);
				gui.main._global_navigation_bar.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, dp * (gui.main.navigation_bar_height + gui.main.navigation_bar_updown_margin * 2)));
				gui.main._global_navigation_bar.setBackgroundColor(gui.config.colors.background);
				
				gui.main.__internal_genNavigationList(s);
				
				gui.main._global_base.addView(gui.main._global_navigation_bar);
				
				//ui.setContentView(gui.main._global_base);
				/*gui.main._global_main_popup = new android.widget.PopupWindow(ctx);
				gui.main._global_main_popup.setWindowLayoutType(android.os.Build.VERSION.SDK_INT >= 26 ? android.view.WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY : android.view.WindowManager.LayoutParams.TYPE_PHONE);
				gui.main._global_main_popup.setFocusable(false);
				gui.main._global_main_popup.setOutsideTouchable(false);
				gui.main._global_main_popup.setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(0));
				gui.main._global_main_popup.setContentView(gui.main._global_base);
				gui.main._global_main_popup.setWidth(gui.main.window_width * dp);
				gui.main._global_main_popup.setHeight((gui.main.window_height + gui.main.navigation_bar_updown_margin * 2) * dp);
				gui.main._global_main_popup.showAtLocation(ctx.getWindow().getDecorView(), 0, s.x = gui.main.cx, s.y = gui.main.cy);*/
				
				s._winParams = new android.view.WindowManager.LayoutParams();
				s._winParams.type = android.view.WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
				s._winParams.flags = android.view.WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;
				s._winParams.format = android.graphics.PixelFormat.TRANSLUCENT;
				s._winParams.width = gui.main.window_width * dp;
				s._winParams.height = (gui.main.window_height + gui.main.navigation_bar_updown_margin * 2) * dp;
				s._winParams.x = s.x = gui.main.cx;
				s._winParams.y = s.y = gui.main.cy;
				gui.winMgr.addView(gui.main._global_base, s._winParams);
				
				gui.main.isShowing = true;
				
				gui.utils.value_animation("Float", 0, 1.0, 200, new android.view.animation.LinearInterpolator(), function(anim) {
					gui.main._global_base.setAlpha(anim.getAnimatedValue());
				});
				gui.utils.value_animation("Float", 0, 1.0, 400 , new android.view.animation.LinearInterpolator(), function(anim) {
					gui.main._global_content_container.setAlpha(anim.getAnimatedValue());
					gui.main._global_title.setAlpha(anim.getAnimatedValue());
				});
				
				if(s._anim != null) s._anim();
				if(gui.main.views[s.index].update != null) gui.main.views[s.index].update(s);
			} else { //window is showing, change content view
				if(gui.main.current_navigation_selection == s.index) return;
				if(content.title != null) gui.main._global_title.setText(content.title);
				
				if(!/^android/.test(String(gui.main._global_content_container.findViewById(s.index)))) {
					s["contentViewLayout" + s.index] = new android.widget.LinearLayout(ctx);
					s["contentViewLayout" + s.index].setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-1, dp * (gui.main.window_height - gui.main.status_bar_height - gui.main.navigation_bar_height)));
					s["contentViewLayout" + s.index].setId(s.index);
					if(content.view != null) {
						s.initial = true;
						var v = content.view(s);
						v.setId(15);
						s["contentViewLayout" + s.index].addView(v);
						gui.main._global_content_container.addView(s["contentViewLayout" + s.index]);
					}
				}
				var cid = gui.main.current_navigation_selection;
				var tid = s.index;
				gui.utils.value_animation("Float", 0, 1.0, 200, new android.view.animation.DecelerateInterpolator(), function(anim) {
					gui.main._global_content_container.findViewById(cid).findViewById(15).setAlpha(1.0 - anim.getAnimatedValue());
					gui.main._global_content_container.findViewById(tid).findViewById(15).setAlpha(anim.getAnimatedValue());
					if(anim.getAnimatedValue() == 1.0) {
						gui.main._global_content_container.findViewById(cid).findViewById(15).setEnabled(false);
						gui.main._global_content_container.findViewById(cid).findViewById(15).setClickable(false);
						gui.main._global_content_container.findViewById(cid).setEnabled(false);
						gui.main._global_content_container.findViewById(cid).setClickable(false); //飞了
						gui.main._global_content_container.findViewById(cid).setZ(0);
						gui.main._global_content_container.findViewById(tid).findViewById(15).setEnabled(true);
						gui.main._global_content_container.findViewById(tid).findViewById(15).setClickable(true);
						gui.main._global_content_container.findViewById(tid).setEnabled(true);
						gui.main._global_content_container.findViewById(tid).setClickable(true);
						gui.main._global_content_container.findViewById(tid).setZ(1); //回来
					}
				});
				gui.utils.value_animation("Float", 0, 1.0, 200, new android.view.animation.LinearInterpolator(), function(anim) {
					gui.main._global_title.setAlpha(anim.getAnimatedValue());
				});
				
				
				gui.main.__internal_changeNavigationStatus(s.index);
				if(gui.main.views[tid].update != null) gui.main.views[tid].update(s);
			}
			if(gui.main.views[s.index].func == null) {
				if(gui.main.func_showing) {
					gui.main.func_showing = false;
					gui.utils.value_animation("Float", 0, 1, 300 , new android.view.animation.DecelerateInterpolator(), function(anim) {
						s.func.setTranslationX(anim.getAnimatedValue() * s.func.getMeasuredWidth());
						s.func.setAlpha(1 - anim.getAnimatedValue());
						if(anim.getAnimatedValue() == 1.0) {
							s.func.setClickable(false);
							s.func.setEnabled(false);
							s.func.setOnClickListener(new android.view.View.OnClickListener({
								onClick: function() {}
							}));
							s.func.setImageBitmap(android.graphics.Bitmap.createBitmap(1, 1, android.graphics.Bitmap.Config.ARGB_8888));
						}
					});
				}
			} else {
				if(gui.main.func_showing) {
					s.func.setOnClickListener(new android.view.View.OnClickListener({
						onClick: function() {gui.main.views[s.index].func(s)}
					}));
					s.func.setImageBitmap(gui.main.views[s.index].func_icon);
					gui.utils.value_animation("Float", 0, 1, 200 , new android.view.animation.DecelerateInterpolator(), function(anim) {
						s.func.setAlpha(anim.getAnimatedValue());
					});
				} else {
					gui.main.func_showing = true;
					s.func.setClickable(true);
					s.func.setEnabled(true);
					s.func.setOnClickListener(new android.view.View.OnClickListener({
						onClick: function() {gui.main.views[s.index].func(s)}
					}));
					s.func.setImageBitmap(gui.main.views[s.index].func_icon);
					gui.utils.value_animation("Float", 1, 0, 300 , new android.view.animation.DecelerateInterpolator(), function(anim) {
						s.func.setTranslationX(anim.getAnimatedValue() * s.func.getMeasuredWidth());
						s.func.setAlpha(1 - anim.getAnimatedValue());
					});
				}
			}
			gui.main.current_navigation_selection = s.index;
		})},
		__internal_genNavigationList: function(s) { gui.run(function(){
			if(gui.main._global_navigation_bar == null) return;
			s.__2x_navigation_padding = (gui.main.window_width - gui.main.views.length * gui.main.navigation_bar_height) / (gui.main.views.length);
			for(var i in gui.main.views) {
				s["navigationBtn" + i] = new android.widget.LinearLayout(ctx);
				s["navigationBtn" + i].setId(i);
				s["navigationBtn" + i].setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
				s["navigationBtn" + i].setOrientation(android.widget.LinearLayout.VERTICAL);
				s["navigationBtn" + i].setLayoutParams(new android.widget.LinearLayout.LayoutParams(dp * gui.main.navigation_bar_height, dp * gui.main.navigation_bar_height));
				s["navigationBtn" + i].setBackgroundDrawable(gui.utils.ripple_drawable(0, 0, "roundrect", dp * 2));
				switch (i) {
					case 0: s["navigationBtn" + i].getLayoutParams().setMargins(s.__2x_navigation_padding, dp * gui.main.navigation_bar_updown_margin, s.__2x_navigation_padding / 2, dp * gui.main.navigation_bar_updown_margin); break;
					case (gui.main.views.length - 1): s["navigationBtn" + i].getLayoutParams().setMargins(s.__2x_navigation_padding / 2, dp * gui.main.navigation_bar_updown_margin, s.__2x_navigation_padding, dp * gui.main.navigation_bar_updown_margin); break;
					default: s["navigationBtn" + i].getLayoutParams().setMargins(s.__2x_navigation_padding / 2, dp * gui.main.navigation_bar_updown_margin, s.__2x_navigation_padding / 2, dp * gui.main.navigation_bar_updown_margin); break;
				}
				s["navigationBtn" + i].setOnClickListener(new android.view.View.OnClickListener({
					onClick: function(view) {
						gui.main.__internal_show(gui.main.views[Number(view.getId())]);
						gui.main.current_navigation_selection = Number(view.getId());
					}
				}));
				
				s["navigationBtnText" + i] = new android.widget.TextView(ctx);
				s["navigationBtnText" + i].setId(12);
				s["navigationBtnText" + i].setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
				s["navigationBtnText" + i].setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, -2));
				s["navigationBtnText" + i].setText(gui.main.views[i].navigation_title);
				s["navigationBtnText" + i].setTextSize(12);
				s["navigationBtnText" + i].setShadowLayer(dp, 0, 0, android.graphics.Color.BLACK);
				s["navigationBtnText" + i].setTextColor(s.index == gui.main.views[i].index ? gui.config.colors.text : gui.config.colors.sec_text);
				
				s["navigationBtnImg" + i] = new android.widget.ImageView(ctx);
				s["navigationBtnImg" + i].setId(14);
				s["navigationBtnImg" + i].setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
				if(gui.main.views[i].navigation_icon != null) s["navigationBtnImg" + i].setImageBitmap(gui.main.views[i].navigation_icon);
				s.__navigationBtnImgHeight = (function() {
					s["navigationBtnText" + i].measure(0, 0);
					return dp * gui.main.navigation_bar_height - s["navigationBtnText" + i].getMeasuredHeight();
				}());
				s["navigationBtnImg" + i].setLayoutParams(new android.widget.LinearLayout.LayoutParams(s.__navigationBtnImgHeight, s.__navigationBtnImgHeight));
				
				s["navigationBtn" + i].addView(s["navigationBtnImg" + i]);
				s["navigationBtn" + i].addView(s["navigationBtnText" + i]);
				gui.main._global_navigation_bar.addView(s["navigationBtn" + i]);
			}
		})},
		__internal_changeNavigationStatus: function(index) { gui.run(function(){
			if(gui.main._global_navigation_bar == null) return;
			if(!/^android/.test(String(gui.main._global_navigation_bar.findViewById(index)))) return;
			if(gui.main.current_navigation_selection == index) return;
			var argbE = new android.animation.ArgbEvaluator();
			var colorAnim = android.animation.ObjectAnimator.ofInt(gui.main._global_navigation_bar.findViewById(index).findViewById(12), "textColor", gui.config.colors.sec_text, gui.config.colors.text);
			colorAnim.setDuration(300);
			colorAnim.setEvaluator(new android.animation.ArgbEvaluator());
			colorAnim.start();
			colorAnim = android.animation.ObjectAnimator.ofInt(gui.main._global_navigation_bar.findViewById(gui.main.current_navigation_selection).findViewById(12), "textColor", gui.config.colors.text, gui.config.colors.sec_text);
			colorAnim.setDuration(300);
			colorAnim.setEvaluator(new android.animation.ArgbEvaluator());
			colorAnim.start();
			gui.main.current_navigation_selection = index;
			
		})},
		__internal_rmNavigationList: function() { gui.run(function(){
			if(gui.main._global_navigation_bar == null) return;
			for(var i = 0; i < gui.main.views.length; i++) {
				gui.main._global_navigation_bar.removeView(gui.main._global_navigation_bar.findViewById(i));
			}
		})},
		__internal_dismiss: function() { gui.run(function(){
			if (gui.main.isShowing) {
				gui.main.isShowing = false;
				gui.main._global_close.setEnabled(false);
				gui.main._global_close.setClickable(false);
				gui.utils.value_animation("Float", 1.0, 0, 200, new android.view.animation.LinearInterpolator(), function(anim) {
					gui.main._global_base.setAlpha(anim.getAnimatedValue());
					if(anim.getAnimatedValue() == 0) {
						gui.winMgr.removeView(gui.main._global_base);
					}
				});
			}
		})},
	},
	
	suspension: {
		
		_global_base: null,
		
		isShowing: false,
		
		cx: dp * 10,
		cy: dp * 10,
		
		width: dp * 10,
		height: dp * 10,
		
		previousx: 0,
		previousy: 0,
		
		show: function s() { gui.run(function(){
			if(!gui.suspension.isShowing) {
				gui.suspension._global_base = new android.view.View(ctx);
				gui.suspension._global_base.setLayoutParams(new android.widget.LinearLayout.LayoutParams(dp * gui.suspension.width, dp * gui.suspension.height));
				gui.suspension._global_base.setBackgroundColor(gui.config.colors.background);
				gui.suspension._global_base.setOnTouchListener(new android.view.View.OnTouchListener({
					onTouch: function onTouchFunction(view, event) {
						switch (event.getAction()) {
							case event.ACTION_MOVE:
								onTouchFunction.lp = gui.suspension._global_base.getLayoutParams();
								onTouchFunction.lp.x = gui.suspension.cx = s.x = event.getRawX() + onTouchFunction.offsetX;
								onTouchFunction.lp.y = gui.suspension.cy = s.y = event.getRawY() + onTouchFunction.offsetY;
								gui.winMgr.updateViewLayout(gui.suspension._global_base, onTouchFunction.lp);
							break;
							case event.ACTION_DOWN:
								onTouchFunction.offsetX = s.x - event.getRawX();
								onTouchFunction.offsetY = s.y - event.getRawY();
							break;
							case event.ACTION_UP: 
								if((Math.abs(gui.suspension.previousx - event.getRawX()) <= gui.suspension.width * dp / 2 && Math.abs(gui.suspension.previousy - event.getRawY()) <= gui.suspension.height * dp / 2) && gui.suspension.isShowing) {
									gui.suspension.dismiss();
									gui.main.show(0);
									return false;
								}
								gui.suspension.previousx = event.getRawX();
								gui.suspension.previousy = event.getRawY();
							default: 
							return false;
						}
						return true;
					},
				}));
				s._winParams = new android.view.WindowManager.LayoutParams();
				s._winParams.type = android.view.WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
				s._winParams.flags = android.view.WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;
				s._winParams.format = android.graphics.PixelFormat.TRANSLUCENT;
				s._winParams.width = gui.suspension.width * dp;
				s._winParams.height = gui.suspension.width * dp;
				s._winParams.x = s.x = gui.suspension.cx;
				s._winParams.y = s.y = gui.suspension.cy;
				gui.winMgr.addView(gui.suspension._global_base, s._winParams);
				
				gui.suspension.isShowing = true;
			}
		})},
		dismiss: function() { gui.run(function(){
			if (gui.suspension.isShowing) {
				gui.suspension.isShowing = false;
				gui.utils.value_animation("Float", 1.0, 0, 200, new android.view.animation.LinearInterpolator(), function(anim) {
					gui.suspension._global_base.setAlpha(anim.getAnimatedValue());
					if(anim.getAnimatedValue() == 0) {
						gui.winMgr.removeView(gui.suspension._global_base);
					}
				});
			}
		})},
	},
	
	key_coordinate_navigation: {
		
		_global_base: null,
		_global_text: null,
		
		isShowing: false,
		isShowingText: false,
		
		cx: dp * 10,
		cy: dp * 10,
		
		total: 15,
		
		current_index: 0,
		
		handler: new android.os.Handler(),
		
		__internal_showTargetDots: function s() { gui.run(function(){
			if(!gui.key_coordinate_navigation.isShowing) {
				gui.key_coordinate_navigation._global_base = new android.widget.TextView(ctx);
				gui.key_coordinate_navigation._global_base.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
				gui.key_coordinate_navigation._global_base.setTextColor(android.graphics.Color.GREEN);
				gui.key_coordinate_navigation._global_base.setText("⛒");
				gui.key_coordinate_navigation._global_base.setTextSize(25);
				gui.key_coordinate_navigation._global_base.setOnTouchListener(new android.view.View.OnTouchListener({
					onTouch: function onTouchFunction(view, event) {
						switch (event.getAction()) {
							case event.ACTION_MOVE:
								onTouchFunction.lp = gui.key_coordinate_navigation._global_base.getLayoutParams();
								onTouchFunction.lp.x = gui.key_coordinate_navigation.cx = s.x = event.getRawX() + onTouchFunction.offsetX;
								onTouchFunction.lp.y = gui.key_coordinate_navigation.cy = s.y = event.getRawY() + onTouchFunction.offsetY;
								gui.winMgr.updateViewLayout(gui.key_coordinate_navigation._global_base, onTouchFunction.lp);
							break;
							case event.ACTION_DOWN:
								onTouchFunction.offsetX = s.x - event.getRawX();
								onTouchFunction.offsetY = s.y - event.getRawY();
							break;
							case event.ACTION_UP: 
								gui.key_coordinate_navigation._global_text.setText("键" + (gui.key_coordinate_navigation.current_index + 1) + "坐标已设置: [" + event.getRawX() + ", " + event.getRawY() + "]");
								config.values.key_coordinates.push([event.getRawX(), event.getRawY()])
								gui.utils.value_animation("Float", 1, 0, 200 , new android.view.animation.DecelerateInterpolator(), function(anim) {
									gui.key_coordinate_navigation._global_base.setAlpha(anim.getAnimatedValue());
									gui.key_coordinate_navigation._global_text.setAlpha(1 - anim.getAnimatedValue());
									if(anim.getAnimatedValue() == 0) {
										gui.key_coordinate_navigation.__internal_dismissTargetDot();
										gui.key_coordinate_navigation.isShowing = false;
									}
								});
								threads.start(function() {
									java.lang.Thread.currentThread().sleep(1000);
									gui.run(function() {
										if(++gui.key_coordinate_navigation.current_index < 15) {
											gui.key_coordinate_navigation.__internal_showTargetDots(gui.key_coordinate_navigation.current_index);
										} else {
											config.save("key_coordinates");
											toast("坐标设置已保存至存储！\n");
											gui.key_coordinate_navigation.__internal_dismissText();
											gui.main.show(2);
										}
									});
								});
							default: 
							return false;
						}
						return true;
					},
				}));
				s._winParams = new android.view.WindowManager.LayoutParams();
				s._winParams.type = android.view.WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
				s._winParams.flags = android.view.WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;
				s._winParams.format = android.graphics.PixelFormat.TRANSLUCENT;
				gui.key_coordinate_navigation._global_base.measure(0, 0);
				s._winParams.width = gui.key_coordinate_navigation._global_base.getMeasuredWidth();
				s._winParams.height = gui.key_coordinate_navigation._global_base.getMeasuredHeight();
				s._winParams.x = s.x = gui.key_coordinate_navigation.cx;
				s._winParams.y = s.y = gui.key_coordinate_navigation.cy;
				gui.winMgr.addView(gui.key_coordinate_navigation._global_base, s._winParams);
				gui.utils.value_animation("Float", 0, 1, 200 , new android.view.animation.DecelerateInterpolator(), function(anim) {
					gui.key_coordinate_navigation._global_base.setAlpha(anim.getAnimatedValue());
					gui.key_coordinate_navigation._global_text.setAlpha(anim.getAnimatedValue());
				});
				gui.key_coordinate_navigation._global_text.setText("移动\"⛒\"至目标位置来设置第" + (gui.key_coordinate_navigation.current_index + 1) + "个键坐标");
				gui.key_coordinate_navigation.isShowing = true;
			}
		})},
		__internal_dismissTargetDot: function() { gui.run(function(){
			if (gui.key_coordinate_navigation.isShowing) {
				gui.winMgr.removeView(gui.key_coordinate_navigation._global_base);
				gui.key_coordinate_navigation.isShowing = false;
			}
		})},
		
		__internal_showTips: function s() { gui.run(function(){
			if(!gui.key_coordinate_navigation.isShowingText) {
				gui.key_coordinate_navigation._global_text = new android.widget.TextView(ctx);
				gui.key_coordinate_navigation._global_text.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
				gui.key_coordinate_navigation._global_text.setTextColor(gui.config.colors.text);
				gui.key_coordinate_navigation._global_text.setBackgroundColor(gui.config.colors.background);
				gui.key_coordinate_navigation._global_text.setTextSize(16);
				gui.key_coordinate_navigation._global_text.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
				gui.key_coordinate_navigation._global_text.getLayoutParams().setMargins(dp * 5, dp * 5, dp * 5, dp * 5);
				
				s._winParams = new android.view.WindowManager.LayoutParams();
				s._winParams.type = android.view.WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
				s._winParams.flags = android.view.WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;
				s._winParams.format = android.graphics.PixelFormat.TRANSLUCENT;
				gui.key_coordinate_navigation._global_text.measure(0, 0);
				s._winParams.width = context.getResources().getDisplayMetrics().widthPixels - dp * 10;
				s._winParams.height = gui.key_coordinate_navigation._global_text.getMeasuredHeight();
				
				gui.winMgr.addView(gui.key_coordinate_navigation._global_text, s._winParams);
				
				s.lp = gui.key_coordinate_navigation._global_text.getLayoutParams();
				s.lp.y = context.getResources().getDisplayMetrics().heightPixels / 2 - gui.key_coordinate_navigation._global_text.getMeasuredHeight() - dp * 5;
				gui.winMgr.updateViewLayout(gui.key_coordinate_navigation._global_text, s.lp);
				gui.key_coordinate_navigation.isShowingText = true;
			}
		})},
		__internal_dismissText: function() { gui.run(function(){
			if (gui.key_coordinate_navigation.isShowingText) {
				gui.utils.value_animation("Float", 1, 0, 200 , new android.view.animation.DecelerateInterpolator(), function(anim) {
					gui.key_coordinate_navigation._global_text.setAlpha(anim.getAnimatedValue());
					if(anim.getAnimatedValue() == 0) {
						gui.winMgr.removeView(gui.key_coordinate_navigation._global_text);
						gui.key_coordinate_navigation.isShowingText = false;
					}
				});
			}
		})},
		
		show: function() {
			config.values.key_coordinates.length = 0;
			gui.key_coordinate_navigation.current_index = 0;
			this.__internal_showTips();
			this.__internal_showTargetDots();
		},
		
	},
	
	player_panel: {
		
		_global_base: null,
		_global_text: null,
		_global_seek: null,
		
		isShowing: false,
		
		cx: dp * 10,
		cy: dp * 10,
		
		__internal_showPanel: function s() { gui.run(function(){
			if(!gui.player_panel.isShowing) {
				gui.player_panel._global_base = new android.widget.RelativeLayout(ctx);
				gui.player_panel._global_base.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
				gui.player_panel._global_base.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
				gui.player_panel._global_base.getLayoutParams().setMargins(dp * 5, dp * 5, dp * 5, dp * 5);
				gui.player_panel._global_base.setBackgroundColor(gui.config.colors.background);
				
				gui.player_panel._global_text = new android.widget.TextView(ctx);
				gui.player_panel._global_text.setId(12);
				gui.player_panel._global_text.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
				gui.player_panel._global_text.setTextColor(gui.config.colors.text);
				gui.player_panel._global_text.setTextSize(14);
				//gui.player_panel._global_text.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
				gui.player_panel._global_text.getLayoutParams().setMargins(0, 0, 0, dp * 2);
				gui.player_panel._global_base.addView(gui.player_panel._global_text);
				
				s.close = new android.widget.TextView(ctx);
				s.close.setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
				gui.player_panel._global_text.measure(0, 0);
				s.close.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(gui.player_panel._global_text.getMeasuredHeight(), gui.player_panel._global_text.getMeasuredHeight()));
				s.close.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);
				s.close.measure(0, 0);
				s.close.setBackgroundDrawable(gui.utils.ripple_drawable(s.close.getMeasuredWidth(), s.close.getMeasuredHeight(), "rect"));
				s.close.setText("×");
				s.close.setTextSize(15);
				s.close.setTextColor(gui.config.colors.text);
				s.close.setOnClickListener(new android.view.View.OnClickListener({
					onClick: function() {
						if(gui.player_panel.isShowing) {
							gui.player_panel.__internal_dismiss();
							sheetplayer.stop();
							gui.main.show(0);
						}
					}
				}));
				gui.player_panel._global_base.addView(s.close);
				
				
				gui.player_panel._global_seek = new android.widget.SeekBar(ctx);
				gui.player_panel._global_seek.setId(13);
				gui.player_panel._global_seek.setMax(sheetplayer.noteCount);
				gui.player_panel._global_seek.setMin(0);
				gui.player_panel._global_seek.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-1, -2));
				gui.player_panel._global_seek.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 12);
				gui.player_panel._global_seek.getLayoutParams().setMargins(0, dp * 2, 0, dp * 2);
				gui.player_panel._global_seek.setOnSeekBarChangeListener(new android.widget.SeekBar.OnSeekBarChangeListener({
					onProgressChanged: function(sb, p) {
					},
					onStopTrackingTouch: function(sb) {
						sheetplayer.setProgress(sb.getProgress());
					},
				}));
				gui.player_panel._global_base.addView(gui.player_panel._global_seek);
				
				
				s.control_panel = new android.widget.LinearLayout(ctx);
				s.control_panel.setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
				s.control_panel.setOrientation(android.widget.LinearLayout.HORIZONTAL);
				s.control_panel.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
				s.control_panel.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 13);
				
				gui.player_panel._global_status = new android.widget.TextView(ctx);
				gui.player_panel._global_status.setLayoutParams(new android.widget.LinearLayout.LayoutParams(dp * 110, dp * 22));
				s.control_panel.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
				gui.player_panel._global_status.setTextColor(gui.config.colors.sec_text);
				gui.player_panel._global_status.setTextSize(12);
				//gui.player_panel._global_status.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
				s.control_panel.addView(gui.player_panel._global_status);
				
				s.play = new android.widget.ImageView(ctx);
				s.play.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
				s.play.setLayoutParams(new android.widget.LinearLayout.LayoutParams(dp * 22, dp * 22));
				s.play.getLayoutParams().setMargins(dp * 8, dp * 8, dp * 8, dp * 8);
				s.play.setImageBitmap(config.bitmaps.play);
				s.play.measure(0, 0);
				s.play.setBackgroundDrawable(gui.utils.ripple_drawable(s.close.getMeasuredWidth(), s.close.getMeasuredHeight(), "rect"));
				s.play.setOnClickListener(new android.view.View.OnClickListener({
					onClick: function() {
						sheetplayer.play(gui.player_panel.refreshStatus);
					}
				}));
				s.control_panel.addView(s.play);
				
				s.pause = new android.widget.ImageView(ctx);
				s.pause.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
				s.pause.setLayoutParams(new android.widget.LinearLayout.LayoutParams(dp * 22, dp * 22));
				s.pause.getLayoutParams().setMargins(dp * 8, dp * 8, dp * 8, dp * 8);
				s.pause.setImageBitmap(config.bitmaps.pause);
				s.pause.measure(0, 0);
				s.pause.setBackgroundDrawable(gui.utils.ripple_drawable(s.close.getMeasuredWidth(), s.close.getMeasuredHeight(), "rect"));
				s.pause.setOnClickListener(new android.view.View.OnClickListener({
					onClick: function() {
						sheetplayer.pause();
					}
				}));
				s.control_panel.addView(s.pause);
				
				gui.player_panel._global_cnote = new android.widget.TextView(ctx);
				gui.player_panel._global_cnote.setLayoutParams(new android.widget.LinearLayout.LayoutParams(dp * 110, dp * 22));
				s.control_panel.setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
				gui.player_panel._global_cnote.setTextColor(gui.config.colors.sec_text);
				gui.player_panel._global_cnote.setTextSize(12);
				//gui.player_panel._global_cnote.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
				s.control_panel.addView(gui.player_panel._global_cnote);
				
				gui.player_panel._global_base.addView(s.control_panel);
				
				s._winParams = new android.view.WindowManager.LayoutParams();
				s._winParams.type = android.view.WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
				s._winParams.flags = android.view.WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;
				s._winParams.format = android.graphics.PixelFormat.TRANSLUCENT;
				gui.player_panel._global_base.measure(0, 0);
				s._winParams.width = gui.player_panel._global_base.getMeasuredWidth();
				s._winParams.height = gui.player_panel._global_base.getMeasuredHeight();
				
				gui.winMgr.addView(gui.player_panel._global_base, s._winParams);
				
				s.lp = gui.player_panel._global_base.getLayoutParams();
				s.lp.x = 0;
				s.lp.y = context.getResources().getDisplayMetrics().heightPixels / 2 - gui.player_panel._global_base.getMeasuredHeight() - dp * 2;
				gui.winMgr.updateViewLayout(gui.player_panel._global_base, s.lp);
				gui.player_panel.isShowing = true;
				
				gui.player_panel._global_text.setText(sheetplayer.name);
				gui.player_panel.refreshStatus();
			}
		});},
		refreshStatus: function() { gui.run(function(){
			gui.player_panel._global_status.setText(String(sheetplayer.playing ? (Number(sheetplayer.currentNote + 1) + "/" + sheetplayer.noteCount + " -> " + sheetplayer.nextInterval + "ms") : (sheetplayer.thread == null ? "Idle" : "Paused")));
			gui.player_panel._global_cnote.setText(String(sheetplayer.playing ? (sheetplayer.notes[sheetplayer.currentNote < sheetplayer.noteCount ? sheetplayer.currentNote : sheetplayer.noteCount - 1].keys) : "-"));
			gui.player_panel._global_seek.setProgress(sheetplayer.currentNote);
			
		});},
		__internal_dismiss: function() { gui.run(function(){
			if (gui.player_panel.isShowing) {
				gui.player_panel.isShowing = false;
				gui.utils.value_animation("Float", 1, 0, 200 , new android.view.animation.DecelerateInterpolator(), function(anim) {
					gui.player_panel._global_base.setAlpha(anim.getAnimatedValue());
					if(anim.getAnimatedValue() == 0) {
						gui.winMgr.removeView(gui.player_panel._global_base);
					}
				});
			}
		})},
		
		show: function() {
			this.__internal_showTips();
			this.__internal_showTargetDots();
		},
		
	},
	
};


gui.run(function(){
	ui.setContentView((function(){
		var layout = new android.widget.LinearLayout(ctx);
		layout.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, -1));
		layout.setOrientation(android.widget.LinearLayout.VERTICAL);
		layout.setPadding(15 * dp, 15 * dp, 15 * dp, 15 * dp);
		layout.setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
		var prompt = new android.widget.TextView(ctx);
		prompt.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
		prompt.getLayoutParams().setMargins(dp * 15, dp * 5, dp * 15, dp * 15);
		prompt.setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
		prompt.setText(android.text.Html.fromHtml("当你发现什么事情都没有发生时<br>也许你应该看看是否授予了Auto.js<u><b>悬浮窗权限</u></b><br><br>" + (function() {
			if(app.autojs.versionCode == 461) {
				return "Auto.js版本为 <b>4.1.1 Alpha2</b>"
			} else {
				return "<font color=red>Auto.js版本为 <b>" + app.autojs.versionName + "</b>，不保证稳定性！</font><br>建议使用 <b>4.1.1 Alpha2</b> 版本！<br><b>4.1.1 Alpha2</b> 版本下载: <a href=https://github.com/Ericwyn/Auto.js/releases/tag/V4.1.1.Alpha2>https://github.com/Ericwyn/Auto.js/releases/tag/V4.1.1.Alpha2</a>"
			}
		}())));
		layout.addView(prompt);
		var btn = new android.widget.Button(ctx);
		btn.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
		btn.setText("强制退出");
		btn.setOnClickListener(new android.view.View.OnClickListener({
			onClick: function() {
				java.lang.System.exit(0);
			}
		}));
		layout.addView(btn);
		return layout;
	}()));
});

gui.dialogs.showProgressDialog(function(o) {
	o.setIndeterminate(true);
	o.setText("加载配置中...");
	config.init();
	config.checkVersion();
	o.setText("加载资源中...");
	config.fetchResources(function(msg) {
		if(msg instanceof Error) {
			o.close();
			error(msg);
			exit();
		} else {
			o.setText(msg);
		}
	});
	gui.main.addPage({
		index: 0, 
		title: "本地乐谱", 
		navigation_title: "本地乐谱",
		navigation_icon: config.bitmaps.local,
		func: function(s) {
			this.getSheetList(s, true);
		},
		func_icon: android.graphics.Bitmap.createBitmap(config.bitmaps.refresh),
		view: function(s) {
			s.ns0_rl = new android.widget.RelativeLayout(ctx);
			s.ns0_rl.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, s._content_height));
			
			s.ns0_listView = new android.widget.ListView(ctx);
			s.ns0_listView.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, s._content_height));
			s.ns0_listView.setAdapter(s.ns0_listAdapter = new RhinoListAdapter([], function self(element) {
				self.relative = new android.widget.RelativeLayout(ctx);
				self.relative.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, -2));
				
				self.title = new android.widget.TextView(ctx);
				self.title.setId(10);
				self.title.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
				self.title.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
				self.title.getLayoutParams().setMargins(dp * 15, dp * 15, dp * 15, dp * 1);
				self.title.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
				self.title.setTextSize(16);
				self.title.setTextColor(gui.config.colors.text);
				self.title.setText(element.name);
				self.relative.addView(self.title);
				
				self.author = new android.widget.TextView(ctx);
				self.author.setId(11);
				self.author.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
				self.author.getLayoutParams().setMargins(dp * 15, dp * 1, dp * 15, dp * 15);
				self.author.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 10);
				self.author.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
				self.author.setTextSize(14);
				self.author.setTextColor(gui.config.colors.sec_text);
				self.author.setText("键数: " + element.songNotes.length + " - BPM: " + element.bpm);
				self.relative.addView(self.author);
				
				self.play = new android.widget.ImageView(ctx);
				self.play.setId(12);
				self.play.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
				self.play.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 25, dp * 25));
				self.play.getLayoutParams().setMargins(dp * 7, dp * 15, dp * 15, dp * 15);
				self.play.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);
				self.play.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
				self.play.setImageBitmap(config.bitmaps.play);
				self.play.measure(0, 0);
				self.play.setBackgroundDrawable(gui.utils.ripple_drawable(self.play.getMeasuredWidth(), self.play.getMeasuredHeight(), "rect"));
				self.play.setOnClickListener(new android.view.View.OnClickListener({
					onClick: function() {
						if(config.values.key_coordinates.length == 15 && gui.main.isShowing) {
							sheetplayer.setSheet(element);
							gui.main.__internal_dismiss();
							gui.player_panel.__internal_showPanel();
						} else {
							toast("未设置键位坐标或坐标数据错误，请前往设置页设置键位坐标");
						}
					}
				}));
				
				self.delete = new android.widget.ImageView(ctx);
				self.delete.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
				self.delete.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 25, dp * 25));
				self.delete.getLayoutParams().setMargins(dp * 15, dp * 15, dp * 7, dp * 15);
				self.delete.getLayoutParams().addRule(android.widget.RelativeLayout.LEFT_OF, 12);
				self.delete.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
				self.delete.setImageBitmap(config.bitmaps.bin);
				self.delete.measure(0, 0);
				self.delete.setBackgroundDrawable(gui.utils.ripple_drawable(self.delete.getMeasuredWidth(), self.delete.getMeasuredHeight(), "rect"));
				self.delete.setOnClickListener(new android.view.View.OnClickListener({
					onClick: function() {
						var path = files.join(sheetmgr.rootDir, element.fileName);
						gui.dialogs.showConfirmDialog({
							title: "删除文件",
							text: "确认要删除 " + path + " 吗？\n该操作不可恢复！",
							canExit: true,
							buttons: ["确认", "取消"],
							callback: function(id) {
								if(id == 0) {
									files.remove(path);
									gui.main.getPage(0).getSheetList(s, true);
								}
							},
						});
					}
				}));
				
				self.relative.addView(self.play);
				self.relative.addView(self.delete);
				
				return self.relative;
			}));
			s.ns0_listAdapterController = RhinoListAdapter.getController(s.ns0_listAdapter);
			
			s.ns0_listView.setAdapter(s.ns0_listAdapterController.self);
			s.ns0_listView.setOnItemClickListener(new android.widget.AdapterView.OnItemClickListener({
				onItemClick: function(parent, view, pos, id) {
					var item = s.ns0_listAdapterController.get(pos);
					gui.dialogs.showDialog((function () {
						var scr = new android.widget.ScrollView(ctx);
						scr.setBackgroundColor(gui.config.colors.background);
						var layout = new android.widget.LinearLayout(ctx);
						layout.setLayoutParams(new android.widget.FrameLayout.LayoutParams(-2, -2));
						layout.setOrientation(android.widget.LinearLayout.VERTICAL);
						layout.setPadding(15 * dp, 15 * dp, 15 * dp, 5 * dp);
						var title = new android.widget.TextView(ctx);
						title.setText(item.name);
						title.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
						title.setPadding(0, 0, 0, 10 * dp);
						title.setTextColor(gui.config.colors.text);
						title.setTextSize(16);
						layout.addView(title);
						var text = new android.widget.TextView(ctx);
						text.setText(android.text.Html.fromHtml(
							"<font color=#FFFFFF>作者: " + (item.author.length == 0 ? "</font><font color=#7B7B7B>Not Provided</font><font color=#FFFFFF>" : item.author) + "</font><br>" + 
							"<font color=#FFFFFF>BPM: " + item.bpm + "</font><br>" + 
							"<font color=#FFFFFF>时长: " + (function(){
								var time_ms = item.songNotes[item.songNotes.length - 1].time;
								var second_s = Math.floor(time_ms / 1000);
								
								var millis = time_ms - second_s * 1000;
								var minute = Math.floor(second_s / 60);
								var second = second_s - minute * 60;
								
								return minute + ":" + second + "." + millis;
							}()) + "</font><br>" + 
							"<br>" + 
							"<font color=#FFFFFF>音高: " + (function(){
								var r = "</font><font color=";
								switch(item.pitchLevel) {
									case 0: r += "#FF6100";break;
									case 1: r += "#FF9200";break;
									case 2: r += "#FFC600";break;
									case 3: r += "#FFFF00";break;
									case 4: r += "#8CC619";break;
									case 5: r += "#00815A";break;
									case 6: r += "#0096B5";break;
									case 7: r += "#2971B5";break;
									case 8: r += "#424DA4";break;
									case 9: r += "#6B3594";break;
									case 10: r += "#C5047B";break;
									case 11: r += "#FF0000";break;
								}
								r += ">" + sheetmgr.pitch_suggestion[item.pitchLevel].name
								return r;
							}()) + "</font><br>" + 
							"<font color=#FFFFFF>建议弹奏地点: " + (function(){
								var r = "</font>";
								sheetmgr.pitch_suggestion[item.pitchLevel].places.map(function(e, i) {
									r += "<br><font color=#FFFFFF> * </font><font color=#7B7B7B>" + e + "</font>"
								}); 
								return r;
							}())
						));
						text.setPadding(0, 0, 0, 10 * dp);
						text.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
						text.setTextColor(gui.config.colors.sec_text);
						text.setTextSize(14);
						layout.addView(text);
						scr.addView(layout)
						return scr;
					}()), -2, -2, null, true);
				}
			}));
			s.ns0_rl.addView(s.ns0_listView);
			
			s.ns0_progress = new android.widget.ProgressBar(ctx, null, android.R.attr.progressBarStyleHorizontal);
			s.ns0_progress.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-1, dp * 15));
			s.ns0_progress.setTranslationY(dp * 5);
			s.ns0_progress.setPadding(0, 0, 0, 0);
			s.ns0_progress.getLayoutParams().setMargins(0, 0, 0, 0);
			s.ns0_progress.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM);
			s.ns0_progress.setProgressDrawable(new android.graphics.drawable.ColorDrawable(gui.config.colors.background));
			s.ns0_progress.setIndeterminate(true);
			s.ns0_progress.setAlpha(0);
			
			s.ns0_rl.addView(s.ns0_progress);
			return s.ns0_rl;
		},
		update: function(s) {
			if(s.initial) this.getSheetList(s, false);
			
		},
		getSheetList: function(s, isForce) {
			gui.run(function() {
				s.ns0_progress.setIndeterminate(true);
				s.ns0_listAdapterController.removeAll();
				gui.utils.value_animation("Float", 0, 1.0, 200, new android.view.animation.LinearInterpolator(), function(anim) {
					gui.main._global_title.setAlpha(anim.getAnimatedValue());
				});
				gui.utils.value_animation("Float", 1.0, 0, 100, new android.view.animation.DecelerateInterpolator(), function(anim) {
					s.ns0_listView.setAlpha(anim.getAnimatedValue());
					s.ns0_progress.setAlpha(1 - anim.getAnimatedValue());
					if(anim.getAnimatedValue() == 0) {
						s.ns0_listAdapterController.notifyChange();
						s.ns0_listView.setAlpha(1);
						threads.start(function() {
							sheetmgr.getLocalSheetList(isForce, function(i) {
								gui.run(function(){
									gui.main._global_title.setText("加载中: 共" + i + "首乐谱");
									s.ns0_listAdapterController.notifyChange();
								});
							}).map(function(e, i) {
								s.ns0_listAdapterController.add(e);
							});
							gui.run(function() {
								s.ns0_listAdapterController.notifyChange();
								gui.main._global_title.setText(gui.main.getPageInfo(s.index).title);
								gui.utils.value_animation("Float", 0, 1.0, 200, new android.view.animation.DecelerateInterpolator(), function(anim) {
									gui.main._global_title.setAlpha(anim.getAnimatedValue());
									s.ns0_listView.setAlpha(anim.getAnimatedValue());
									s.ns0_progress.setAlpha(1 - anim.getAnimatedValue());
									if(anim.getAnimatedValue() == 1.0) s.ns0_progress.setIndeterminate(false);
								});
							});
						});
					}
				});
			});
		}
	});
	gui.main.addPage({
		index: 1, 
		title: "共享乐谱",
		navigation_title: "共享乐谱", 
		navigation_icon: config.bitmaps.online,
		func: function(s) {
			this.getOnlineSheetList(s, true);
		},
		func_icon: android.graphics.Bitmap.createBitmap(config.bitmaps.refresh),
		view: function(s) {
			
			s.ns1_rl = new android.widget.RelativeLayout(ctx);
			s.ns1_rl.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, s._content_height));
			
			s.ns1_listView = new android.widget.ListView(ctx);
			s.ns1_listView.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, s._content_height));
			s.ns1_listView.setAdapter(s.ns1_listAdapter = new RhinoListAdapter([], function self(element) {
				
				self.relative = new android.widget.RelativeLayout(ctx);
				self.relative.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, -2));
				
				self.downloading = false;
				
				if(element.type == -1) {
					self.info = new android.widget.ImageView(ctx);
					self.info.setId(10);
					self.info.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
					self.info.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 25, dp * 25));
					self.info.getLayoutParams().setMargins(dp * 15, dp * 10, dp * 5, dp * 10);
					self.info.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
					self.info.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
					self.info.setImageBitmap(config.bitmaps.info);
					self.relative.addView(self.info);
					
					self.upload = new android.widget.TextView(ctx);
					self.upload.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
					self.upload.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
					self.upload.getLayoutParams().setMargins(dp * 7, dp * 5, dp * 15, dp * 10);
					self.upload.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
					self.upload.getLayoutParams().addRule(android.widget.RelativeLayout.RIGHT_OF, 10);
					self.upload.setTextSize(13);
					self.upload.setTextColor(gui.config.colors.sec_text);
					self.upload.setText("如何上传乐谱");
					self.relative.addView(self.upload);
					return self.relative;
				}
				
				self.title = new android.widget.TextView(ctx);
				self.title.setId(10);
				self.title.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
				self.title.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
				self.title.getLayoutParams().setMargins(dp * 15, dp * 15, dp * 15, dp * 1);
				self.title.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
				self.title.setTextSize(16);
				self.title.setTextColor(gui.config.colors.text);
				self.title.setText(element.name);
				self.relative.addView(self.title);
				
				self.info = new android.widget.TextView(ctx);
				self.info.setId(11);
				self.info.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
				self.info.getLayoutParams().setMargins(dp * 15, dp * 1, dp * 15, dp * 2);
				self.info.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 10);
				self.info.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
				self.info.setTextSize(15);
				self.info.setTextColor(gui.config.colors.text);
				self.info.setText(element.author);
				self.relative.addView(self.info);
				
				self.desc = new android.widget.TextView(ctx);
				self.desc.setId(12);
				self.desc.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
				self.desc.getLayoutParams().setMargins(dp * 15, dp * 2, dp * 15, dp * 15);
				self.desc.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 11);
				self.desc.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
				self.desc.setTextSize(13);
				self.desc.setTextColor(gui.config.colors.sec_text);
				self.desc.setText(android.text.Html.fromHtml(element.desc.replace(new RegExp("\x0a", "gi"), "<br>")));
				self.relative.addView(self.desc);
				
				self.download = new android.widget.ImageView(ctx);
				self.download.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
				self.download.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 25, dp * 25));
				self.download.getLayoutParams().setMargins(dp * 15, dp * 15, dp * 15, dp * 15);
				self.download.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);
				self.download.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
				self.download.setImageBitmap(config.bitmaps.download);
				self.download.measure(0, 0);
				self.download.setBackgroundDrawable(gui.utils.ripple_drawable(self.download.getMeasuredWidth(), self.download.getMeasuredHeight(), "rect"));
				self.download.setOnClickListener(new android.view.View.OnClickListener({
					onClick: function() { threads.start(function() {
						if(!self.isShowingStatusBar) sheetmgr.downloadAndLoad(element.file, function(r) {
							switch(r.status) {
								case 1: {
									gui.run(function() {
										self.status.setText("下载中...");
										self.relative.addView(self.status);
										self.relative.addView(self.progress);
										self.isShowingStatusBar = true;
										self.progress.setIndeterminate(true);
										self.desc.getLayoutParams().setMargins(dp * 15, dp * 2, dp * 15, dp * 1);
										gui.utils.value_animation("Float", 0, 1.0, 150, new android.view.animation.LinearInterpolator(), function(anim) {
											self.progress.setAlpha(anim.getAnimatedValue());
											self.status.setAlpha(anim.getAnimatedValue());
										});
									});
									break;
								}
								case 2: {
									if(gui.main.isShowing) gui.run(function() {
										self.status.setText("解析中...");
									});
									break;
								}
								case 3: {
									if(gui.main.isShowing) { gui.run(function() { 
										toast("下载完成: " + element.name + "\n请在本地曲谱页面刷新");
										gui.utils.value_animation("Float", 1, 0, 150, new android.view.animation.LinearInterpolator(), function(anim) {
											self.progress.setAlpha(anim.getAnimatedValue());
											self.status.setAlpha(anim.getAnimatedValue());
											if(anim.getAnimatedValue() == 0) {
												self.desc.getLayoutParams().setMargins(dp * 15, dp * 2, dp * 15, dp * 15);
												self.relative.removeView(self.status);
												self.relative.removeView(self.progress);
												self.isShowingStatusBar = false;
											}
										});
									});}
									break;
								}
								case -1: {
									if(gui.main.isShowing) { gui.run(function() { 
										toast("下载" + element.name + "失败: " + r.msg);
										gui.utils.value_animation("Float", 1, 0, 150, new android.view.animation.LinearInterpolator(), function(anim) {
											self.progress.setAlpha(anim.getAnimatedValue());
											self.status.setAlpha(anim.getAnimatedValue());
											if(anim.getAnimatedValue() == 0) {
												self.desc.getLayoutParams().setMargins(dp * 15, dp * 2, dp * 15, dp * 15);
												self.relative.removeView(self.status);
												self.relative.removeView(self.progress);
												self.isShowingStatusBar = false;
											}
										});
									});}
									break;
								}
							}
						});
					}); }
				}));
				self.relative.addView(self.download);
				
				self.status = new android.widget.TextView(ctx);
				self.status.setId(13);
				self.status.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
				self.status.getLayoutParams().setMargins(dp * 15, 0, dp * 15, 0);
				self.status.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 12);
				self.status.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
				self.status.setTextSize(13);
				self.status.setAlpha(0);
				self.status.setTextColor(gui.config.colors.text);
				
				//self.relative.addView(self.status);
				
				self.progress = new android.widget.ProgressBar(ctx, null, android.R.attr.progressBarStyleHorizontal);
				self.progress.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-1, dp * 15));
				self.progress.setPadding(0, 0, 0, 0);
				self.progress.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 13);
				self.progress.getLayoutParams().setMargins(dp * 15, 0, dp * 15, dp * 5);
				self.progress.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM);
				self.progress.setProgressDrawable(new android.graphics.drawable.ColorDrawable(gui.config.colors.background));
				self.progress.setIndeterminate(false);
				self.progress.setAlpha(0);
				
				//self.relative.addView(self.progress);
				
				return self.relative;
			}));
			s.ns1_listAdapterController = RhinoListAdapter.getController(s.ns1_listAdapter);
			
			s.ns1_listView.setAdapter(s.ns1_listAdapterController.self);
			s.ns1_listView.setOnItemClickListener(new android.widget.AdapterView.OnItemClickListener({
				onItemClick: function(parent, view, pos, id) {
					var item = s.ns1_listAdapterController.get(pos);
					if(item.type == -1 || pos == 0) {
						gui.dialogs.showConfirmDialog({
							title: "如何上传乐谱",
							text: "共有两种方式可以上传乐谱：\n\n" + 
								"①酷安私信@StageGuard，发送时请附带简介，曲谱链接(百度云或其他云盘都可)\n" + 
								"②在github fork StageGuard/SkyAutoplayerScript，在shared_sheets文件夹添加你的曲谱，并按照格式修改shared_sheets.json\n\n" + 
								"注：若是转载转载请注明原作者同意\n\n" + 
								"如果所有人都白嫖，那么这个列表将永远也不会扩充",
							canExit: true,
							buttons: ["打开酷安", "打开Github", "取消"],
							callback: function(id) {
								if(id == 0) {
									if(!app.launch("com.coolapk.market")) toast("应用 酷安 不存在！");
								} else if(id == 1) {
									app.openUrl("https://github.com/StageGuard/SkyAutoplayerScript/");
								}
							},
						});
						return true;
					}
					gui.dialogs.showDialog((function () {
						var scr = new android.widget.ScrollView(ctx);
						scr.setBackgroundColor(gui.config.colors.background);
						var layout = new android.widget.LinearLayout(ctx);
						layout.setLayoutParams(new android.widget.FrameLayout.LayoutParams(-2, -2));
						layout.setOrientation(android.widget.LinearLayout.VERTICAL);
						layout.setPadding(15 * dp, 15 * dp, 15 * dp, 5 * dp);
						var title = new android.widget.TextView(ctx);
						title.setText(item.name);
						title.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
						title.setPadding(0, 0, 0, 10 * dp);
						title.setTextColor(gui.config.colors.text);
						title.setTextSize(16);
						layout.addView(title);
						var text = new android.widget.TextView(ctx);
						text.setText(android.text.Html.fromHtml(
							"<font color=#FFFFFF>作者: " + (item.author.length == 0 ? "</font><font color=#7B7B7B>Not Provided</font><font color=#FFFFFF>" : item.author) + "</font><br>" + 
							"<font color=#FFFFFF>BPM: " + item.bpm + "</font><br>" + 
							"<br>" + 
							"<font color=#FFFFFF>音高: " + (function(){
								var r = "</font><font color=";
								switch(item.pitchLevel) {
									case 0: r += "#FF6100";break;
									case 1: r += "#FF9200";break;
									case 2: r += "#FFC600";break;
									case 3: r += "#FFFF00";break;
									case 4: r += "#8CC619";break;
									case 5: r += "#00815A";break;
									case 6: r += "#0096B5";break;
									case 7: r += "#2971B5";break;
									case 8: r += "#424DA4";break;
									case 9: r += "#6B3594";break;
									case 10: r += "#C5047B";break;
									case 11: r += "#FF0000";break;
								}
								r += ">" + sheetmgr.pitch_suggestion[item.pitchLevel].name
								return r;
							}()) + "</font><br>" + 
							"<font color=#FFFFFF>建议弹奏地点: " + (function(){
								var r = "</font>";
								sheetmgr.pitch_suggestion[item.pitchLevel].places.map(function(e, i) {
									r += "<br><font color=#FFFFFF> * </font><font color=#7B7B7B>" + e + "</font>"
								}); 
								return r;
							}()) + 
							"<br><br>" + 
							"<font color=#FFFFFF>简介: </font><br><font color=#7B7B7B>" + 
							item.desc.replace(new RegExp("\x0a", "gi"), "<br>")
								
							+ "</font>"
						));
						text.setPadding(0, 0, 0, 10 * dp);
						text.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
						text.setTextColor(gui.config.colors.sec_text);
						text.setTextSize(14);
						layout.addView(text);
						scr.addView(layout)
						return scr;
					}()), -2, -2, null, true);
				}
			}));
			s.ns1_rl.addView(s.ns1_listView);
			
			s.ns1_progress = new android.widget.ProgressBar(ctx, null, android.R.attr.progressBarStyleHorizontal);
			s.ns1_progress.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-1, dp * 15));
			s.ns1_progress.setTranslationY(dp * 5);
			s.ns1_progress.setPadding(0, 0, 0, 0);
			s.ns1_progress.getLayoutParams().setMargins(0, 0, 0, 0);
			s.ns1_progress.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM);
			s.ns1_progress.setProgressDrawable(new android.graphics.drawable.ColorDrawable(gui.config.colors.background));
			s.ns1_progress.setIndeterminate(true);
			s.ns1_progress.setAlpha(0);
			
			s.ns1_rl.addView(s.ns1_progress);
			return s.ns1_rl;
		},
		update: function(s) {
			if(s.initial) this.getOnlineSheetList(s, false);
		},
		getOnlineSheetList: function(s, isForce) {
			gui.run(function() {
				s.ns1_progress.setIndeterminate(true);
				s.ns1_listAdapterController.removeAll();
				s.ns1_listAdapterController.notifyChange();
				gui.utils.value_animation("Float", 0, 1.0, 200, new android.view.animation.LinearInterpolator(), function(anim) {
					gui.main._global_title.setAlpha(anim.getAnimatedValue());
				});
				gui.utils.value_animation("Float", 1.0, 0, 100, new android.view.animation.DecelerateInterpolator(), function(anim) {
					s.ns1_listView.setAlpha(anim.getAnimatedValue());
					s.ns1_progress.setAlpha(1 - anim.getAnimatedValue());
					if(anim.getAnimatedValue() == 0) {
						s.ns1_listAdapterController.add({type: -1});
						s.ns1_listAdapterController.notifyChange();
						s.ns1_listView.setAlpha(1);
						gui.main._global_title.setText("获取列表中...");
						threads.start(function() {
							sheetmgr.getOnlineSharedSheetInfoList(isForce).map(function(e, i) {
								s.ns1_listAdapterController.add(e);
							});
							gui.run(function() {
								s.ns1_listAdapterController.notifyChange();
								gui.main._global_title.setText(gui.main.getPageInfo(s.index).title);
								gui.utils.value_animation("Float", 0, 1.0, 200, new android.view.animation.DecelerateInterpolator(), function(anim) {
									gui.main._global_title.setAlpha(anim.getAnimatedValue());
									s.ns1_listView.setAlpha(anim.getAnimatedValue());
									s.ns1_progress.setAlpha(1 - anim.getAnimatedValue());
									if(anim.getAnimatedValue() == 1.0) s.ns1_progress.setIndeterminate(false);
								});
							});
						});
					}
				});
			});
		}
	});
	gui.main.addPage({
		index: 2, 
		title: "设置", 
		navigation_title: "设置",
		navigation_icon: config.bitmaps.settings,
		view: function(s) {
			s.ns2_listView = new android.widget.ListView(ctx);
			s.ns2_listView.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, s._content_height));
			s.ns2_listView.setAdapter(s.ns2_listAdapter = new RhinoListAdapter([{
				type: "tag",
				name: "基本设置", 
			}, {
				type: "default",
				name: "设置键位坐标", 
				onClick: function(v) {
					gui.main.__internal_dismiss();
					gui.key_coordinate_navigation.show();
				}
			}, {
				type: "default",
				name: "查看使用须知", 
				onClick: function(v) {
					gui.dialogs.showConfirmDialog({
						title: "使用须知",
						text: user_agreements,
						canExit: true,
						buttons: ["确认"],
					})
				},
			}, {
				type: "default",
				name: "查看LICENSE", 
				onClick: function(v) {
					threads.start(function() {
						var license = http.get("https://cdn.jsdelivr.net/gh/StageGuard/SkyAutoPlayerScript/LICENSE").body.string();
						gui.dialogs.showConfirmDialog({
							title: "GNU GENERAL PUBLIC LICENSE",
							text: license,
							canExit: true,
							buttons: ["确认"],
						});
					});
				},
			}, {
				type: "tag",
				name: "Version: " + config.values.currentVersion + "(git@" + config.values.gitVersion + ")", 
			}], function self(element) {
				self.relative = new android.widget.RelativeLayout(ctx);
				self.relative.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, -2));
				
				switch(element.type) {
					case "tag":
						self.title = new android.widget.TextView(ctx);
						self.title.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
						self.title.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
						self.title.getLayoutParams().setMargins(dp * 5, dp * 5, dp * 5, dp * 5);
						self.title.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
						self.title.setTextSize(12);
						self.title.setTextColor(gui.config.colors.sec_text);
						self.title.setText(element.name);
						self.relative.addView(self.title);
					break;
					case "default":
						self.title = new android.widget.TextView(ctx);
						self.title.setId(10);
						self.title.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
						self.title.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
						self.title.getLayoutParams().setMargins(dp * 10, dp * 10, dp * 10, dp * 10);
						self.title.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
						self.title.setTextSize(14);
						self.title.setTextColor(gui.config.colors.text);
						self.title.setText(element.name);
						self.relative.addView(self.title);
					break;
				}
				return self.relative;
				
			}));
			s.ns2_listAdapterController = RhinoListAdapter.getController(s.ns2_listAdapter);
			s.ns2_listView.setDividerHeight(0);
			s.ns2_listView.setAdapter(s.ns2_listAdapterController.self);
			s.ns2_listView.setOnItemClickListener(new android.widget.AdapterView.OnItemClickListener({
				onItemClick: function(parent, view, pos, id) {
					var item = s.ns2_listAdapterController.get(pos);
					switch(item.type) {
						case "default":
							item.onClick(view);
					}
				}
			}));
			return s.ns2_listView;
		},
	});
	gui.suspension.show();
	o.close();
	ctx.moveTaskToBack(true);
	if(!config.values.skipRunScriptTip) {
		gui.dialogs.showConfirmDialog({
			title: "使用须知",
			text: user_agreements,
			canExit: false,
			buttons: ["确认"],
			skip: function(checked) {
				config.save("skip_run_script_tip", checked);
			},
			callback: function(id) {},
		});
	}
}, false, false);

});