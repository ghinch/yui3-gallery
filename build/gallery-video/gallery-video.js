YUI.add('gallery-video', function(Y) {

function VideoBase () {
	VideoBase.superclass.constructor.apply(this, arguments);
}

Y.mix(VideoBase, {
	NAME : 'video',
	
	ATTRS : {
		mimeType : {
			value : '',
			validator : Y.Lang.isString
		},
		src : {
			value : '',
			validator : Y.Lang.isString
		},
		autoplay : {
			value : true,
			validator : Y.Lang.isBoolean
		},
		defaultControls : {
			value : false,
			validator : Y.Lang.isBoolean
		},
		media : {
			value : null,
			validator : function (val) {
				return this._validateMedia(val);
			}
		},
		volume : {
			value : 100,
			validator : function (val) {	
				return this._validateVolume(val);
			},
			setter : function (val, attr) {
				return parseInt(val, 10);
			}
		}
	}
});
var videoTemplate =
		'<video width="100%" height="100%" ' +
			//'src="{src}" ' +
			//'poster="{poster}" ' +
			//'preload ' +
			'{autoplay} ' +
			'{controls}>' +
			'{source}' +
		'</video>',
	sourceTemplate =
		'<source ' +
			'src="{src}" ' +
			'type="{typeDef}" ' +
			'{media}>',
	objTemplate =
		'<object width="{width}" height="{height}" ' +
			'data="{src}" ' +
			//'id="{id}" ' +
			//'name="{name}" ' +
			'codebase="{codebase}" ' +
			'classid="{classid}" ' +
			'type="{mimeType}" ' +
			'style="{style}">' +
			'{params}' +
		'</object>',
	paramTemplate =
		'<param name="{name}" value="{value}">';

Y.extend(VideoBase, Y.Widget, {
	_videoNode : null,
	
	_validateMedia : function (val) {
		
		return true;
	},
	
	_validateVolume : function (val) {
		if (Y.Lang.isNumber(val) === false) {
			return false;
		}
		
		if (val > 100 || val < 0) {
			return false;
		}
		
		return true;
	},
	
	_checkPlugin : function () {
		return true;
	},
	
	_publishEvents : function () {
		// HTML 5 Events
		/*
			onabort	 	 to be run on an abort event
			oncanplay		 to be run when media can start play, but might has to stop for buffering
			oncanplaythrough		 to be run when media can be played to the end, without stopping for buffering
			ondurationchange	 	 to be run when the length of the media is changed
			onemptied	 	 to be run when a media resource element suddenly becomes empty (network errors, errors on load etc.)
			onended	 	 to be run when media has reach the end
			onerror	 	 to be run when an error occurs during the loading of an element
			onloadeddata		 to be run when media data is loaded
			onloadedmetadata		 to be run when the duration and other media data of a media element is loaded
			onloadstart		 to be run when the browser starts to load the media data
			onpause	 	 to be run when media data is paused
			onplay	 	 to be run when media data is going to start playing
			onplaying	 	 to be run when media data has start playing
			onprogress	 	 to be run when the browser is fetching the media data
			onratechange	 	 to be run when the media data's playing rate has changed
			onreadystatechange	 	 to be run when the ready-state changes
			onseeked	 	 to be run when a media element's seeking attribute is no longer true, and the seeking has ended
			onseeking	 	 to be run when a media element's seeking attribute is true, and the seeking has begun
			onstalled	 	 to be run when there is an error in fetching media data (stalled)
			onsuspend		 to be run when the browser has been fetching media data, but stopped before the entire media file was fetched
			ontimeupdate		 to be run when media changes its playing position
			onvolumechange		 to be run when media changes the volume, also when volume is set to "mute"
			onwaiting		 to be run when media has stopped playing, but is expected to resume
		*/
		
		// QT Events
		/*
			qt_begin — The plug in has been instantiated and can interact with JavaScript.
			qt_loadedmetadata — The movie header information has been loaded or created. The duration, dimensions, looping state, and so on are now known.
			qt_loadedfirstframe — The first frame of the movie has been loaded and can be displayed. (The frame is displayed automatically at this point.)
			qt_canplay — Enough media data has been loaded to begin playback (but not necessarily enough to play the entire file without pausing).
			qt_canplaythrough — Enough media data has been loaded to play through to the end of the file without having to pause to buffer, assuming data continues to come in at the current rate or faster. (If the movie is set to autoplay, it will begin playing now.)
			qt_durationchange — The media file’s duration is available or has changed. (A streaming movie, a SMIL movie, or a movie with a QTNEXT attribute may load multiple media segments or additional movies, causing a duration change.)
			qt_load — All media data has been loaded.
			qt_ended — Playback has stopped because end of the file was reached. (If the movie is set to loop, this event will not occur.)
			qt_error — An error occurred while loading the file. No more data will be loaded.
			qt_pause — Playback has paused. (This happens when the user presses the pause button before the movie ends.)
			qt_play — Playback has begun.
			qt_progress — More media data has been loaded. This event is fired no more than three times per second.
			This event occurs repeatedly until the qt_load event or qt_error event. The last progress event may or may not coincide with the loading of the last media data. Use the progress function to monitor progress, but do not rely on it to determine whether the movie is completely loaded. Use the qt_load function in conjunction with the qt_progress function to monitor load progress and determine when loading is complete.
			
			qt_waiting — Playback has stopped because no more media data is available, but more data is expected. (This usually occurs if the user presses the play button prior to the qt_canplaythrough event. It can also occur if the data throughput slows during movie playback, and the buffer runs dry.)
			qt_stalled — No media has been received for approximately three seconds.
			qt_timechanged — The current time has been changed (current time is indicated by the position of the playhead).
			qt_volumechange — The audio volume or mute attribute has changed.
		*/
		
		// VideoDisplay Events
		/*
			close
			Dispatched when the NetConnection object is closed, whether by timing out or by calling the close() method.
			 	 	
			complete
			Dispatched when the playhead reaches the end of the FLV file.
			 	 	
			cuePoint
			Dispatched when the value of a cue point's time property is equal to the current playhead location.
			 	 	
			metadataReceived
			Dispatched the first time metadata in the FLV file is reached.
			 	 	
			playheadUpdate
			Dispatched continuosly while the video is playing.
			 	 	
			progress
			Dispatched continuously until the FLV file has downloaded completely.
			 	 	
			ready
			Dispatched when the FLV file is loaded and ready to play.
			 	 	
			rewind
			Dispatched when the control autorewinds.
			 	 	
			stateChange
			Dispatched when the state of the control changes
		*/
		Y.publish('canPlay');
		Y.publish('ended');
		Y.publish('loadedMetadata');
		Y.publish('progress');
		Y.publish('playheadUpdate');
		Y.publish('error');
		Y.publish('pause');
		Y.publish('play');
	},
	
	initializer : function () {
		this._publishEvents();
		this._checkPlugin();
	},
	
	destructor : function () {
	
	},
	
	_createParams : function (params) {
		var paramString = '';
		
		Y.each(params, function (val, key, obj) {
			paramString += Y.substitute(paramTemplate, {
				name : key,
				value : String(val)
			});
		});
		
		return paramString;
	},
		
	_renderPlayer : function () {},
	
	_bindPlayer : function () {
		this.after('volumeChange', Y.rbind(this._handleVolumeChange, this, {source : 'self'}));
	},
	
	renderUI : function () {
		this._renderPlayer();
	},
	
	bindUI : function () {
		this._bindPlayer();
	},
	
	syncUI : function () {
	
	},
	
	play : function () {},
	
	pause : function () {},
	
	stop : function () {},
	
	getTotalTime : function () {},
	
	getCurrentTime : function () {},
	
	setCurrentTime : function (seconds) {},
	
	_handleVolumeChange : function () {}
});
Y.mix(Y.Node.DOM_EVENTS, {
	abort : 1,
	canplay : 1,
	canplaythrough : 1,
	durationchange : 1,
	emptied : 1,
	ended : 1,
	error : 1,
	loadeddata : 1,
	loadedmetadata : 1,
	loadstart : 1,
	pause : 1,
	play : 1,
	playing : 1,
	progress : 1,
	ratechang : 1,
	readystatechange : 1,
	seeked : 1,
	seeking : 1,
	stalled : 1,
	suspend : 1,
	timeupdate : 1,
	volumechange : 1,
	waiting : 1
});

function VideoHTML5 () {
	VideoHTML5.superclass.constructor.apply(this, arguments);
}

Y.mix(VideoHTML5, {
	NAME : 'video-html5'
});

Y.extend(VideoHTML5, VideoBase, {
	_renderPlayer : function () {
		var contentBox = this.get('contentBox'),
			media = this.get('media'),
			sourceString = '',
			tagString, tag, i = 0, len = media.length;
		
		for (; i < len; i++) {
			sourceString += Y.substitute(sourceTemplate, {
				src : media[i].src,
				typeDef : media[i].mimeType + ';',
				media : ''
			});
		}
		
		tagString = Y.substitute(videoTemplate, {
			poster : '',
			autoplay : (this.get('autoplay') === true ? 'autoplay' : ''),
			preload : '',
			loop : '',
			controls : 'controls',
			source : sourceString
		});
		
		tag = Y.Node.create(tagString);
				
		contentBox.append(tag);
		
		this._videoNode = tag;
	},
	
	_bindPlayer : function () {
		VideoHTML5.superclass._bindPlayer.apply(this, arguments);

		var v = this._videoNode;

		v.on('timeupdate', Y.bind(function () {
			this.fire('playheadUpdate');
		}, this));
		
		v.on('canplay', Y.bind(function () {
			this.fire('canPlay');
		}, this));
		
		v.on('ended', Y.bind(function () {
			this.fire('ended');
		}, this));
		
		v.on('loadedmetadata', Y.bind(function () {
			this.fire('loadedMetadata');
		}, this));
		
		v.on('progress', Y.bind(function () {
			this.fire('progress');
		}, this));
		
		v.on('volumechange', Y.bind(function () {
			var val = Y.Node.getDOMNode(v).volume,
				newVol = Math.floor(val * 100);
				
			this.set('volume', newVol);
		}, this));
	},
	
	play : function () {
		Y.Node.getDOMNode(this._videoNode).play();
	},
	
	pause : function () {
		Y.Node.getDOMNode(this._videoNode).pause();
	},
	
	stop : function () {
		var video = Y.Node.getDOMNode(this._videoNode);
		video.pause();
		video.currentTime = 0;
	},
	
	getTotalTime : function () {
		return Y.Node.getDOMNode(this._videoNode).duration;
	},
	
	getCurrentTime : function () {
		return Y.Node.getDOMNode(this._videoNode).currentTime;
	},
	
	setCurrentTime : function (seconds) {
		if (Y.Lang.isNumber(seconds) === false) {
			return false;
		}
		
		var v = Y.Node.getDOMNode(this._videoNode);
		
		v.currentTime = seconds;
	},
	
	_handleVolumeChange : function (e, args) {
		if (args.source == 'self') {
			var newVol = e.newVal / 100;
			Y.Node.getDOMNode(this._videoNode).volume = newVol;
		}
	}
	
});
function VideoFlash () {
	VideoFlash.superclass.constructor.apply(this, arguments);
}

Y.mix(VideoFlash, {
	NAME : 'video-flash',
	
	EVENT_MAP : {
		'complete' 					: 'ended',
		'metadataReceived' 			: 'loadedMetadata',
		'currentTimeChange'			: 'playheadUpdate',
		'bytesLoadedChange'			: 'progress',
		'ready' 					: 'canPlay',
		'play' 						: 'play',
		'pause' 					: 'pause',
		'mediaPlayerStateChange'	: 'stateChange'
	}
});

(function () {
	var et = new Y.EventTarget();
	et.publish('flashEvent');
	
	Y.mix(VideoFlash, {
		flashEventTarget : et
	});
})();

YUI.galleryVideoListener = function (id, event) {
	VideoFlash.flashEventTarget.fire('flashEvent', {
		id : id,
		event : event
	});
};

Y.extend(VideoFlash, VideoBase, {
	initializer : function () {
		VideoFlash.superclass.initializer.apply(this, arguments);
		
		VideoFlash.flashEventTarget.on('flashEvent', Y.bind(function (args) {
			if (args.id == this.get('id')) {
				this.fire(VideoFlash.EVENT_MAP[args.event]);
			}
		}, this));
	},
	
	_renderPlayer : function () {
		var contentBox = this.get('contentBox'),
			//height = this.get('height'),
			media = this.get('media')[0],
			src = Y.Video.SWF_PLAYER_SRC,
			params = {
				movie : src,
				loop : 'true',
				menu : 'true',
				quality : 'best',
				scale : 'showall',
				salign : 'tl',
				wmode : 'opaque',
				bgcolor : '#000000',
				allowScriptAccess : 'always',
				allowNetworking : 'all',
				allowFullScreen : 'true',
				flashVars : Y.QueryString.stringify({
					file : media.src,
					width : this.get('width'),
					height : this.get('height'),
					playerId : this.get('id'),
					jsCallback : 'YUI.galleryVideoListener'
				})
			},
			tagString = Y.substitute(objTemplate, {
				src : src,
				codebase : '',
				classid : '',
				width : this.get('width'),
				height : this.get('height'),
				mimeType : 'application/x-shockwave-flash',
				//style : '',
				params : this._createParams(params)
			}),
			tag = Y.Node.create(tagString);
		//this.set('height', height + 16);
		contentBox.append(tag);

		this._videoNode = tag;
	},
	
	play : function () {
		Y.Node.getDOMNode(this._videoNode).play();
	},
		
	pause : function () {
		Y.Node.getDOMNode(this._videoNode).pause();
	},
	
	stop : function () {
		Y.Node.getDOMNode(this._videoNode).stop();
	},
	
	getCurrentTime : function () {
		return Y.Node.getDOMNode(this._videoNode).getCurrentTime();
	},
	
	setCurrentTime : function (seconds) {
		if (Y.Lang.isNumber(seconds) === false) {
			return false;
		}
		
		var v = Y.Node.getDOMNode(this._videoNode);
		v.setCurrentTime(seconds);
	},
	
	getTotalTime : function () {
		return Y.Node.getDOMNode(this._videoNode).getTotalTime();
	},
	
	_handleVolumeChange : function (e, args) {
		if (args.source == 'self') {
			var newVol = e.newVal / 100;
			
			Y.Node.getDOMNode(this._videoNode).setVolume(newVol);
		}
	}

});
Y.mix(Y.Node.DOM_EVENTS, {
	'qt_canplay' : 1,
	'qt_ended' : 1,
	'qt_loadedmetadata' : 1,
	'qt_progress' : 1,
	'qt_timechanged' : 1,
	'qt_play' : 1,
	'qt_pause' : 1,
	'qt_volumechange' : 1
});

function VideoQuicktime () {
	VideoQuicktime.superclass.constructor.apply(this, arguments);
}

Y.mix(VideoQuicktime, {
	NAME : 'video-quicktime'
});

Y.extend(VideoQuicktime, VideoBase, {
	_timeScale : null,
	
	_duration : null,
	
	_useQTDOMEvents : false,
	
	_rate : 0,
	
	_pluginStatusInterval : null,
	
	_playheadInterval : null,

	_checkPlugin : function () {
		if (navigator.plugins) {
			Y.Array.each(navigator.plugins, Y.bind(function(val, index, array) {
				if (val.name && val.name.toLowerCase().search('quicktime') > -1) {
					if (val.version) {
						var nVersion = val.version.split('.').join('');
						if (nVersion < 700) {
							return false;
						}
						if (nVersion >= 721) {
							this._useQTDOMEvents = true;
						}
					}
					return true;
				}
			}, this));
		}
	},
	
	_renderPlayer : function () {
		var contentBox = this.get('contentBox'),
			//height = this.get('height'),
			media = this.get('media')[0],
			src = media.src,
			mimeType = media.mimeType,
			qtParams = {
				src : src,
				showlogo : false,
				autoplay : this.get('autoplay'),
				enablejavascript : true,
				postdomevents : true,
				kioskmode : false,
				scale : 'aspect',
				cache : true,
				controller : true
			},
			tagString = Y.substitute(objTemplate, {
				src : src,
				codebase : '',
				classid : '',
				mimeType : mimeType,
				style : '',
				params : this._createParams(qtParams)
			}),
			tag = Y.Node.create(tagString);
		//this.set('height', height + 16);
		contentBox.append(tag);

		this._videoNode = tag;
		
		if (this._useQTDOMEvents === false) {
			this._startPluginStatusInterval();
		}		
	},
	
	_bindPlayer : function () {
		VideoQuicktime.superclass._bindPlayer.apply(this, arguments);
		
		var v = this._videoNode;
		

		function handleClick () {
			var rate = Y.Node.getDOMNode(v).GetRate();
			if (rate === 1) {
				this.fire('play');
			} else {
				this.fire('pause');
			}
		}

		
		if (this._useQTDOMEvents === true) {
			v.on('qt_canplay', Y.bind(function () {
				this.fire('canPlay');
			}, this));
			
			v.on('qt_ended', Y.bind(function () {
				this.fire('ended');
			}, this));
			
			v.on('qt_loadedmetadata', Y.bind(function () {
				this._setTimeConstants();
				this.fire('loadedMetadata');
			}, this));
			
			v.on('qt_progress', Y.bind(function () {
				this.fire('progress');
			}, this));
			
			v.on('qt_timechanged', Y.bind(function () {
				this.fire('playheadUpdate');
			}, this));
			
			v.on('qt_play', Y.bind(function () {
				this.fire('play');
			}, this));
			
			v.on('qt_pause', Y.bind(function () {
				this.fire('pause');
			}, this));
			
			v.on('qt_volumechange', Y.bind(function () {
				var val = Y.Node.getDOMNode(v).GetVolume(),
					max = 256,
					newVol = Math.floor((val / max) * 100);
					
				this.set('volume', newVol);
			}, this));
		} else {
			// Non-DOM event browsers
			this.after('playheadUpdate', Y.bind(function () {
				// This check only matters if the movie is stopped
				var rate = Y.Node.getDOMNode(v).GetRate();
				if (rate === 0 && this._rate !== 0) {
					// If within a second of the end and paused, assume ended
					if (Math.ceil(this.getCurrentTime()) == Math.ceil(this._duration)) {
						this.fire('pause');
						this.fire('ended');
					}
				}
				this._rate = rate;
			}, this));
			
			v.on('click', Y.bind(handleClick, this));
			
			v.on('dblclick', Y.bind(handleClick, this));
		}
		
		this.after('play', Y.bind(function () {
			this._startPlayheadInterval();
		}, this));
		
		this.after('pause', Y.bind(function () {
			this._clearPlayheadInterval();
		}, this));
	},
	
	_startPluginStatusInterval : function () {
		if (!this._pluginStatusInterval) {
			var self = this,
				obj = Y.Node.getDOMNode(this._videoNode),
				autoplay = this.get('autoplay');
			this._pluginStatusInterval = setInterval(function () {
				try {
					var status = obj.GetPluginStatus();
					if (status == "Loading") {
						this.fire('progress');
					} else if (status == "Playable" || status == "Complete") {
						this.fire('canPlay');
						this._setTimeConstants();
						self.fire('loadedMetadata');
						if (autoplay === true) {
							self.fire('play');
						}
						self._clearPluginStatusInterval();
					}
				} catch (err) {
				}
			}, 100);
		}
	},
	
	_clearPluginStatusInterval : function () {
		clearInterval(this._pluginStatusInterval);
		this._pluginStatusInterval = null;
	},				
	
	_startPlayheadInterval : function () {
		if (!this._playheadInterval) {
			var self = this;
			this._playheadInterval = setInterval(function () {
				self.fire('playheadUpdate');
			}, 300);
		}
	},
	
	_clearPlayheadInterval : function () {
		clearInterval(this._playheadInterval);
		this._playheadInterval = null;
	},
	
	play : function () {
		if (this._useQTDOMEvents === false) {
			this.fire('play');
		}
		Y.Node.getDOMNode(this._videoNode).Play();
	},
	
	pause : function () {
		if (this._useQTDOMEvents === false) {
			this.fire('pause');
		}
		Y.Node.getDOMNode(this._videoNode).Stop();
	},
	
	stop : function () {
		this.pause();
		Y.Node.getDOMNode(this._videoNode).SetTime(0);
	},
	
	_setTimeConstants : function () {
		var vNode = Y.Node.getDOMNode(this._videoNode);
		this._timeScale = vNode.GetTimeScale();
		this._duration = vNode.GetDuration() / this._timeScale;
	},
	
	getTotalTime : function () {
		return this._duration;
	},
	
	getCurrentTime : function () {
		var v = Y.Node.getDOMNode(this._videoNode),
			tc = v.GetTime(),
			s = tc / this._timeScale;
		return s;
	},
	
	setCurrentTime : function (seconds) {
		if (Y.Lang.isNumber(seconds) === false) {
			return false;
		}
		
		var v = Y.Node.getDOMNode(this._videoNode),
			tc = Math.ceil(seconds * this._timeScale);
		
		v.SetTime(tc);
	},
	
	_handleVolumeChange : function (e, args) {
		if (args.source == 'self') {
			var max = 256,
				perc = e.newVal / 100,
				newVol = Math.floor(max * perc);
			
			Y.Node.getDOMNode(this._videoNode).SetVolume(newVol);
		}
	}
});
(function () {

	function Video (config) {
		Video.superclass.constructor.call(this);
		if (!config || !config.media) {
			return false;
		}
		
		var i =0 , len = config.media.length;
		
		for (; i < len; i++) {
			config.media[i].index = this._checkEnvironment(config.media[i].mimeType);
		}
		
		config.media.sort(function (a, b) {
			return a.index > b.index;
		});

		this._buildPlayer(config.media[0].index, config);
	}
	
	var RENDER_ORDER = ['html5', 'flash', 'quicktime'],
		
		CONTENT_TYPES = {
			MOV : 1,
			FLV : 2,
			MP4 : 3,
			M4V : 4,
			MPEG : 5,
			OGG : 6
		},
		
		MIME_TYPES = {
			'video/quicktime' : CONTENT_TYPES.MOV,
			'video/mp4' : CONTENT_TYPES.MP4,
			'video/mpeg' : CONTENT_TYPES.MPEG,
			'video/x-m4v' : CONTENT_TYPES.M4V,
			'video/x-flv' : CONTENT_TYPES.FLV,
			'video/ogg' : CONTENT_TYPES.OGG
		},
		
		HTML5_BROWSERS = {
			GECKO : [
				CONTENT_TYPES.OGG
			],
			OPERA : [
				CONTENT_TYPES.OGG
			],
			WEBKIT : [
				CONTENT_TYPES.MP4, 
				CONTENT_TYPES.MOV, 
				CONTENT_TYPES.MPEG, 
				CONTENT_TYPES.M4V
			]
		},
		
		FLASH_TYPES = [
			CONTENT_TYPES.MP4, 
			CONTENT_TYPES.MOV, 
			CONTENT_TYPES.M4V, 
			CONTENT_TYPES.FLV
		],		
		
		PLAYERS = {
			html5 : VideoHTML5,
			flash : VideoFlash,
			quicktime : VideoQuicktime
		};
		
	Y.mix(Video, {
		SWF_PLAYER_SRC : 'assets/player.swf'
	});
	
	Y.extend(Video, Y.Base, {
		_widget : null,
		
		initializer : function () {
			Y.publish('canPlay');
			Y.publish('ended');
			Y.publish('loadedMetadata');
			Y.publish('progress');
			Y.publish('playheadUpdate');
			Y.publish('error');
		},
		
		_checkEnvironment : function (mimeType) {
			var type = MIME_TYPES[mimeType];
			if (Y.UA.gecko > 0) {
				if (Y.UA.gecko >= 1.91 && Y.Array.indexOf(HTML5_BROWSERS.GECKO, type) > -1) {
					return Y.Array.indexOf(RENDER_ORDER, 'html5');
				} else if (Y.UA.flashMajor > 9) {
					return Y.Array.indexOf(RENDER_ORDER, 'flash');
				} else {
					return Y.Array.indexOf(RENDER_ORDER, 'quicktime');
				}
			} else if (Y.UA.opera > 0) {
				if (Y.UA.opera >= 10.5 && Y.Array.indexOf(HTML5_BROWSERS.OPERA, type) > -1) {
					return Y.Array.indexOf(RENDER_ORDER, 'html5');
				} else {
					return Y.Array.indexOf(RENDER_ORDER, 'quicktime');
				}
			} else if (Y.UA.webkit > 0) {
				if (Y.UA.webkit >= 525.25 && Y.Array.indexOf(HTML5_BROWSERS.WEBKIT, type) > -1) {
					return Y.Array.indexOf(RENDER_ORDER, 'html5');
				} else {
					return Y.Array.indexOf(RENDER_ORDER, 'quicktime');
				}
			} else if (Y.UA.ie > 0) {
			} else {
				return -1;
			}
		},
				
		_buildPlayer : function (renderIndex, config) {
			if (!RENDER_ORDER[renderIndex]) {
				return false;
			}

			this._widget = new PLAYERS[RENDER_ORDER[renderIndex]](config);
		},
		
		getPlayer : function () {
			return this._widget;
		},
		
		render : function () {
			this._widget.render.apply(this._widget, arguments);
		},
		
		play : function () {
			this._widget.play();
		},
		
		pause : function () {
			this._widget.pause();
		},
		
		stop : function () {
			this._widget.stop();
		}
	});
	
	Y.Video = Video;

})();


}, '@VERSION@' ,{requires:['node', 'widget', 'substitute', 'swfdetect', 'querystring-stringify']});
