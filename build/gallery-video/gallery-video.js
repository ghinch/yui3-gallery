YUI.add('gallery-video', function(Y) {

function VideoPluginBase () {
    VideoPluginBase.superclass.constructor.apply(this, arguments);
}

function setFloat (val, attr) {
    return parseFloat(val);
}

Y.mix(VideoPluginBase, {
    NAME : 'video-base',
    
    ATTRS : {
        src : {
            value : '',
            validator : Y.Lang.isString
        },
        autoplay : {
            value : true,
            validator : Y.Lang.isBoolean
        },
        mimeType : {
            value : '',
            validator : Y.Lang.isString
        },
        codecs : {
            validator : Y.Lang.isString
        },
        volume : {
            value : 100,
            validator : function (val) {	
                return this._validatePercentage(val);
            },
            setter : setFloat
        },
        totalTime : {
            writeOnce : true,
            validator : Y.Lang.isNumber,
            setter : setFloat
        },
        currentTime : {
            value : 0,
            validator : Y.Lang.isNumber,
            setter : setFloat
        },
        totalBytes : {
            writeOnce : true,
            validator : Y.Lang.isNumber,
            setter : setFloat
        },
        currentBytes : {
            value : 0,
            validator : Y.Lang.isNumber,
            setter : setFloat
        },
        percentLoaded : {
            value : 0,
            validator : function (val) {	
                return this._validatePercentage(val);
            },
            setter : setFloat
        }
    }
});

Y.extend(VideoPluginBase, Y.Plugin.Base, {
    _videoNode : null,
        
    _validatePercentage : function (val) {
        if (Y.Lang.isNumber(val) === false) {
            return false;
        }
        
        if (val > 100 || val < 0) {
            return false;
        }
        
        return true;
    },
            
    initializer : function () {
        this.afterHostEvent('render', Y.bind(function (e) {
            this._renderPlayer();
            this._bindPlayer();
        }, this));
    },
    
    destructor : function () {
    
    },
        
    _renderPlayer : function () {
    },
    
    _bindPlayer : function () {
        this.after('volumeChange', Y.rbind(this._handleVolumeChange, this, {source : 'self'}));
        this.after('currentTimeChange', Y.bind(this._handleCurrentTimeChange, this));
    },
        
    play : function () {},
    
    pause : function () {},
    
    stop : function () {},
    
    _handleCurrentTimeChange : function () {},
        
    _handleVolumeChange : function () {}
});
function ObjectPluginBase () {
    ObjectPluginBase.superclass.constructor.apply(this, arguments);
}

ObjectPluginBase.NAME = 'object-plugin';

Y.extend(ObjectPluginBase, VideoPluginBase, {
    _createObjectNode : function (data, type, classid, codebase, paramMap) {
        var objTemplate = '<object height="100%" width="100%" ',
            widget = this.get('host'),
            contentBox = widget.get('contentBox');
        
        if (Y.UA.ie) {
            objTemplate += 'classid="' + classid + '" codebase="' + codebase + '"';
        } else {
            objTemplate += 'data="' + data + '" type="' + type + '"';
        }
        
        objTemplate += '>'; 
        
        Y.Object.each(paramMap, Y.bind(function(val, key) {
            var p = this._createParamNode(key, val);
            objTemplate += p;
        }, this));
        
        objTemplate += '</object>';
        
        contentBox.set('innerHTML', objTemplate);
        return contentBox.one('object');
    },
    
    
    _createParamNode : function (name, value) {
        var param = 
            '<param name="' + name + '" value="' + value + '">';
        
        return param;
    }
});
	// Add the list of HTML Media Events that can be fired to those which 
	// Y.Event will listen for
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
		NAME : 'video-html5',

		NS : 'player',
			
		checkCompatibility : function (mimeType, codecs) {
			if (Y.UA.ie) {
				return false;
			}
			
			try {
				var video = document.createElement('video'),
					canPlay = video.canPlayType(mimeType + (codecs ? '; codecs="' + codecs : '"'));

				if (canPlay == 'maybe' || canPlay == 'probably') {
					return true;
				}
			} catch (err) {}
			
			return false;
		}
	});
	
	Y.extend(VideoHTML5, VideoPluginBase, {
	    _manualProgressInterval : null,
	
		_renderPlayer : function () {
            VideoHTML5.superclass._renderPlayer.apply(this, arguments);
		
			var video = Y.Node.create('<video width="100%" height="100%"></video>'),
				source = Y.Node.create('<source></source>'),
				widget = this.get('host'),
				contentBox = widget.get('contentBox'),
				src = this.get('src'),
				mimeType = this.get('mimeType'),
				codecs = this.get('codecs');
				
				source.setAttrs({
					src : src,
					type : mimeType + '; ' + (codecs ? 'codecs="' + codecs : '"')
				});
				
				if (this.get('autoplay') === true) {
					video.setAttribute('autoplay', '');
				}
				video.append(source);
				contentBox.append(video);
							
			this._videoNode = video;
		},
		
		_bindPlayer : function () {
			VideoHTML5.superclass._bindPlayer.apply(this, arguments);
	
			var v = this._videoNode,
			    vDOMNode = Y.Node.getDOMNode(v),
			    count = 0, host = this.get('host');
			
			this.after('percentLoadedChange', Y.bind(function (e) {
			    if (e.newVal >= 100 && this._manualProgressInterval) {
			        this._manualProgressInterval.cancel();
			    }
			}, this));
			
			if (vDOMNode.buffered) {
			    // Webkit isn't great about firing the progress 
			    // event so we have to manually check it
			    this._manualProgressInterval = Y.later(500, this, function() {
			        var curLoaded = this.get('percentLoaded'),
			            percent = (vDOMNode.buffered.end() * 100) / vDOMNode.duration;
			            
			        if (curLoaded == percent) {
			            count++;
			        } else {
			            count = 0;
			        }

                    this.set('percentLoaded', percent);
                    host.fire('progress');
			        
			        // Video is stalled if the same percent loaded comes up 10 times in a row
			        // @TODO : find a way to deal with stalled videos
			        if (count > 10) {
			            count = 0;
			            this._manualProgressInterval.cancel();
			        }
			    }, null, true);
			}
			
            v.after('progress', Y.bind(function (e) {
                var percent = (e._event.loaded * 100) / e._event.total;
                this.set('currentBytes', e._event.loaded);
                this.set('totalBytes', e._event.total);
                this.set('percentLoaded', percent);
            	host.fire('progress');
            }, this));
	
			v.after('timeupdate', Y.bind(function () {
			    this.set('currentTime', vDOMNode.currentTime, {source : 'self'});
				host.fire('playheadUpdate');
			}, this));
			
			v.after('canplay', function () {
				host.fire('canPlay');
			});
			
			v.after('ended', function () {
				host.fire('ended');
			});
			
			v.after('loadeddata', Y.bind(function (e) {
			    this.set('totalTime', vDOMNode.duration);
			
				host.fire('loadedMetadata');
			}, this));
			
			v.after('play', function () {
			    host.fire('play');
			});
			
			v.after('pause', function () {
			    host.fire('pause');
			});
			
			v.after('volumechange', Y.bind(function () {
				var val = vDOMNode.volume,
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
		
        _handleCurrentTimeChange : function (e, args) {
            if(!e.source || e.source != 'self') {
        	    Y.Node.getDOMNode(this._videoNode).currentTime = e.newVal;
            }
        },
		
		_handleVolumeChange : function (e, args) {
			if (args.source == 'self') {
				var newVol = e.newVal / 100;
				Y.Node.getDOMNode(this._videoNode).volume = newVol;
			}
		}
		
	});
	
	Y.VideoHTML5 = VideoHTML5;
    var et = new Y.EventTarget();
    et.publish('flashEvent');

    function VideoFlash () {
        VideoFlash.superclass.constructor.apply(this, arguments);
    }
    
    Y.mix(VideoFlash, {
        NAME : 'video-flash',
        
        NS : 'player',
        
        EVENT_MAP : {
            'complete' : 'ended',
            'metadataReceived' : 'loadedMetadata',
            'playheadUpdate' : 'playheadUpdate',
            'bytesLoadedChange' : 'progress',
            'ready'	: 'canPlay',
            'play' : 'play',
            'pause'	: 'pause'
        },
        
        MIME_TYPES : [
            'video/x-flv',
            'video/mp4',
            'video/quicktime',
            'video/x-m4v'
        ],
        
        CID : 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000',
        CODEBASE : 'http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,115',
        
        flashEventTarget : et,
        
        checkCompatibility : function (mimeType, codecs) {
            if (Y.Array.indexOf(Y.VideoFlash.MIME_TYPES, mimeType) > -1) {
                if (codecs && /avc/.test(codecs) === false && mimeType != 'video/x-flv') {
                    return false;
                }
            } else {
                return false;
            }
            
            if (!Y.UA.flashMajor || Y.UA.flashMajor < 9) {
                return false;
            }
                        
            return true;
        }
    });
    
    YUI.galleryVideoListener = function (id, event) {
        Y.VideoFlash.flashEventTarget.fire('flashEvent', {
            id : id,
            event : event
        });
    };
    
    Y.extend(VideoFlash, ObjectPluginBase, {
        initializer : function () {
            var host = this.get('host');
            
            VideoFlash.flashEventTarget.on('flashEvent', function (args) {
                if (args.id == host.get('id')) {
                    host.fire(VideoFlash.EVENT_MAP[args.event]);
                }
            });
        },
        
        _renderPlayer : function () {
            VideoFlash.superclass._renderPlayer.apply(this, arguments);
        
            var widget = this.get('host'),
                src = this.get('src'),
                swf = Y.Video.SWF_PLAYER_SRC,
                paramMap = {
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
                        file : src,
                        playerId : widget.get('id'),
                        jsCallback : 'YUI.galleryVideoListener'
                    })
                };
            
            if (Y.UA.ie) {
                paramMap.movie = swf;
            }

            this._videoNode = this._createObjectNode(swf, 'application/x-shockwave-flash', VideoFlash.CID, VideoFlash.CODEBASE, paramMap);
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
    
    Y.VideoFlash = VideoFlash;
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
function VideoControls () {
    VideoControls.superclass.constructor.apply(this, arguments);
}

Y.mix(VideoControls, {
    NAME : 'video-controls',
    
    NS : 'controls'
});

Y.extend(VideoControls, Y.Plugin.Base, {
    initializer : function () {
    
    }
});
    function Video (config) {
        Video.superclass.constructor.apply(this, arguments);
    }
        
    Y.mix(Video, {
        NAME : 'video', 
        
        SWF_PLAYER_SRC : 'assets/player.swf',
        
        RENDER_ORDER : ['html5', 'quicktime', 'flash'],
        
        ATTRS : {
            media : {
                validator : function (val) {
                    return this._validateMedia(val);
                }
            },
            
            autoCreate: {
                value : true,
                validator : Y.Lang.isBoolean
            }
        }
    });
    
    Y.extend(Video, Y.Widget, {		
        initializer : function () {
            Y.publish('canPlay');
            Y.publish('ended');
            Y.publish('loadedMetadata');
            Y.publish('progress');
            Y.publish('playheadUpdate');
            Y.publish('error');
            Y.publish('pause');
            Y.publish('play');			
            
            if (this.get('autoCreate') === true) {
                this._findPlayer();
            }
        },
        
        _findPlayer : function () {
            var media = this.get('media'),
                playerMap = {
                    html5 : VideoHTML5,
                    flash : VideoFlash,
                    quicktime : VideoQuicktime
                },
                player;
            
            Y.Array.some(media, Y.bind(function (m) {
                Y.Array.some(Y.Video.RENDER_ORDER, function (key) {
                    player = playerMap[key];
                    var canUse = player.checkCompatibility(m.mimeType, m.codecs);
                    
                    if (canUse === false) {
                        player = null;
                    }
                    
                    return canUse;
                });
                
                if (player) {
                    this.plug(player, m);				
                    return true;
                }
            }, this));
        },
        
        _validateMedia : function (val) {
            if (Y.Lang.isArray(val) === true) {
                return true;
            }
            
            return false;
        }
    });
    
    Y.Video = Video;


}, '@VERSION@' ,{requires:['node', 'widget', 'substitute', 'swfdetect', 'querystring-stringify', 'plugin']});
