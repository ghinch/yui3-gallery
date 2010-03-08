import mx.transitions.Tween;
import mx.transitions.easing.*;

stop();

if(!bgcolor) bgcolor = "0x051615";
if(!fgcolor) fgcolor = "0x13ABEC";
setFills(bgcolor, fgcolor);

/* Disable the default menu */
(_root.menu = new ContextMenu()).hideBuiltInItems();
function jc(){getURL("http://www.Jambocast.com")}
function addVideo(){getURL("http://www.JamboVideoNetwork.com")}
_root.menu.customItems.push(new ContextMenuItem("Powered by JamboCast", jc));
_root.menu.customItems.push(new ContextMenuItem("Add Video to Your Site", addVideo));

/* You don't have to leave the right click link or the menu item. Use this line instead
   to get rid of the link. You may NOT copyright the player, or say you created it. */
//_root.menu.customItems.push(new ContextMenuItem("Created by Jambo Media", new Function()));

/* Set stage properties */
Stage.align = "BL";
Stage.scaleMode = "noScale";

/* Set globals */
_global.wasPlaying = false;
_global.noTwitch = false;
_global.ready = false;

/* Embed parameters */
_global.autoplay = (autoplay == "true" || autoplay == "on") ? true : false;
_global.filename = movie;
_global.autoload = (autoload == "false" || autoload == "off") ? false : true;
_global.muteonly = (muteonly == "true" || muteonly == "on") ? true : false;
_global.loop = (loop == "true" || loop == "on") ? true : false;
_global.autorewind = (autorewind == "false" || autorewind == "off") ? false : true;
_global.mute = (mute == "true" || mute == "on") ? true : false;
_global.clickurl = clickurl;
_global.clicktarget = clicktarget;

_global.postimage = postimage;

if(postimage != null)
{
	_root.posterImage._width = Stage.width;
	_root.posterImage._height = Stage.height - 40;
	_root.posterImage._x = 0;
	_root.posterImage._y = 400 - Stage.height;

	this.posterImage.loadMovie(postimage);	
}

_root.bigplayButton._visible = false;
_root.washoutplay._alpha = 0;
_root.preLoader.play();
_root.posterImage._alpha = 0;

_root.playButton._visible = false;
_root.pauseButton._visible = false;

_root.setSizes();

if(!_global.clickurl)
	_root.clickArea._visible = false;

if (_global.volume = volume) _root.display.volume = volume; else _global.volume = 50;

_root.volPanel.volDrag._x = (_global.volume / 2);

if(_root.display.volume <= 1)
	_root.volPanel.volDrag._x = 0;

/*Set Volume Control*/
if(_global.muteonly){
	_root.panelRight.audioOn._visible = false;
} else {
	_root.panelRight.audioOn._visible = true;
} 

if(_global.mute){
	_root.display.volume = 0;
	this.panelRight.audioOn._visible = false;
}


/* Error message and embed instructions */
if(!movie)
	_root.gotoAndStop(2);

/* Converts seconds into readable time */
function formatTime(timeval){
	timeval = timeval / 60;
	integer = String(Math.floor(timeval));
	decimal = timeval - Math.floor(timeval);
	decimal *= .6;
	decimal = String(decimal);
	decimal = decimal.substr(2, 2);
	while(decimal.length < 2) decimal = "0" + decimal;
	while(integer.length < 2) integer = "0" + integer;
	
	return integer + ":" + decimal;
}

/* Events genearted by the FLV Component */
var listenerObject:Object = new Object();

listenerObject.complete = function(eventObject:Object):Void {
	if(_global.autorewind && !_global.loop){
		_root.display.playheadTime = 0;
		_root.display.pause();
		_root.playButton._visible = true;
		_root.pauseButton._visible = false;
		return;
	}
	_root.playButton._visible = !_global.loop;
	_root.display.play();
};

listenerObject.ready = function(eventObject:Object):Void {
	_root.panelRight.totalTime.text = formatTime(_root.display.totalTime);
	_global.ready = true;
	_root.washout._visible = _root.washoutplay._visible = false;
	_root.preLoader.stop();
	_root.preLoader._visible = false;
	_root.pauseButton._visible = true;
	_root.display.volume = _global.volume;
	
	if(_global.autoplay == false && _global.autoload == true){
		_root.bigplayButton._visible = true;
		_root.pauseButton._visible = false;
		
		_root.bigplayButton.onRelease = function() {
			_root.display.play();
			_root.playButton._visible = false;
			_root.pauseButton._visible = true;
			_root.bigplayButton._visible = false;
			_root.posterImage._alpha = 0;
		}
	}
	
	_root.setSizes();
};

