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