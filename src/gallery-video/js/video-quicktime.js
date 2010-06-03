Y.mix(Y.Node.DOM_EVENTS, {
	'qt_begin' : 1,
	'qt_loadedmetadata' : 1,
	'qt_loadedfirstframe' : 1,
	'qt_canplay' : 1,
	'qt_canplaythrough' : 1,
	'qt_durationchange' : 1,
	'qt_load' : 1,
	'qt_ended' : 1,
	'qt_error' : 1,
	'qt_pause' : 1,
	'qt_play' : 1,
	'qt_progress' : 1,
	'qt_waiting' : 1,
	'qt_stalled' : 1,
	'qt_timechanged' : 1,
	'qt_volumechange' : 1
});
	
Y.VideoQuicktime = Y.Base.create('video-quicktime', Y._VideoBase, [Y.WidgetChild], {		
	_useQTDOMEvents : false,
	
	_pluginStatusInterval : null,
	
	_playheadInterval : null,
	
	initializer : function () {
	    this._useQTDOMEvents = (Y.UA.ie === 0 && Y.UA.quicktime > 7.2);
	    
	    if (this.get('controls') === true) {
	        var h = this.get('height');
	        this.set('height', h + 16);
	    }
	},
	
	_renderPlayer : function () {
		var src = this.get('src'),
			mimeType = this.get('mimeType'),
			paramMap = {
			    showlogo : false,
			    autoplay : this.get('autoplay'),
			    enablejavascript : true,
			    postdomevents : true,
			    kioskmode : false,
			    scale : 'aspect',
			    cache : true,
			    controller : this.get('controls')
			},
			contentBox = this.get('contentBox'),
			objTag;

        if (Y.UA.ie) {
        	paramMap.src = src;
        }
		
		objTag = Y.ObjectTag.create(src, mimeType, Y.VideoQuicktime.CID, Y.VideoQuicktime.CODEBASE, paramMap);
		contentBox.set('innerHTML', objTag);
		this._videoNode = contentBox.one('object');
	},
	
	_bindPlayer : function () {
		Y.VideoQuicktime.superclass._bindPlayer.apply(this, arguments);
		
		var v = this._videoNode,
		    vDOMNode = Y.Node.getDOMNode(v);

        function handleProgress () {
            var currentBytes = vDOMNode.GetMaxBytesLoaded(),
                totalBytes = this.get('totalBytes'),
                percent = (currentBytes * 100) / totalBytes;
                
            this.set('currentBytes', currentBytes);
            this.set('percentLoaded', percent);
        }
		
		// Doubleclicking a Quicktime instance will play/pause it
		v.after('dblclick', Y.bind(function (e) {
		    if (vDOMNode.GetRate() > 0) {
		        this.set('playing', true, {source : 'self'});
		    } else {
		        this.set('playing', false, {source : 'self'});
		    }
		}, this));
		
		if (this._useQTDOMEvents === true) {
		    // If the video is cached, neither the progress, load,
		    // play (if autoplaying), or loadedmetadata events will
		    // fire, so we have to fake it and set everything manually
		    if (Y.Lang.isFunction(vDOMNode.GetPluginStatus) && vDOMNode.GetPluginStatus() == 'Complete') {
		    	this._setConstants();
		        this.set('currentBytes', vDOMNode.GetMovieSize());
		        this.set('percentLoaded', 100);
		    } else {
                v.on('qt_loadedmetadata', Y.bind(function () {
                	this._setConstants();
                }, this));
                
                v.on('qt_progress', Y.bind(handleProgress, this));
                v.on('qt_load', Y.bind(handleProgress, this));
		    }
							
			v.on('qt_volumechange', Y.bind(function () {
				var val = vDOMNode.GetVolume(),
					max = 256,
					newVol = Math.floor((val / max) * 100);
					
				this.set('volume', newVol, {source : 'self'});
			}, this));
		} else {
			this._startPluginStatusInterval();
		}
	},
	
	_startPluginStatusInterval : function () {
		if (!this._pluginStatusInterval) {
			var obj = Y.Node.getDOMNode(this._videoNode);
			this._pluginStatusInterval = Y.later(100, this, function () {
				try {
					var status = obj.GetPluginStatus(),
					    currentBytes = obj.GetMaxBytesLoaded(),
					    totalBytes = this.get('totalBytes');

                    this.set('currentBytes', currentBytes);
                    this.set('percentLoaded', (currentBytes * 100) / totalBytes);
					    
					if (status == "Loading") {
					} else if (status == "Playable" || status == "Complete") {
						this._clearPluginStatusInterval();
						this._setConstants();
					}
				} catch (err) {
					Y.log('Had an error when trying to check status', 'warn', 'Video');
				}
			}, null, true);
		}
	},
	
	_clearPluginStatusInterval : function () {
		this._pluginStatusInterval.cancel();
		this._pluginStatusInterval = null;
	},				
	
	_startPlayheadInterval : function () {
		if (!this._playheadInterval) {
		    var obj = Y.Node.getDOMNode(this._videoNode);
		    				    
			this._playheadInterval = Y.later(300, this, function () {
			    var ts = this.get('timeScale'),
			        time, rate, playing;
				
			    if (!ts) {
			        return;
			    }
			    
			    time = obj.GetTime();
			    rate = obj.GetRate();
			    playing = this.get('playing');
			    
			    
			    if (playing === true && rate === 0 && time > 0) {
			        this.set('playing', false, {source : 'self'});
			    } else if (playing === false && rate !== 0) {
			        this.set('playing', true, {source : 'self'});
			    }
			    
			    this.set('currentTime', time / ts, {source : 'self'});
			}, null, true);
		}
	},
	
	_clearPlayheadInterval : function () {
		this._playheadInterval.cancel();
		this._playheadInterval = null;
	},
			
	_setConstants : function () {
		var vNode = Y.Node.getDOMNode(this._videoNode),
		    timeScale = vNode.GetTimeScale(),
		    duration = vNode.GetDuration() / timeScale,
		    totalBytes = vNode.GetMovieSize();
		
		this.set('timeScale', timeScale);
		this.set('totalTime', duration);
		this.set('totalBytes', totalBytes);
	},
			
	_handleCurrentTimeChange : function (e) {
	    if(e.source && e.source == 'self') {
	        return;
	    }
	    
	    var timeScale = this.get('timeScale');
	    Y.Node.getDOMNode(this._videoNode).SetTime(Math.ceil(e.newVal * timeScale));
	},
	
	_handleVolumeChange : function (e) {
		if (e.source && e.source == 'self') {
		    return;
		}
		
		var max = 256,
			perc = e.newVal / 100,
			newVol = Math.floor(max * perc);
		
		Y.Node.getDOMNode(this._videoNode).SetVolume(newVol);
	},
	
	_handlePlayingChange : function (e) {
	    var playing = e.newVal;
	    if (playing === e.prevVal) {
	        e.stopPropagation();
	        return;
	    }
	    
	    if (playing === true) {
	    	this._startPlayheadInterval();
	    } else {
	    	this._clearPlayheadInterval();
	    }
	    
	    if (e.source && e.source == 'self') {
	        return;
	    }
	    
	    if (playing === true) {
			Y.Node.getDOMNode(this._videoNode).Play();		    
	    } else {
			Y.Node.getDOMNode(this._videoNode).Stop();
	    }
	},
	
	getControlsHeight : function () {
	    return 16;
	}
}, {
	ATTRS : {
	    timeScale : {
	        validator : Y.Lang.isNumber,
	        writeOnce : true,
	        readOnly : true
	    }
	},
	
	MIME_TYPES : [
		'video/quicktime',
		'video/x-msvideo',
		'video/msvideo',
		'video/avi',
		'video/flc',
		'video/x-mpeg',
		'video/mpeg',
		'video/3gpp',
		'video/3gpp2',
		'video/sd-video',
		'video/mp4',
		'video/x-m4v'
	],
	
	CID : 'clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B',
	CODEBASE : 'http://www.apple.com/qtactivex/qtplugin.cab',
	
	checkCompatibility : function (mimeType) {
	    if (Y.Array.indexOf(Y.VideoQuicktime.MIME_TYPES, mimeType) < 0) {
	        return false;
	    }
		
		var plugin,
			va,
			version,
			ax;
		
		if (!Y.UA.quicktime) {
			try {
				if (navigator.mimeTypes) {
				    plugin = navigator.mimeTypes['video/quicktime'];

				    if (plugin && plugin.enabledPlugin) {
				        plugin = plugin.enabledPlugin;
				    }
				}
				
				if (plugin) {
					version = plugin.version || plugin.name.match(/[^\w\d][\d][\d\.\_,\-]*/gi)[0];
				} else if (window.ActiveXObject) {
			        ax = new window.ActiveXObject('QuickTime.QuickTime');
			        version = ax.GetQuickTimeVersion();
				}
				
				if (version) {
					va = version.split(/[\.\_,\-]/g);
					version = va[0] + '.' + va[1] + va[2];
					Y.UA.quicktime = parseFloat(version);
				}
			} catch (err) {}
		}
		
		if (!Y.UA.quicktime || Y.UA.quicktime < 7) {
			return false;
		}
		
		return true;
	}
});