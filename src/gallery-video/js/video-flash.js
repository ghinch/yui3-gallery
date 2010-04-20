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
			Y.log("Seconds must be a number", "error", "Video");
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