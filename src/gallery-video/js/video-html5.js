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