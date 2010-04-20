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
			Y.log('Volume must be a number', 'error', 'Video');
			return false;
		}
		
		if (val > 100 || val < 0) {
			Y.log('Volume must be between 0 and 100', 'error', 'Video');
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