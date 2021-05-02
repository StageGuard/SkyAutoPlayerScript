# SkyAutoPlayerScript

English: [README-en.md](README-en.md)

使用Auto.js提供的无障碍权限实现在Sky光遇中自动弹奏 [SkyStudio](https://play.google.com/store/apps/details?id=com.Maple.SkyStudio) 导出的曲谱

[![shared sheet](https://badgen.net/badge/shared%20sheets/130%20in%20total/green)](shared_sheets/) [![sheet contributors](https://badgen.net/badge/sheet%20contributors/24/pink)](#共享乐谱) [![Hosted in](https://badgen.net/badge/CDN/jsDelivr?icon=jsdelivr)](https://www.jsdelivr.com/)

~~不会进一步支持原神的21键琴和上传21键位的共享乐谱，反正15键又不是不能弹。~~

## 特性

相比于其他脚本，SkyAutoPlayerScript 拥有以下优势

* 全GUI操作，无需编辑任何代码，流畅的UI动画。
* 多功能的弹奏控制面板，支持**暂停**， **进度控制**， **倍速控制**等。
* 通过引导自设定键位坐标，避免按压琴键的偏移问题。
* 在线[共享乐谱](https://github.com/StageGuard/SkyAutoPlayerScript/tree/master/shared_sheets)，有许多优质乐谱。
* 自动更新，及时修复BUG，无需担心版本过时问题。
* [多语言支持](#翻译)。
* ...

## 使用

1. Auto.js `4.1.1 Alpha2 (461) -> armeabi-v7a` 版本下载: [`Ericwyn/Auto.js/releases@V4.1.1.Alpha2`](https://github.com/Ericwyn/Auto.js/releases/tag/V4.1.1.Alpha2)

2. 为Auto.js开启**无障碍服务**和**悬浮窗权限**。

3. 在Auto.js中新建一个脚本并粘贴以下代码并运行：

```javascript
"ui";
"use strict";
var emitter = events.emitter(threads.currentThread());
threads.start(function() {
  emitter.emit("evaluate", (function(){
    var resp = http.get("https://gitee.com/stageguard/SkyAutoPlayerScript/raw/master/source/SkyAutoplayer.js");
    if(resp.statusCode >= 200 && resp.statusCode < 300) {
      return resp.body.string();
    } else {
      resp = http.get("https://cdn.jsdelivr.net/gh/StageGuard/SkyAutoPlayerScript@" + http.get("https://gitee.com/stageguard/SkyAutoPlayerScript/raw/master/gitVersion").body.string() + "/source/SkyAutoplayer.js");
      if(resp.statusCode >= 200 && resp.statusCode < 300) {
        return resp.body.string();
      } else {
        return "console.show();console.log(\"Failed to load script\")";
      }
	}
  }()));
});
emitter.on('evaluate', function(s){
  eval(s);
});
```

在Auto.js版本 `4.1.1 Alpha2 (461)` 中测试通过，**不保证其他版本的兼容性**(取决于其他版本相对于此版本的API是否有`breaking changes`)

## 清除数据

`SkyAutoPlayerScript` 在使用过程中会产生本地数据存储，若想全部删除，请使用Auto.js执行以下代码

```
storages.remove("StageGuard:SkyAutoPlayer:Config");
files.removeDir("/storage/emulated/0/Documents/SkyAutoPlayer/");
```

# 上传乐谱

SkyAutoplayerScript 可以从这个仓库中的 `shared_sheets.json` 读取在线共享乐谱列表并可以方便地下载和弹奏。

你可以通过以下两种方式的任意一种方式来让你自制或经过原作者授权转载的乐谱在这个列表显示：

### 1. Pull Request

你可以克隆这个仓库，将你的乐谱添加到 `shared_sheets` 文件夹中，并按照以下要求在 `shared_sheets.json` 中添加新的项目：

```javascript
{
  //乐谱名称
  "name": "Vicetone - Nevada",
  //文件名
  "file": "Nevada.txt",
  //乐谱作者
  "author": "StageGuard",
  //乐谱简介
  "desc": "Nevada SkyStudio钢琴版。\n内包含<u>比较复杂的和弦</u>，不适合手弹(笑\n你可以在SkyStudio的练习模式试试[狗头]",
  //乐谱文件中的BPM
  "bpm": 497,
  //乐谱的键位数目(它是一个 15 键位乐谱还是 8 键位乐谱)
  "keyCount": 15,
  //乐谱文件中的音高
  "pitchLevel": 3,
  //键的数目
  //乐谱文件中数组 songNotes 的长度
  "noteCount": 1308,
  //你的社交链接
  //你可以添加多个
  "social": [
    {
      //社交平台名称代号，现在支持 github, twitter, douyin(tiktok) and coolapk
      "platform": "github",
      //社交平台名称
      "name": "GitHub",
      //社交连接
      "link": "https://github.com/StageGuard/"
    }
  ]
},
```

修改完成后，申请 `Pull Request` ，等待 merge 即可。

> 请注意：在申请`Pull Request`之前请确保你本地的 仓库已同步至最新，以免出现意外问题！

### 2. 如果你不是很懂 Github...

只需要把乐谱发送到邮箱 [beamiscool@qq.com](mailto:beamiscool@qq.com) 来交给我就行啦！别忘了附带乐谱简介！

# 注意!

### 请仔细阅读以下使用须知！

1. 未充分测试，若遇到BUG，请酷安私信@StageGuard或新建Issue来反馈BUG！

2. **SkyAutoplayerScript是完全免费且开源的软件/脚本([https://github.com/StageGuard/SkyAutoPlayerScript](https://github.com/StageGuard/SkyAutoPlayerScript))，使用 SkyAutoplayerScript 盈利的同时请标注源项目链接。**

3. **共享乐谱不遵守LGPL-2.1协议，如您想在SkyAutoPlayer以外使用这些乐谱，请自行找乐谱作者授权！**

4. 本脚本仅可用作娱乐用途，请不要在正规场合使用本脚本(请自行体会\"正规场合\"是什么意思)，若因使用本脚本所出现了一些不友好的问题，与脚本作者StageGuard无关。

5. 脚本只能给你一时满足感而不能使你进步，请适当使用，只有真正的技术才是王道，才能使你感到快乐。

6. 本脚本只是一个"弹奏机"，并不内置曲谱，请在 GooglePlay 下载 [SkyStudio](https://play.google.com/store/apps/details?id=com.Maple.SkyStudio) 编谱。

7. 本脚本不会增加解密乐谱功能，包括但不限于**加密的SkyStudio乐谱**，**加密的JS**等，也不接受加密乐谱的共享。


<details> <summary>针对上述第2, 3条出现的问题：</summary>

# 关于脚本倒卖的问题: [#1](https://github.com/StageGuard/SkyAutoPlayerScript/issues/1)

# 耻辱柱

Gitee 用户[嗨游圈(@vipssp)](https://gitee.com/vipssp)在**未经乐谱上传者的同意下私自盗用** SkyAutoplayerScript 于 Gitee 的[同步镜像](https://gitee.com/stageguard/SkyAutoPlayerScript)到它的 [Gitee 仓库](https://gitee.com/vipssp/SkyAutoPlayerScript/)。

在经过[通知](https://gitee.com/vipssp/SkyAutoPlayerScript/commit/197925a71ff9cc6248be682a55406fc5814b12d7#note_3637784)后仍未及时删除盗用的乐谱，在于一些乐谱原作者沟通后，决定将其挂在此 README.md 首部，以告示。

<table>
<tr>
    <td align="center" height="200">
        <img src="https://gitee.com/stageguard/SkyAutoPlayerScript/raw/master/resources/static/2020-12-19_0-8-40.PNG" />
    </td>
    <td align="center" height="200">
        <img src="https://gitee.com/stageguard/SkyAutoPlayerScript/raw/master/resources/static/2020-12-19_0-9-57.PNG" />
    </td>
    <td align="center" height="200">
        <img src="https://gitee.com/stageguard/SkyAutoPlayerScript/raw/master/resources/static/2020-12-19_0-44-4.PNG" />
    </td>
    <td align="center" height="200">
        <img src="https://gitee.com/stageguard/SkyAutoPlayerScript/raw/master/resources/static/Screenshot_2020-12-19-00-10-12-499_com.coolapk.market.jpg" />
    </td>
    <td align="center" height="200">
        <img src="https://gitee.com/stageguard/SkyAutoPlayerScript/raw/master/resources/static/Screenshot_2020-12-19-00-11-23-671_com.coolapk.market.jpg" />
    </td>
</tr>
</table>
</details>

# 贡献

欢迎任何人贡献本项目，包括但不限于 Pull Request，Issue，New feature request 或者 贡献翻译。

### ⚠️警告
CodeFactor 代码评估: [![CodeFactor](https://www.codefactor.io/repository/github/stageguard/skyautoplayerscript/badge)](https://www.codefactor.io/repository/github/stageguard/skyautoplayerscript)

由于 Auto.js 的限制，无法将不同的功能分离，所以所有功能都在一个文件实现；再加上我糟糕的代码技能，源码会非常难读。

## 贡献者

### SkyAutoPlayerScript

[@tiaod](https://github.com/tiaod)

### 共享乐谱

酷安[@Aex技术总监](http://www.coolapk.com/u/1286879)<br>
酷安[@夏卡卡卡](http://www.coolapk.com/u/2313452)<br>
酷安[@深空失忆か](http://www.coolapk.com/u/3005974)<br>
抖音[@子哲啊🌈(zizhe1880689503)](https://v.douyin.com/J9gUaVE/)<br>
酷安[@你们很有趣呢](http://www.coolapk.com/u/2416229)<br>
酷安[@情如风雪无常](http://www.coolapk.com/u/643670)<br>
酷安[@慕疵](http://www.coolapk.com/u/3286967)<br>
酷安[@社区最弱萌新](http://www.coolapk.com/u/3291313)<br>
酷安[@九方辰](http://www.coolapk.com/u/634078)<br>
酷安[@北极马可罗尼](http://www.coolapk.com/u/463478)<br>
哔哩哔哩[@UTF16](https://space.bilibili.com/623364258)<br>
酷安[@Syngenex](http://www.coolapk.com/u/1093421)<br>
Twitter [Phoebe@huunhut1217](https://mobile.twitter.com/huunhut1217)<br>
酷安[@终究是错付了](http://www.coolapk.com/u/2293899)<br>
酷安[@DesperatU](http://www.coolapk.com/u/1075889)<br>
酷安[@明明酱](http://www.coolapk.com/u/1706128)<br>
酷安[@cxk的篮球](http://www.coolapk.com/u/1090769)<br>
酷安[@头条乀](http://www.coolapk.com/u/1192320)<br>
酷安[@Alusias](http://www.coolapk.com/u/808787)<br>
[chikin](mailto:2869826936@qq.com)<br>
酷安[@温茶予君](http://www.coolapk.com/u/1212499)<br>
酷安[@落红难相聚](http://www.coolapk.com/u/2082465)<br>
酷安[@bugjump233](http://www.coolapk.com/u/3294062)<br>
酷安[@阿基米德的船](http://www.coolapk.com/u/3283016)<br>
[2087131113@qq.com](mailto:2087131113@qq.com)<br>

## 翻译

SkyAutoplayerScript 在版本 21 已支持多语言并可以在线获取语言列表，你可以查看 [contribute-translation.md](contribute-translation.md) (English) 来了解如何贡献翻译。

### 贡献者

无

# 图标来源

[Iconfont-阿里巴巴矢量图标库](https://www.iconfont.cn/)

# 鸣谢

[projectXero](https://gitee.com/projectXero) (提供适用于Rhino的`ListAdapter`)

# 许可证协议

```
    SkyAutoPlayer (Auto.js script)
	  Copyright © 2020-2021 StageGuard

  This library is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation; either
  version 2.1 of the License, or (at your option) any later version.

  This library is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public
  License along with this library; if not, write to the Free Software
  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301
  USA
```