listenerObject.playheadUpdate = function(eventObject:Object):Void {
	if(!_global.noTwitch){
		_root.playingBar._width = (Stage.width - 228) * (_root.display.playheadTime / _root.display.totalTime);
		_root.panelRight.currentTime.text = formatTime(_root.display.playheadTime);
		_root.slider._x = 32 + (Stage.width - 228) * (_root.display.playheadTime / _root.display.totalTime);
	} else
		_global.noTwitch = false;
};

listenerObject.stateChange = function(eventObject:Object):Void {
	if(_root.display.state == 'connectionError')
		_root.gotoAndStop(2);
};

listenerObject.progress = function(eventObj){
	_root.blankBar._width = ((Stage.width - 228) * (1-(_root.display.bytesLoaded / _root.display.bytesTotal))) ;
	_root.blankBar._x = (Stage.width - 228 + 34) - _root.blankBar._width;
}

_root.display.addEventListener("ready", listenerObject);
_root.display.addEventListener("complete", listenerObject);
_root.display.addEventListener("playheadUpdate", listenerObject);
_root.display.addEventListener("stateChange", listenerObject);
_root.display.addEventListener("progress", listenerObject);

/* Sets the sie of all root objects */
_root.setSizes = function(){
	if(Stage.width < 200)
		return false;
		
	_root.playingBar._width = (Stage.width - 228) * (_root.display.playheadTime / _root.display.totalTime);
	_root.panelRight.currentTime.text = formatTime(_root.display.playheadTime);
	_root.slider._x = 32 + (Stage.width - 228) * (_root.display.playheadTime / _root.display.totalTime);
	
	_root.washout._width = _root.panel._width = Stage.width;
	_root.panelRight._x = Stage.width - 137;
	_root.bar._width = Stage.width - 228;
	_root.loadedBar._width = Stage.width - 228;
	
	//_root.panelRight.currentTime._x = playingBar._x - 40;

	_root.blankBar._width = ((Stage.width - 228) * (1-(_root.display.bytesLoaded / _root.display.bytesTotal))) ;
	_root.blankBar._x = (Stage.width - 228 + 34) - _root.blankBar._width;
	
	_root.washoutplay._width = _root.bigplayButton._width = Stage.width / 4;
	_root.washoutplay._x =_root.bigplayButton._x = ((Stage.width/2) - (_root.bigplayButton._width/2));
	_root.washoutplay._height =_root.bigplayButton._height = _root.bigplayButton._width * (84/127);
	_root.washoutplay._y =_root.bigplayButton._y = (400-Stage.height)+((Stage.height-40) -_root.bigplayButton._height)/2;
	
	_root.preLoader._x = ((Stage.width-_root.preLoader._width)/2) - (_root.preLoader._width/4);
	_root.preLoader._y = (400-Stage.height)+((Stage.height-40)-_root.preLoader._height)/2;
	
	_root.usage._y = 200-(Stage.height/2);
	_root.usage._x = (Stage.width-550)/2;

	aspect = _root.display.preferredWidth / _root.display.preferredHeight;

	if( ( (Stage.height-40) * aspect) <= Stage.width){
		_root.display._height = Stage.height-40;	
		_root.display._width = _root.display._height * aspect;
		_root.display._x = (Stage.width - _root.display._width) / 2;
	} else {
		_root.display._width = Stage.width;
		_root.display._height = ( Stage.width * (1/aspect));
		_root.display._x = (Stage.width - _root.display._width) / 2;
	}
	
	_root.volPanel._x = _root.panelRight._x + 50;
	_root.volPanel._y = _root.panelRight._y + 1;
	//_root.volPanel._alpha = 0;
	_root.volPanel.volLine._x = 0;
	_root.volPanel.volLine._y = 0;
	
	
	_root.clickArea._width = Stage.width;
	_root.clickArea._height = Stage.height - 40;
	_root.clickArea._y = 400 - Stage.height;
	_root.display._y = 400 - Stage.height + (((Stage.height-40) - _root.display._height) / 2);
	_root.playingBar._width = (Stage.width - 228) * (_root.display.playheadTime / _root.display.totalTime);
	return true;
}


sizeListener = new Object();
sizeListener.onResize = function() {
	_root.setSizes();
};
sizeListener.onFullScreen = function() {
	_root.setSizes();
}
Stage.addListener(sizeListener);

