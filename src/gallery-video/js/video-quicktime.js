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
							Y.log('Starting off with the requirement of QT 7', 'error', 'Video');
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
					Y.log('Had an error when trying to check status', 'warn', 'Video');
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
			Y.log("Seconds must be a number", "error", "Video");
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

Y.VideoQuicktime = VideoQuicktime;