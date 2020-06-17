---
title: 开发小记——Web Audio API
toc: true
top: true
cover: false
mathjax: false
reprintPolicy: cc_by
date: 2020-04-28 00:27:19
img: https://s1.ax1x.com/2020/04/28/J42pPs.png
password:
tags:
  - 踩坑
  - JavaScript
categories:
  - 前端开发
summary: 总结了 Web Audio API 的使用流程，整理了 AlloyTeam 等团队的方案，记录了使用 Audio API 过程中会遇到的一些问题。
---

## 前言

最近在做一个在线语音聊天室的项目，在此之前零经验，所以疯狂爬帖。对于 Web Audio API 来说，除了 MDN 之外，资料不是特别多，[掘金](https://juejin.im/ "主页") 和 [思否](https://segmentfault.com/ "主页") 文章相对集中，但也不全是新的，这就导致了一个刚入手就会遇到的坑。

> 本文重点不是介绍 Web Audio API，而是分享开发时的历程。若想获得更多知识以及技术细节，请参阅 [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API "Web Audio API - MDN") 和文末 [推荐阅读](#推荐阅读) 中的文章。

测试环境：

- Mozilla Firefox：v75.0
- Microsoft Edge：v81.0.416.64

## getUserMedia

使用 Web Audio API 进行录音，第一步就是要拿到浏览器的录音 API 以及获得相应的录音权限，部分文章会使用 `navigator.getUserMedia()` 这个 API。为解决不同浏览器兼容性问题，有形如以下的代码：

```js
navigator.getUserMedia =
	navigator.getUserMedia ||
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia ||
	navigator.msGetUserMedia;

navigator.getUserMedia(constraints, sucCallBack, errCallBack);
```

上述代码是在三四年前（当前 2020 年）的历史条件下形成的，在 Firefox 下运行可能会有以下警告⚠️：

![#b# getUserMedia() 的警告](https://s1.ax1x.com/2020/04/28/J42AqU.png)

访问 [MDN 对应页面](https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/getUserMedia "Navigator.getUserMedia - MDN")，可以看到该 API 被 [`MediaDevices.getUserMedia()`](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia "MediaDevices.getUserMedia - MDN") 取代，并且结合了 Promise。作为 Navigator 的一个子对象，调用形式如下：

```js
navigator.mediaDevices.getUserMedia({ audio: true, video: false });
	.then((stream) => {
		/* 使用 stream */
	})
	.catch((error) => {
		/* 处理 error */
	});
```

使用 Promise 的 `then()` resolve `sucCallBack()` 处理成功的回调，`catch()` reject `errCallBack()` 处理失败的回调，`constraints` 照旧。

> 返回一个 Promise 对象，成功后会 resolve 回调一个 MediaStream 对象。若用户拒绝了使用权限，或者需要的媒体源不可用，promise 会 reject 回调一个 `PermissionDeniedError` 或者 `NotFoundError`。

> 返回的 promise 对象可能既不会 resolve 也不会 reject，因为用户不是必须选择允许或拒绝。

版本问题不能算是坑，毕竟要考虑项目的用户对象等各种原因，但对于一个刚入坑的新人来讲，很容易摸不着头脑，不知孰对孰错。

好，通过 `navigator.mediaDevices.getUserMedia()` 指定的 resolve 函数，现在可以得到 `stream` 了，这是一个 MediaStream 媒体流，可以直接作为音频或视频的播放源。那么，如何播放呢？创建 `<audio>` 或者 `<video>` 标签，填写 `src` 属性然后触发响应事件就行，OK 文章结束。是吗？强大的 HTML5 可不这么认为，了解了 [音频图](#音频图)，你就会知道原来代码不仅可以作画，还可以 [写音乐](https://www.zhangxinxu.com/wordpress/2017/06/html5-web-audio-api-js-ux-voice/ "张鑫旭的博客")。

在了解播放音频之前，不妨先来看看这些音乐数据的格式。

## 获取数据

JS 获取二进制数据的方式不少，比较常见的就是读取为 ArrayBuffer 和 Blob。

### File 对象

```html
<input type="file" onclick="loadFile(e)">
```

使用 `<input>` 标签上传文件，然后使用 FileReader 对象读取文件。

```js
function loadFile(e) {
	let reader = new FileReader();
	reader.onload = function() {
		let arrayBuffer = reader.result;
		// 处理 arrayBuffer
	};
	reader.readAsArrayBuffer(e.target.files[0]);
}
```

此时 `arrayBuffer` 是 ArrayBuffer 实例，可以通过 `Blob()` 构造 Blob 对象，进而创建 Blob URL。

### Blob URL

> `URL.createObjectURL()` 静态方法会创建一个 DOMString，其中包含一个表示参数中给出的对象的 URL。这个 URL 的生命周期和创建它的窗口中的 document 绑定。这个新的 URL 对象表示指定的 File 对象或 Blob 对象。

```js
reader.load = function(){
	let blob = new Blob([arrBuf], {type: "audio/wav"});
	let blobURL = window.URL.createObjectURL(blob);
	doucment.getElementById("audio").src = blobURL;
	window.URL.revokeObjectURL(blobURL);	// 使用完需要释放资源
}
```

Blob URL 可以像一般的 HTTP URL 引用，但只能在浏览器的单个实例中和同一个会话中。而正是绑定了 document 对象，所以每次使用完尽量释放，尽管页面在关闭时浏览器会自动清理 document。

实际上 File 继承了 Blob，拥有其所有接口，所以 `file` 实例其实无需经过 Blob 可直接创建 Blob URL：

```js
reader.load = function(e){
	blobUrl = URL.createObjectURL(e.target.files[0]);
}
```

### ArrayBuffer

调用 FileReader 对象的 `readAsArrayBuffer()` 方法后，读取 `result` 实例属性，可以获得转换后的 ArrayBuffer 对象，借助 `TypedeArray` 或 `DataView` 对象可实现自定义操作。

### XHR

使用 HTTP 协议的 AJAX，可以发送或者接受二进制文件。

- 接受：
	```js
	var XHR = new XMLHttpRequest();
	XHR.open("GET", "/myfile.png", true);
	XHR.responseType = "arraybuffer";
	XHR.onload = function(e) {
		let buf = XHR.response;	// 获得 ArrayBuffer
	}
	```
	- 也可直接构造 Blob
		```js
		let blob = new Blob([XHR.response], { type: "image/png" });
		```
	- 或者设置 `responseType` 为 `blob`
		```js
		XHR.responseType = "blob";
		```
- 发送：
	```js
	let myArray = new ArrayBuffer(512);
	let longInt8View = new Uint8Array(myArray);
	let XHR = new XMLHttpRequest();
	XHR.open("POST", url, true);
	XHR.send(longInt8View);
	```
	XHR 增强的 `send()` 方法可直接发送二进制文件。

### WebSocket

同样 WebSocket 的 `send()` 方法也可直接发送二进制格式，具体有以下类型：

- USVString
- Blob
- ArrayBuffer

而接收时，浏览器可能会进行解析，因此必要时需在连接前指定 `binarytype` 属性。如果发送是以 Blob，那么接收也应该按相同的格式接收。除却 USVString，两种类型大致相同，Blob 适合直接保存为文件，ArrayBuffer 适合在内存中编辑（毕竟有 `TypedeArray` 和 `DataView`）。

## 音频图？

[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API "Web Audio API - MDN") 对 Web Audio API 是这样介绍的：

> Web Audio API 使用户可以在*音频上下文*(AudioContext)中进行音频操作，具有*模块化路由*的特点。在*音频节点*上操作进行基础的音频， 它们连接在一起构成*音频路由图*。

下方还有这样的章节：

![#b# 音频图?](https://s1.ax1x.com/2020/04/28/J42VZF.png)

什么是音频图呢？乍接触到时云里雾里的，直接翻文档不知所云，所以还是得先读一读其他的文章。爬帖一波，再结合文档，我整理了如下一张图：

![#b# Audio API 的大体结构](https://s1.ax1x.com/2020/04/28/J42krT.png)

可以看到，AudioContext 和 AudioNode 衍生出了一系列对象。不得不说，Web 的对象和 API 真是多，而且相互交织，不画个示意图真不好理解。

### 创建 AudioContext

AudioContext 翻译为 *音频上下文*，对音频的一切操作都在这个环境里进行，就像一个工厂。自然而然的会想到，AudioContext 可以类比 Canvas 中 `getContext()`。

```js
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
```

有了 AudioContext 后，就可以创建音频/视频源了，来源有下面几个。

### AudioBufferSourceNode

AudioBufferSourceNode 对象由 AudioContext 实例的 `createBufferSource()` 方法创建。

顾名思义，就是音视频的起点，是一个 AudioNode。有以下常用属性：

- `buffer`：是一个 AudioBuffer 对象，表示要播放的音频
- `loop`：布尔值。是否重播，默认 `false`
- `connect`：继承自 [AudioNode](#audionode "跳转到该节")

使用以下方法开始和暂停：

- `start(when[, offset][, duration])`：从 `when` 开始播放
	只能被播放一次，也就是每次 `start()` 后，如果想再播放一遍，就需要重新创建，不过创建该节点代价不大
- `stop([when])`：到 `when` 停止播放
	不同于 `start()`，可以多次调用

该节点的 `buffer` 属性指向一个 AudioBuffer 对象，这个对象是由 AudioContext 的方法创建的。前面提到，通过 XHR 或者 File 获得二进制文件。我们都知道音视频都有压缩（所以产生了各种压缩格式），播放前得先解码，所以下面两个函数就是用来将之解码为可播放的 buffer。

#### `decodeAudioData()`

该函数可实现从 **音频文件** 的 ArrayBuffer 异步解码。新版 API 使用 Promise 的形式。

```js
XHR.onload = function(){
	context.decodeAudioData(XHR.response)
		.then((buffer) => {
			// 处理 buffer
		})
		.catch((error) => {
			// 处理错误
		});
};
```

#### `createBuffer()`
新建一个空白的 AudioBuffer 对象，以便用于填充数据，通过 AudioBufferSourceNode 播放。

```js
let ctx = new AudioContext();
let emptyBuffer = ctx.createBuffer(numOfChan, len, rate);
```

- `numOfChan`：声道数
- `len`：长度
- `rate`：采样频率

### AudioDestinationNode

为了遵循行文逻辑，而保持层次结构上清晰，这部分见 [`destination`](#destination)。

### MediaElementAudioSourceNode
- 表示由 HTML5 `<audio>` 或 `<video>` 元素生成的音频源
- 这是一个作为音频源的 AudioNode

```js
let audioCtx = new window.AudioContext();
let audio = document.querySelector('audio');
let source = audioCtx.createMediaElementSource(audio);
```

### MediaStreamAudioSourceNode
- 表示由 WebRTC MediaStream（如网络摄像头或麦克风）生成的音频源
- 这是一个作为音频源的 AudioNode

```js
navigator.mediaDevices.getUserMedia(constraints)
	.then((stream) => {
			let audioCtx = new window.AudioContext();
			let source = audioCtx.createMediaStreamSource(stream);
	});
```

## 连接 `connect()`

有了起点和音源/视频源，现在可以播放了。怎么操作呢？很简单，连接到扬声器/屏幕就行了。把大象塞到冰箱里的第三步——关上冰箱门。在这里是连接到终点。

### `destination`

所谓终点，由 AudioContext 的 `destination` 定义，是一个 AudioDestinationNode 对象，该对象也是个 AudioNode，一般表示最终的渲染设备。

```js
let audioCtx = new AudioContext();
let source = audioCtx.createMediaElementSource("element");
source.connect(audioCtx.destination);
```

使用 `disconnect()` 方法断开连接，可以实现停止播放，再次 `connect()` 即可继续。

对于 WebRTC MediaStream，媒体流可以存储在本地文件或者被发送到另外一台计算机，使用 `createMediaStreamDestination()` 方法创建一个对象，关联一个音频流。

```js
let audioCtx = new AudioContext();
let destination = audioCtx.createMediaStreamDestination();
```

现在 `<audio>` 和 `<video>` 标签的功能好像都实现了，但 Web Audio API 的功能远不止这些。翻看 MDN 文档，会发现有一堆 `*Node`，这些对象都是继承自 AudioNode，正如示意图所呈现的。

### AudioNode

该接口是处理音视频的通用模块，可以衍生出各种不同功能的模块，正如上文多次提到的“作为 `AudioNode`”

- AudioBufferSourceNode，它的数据来源于一个解码好的完整的 buffer
- GainNode：用于设置音量
- OscillatorNode：用于产生周期性波形
- BiquadFilterNode：用于滤波
- ScriptProcessorNode：用 JS 处理音频，见 [下文](#scriptprocessornode)
- MediaStreamAudioSourceNode：用于连接麦克风设备

这些模块既有输入也有输出，可以用装饰者模式一层层 connect，不同的节点可以 **连接** 在一起构建一个处理图。

![#b# 音频节点图 - MDN](https://mdn.mozillademos.org/files/7949/voice-change-o-matic-graph.png)

### GainNode

是用于修改音量的节点，现在可以写一个音乐播放器了（逃

```js
let gainNode = context.createGain();
source.connect(gainNode);
gainNode.connect(context.destination);
```

连接好后可以通过修改 `value` 值更改音量：

```js
gainNode.gain.value = 0.5;
```

### 代码与艺术

借助各式各样的音频模块，处理一段音频或者生成一段音频不在话下，甚至还能用声音作画（AnalyserNode），我不通乐理、不懂声学，暂且不深入学习。分享几个与 Web Audio API 相关的网页：

- [Violent Theremin](http://mdn.github.io/violent-theremin/)
- [Voice change o matic](https://mdn.github.io/voice-change-o-matic/)
- [Loop Waveform Visualizer](https://airtightinteractive.com/demos/js/reactive)

若有兴趣可移步 [把浏览器变成钢琴！Web Audio API入门](https://github.com/yrq110/odds-and-ends/blob/master/%E6%8A%8A%E6%B5%8F%E8%A7%88%E5%99%A8%E5%8F%98%E6%88%90%E9%92%A2%E7%90%B4%EF%BC%81Web%20Audio%20API%E5%85%A5%E9%97%A8.md "博客文章")。

## 录音

大致了解了 Audio API，但还没解决录音的问题，录音这部分资料不是太多，但模式大致相同。

1. 使用 WebRTC 的 `getUserMedia()` 获取 MediaStream
2. 使用这个流初始化（`createMediaStreamSource()`）一个 [MediaStreamAudioSourceNode](#mediastreamaudiosourcenode) 音频模块
3. 将节点连接到 ScriptProcessorNode（`createScriptProcessor()`）——使用 JS 处理音频的节点
4. 设置 ScriptProcessorNode 的 `onaudioprocess` 事件的回调函数

### ScriptProcessorNode

通过这个节点，可以使用 JS 操作音频，进一步让用代码写音乐成为可能。

```js
let audioCtx = new AudioContext();
scriptNode = audioCtx.createScriptProcessor(bufferSize, numrOfIn, numOfOut);
```

- `bufferSize`：缓冲区大小，应为 2 的幂，通常为 `4096`
- `numOfIn`：输入声道数，默认 `2`，最高 `32`
- `numOfOut`：输出声道数，默认 `2`，最高 `32`

### `onaudioprocess` 事件

该事件对象有以下两个缓冲区（AudioBuffer 对象）：

- `inputBuffer`
- `outputBuffer`

使用 `getChannelData(num)` 方法可获得该 `num` 声道的数据，数据以 Float32Array 对象存储。

```js
const onAudioProcess = (event) => {
    let audioBuffer = event.inputBuffer;
    let leftChannelData = audioBuffer.getChannelData(0),
		rightChannelData = audioBuffer.getChannelData(1);
	// 处理两个声道的数据
}
```

### 合并声道

各个声道是分离的，如果要存储然后播放，按时间先后排布显然是不行的，所以要合并，左右声道交叉存储和播放。

```js
// 交叉合并左右声道的数据
const combine = (left, right) => {
    let totalLength = left.length + right.length;
    let data = new Float32Array(totalLength);
    for (let i = 0; i < left.length; i += 2) {
        data[k] = left[i];
        data[k + 1] = right[i];
    }
    return data;
}
```

### 编码并传输

编码为 WAV 格式的函数经过不断改进，可以直接使用。编码以及压缩后的数据（Blob）可以直接保存/发送。但是在实时通信的场景下，数据应该是源源不断地产生和消耗，所以要用到流。开辟一块缓冲区，隔一段时间取出发送，并清空缓冲区，当这个间隔时间大小合适，就能产生实时的效果。

感谢腾讯 AlloyTeam 全端团队来自 2015 年的 [文章](http://www.alloyteam.com/2015/12/websockets-ability-to-explore-it-with-voice-pictures)，给出了 Audio API 结合 WebSocket 进行录制与传输的方案。我在此基础上稍作修改，分理出两个类，项目的烂代码还没开源，为不影响阅读暂把前人的智慧贴在文章末尾。（可自定义的参数太多了，全部提取出来有点繁琐，所以部分参数硬编码了。）

## 推荐阅读
> 注意本节内容列出阅读的文章，虽然也是写作本文的参考文章，读到这里时也建议移步吸取灵感。

1. [深入浅出 Web Audio Api - 掘金](https://juejin.im/post/599e35f5f265da246c4a1910)
2. [大话Web-Audio-Api - 掘金](https://juejin.im/entry/588ca34e8fd9c5d09bbcaad4)
3. [初识HTML5 Web Audio API - 掘金](https://juejin.im/post/5cbfdd4ee51d456e6f45c721)
4. [如何实现前端录音功能 - 掘金](https://juejin.im/post/5b8bf7e3e51d4538c210c6b0)
5. [HTML5音频API Web Audio - 思否](https://segmentfault.com/a/1190000010561222)
6. [基于WebSocket的在线聊天室（一） - 简书](https://www.jianshu.com/p/62790429acef)
7. [基于WebSocket的在线聊天室（二） - 简书](https://www.jianshu.com/p/03a74d489f34)
8. [websocket 探索其与语音、图片的能力](http://www.alloyteam.com/2015/12/websockets-ability-to-explore-it-with-voice-pictures)
9. [把浏览器变成钢琴！Web Audio API入门](https://github.com/yrq110/odds-and-ends/blob/master/%E6%8A%8A%E6%B5%8F%E8%A7%88%E5%99%A8%E5%8F%98%E6%88%90%E9%92%A2%E7%90%B4%EF%BC%81Web%20Audio%20API%E5%85%A5%E9%97%A8.md)
10. [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 附录：代码

```js
class SAudioData {
	constructor(rate) {
		this.size = 0; // 录音文件长度
		this.buffer = []; // 录音缓存
		this.inputSampleRate = rate; // 输入采样率
		this.outputSampleRate = 44100 / 6; // 输出的采样率,取决于平台
		this.inputSampleBits = 16; // 输入采样位数 8, 16
		this.outputSampleBits = 8; // 输出采样位数 8, 16
	}

	// 填入缓冲区
	inputData = (data) => {
		this.buffer.push(new Float32Array(data));
		this.size += data.length;
	};

	// 清理缓冲区
	clearData = () => {
		this.size = 0;
		this.buffer = [];
	};

	// 合并压缩
	compress = () => {
		var data = new Float32Array(this.size);
		var offset = 0;
		for (var i = 0; i < this.buffer.length; i++) {
			data.set(this.buffer[i], offset);
			offset += this.buffer[i].length;
		}
		// 压缩
		var compression = parseInt(this.inputSampleRate / this.outputSampleRate);
		var length = data.length / compression;
		var result = new Float32Array(length);
		var index = 0,
			j = 0;
		while (index < length) {
			result[index] = data[j];
			j += compression;
			index++;
		}
		return result;
	};

	// 编码为 WAV，Blob
	encodeWAV = () => {
		var sampleRate = Math.min(this.inputSampleRate, this.outputSampleRate);
		var sampleBits = Math.min(this.inputSampleBits, this.outputSampleBits);
		var bytes = this.compress();
		var dataLength = bytes.length * (sampleBits / 8);
		var buffer = new ArrayBuffer(44 + dataLength);
		var data = new DataView(buffer);

		var channelCount = 1; // 单声道
		var offset = 0;

		var writeString = function (str) {
			for (var i = 0; i < str.length; i++) {
				data.setUint8(offset + i, str.charCodeAt(i));
			}
		};

		writeString("RIFF"); // 资源交换文件标识符
		offset += 4;
		data.setUint32(offset, 36 + dataLength, true); // 下个地址开始到文件尾总字节数，即文件大小 -8
		offset += 4;
		writeString("WAVE"); // WAV 文件标志
		offset += 4;
		writeString("fmt "); // 波形格式标志
		offset += 4;
		data.setUint32(offset, 16, true); // 过滤字节,一般为 0x10 = 16
		offset += 4;
		data.setUint16(offset, 1, true); // 格式类别 (PCM 形式采样数据)
		offset += 2;
		data.setUint16(offset, channelCount, true); // 通道数
		offset += 2;
		data.setUint32(offset, sampleRate, true); // 采样率，每秒样本数,表示每个通道的播放速度
		offset += 4;
		data.setUint32(offset, channelCount * sampleRate * (sampleBits / 8), true); // 波形数据传输率 (每秒平均字节数) 单声道×每秒数据位数×每样本数据位/8
		offset += 4;
		data.setUint16(offset, channelCount * (sampleBits / 8), true); // 快数据调整数 采样一次占用字节数 单声道×每样本的数据位数/8
		offset += 2;
		data.setUint16(offset, sampleBits, true); // 每样本数据位数
		offset += 2;
		writeString("data"); // 数据标识符
		offset += 4;
		data.setUint32(offset, dataLength, true); // 采样数据总数，即数据总大小-44
		offset += 4;

		// 写入数据
		if (sampleBits === 8) {
			for (var i = 0; i < bytes.length; i++, offset++) {
				var s = Math.max(-1, Math.min(1, bytes[i]));
				var val = s < 0 ? s * 0x8000 : s * 0x7fff;
				val = parseInt(255 / (65535 / (val + 32768)));
				data.setInt8(offset, val, true);
			}
		} else {
			for (var i = 0; i < bytes.length; i++, offset += 2) {
				var s = Math.max(-1, Math.min(1, bytes[i]));
				data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
			}
		}

		return new Blob([data], { type: "audio/wav" });
	};
}
```

```js
class SRecorder {
	constructor(stream) {
		this.clock = null; // 循环定时器
		// 音频处理接口
		this.audioContext = new AudioContext();
		// 通过音频流创建输入音频对象
		this.audioInput = this.audioContext.createMediaStreamSource(stream);
		// 创建音频数据对象
		this.audioData = new SAudioData(this.audioContext.sampleRate);
		// 创建音量对象
		this.audioVolume = this.audioContext.createGain();
		// 创建录音机对象
		this.recorder = this.audioContext.createScriptProcessor(4096, 1, 1);
		this.recorder.onaudioprocess = (e) => {
			this.audioData.inputData(e.inputBuffer.getChannelData(0));
		};
	}

	// 开始录音
	start = (callback = null) => {
		this.audioInput.connect(this.audioVolume);
		this.audioVolume.connect(this.recorder);
		this.recorder.connect(this.audioContext.destination);
		callback && this.cycle((data) => callback(data));
	};

	// 停止录音
	stop = () => {
		this.recorder.disconnect();
		clearTimeout(this.clock);
	};

	// 暂停录音
	pause = () => {
		this.audioVolume.disconnect();
		clearTimeout(this.clock);
	};

	// 继续录音
	continue = (callback = null) => {
		this.recorder.connect(this.audioContext.destination);
		callback && this.cycle((data) => callback(data));
	};

	// 获取 WAV 数据
	getWav = () => {
		return this.audioData.encodeWAV();
	};

	// 清除缓冲区
	clear = () => {
		this.audioData.clearData();
	};

	// 循环拉取缓冲数据，使用 `callback()` 发送出去，该方法适用于流
	cycle = (callback, time = 500) => {
		let bTime = new Date();
		callback(this.getWav());
		this.clear();
		this.clock = setTimeout(
			() => this.cycle((data) => callback(data), time),
			time - (new Date() - bTime)
		);
	};
}
```