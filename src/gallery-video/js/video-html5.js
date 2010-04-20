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
			Y.log("Seconds must be a number", "error", "Video");
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

Y.VideoHTML5 = VideoHTML5;