var listenerObject:Object = new Object();

if(_global.autoplay == true){
	_root.display.contentPath = _global.filename;
	_root.display.play();
	sizeListener.onResize();
	
	_root.posterImage._alpha = 0;
	_root.bigplayButton._visible = false;
	_root.playButton._visible = false;
	_root.pauseButton._visible = true;
}

if(_global.autoload == true) {
	_root.display.contentPath = _global.filename;
	sizeListener.onResize();
	
	if (_root.bigplayButton._visible == true) {
		_root.bigplayButton.onRelease = function() {
			_root.posterImage._alpha = 0;
			_root.display.play();
			_root.playButton._visible = false;
			_root.pauseButton._visible = true;
			_root.bigplayButton._visible = false;
		}
	}
}
	
if(_global.autoload == false) {
	sizeListener.onResize();
	_root.posterImage._alpha = 100;
	
	_root.bigplayButton.onRelease = function() {
		_root.display.contentPath = _global.filename;
		_root.display.play();
		_root.playButton._visible = false;
		_root.pauseButton._visible = true;
		_root.bigplayButton._visible = false;
		_root.posterImage._alpha = 0;
	}
}

if(_global.autoload == true)
	_root.display.contentPath = _global.filename;


if(_global.autoplay == false){
	sizeListener.onResize();	
	_root.posterImage._alpha = 100;
	_root.bigplayButton._visible = true;
	_root.pauseButton._visible = false;
	_root.preLoader._visible = false;
	
}

if(_root.bigplayButton._visible == false)
	_root.posterImage._alpha = 0;
	

_root.playingBar.onRelease = function(){
	percentage = (_root._xmouse-44) / (Stage.width-228);
	_root.display.playheadTime = percentage * _root.display.totalTime;
	_root.bigplayButton._visible = false;
	_root.slider._x = 32 + (Stage.width - 228) * (_root.display.playheadTime / _root.display.totalTime);

	if(_global.wasPlaying) _root.display.play();
}

_root.blankBar.onRelease = function(){
	if(_global.ready){
		percentage = _root.display.bytesLoaded / _root.display.bytesTotal;
		_global.noTwitch = false;
		_root.display.seekSeconds(Math.floor(percentage * _root.display.totalTime));
		if(_global.wasPlaying) _root.display.play();
		_root.bigplayButton._visible = false;
		//if(_global.wasPlaying) _root.display.play();
	}
}

_root.loadedBar.onRelease = function(){
	if(_global.ready){
		percentage = (_root._xmouse-44) / (Stage.width-228);
		_root.display.playheadTime = percentage * _root.display.totalTime;
		_root.bigplayButton._visible = false;
	
		_root.slider._x = 32 + (Stage.width - 228) * (_root.display.playheadTime / _root.display.totalTime);
		_root.bigplayButton._visible = false;
	}
}

_root.pauseButton.pausebtn.onRelease = function(){
	_root.display.pause();
	_root.playButton._visible = true;
	_root.pauseButton._visible = false;
}

_root.playButton.playbtn.onRelease = function(){

	if(!_global.autoload)
		if(!_root.display.contentPath){
			_root.display.contentPath = _global.filename;
			_global.autoload = true;
			_root.display.play();
			_root.playButton._visible = false;
			_root.bigplayButton._visible = false;
			_root.pauseButton._visible = true;
		}
	
	if(_global.ready){		
		_root.display.play();
		_root.playButton._visible = false;
		_root.pauseButton._visible = true;
		_root.bigplayButton._visible = false;
	}
}

_root.usage._width = Stage.width;
_root.usage._height = Stage.height;
_root.usage._y = 400 - Stage.height;

/* Sets the starting size of the objects */
_root.onEnterFrame = function(){
	if(_root.setSizes())
		_root.onEnterFrame = null;
}

/* Turn on video smoothing */
MovieClip(_root.display.getVideoPlayer(_root.display.activeVideoPlayerIndex))._video.smoothing = true;

_root.panelRight.audioOn.onPress = function() {
	_root.panelRight.audioOn._visible = false;
	_root.display.volume = 0;
	_root.volPanel.volDrag._x = 0;
	
	_root.volPanel.volDrag.enabled = false;
}	

