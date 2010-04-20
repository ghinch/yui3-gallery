(function () {

	function Video (config) {
		Video.superclass.constructor.call(this);
		if (!config || !config.media) {
			return false;
		}
		
		var i =0 , len = config.media.length;
		
		for (; i < len; i++) {
			config.media[i].index = this._checkEnvironment(config.media[i].mimeType);
		}
		
		config.media.sort(function (a, b) {
			return a.index > b.index;
		});

		this._buildPlayer(config.media[0].index, config);
	}
	
	var RENDER_ORDER = ['html5', 'flash', 'quicktime'],
		
		CONTENT_TYPES = {
			MOV : 1,
			FLV : 2,
			MP4 : 3,
			M4V : 4,
			MPEG : 5,
			OGG : 6
		},
		
		MIME_TYPES = {
			'video/quicktime' : CONTENT_TYPES.MOV,
			'video/mp4' : CONTENT_TYPES.MP4,
			'video/mpeg' : CONTENT_TYPES.MPEG,
			'video/x-m4v' : CONTENT_TYPES.M4V,
			'video/x-flv' : CONTENT_TYPES.FLV,
			'video/ogg' : CONTENT_TYPES.OGG
		},
		
		HTML5_BROWSERS = {
			GECKO : [
				CONTENT_TYPES.OGG
			],
			OPERA : [
				CONTENT_TYPES.OGG
			],
			WEBKIT : [
				CONTENT_TYPES.MP4, 
				CONTENT_TYPES.MOV, 
				CONTENT_TYPES.MPEG, 
				CONTENT_TYPES.M4V
			]
		},
		
		FLASH_TYPES = [
			CONTENT_TYPES.MP4, 
			CONTENT_TYPES.MOV, 
			CONTENT_TYPES.M4V, 
			CONTENT_TYPES.FLV
		],		
		
		PLAYERS = {
			html5 : Y.VideoHTML5,
			flash : Y.VideoFlash,
			quicktime : Y.VideoQuicktime
		};
		
	Y.mix(Video, {
		SWF_PLAYER_SRC : 'assets/player.swf'
	});
	
	Y.extend(Video, Y.Base, {
		_widget : null,
		
		initializer : function () {
			Y.publish('canPlay');
			Y.publish('ended');
			Y.publish('loadedMetadata');
			Y.publish('progress');
			Y.publish('playheadUpdate');
			Y.publish('error');
		},
		
		_checkEnvironment : function (mimeType) {
			var type = MIME_TYPES[mimeType];
			if (Y.UA.gecko > 0) {
				if (Y.UA.gecko >= 1.91 && Y.Array.indexOf(HTML5_BROWSERS.GECKO, type) > -1) {
					return Y.Array.indexOf(RENDER_ORDER, 'html5');
				} else if (Y.UA.flashMajor > 9 && Y) {
					return Y.Array.indexOf(RENDER_ORDER, 'flash');
				} else {
					return Y.Array.indexOf(RENDER_ORDER, 'quicktime');
				}
			} else if (Y.UA.opera > 0) {
				if (Y.UA.opera >= 10.5 && Y.Array.indexOf(HTML5_BROWSERS.OPERA, type) > -1) {
					return Y.Array.indexOf(RENDER_ORDER, 'html5');
				} else {
					return Y.Array.indexOf(RENDER_ORDER, 'quicktime');
				}
			} else if (Y.UA.webkit > 0) {
				if (Y.UA.webkit >= 525.25 && Y.Array.indexOf(HTML5_BROWSERS.WEBKIT, type) > -1) {
					return Y.Array.indexOf(RENDER_ORDER, 'html5');
				} else {
					return Y.Array.indexOf(RENDER_ORDER, 'quicktime');
				}
			} else if (Y.UA.ie > 0) {
			} else {
				return -1;
			}
		},
				
		_buildPlayer : function (renderIndex, config) {
			if (!RENDER_ORDER[renderIndex]) {
				return false;
			}

			this._widget = new PLAYERS[RENDER_ORDER[renderIndex]](config);
		},
		
		getPlayer : function () {
			return this._widget;
		},
		
		render : function () {
			this._widget.render.apply(this._widget, arguments);
		},
		
		play : function () {
			this._widget.play();
		},
		
		pause : function () {
			this._widget.pause();
		},
		
		stop : function () {
			this._widget.stop();
		}
	});
	
	Y.Video = Video;

})();