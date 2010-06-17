YUI.add('gallery-video', function(Y) {

function setFloat (val, attr) {
    return parseFloat(val);
}

Y._VideoBase = Y.Base.create('video-base', Y.Widget, [Y.WidgetParent, Y.WidgetChild], {
    _videoNode : null,
        
    _validatePercentage : function (val) {
        if (Y.Lang.isNumber(val) === false) {
            Y.log('Must be a number', 'error', 'Video');
            return false;
        }
        
        if (val > 100 || val < 0) {
            Y.log('Must be between 0 and 100', 'error', 'Video');
            return false;
        }
        
        return true;
    },
            
    initializer : function () {
    },
    
    destructor : function () {
    
    },
    
    renderUI : function () {
        this._renderPlayer();
    },
    
    bindUI : function () {
        this._bindPlayer();
    },
    
    syncUI : function () {
        if (this.get('autoplay') === true) {
            this.set('playing', true, {source : 'self'});
        }    
    },
        
    _renderPlayer : function () {},
    
    _bindPlayer : function () {
        this.on('volumeChange', Y.bind(this._handleVolumeChange, this));
        this.on('currentTimeChange', Y.bind(this._handleCurrentTimeChange, this));
        this.on('playingChange', Y.bind(this._handlePlayingChange, this));
    },
    
    _handleCurrentTimeChange : function () {},
        
    _handleVolumeChange : function () {},
    
    _handlePlayingChange : function () {},
    
    getControlsHeight : function () {}
}, {
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
        controls : {
            value : false,
            validator : Y.Lang.isBoolean
        },
        volume : {
            value : 100,
            validator : function (val) {	
                return this._validatePercentage(val);
            },
            setter : setFloat,
            broadcast : 1
        },
        totalTime : {
            writeOnce : true,
            validator : Y.Lang.isNumber,
            setter : setFloat,
            broadcast : 1
        },
        currentTime : {
            value : 0,
            validator : Y.Lang.isNumber,
            setter : setFloat,
            broadcast : 1
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
            setter : setFloat,
            broadcast : 1
        },
        playing : {
            value : false,
            validator : Y.Lang.isBoolean,
            broadcast : 1
        }
    }
});
Y.ObjectTag = (function () {
    function _createParamNode (name, value) {
        var param = 
            '<param name="' + name + '" value="' + value + '">';
        return param;
    }
    
    return {
        create : function (data, type, classid, codebase, paramMap) {
            var objTemplate = '<object height="100%" width="100%" ';
            
            if (Y.UA.ie) {
                objTemplate += 'classid="' + classid + '" codebase="' + codebase + '"';
            } else {
                objTemplate += 'data="' + data + '" type="' + type + '"';
            }
            
            objTemplate += '>'; 
            
            Y.Object.each(paramMap, function(val, key) {
                var p = _createParamNode(key, val);
                objTemplate += p;
            });
            
            objTemplate += '</object>';
            
            return objTemplate;
        }
    }; 
})();
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

Y.VideoHTML5 = Y.Base.create('video-html5', Y._VideoBase, [Y.WidgetChild], {
	_renderPlayer : function () {
        Y.VideoHTML5.superclass._renderPlayer.apply(this, arguments);
        
        // innerHTML doesn't work on mobile safari
		var video = document.createElement('video'),
			source = document.createElement('source'),
			contentBox = this.get('contentBox'),
			src = this.get('src'),
			mimeType = this.get('mimeType'),
			codecs = this.get('codecs');
			
		video.width = this.get('width');
		video.height = this.get('height');
			
		source.src = src;
		source.type = mimeType + '; ' + (codecs ? 'codecs="' + codecs : '"');
		
		if (this.get('autoplay') === true) {
		    video.autoplay = "autoplay";
		}
		
		video.appendChild(source);
		contentBox.appendChild(video);
						
		this._videoNode = contentBox.one('video');
	},
	
	_bindPlayer : function () {
		Y.VideoHTML5.superclass._bindPlayer.apply(this, arguments);

		var v = this._videoNode,
		    vDOMNode = Y.Node.getDOMNode(v),
		    progressInterval,
		    count = 0;
		
		this.after('percentLoadedChange', Y.bind(function (e) {
		    if (e.newVal == e.prevVal) {
		        count++;
		    } else {
		        count = 0;
		    }

            // Video is stalled if the same percent loaded comes up 10 times in a row
            // @TODO : find a way to deal with stalled videos
		    if ((e.newVal >= 100 && progressInterval) || count > 10) {
                count = 0;
		        progressInterval.cancel();
		        progressInterval = null;
		    }
		}, this));
		
		if (vDOMNode.buffered) {
		    // Webkit isn't great about firing the progress 
		    // event accurately so we have to manually check it
		    progressInterval = Y.later(500, this, function() {
		        var percent = (vDOMNode.buffered.end() * 100) / vDOMNode.duration;
                this.set('percentLoaded', percent);
		    }, null, true);
		}
		
        v.after('progress', Y.bind(function (e) {
            var percent = (e._event.loaded * 100) / e._event.total;
            this.set('currentBytes', e._event.loaded);
            this.set('totalBytes', e._event.total);
            this.set('percentLoaded', percent);
        }, this));

		v.after('timeupdate', Y.bind(function () {
		    this.set('currentTime', vDOMNode.currentTime, {source : 'self'});
		}, this));
		
		v.after('loadedmetadata', Y.bind(function (e) {
		    this.set('totalTime', vDOMNode.duration);
		}, this));
		
		v.after('play', Y.bind(function () {
		    this.set('playing', true, {source : 'self'});
		}, this));

        v.after('pause', Y.bind(function () {
            this.set('playing', false, {source : 'self'});
        }, this));
        
        v.after('ended', Y.bind(function () {
            this.set('playing', false, {source : 'self'});
        }, this));
		
		v.after('volumechange', Y.bind(function () {
			var val = vDOMNode.volume,
				newVol = Math.floor(val * 100);
				
			this.set('volume', newVol, {source : 'self'});
		}, this));
	},
			
    _handleCurrentTimeChange : function (e) {
        if(e.source && e.source == 'self') {
            return;
        }
    	
    	Y.Node.getDOMNode(this._videoNode).currentTime = e.newVal;
    },
	
	_handleVolumeChange : function (e) {
		if (e.source && e.source == 'self') {
		    return;
		}
		
		var newVol = e.newVal / 100;
		Y.Node.getDOMNode(this._videoNode).volume = newVol;
	},
	
	_handlePlayingChange : function (e) {
        if (e.source && e.source == 'self') {
            return;
        }
        
	    if (e.newVal === true) {
			Y.Node.getDOMNode(this._videoNode).play();
	    } else {
			Y.Node.getDOMNode(this._videoNode).pause();
	    }
	},
	
    getControlsHeight : function () {
        return 0;
    }
}, {		
	checkCompatibility : function (mimeType, codecs) {
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
var et = new Y.EventTarget();
et.publish('flashEvent');

Y.VideoFlash = Y.Base.create('video-quicktime', Y._VideoBase, [Y.WidgetChild], {
    _renderPlayer : function () {
        Y.VideoFlash.superclass._renderPlayer.apply(this, arguments);
    
        var src = this.get('src'),
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
                    playerId : this.get('id'),
                    jsCallback : 'YUI.galleryVideoListener',
                    yuiId : Y.id
                })
            },
            contentBox = this.get('contentBox'),
            objTag;
        
        if (Y.UA.ie) {
            paramMap.movie = swf;
        }
        
        objTag = Y.ObjectTag.create(swf, 'application/x-shockwave-flash', Y.VideoFlash.CID, Y.VideoFlash.CODEBASE, paramMap);
        
        contentBox.set('innerHTML', objTag);
        this._videoNode = contentBox.one('object');
    },
    
    _bindPlayer : function () {
        Y.VideoFlash.superclass._bindPlayer.apply(this, arguments);
        var hostId = this.get('id'),
            v = this._videoNode,
            vDOMNode = Y.Node.getDOMNode(v),
            eventMap = {};

        eventMap.stateChange = function (e) {
            var totalTime = vDOMNode.getTotalTime(),
                totalBytes = vDOMNode.getTotalBytes();
            
            if (Y.Lang.isNumber(totalTime) && Y.Lang.isNumber(totalBytes)) {
                delete eventMap.stateChange;
            }
            
        	this.set('totalTime', totalTime);
        	this.set('totalBytes', totalBytes);
        };
        
        eventMap.currentTimeChange = function (e) {
            this.set('currentTime', vDOMNode.getCurrentTime(), {source : 'self'});
        };
        
        eventMap.bytesLoadedChange = function (e) {
            this.set('currentBytes', vDOMNode.getCurrentBytes());
            this.set('percentLoaded', (vDOMNode.getCurrentBytes() * 100) / this.get('totalBytes'));
        };
        
        eventMap.play = function (e) {
            this.set('playing', true, {source : 'self'});
        };
        
        eventMap.pause = function (e) {
            this.set('playing', false, {source : 'self'});
        };
        
        Y.VideoFlash.flashEventTarget.on('flashEvent', Y.bind(function (args) {
            if (args.id == hostId) {
                eventMap[args.event].apply(this, arguments);
            }
        }, this));
    },
    
    _handleCurrentTimeChange : function (e) {
        if(e.source && e.source == 'self') {
            return;
        }
        
   	    Y.Node.getDOMNode(this._videoNode).setCurrentTime(e.newVal);
    },
    
    _handleVolumeChange : function (e) {
        if (e.source && e.source == 'self') {
            return;
        }
        
        var newVol = e.newVal / 100;
        Y.Node.getDOMNode(this._videoNode).setVolume(newVol);
    },
    
    _handlePlayingChange : function (e) {
        if (e.source && e.source == 'self') {
            // @TODO: Need to stop the event here or JS error occurs. Not sure why
            e.halt();
            return;
        }
        
        if (e.newVal === true) {
			Y.Node.getDOMNode(this._videoNode).playMedia();
        } else {
			Y.Node.getDOMNode(this._videoNode).pauseMedia();
		}
    },

    getControlsHeight : function () {
        return 0;
    }
}, {
    ATTRS : {
        playing : {
            value : true
        }
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
Y.VideoControls = Y.Base.create('video-controls', Y.Widget, [Y.WidgetParent, Y.WidgetChild], {
    _totalTime : null,
    
    _progressSlider : null,
    
    _volumeSlider : null,
    
    _seeking : false,
    
    initializer : function () {},
    
    destructor : function () {},
    
    renderUI : function () {
        this.renderControls();
    },
    
    bindUI : function () {
        this.bindControls();
    },
    
    syncUI : function () {
        this.syncControls();
    },
        
    _toggleVolume : function () {
        var cb = this.get('contentBox'),
            volBB = this._volumeSlider.get('boundingBox'),
            anim = new Y.Anim({
                node : volBB,
                duration : 0.3,
                easing : Y.Easing.easeOut
            });
            
        if (cb.hasClass('video-volume-showing') === true) {
            anim.set('to', {
                height : 0
            });
        } else {
            anim.set('to', {
                height : 106
            });
        }
        anim.after('end', function () {
            cb.toggleClass('video-volume-showing');
        });
        anim.run();
    },
    
    renderControls : function () {
        var contentBox = this.get('contentBox'),
            controlWidth = this.get('width'),
            curTimeBox, remTimeBox, playBarWidth;
        
        contentBox.set('innerHTML',
            '<button class="yui3-video-controls-button yui3-video-controls-button-play">&nbsp;</button>' + 
            '<button class="yui3-video-controls-button yui3-video-controls-button-pause">&nbsp;</button>' + 
            '<button class="yui3-video-controls-button yui3-video-controls-button-stop">&nbsp;</button>' + 
            '<span class="yui3-video-controls-current-time">00:00:00</span>' +
            '<span class="yui3-video-controls-total"><span class="yui3-video-controls-loaded"></span></span>' +
            '<span class="yui3-video-controls-remaining-time">00:00:00</span>' +
            '<button class="yui3-video-controls-button yui3-video-controls-button-volume">&nbsp;</button>' +
            '<span class="yui3-video-controls-volume-slider"></span>');
        
        curTimeBox = contentBox.one('.yui3-video-controls-current-time');
        remTimeBox = contentBox.one('.yui3-video-controls-remaining-time');
        
        playBarWidth = Math.floor(controlWidth -
                        parseInt(curTimeBox.getStyle('left'), 10) -
                        parseInt(curTimeBox.getComputedStyle('width'), 10) -
                        parseInt(remTimeBox.getStyle('right'), 10) -
                        parseInt(remTimeBox.getComputedStyle('width'), 10) -
                        24);
            
        this._progressSlider = new Y.Slider({
        	min : 0,
        	max : playBarWidth,
        	length : playBarWidth,
        	thumbUrl : Y.VideoControls.PLAYHEAD_IMG
        });
        this._progressSlider.render(contentBox.one('.yui3-video-controls-total'));
        
        this._volumeSlider = new Y.Slider({
        	min : 100,
        	max : 0,
        	length : 100,
        	value : 100,
        	thumbUrl : Y.VideoControls.VOLUME_IMG,
        	axis : 'y',
        	boundingBox : contentBox.one('.yui3-video-controls-volume-slider')
        });
        this._volumeSlider.render();
    },
    
    bindControls : function () {
        var parent = this.get('parent'),
            player = parent.getPlayer(),
            contentBox = this.get('contentBox'),
            loadedBar = contentBox.one('.yui3-video-controls-loaded'),
            curTimeDisplay = contentBox.one('.yui3-video-controls-current-time'),
            remTimeDisplay = contentBox.one('.yui3-video-controls-remaining-time'),
            prefix = '';
        
        if (player) {
            prefix = player.name + ':';
        }
        
        parent.after(prefix + 'totalTimeChange', Y.bind(function (e) {
            this._totalTime = e.newVal;
        }, this));
        
        parent.after(prefix + 'currentTimeChange', Y.bind(function (e) {
            var remTime = this._totalTime - e.newVal;
            curTimeDisplay.set('innerHTML', Y.VideoControls.secondsToTimestamp(e.newVal));
            remTimeDisplay.set('innerHTML', Y.VideoControls.secondsToTimestamp(remTime));
            
            if (this._seeking === false) {
            	this._progressSlider.set('value', Math.ceil((e.newVal * this._progressSlider.get('max')) / this._totalTime));
            }
        }, this));
        
        parent.after(prefix + 'percentLoadedChange', Y.bind(function (e) {            
            loadedBar.setStyle('width', Math.ceil((e.newVal / 100) * this._progressSlider.get('max')) + 'px');
        }, this));
        
        contentBox.one('.yui3-video-controls-button-play').after('click', function (e) {
            player.set('playing', true);
        });
        
        contentBox.one('.yui3-video-controls-button-pause').after('click', function (e) {
            player.set('playing', false);
        });
        
        contentBox.one('.yui3-video-controls-button-stop').after('click', function (e) {
            player.set('playing', false);
            player.set('currentTime', 0);
        });
        
        contentBox.one('.yui3-video-controls-button-volume').after('click', Y.bind(function (e) {
            this._toggleVolume();
        }, this));
        
        this._progressSlider.rail.on('mousedown', Y.bind(function (e) {
        	this._seeking = true;
        }, this));
        
        this._progressSlider.rail.on('mouseup', Y.bind(function (e) {
        	var s = (this._progressSlider.get('value') * this._totalTime) / this._progressSlider.get('max');
        	player.set('currentTime', s);
        	this._seeking = false;
        }, this));

        this._volumeSlider.after('valueChange', function (e) {
        	player.set('volume', e.newVal);
        });
    },
    
    syncControls : function () {
    
    }
}, {
    ATTRS : {
        height : {
            value : 32
        }
    },
    
    PLAYHEAD_IMG : 'assets/playhead_slider.png',
    
    VOLUME_IMG : 'assets/volume_slider.png',
    
    BUTTON_WIDTH : 32,
    
    secondsToTimestamp : function (seconds) {
    	var whole = Math.floor(seconds),
    		h = whole / 3600,
    		m = whole / 60,
    		s = seconds - (Math.floor(m) * 60),
    		timestamp = '';
    	
    	timestamp += (h >= 10 ? Math.floor(h) : '0' + Math.floor(h)) + ':';
    	timestamp += (m >= 10 ? Math.floor(m) : '0' + Math.floor(m)) + ':';
    	timestamp += (s >= 10 ? Math.floor(s) : '0' + Math.floor(s));
    	return timestamp;
    }
});
Y.Video = Y.Base.create('video', Y.Widget, [Y.WidgetParent], {		
    _validateMedia : function (val) {
        if (Y.Lang.isArray(val) === true) {
            return true;
        }
        
        return false;
    },
    
    _validateCustomControls : function (val) {
        if (val === false) {
            return true;
        }
        
        if (val instanceof Y.VideoControls) {
            return true;
        }
        
        return false;
    },

    initializer : function () {            
        if (this.get('autoCreate') === true) {
            this._findPlayer();
            this._setControls();
        }
    },
    
    // @TODO : Refactor all of this, too messy
    _findPlayer : function () {
        var media = this.get('media'),
            playerMap = {
                html5 : Y.VideoHTML5,
                flash : Y.VideoFlash,
                quicktime : Y.VideoQuicktime
            },
            usableMap = [],
            playerIndex,
            useIndex, 
            useMedia,
            player;
        
        // Loop through each of the media and find the best (lowest indexed)
        // player to use for that media. Store that in an array to find the
        // best value from
        Y.Array.each(media, Y.bind(function (m, index) {
            Y.Array.some(Y.Video.RENDER_ORDER, function (key, rendererIndex) {
                var player = playerMap[key],
                    canUse = player.checkCompatibility(m.mimeType, m.codecs);
                
                usableMap[index] = (canUse === true) ? rendererIndex : false;
                
                return canUse;
            });
        }, this));
        
        // In the array of player indexes to use for each media, find the
        // best (lowest player index) media to use
        Y.Array.each(usableMap, Y.bind(function (val, mediaIndex) {
            if (Y.Lang.isNumber(val) && (playerIndex === undefined || val < playerIndex)) {
                playerIndex = val;
                useIndex = mediaIndex;
            } else if (val === 0 && !Y.Lang.isNumber(useIndex)) {
                useIndex = mediaIndex;
            }
        }, this));
        
        // If there is a player to use, render it
        if (Y.Lang.isNumber(useIndex)) {
            player = playerMap[Y.Video.RENDER_ORDER[playerIndex]];
            useMedia = media[useIndex];
            useMedia.width = this.get('width');
            useMedia.height = this.get('height');
            useMedia.controls = (this.get('customControls') === false);
            this.add((new player(useMedia)));
            return true;
        }
        
        return false;
    },
    
    _setControls : function () {
        var ctrls = this.get('customControls'),
            player = this.getPlayer(),
            height = this.get('height');
        
        if (!player) {
            return;
        }
        
        if (ctrls === false) {
            this.set('height', height + player.getControlsHeight());
            return;
        }
        
        if (!ctrls) {
            ctrls = new Y.VideoControls({
                width : this.get('width')
            });
            this.set('customControls', ctrls);
        }
        
        this.add(ctrls);
        this.set('height', height + ctrls.get('height'));
    },
    
    _syncPlaying : function (val) {
        var contentBox = this.get('contentBox');
        
        if (val === true) {
            contentBox.addClass('video-playing');
            contentBox.removeClass('video-paused');
        } else {
            contentBox.removeClass('video-playing');
            contentBox.addClass('video-paused');            
        }
    },
    
    bindUI : function () {
        var player = this.getPlayer();
        if (player) {
            player.after('playingChange', Y.bind(function (e) {
                this._syncPlaying(e.newVal);
            }, this));
        }
    },
    
    syncUI : function () {
        var player = this.getPlayer();
        if (player) {
            this._syncPlaying(player.get('playing'));
        }
    },
    
    getPlayer : function () {
        var player = null;
        this.some(function (item, index) {
            if (item instanceof Y._VideoBase) {
                player = item;
                return true;
            }
        }, this);
        
        return player;
    }
}, {
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
        },
        
        customControls : {
            value : null,
            writeOnce : true,
            validator : function (val) {
                return this._validateCustomControls(val);
            }
        }
    }
});


}, '@VERSION@' ,{requires:['node', 'node-event-html5', 'widget', 'widget-parent', 'widget-child', 'swfdetect', 'querystring-stringify', 'plugin', 'anim']});
