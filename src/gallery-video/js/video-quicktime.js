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
	
	function VideoQuicktime () {
		VideoQuicktime.superclass.constructor.apply(this, arguments);
	}
	
	Y.mix(VideoQuicktime, {
		NAME : 'video-quicktime',
		
		NS : 'player',
		
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
		    if (Y.Array.indexOf(VideoQuicktime.MIME_TYPES, mimeType) < 0) {
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
	
	Y.extend(VideoQuicktime, ObjectPluginBase, {		
		_useQTDOMEvents : false,
		
		_rate : 0,
		
		_pluginStatusInterval : null,
		
		_playheadInterval : null,
		
		initializer : function () {
		    this._useQTDOMEvents = (Y.UA.ie === 0 && Y.UA.quicktime > 7.2);
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
				    controller : false
				};

            if (Y.UA.ie) {
            	paramMap.src = src;
            }
			
			this._videoNode = this._createObjectNode(src, mimeType, VideoQuicktime.CID, VideoQuicktime.CODEBASE, paramMap);
			
			
			
			if (this._useQTDOMEvents === false) {
				this._startPluginStatusInterval();
			}		
		},
		
		_bindPlayer : function () {
			VideoQuicktime.superclass._bindPlayer.apply(this, arguments);
			
			var v = this._videoNode,
			    vDOMNode = Y.Node.getDOMNode(v),
			    host = this.get('host');
			
			function handleClick () {
				var rate = Y.Node.getDOMNode(v).GetRate();
				if (rate === 1) {
					host.fire('play');
				} else {
					host.fire('pause');
				}
			}

            function handleProgress () {
                var currentBytes = vDOMNode.GetMaxBytesLoaded(),
                    totalBytes = this.get('totalBytes'),
                    percent = (currentBytes * 100) / totalBytes;
                    
                this.set('currentBytes', currentBytes);
                this.set('percentLoaded', percent);
                
                host.fire('progress');
            }
			
            host.after('play', Y.bind(function () {
            	this._startPlayheadInterval();
            }, this));
            
            host.after('pause', Y.bind(function () {
            	this._clearPlayheadInterval();
            }, this));
			
			if (this._useQTDOMEvents === true) {
			    // If the video is cached, neither the progress, load,
			    // play (if autoplaying), or loadedmetadata events will
			    // fire, so we have to fake it and set everything manually
			    if (Y.Lang.isFunction(vDOMNode.GetPluginStatus) && vDOMNode.GetPluginStatus() == 'Complete') {
			    	this._setConstants();
			        this.set('currentBytes', vDOMNode.GetMovieSize());
			        this.set('percentLoaded', 100);
			        host.fire('progress');
			        if (this.get('autoplay') === true) {
			            host.fire('play');
			        }
			    } else {
                    v.on('qt_loadedmetadata', Y.bind(function () {
                    	this._setConstants();
                    }, this));
                    
                    v.on('qt_progress', Y.bind(handleProgress, this));
                    v.on('qt_load', Y.bind(handleProgress, this));
			    }
			
				v.on('qt_canplay', function () {
					host.fire('canPlay');
				});
				
				v.on('qt_ended', function () {
					host.fire('ended');
				});
				
				v.on('qt_timechanged', function () {
					host.fire('playheadUpdate');
				});
				
				v.on('qt_play', function () {
					host.fire('play');
				});
				
				v.on('qt_pause', function () {
					host.fire('pause');
				});
				
				v.on('qt_volumechange', Y.bind(function () {
					var val = vDOMNode.GetVolume(),
						max = 256,
						newVol = Math.floor((val / max) * 100);
						
					this.set('volume', newVol);
				}, this));
			} else {
				// Non-DOM event browsers
				this.after('playheadUpdate', Y.bind(function () {
					// This check only matters if the movie is stopped (and it wasn't already)
					var rate = vDOMNode.GetRate();
					if (rate === 0 && this._rate !== 0) {
						// If within a second of the end and paused, assume ended
						if (Math.ceil(this.getCurrentTime()) == Math.ceil(this._duration)) {
							host.fire('pause');
							host.fire('ended');
						}
					}
					this._rate = rate;
				}, this));
				
				v.on('click', Y.bind(handleClick, this));
				
				v.on('dblclick', Y.bind(handleClick, this));
			}
		},
		
		_startPluginStatusInterval : function () {
			if (!this._pluginStatusInterval) {
				var self = this,
				    host = this.get('host'),
					obj = Y.Node.getDOMNode(this._videoNode),
					autoplay = this.get('autoplay');
				this._pluginStatusInterval = setInterval(function () {
					try {
						var status = obj.GetPluginStatus(),
						    currentBytes = obj.GetMaxBytesLoaded(),
						    totalBytes = self.get('totalBytes');

                        self.set('currentBytes', currentBytes);
                        self.set('percentLoaded', (currentBytes * 100) / totalBytes);
						    
						if (status == "Loading") {
							host.fire('progress');
						} else if (status == "Playable" || status == "Complete") {
							self._clearPluginStatusInterval();
							host.fire('canPlay');
							self._setConstants();
							if (autoplay === true) {
								host.fire('play');
							}
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
				var host = this.get('host'),
					obj = Y.Node.getDOMNode(this._videoNode),
					timeScale = this.get('timeScale'),
				    self = this;
				    
				this._playheadInterval = setInterval(function () {
				    self.set('currentTime', obj.GetTime() / timeScale, {source : 'self'});
					host.fire('playheadUpdate');
				}, 300);
			}
		},
		
		_clearPlayheadInterval : function () {
			clearInterval(this._playheadInterval);
			this._playheadInterval = null;
		},
		
		play : function () {
		    var host = this.get('host');
			if (this._useQTDOMEvents === false) {
				host.fire('play');
			}
			Y.Node.getDOMNode(this._videoNode).Play();
		},
		
		pause : function () {
		    var host = this.get('host');
			if (this._useQTDOMEvents === false) {
				host.fire('pause');
			}
			Y.Node.getDOMNode(this._videoNode).Stop();
		},
		
		stop : function () {
			this.pause();
			Y.Node.getDOMNode(this._videoNode).SetTime(0);
		},
		
		_setConstants : function () {
			var vNode = Y.Node.getDOMNode(this._videoNode),
			    host = this.get('host'),
			    timeScale = vNode.GetTimeScale(),
			    duration = vNode.GetDuration() / timeScale,
			    totalBytes = vNode.GetMovieSize();
			
			this.set('timeScale', timeScale);
			this.set('totalTime', duration);
			this.set('totalBytes', totalBytes);
			host.fire('loadedMetadata');
		},
				
		_handleCurrentTimeChange : function (e, args) {
		    if(!e.source || e.source != 'self') {
    		    var timeScale = this.get('timeScale');
    		    Y.Node.getDOMNode(this._videoNode).SetTime(Math.ceil(e.newVal * timeScale));
		    }
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