_root.panelRight.audioOff.onPress = function() {
	_root.volPanel.volDrag.enabled = true;
	_root.panelRight.audioOn._visible = true;
	_root.display.volume = _root.currVol;
	_root.volPanel.volDrag._y = 13;
	_root.volPanel.volDrag._x = _root.currVol/2;
	
	if (!_root.currVol) {
		_root.display.volume = _global.volume;
		_root.volPanel.volDrag._x = _global.volume/2;
	}
}

/* Slider */
_root.slider.onPress = function(){
	if(_global.ready){
		_global.wasPlaying = _root.display.playing;
		_root.display.pause();
		_root.slider.onEnterFrame = Sliding;
	}
}

function Sliding(){

	percentage = (_root._xmouse-32) / (Stage.width-228);
	
	if(percentage <= 0){
		_root.slider._x = 32;
		_root.panelRight.currentTime.text = "00:00";
		_root.playingBar._width = 0;
		return;
	}
	if(percentage >= 1){
		_root.slider._x = Stage.width-200;
		_root.panelRight.currentTime.text = formatTime(_root.display.totalTime);
		_root.playingBar._width = (Stage.width - 228);
		return;
	}
	
	_root.slider._x = 32 + ((Stage.width-200)-32) * percentage;
	_root.panelRight.currentTime.text = formatTime(_root.display.totalTime * percentage);
	_root.playingBar._width = (Stage.width - 228) * percentage;
}

function Release(){
	_root.slider.onEnterFrame = null;

	percentage = (_root._xmouse-44) / (Stage.width-228);
	loadedPercentage = _root.display.bytesLoaded / _root.display.bytesTotal;
	
	if(percentage < 0)
		percentage = 0;
	if(percentage > 1)
		percentage = 1;
	if(percentage > loadedPercentage)
		percentage = loadedPercentage - .01;
	
	_root.display.playheadTime = Math.floor(percentage * _root.display.totalTime);
	
	_root.slider._x = 32 + ((Stage.width-200)-32) * percentage;
	_root.panelRight.currentTime.text = formatTime(_root.display.totalTime * percentage);
	_root.playingBar._width = (Stage.width - 228) * percentage;
	
	if(_global.wasPlaying) _root.display.play();
	_root.bigplayButton._visible = false;
	_global.noTwitch = true;
}

_root.slider.onRelease = function(){
	Release();
}

_root.slider.onReleaseOutside = function(){
	Release();
}

/* Dynamic Foreground and Background Colors */
function setFills(bgcolor, fgcolor){
	_root.panel.barbase.beginFill(bgcolor);
	_root.panel.barbase.moveTo(0, 0);
	_root.panel.barbase.lineTo(550, 0);
	_root.panel.barbase.lineTo(550, 40);
	_root.panel.barbase.lineTo(0, 40);
	_root.panel.barbase.lineTo(0, 0);
	_root.panel.barbase.endFill();
	
/*	_root.volPanel.beginFill(bgcolor);
	_root.volPanel._alpha = 75;
	_root.volPanel.moveTo(0, 0);
	_root.volPanel.lineTo(0, 70);
	_root.volPanel.lineTo(40, 70);
	_root.volPanel.lineTo(40, 0);
	_root.volPanel.lineTo(0,0);
	_root.volPanel.endFill();*/
	
	_root.bigplayButton.beginFill(fgcolor);
	_root.bigplayButton.moveTo(0, 0);
	_root.bigplayButton.lineTo(127, 0);
	_root.bigplayButton.lineTo(127, 84);
	_root.bigplayButton.lineTo(0, 84);
	_root.bigplayButton.lineTo(0, 0);
	_root.bigplayButton.endFill();
	
	_root.volPanel.volLine.beginFill(fgcolor);
	_root.volPanel.volLine.moveTo(0, 5);
	_root.volPanel.volLine.lineTo(50, 5);
	_root.volPanel.volLine.lineTo(50, 10);
	_root.volPanel.volLine.lineTo(0, 10);
	_root.volPanel.volLine.lineTo(0,5);
	_root.volPanel.volLine.endFill();
	
	_root.loadedBar.beginFill(fgcolor);
	_root.loadedBar.moveTo(0, 0);
	_root.loadedBar.lineTo(363, 0);
	_root.loadedBar.lineTo(363, 6);
	_root.loadedBar.lineTo(0, 6);
	_root.loadedBar.lineTo(0, 0);
	_root.loadedBar.endFill();
}

if(_global.clickurl){
	_root.clickArea.onPress = function(){
		if(_global.clicktarget)
			getURL(_global.clickurl, _global.clicktarget, "GET");
		else
			getURL(_global.clickurl, '_blank', "GET");
	}
}