YUI.add('gallery-video', function(Y) {

function VideoPlayer () {
	VideoPlayer.superclass.constructor.apply(this, arguments);
}

Y.mix(VideoPlayer, {
	NAME : 'video-player',
	
	ATTRS : {
		mimeType : {
			value : '',
			validator : Y.Lang.isString
		},
		src : {
			value : '',
			validator : Y.Lang.isString
		},
		autoplay : {
			value : true,
			validator : Y.Lang.isBoolean
		}
	}
});

var objTemplate =
	'<object width="100%" height="100%" ' +
		'data="{src}" ' +
		//'id="{id}" ' +
		//'name="{name}" ' +
		'codebase="{codebase}" ' +
		'classid="{classid}" ' +
		'type="{mimeType}" ' +
		'style="{style}">' +
		'{params}' +
	'</object>',
	paramTemplate =
		'<param name="{name}" value="{value}">',
	videoTemplate =
		'<video width="100%" height="100%" ' +
			//'src="{src}" ' +
			'poster="{poster}" ' +
			'preload="{preload}" ' +
			'autoplay="{autoplay}" ' +
			'loop="{loop}" ' +
			'controls="{controls}">' +
			'{source}' +
		'</video>',
	sourceTemplate =
		'<source ' +
			'src="{src}" ' +
			'type="{typeDef}" ' +
			'media="{media}">';

Y.extend(VideoPlayer, Y.Widget, {
	_videoNode : null,
	
	_checkPlugin : function () {
		return true;
	},
	
	initializer : function () {
		
	},
	
	destructor : function () {
	
	},
	
	_createParams : function (params) {
		var paramString = '';
		
		Y.each(params, function (val, key, obj) {
			paramString += Y.substitute(paramTemplate, {
				name : key,
				value : String(val)
			});
		});
		
		return paramString;
	},
	
	_drawHtml5VideoTag : function () {
		var contentBox = this.get('contentBox'),
			src = this.get('src'),
			mimeType = this.get('mimeType'),
			tagString = Y.substitute(videoTemplate, {
				poster : '',
				autoplay : '',
				preload : '',
				loop : '',
				controls : '',
				source : Y.substitute(sourceTemplate, {
					src : src,
					typeDef : mimeType + ';',
					media : ''
				})
			}),
			tag = Y.Node.create(tagString);
			
		tag.after('error', Y.bind(function (e) {
			tag.remove();
			this._drawVideoObjectTag();
		}, this));
		contentBox.append(tag);
		
		this._videoNode = tag;
	},
	
	_drawVideoObjectTag : function () {
		var contentBox = this.get('contentBox'),
			height = this.get('height'),
			src = this.get('src'),
			mimeType = this.get('mimeType'),
			qtParams = {
				src : this.get('src'),
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
		this.set('height', height + 16);
		contentBox.append(tag);
		
		this._videoNode = tag;
	},
	
	_renderPlayer : function () {
		this._drawHtml5VideoTag();
	},
	
	renderUI : function () {
		this._renderPlayer();
	},
	
	bindUI : function () {
	
	},
	
	syncUI : function () {
	
	}
});

Y.VideoPlayer = VideoPlayer;


}, '@VERSION@' ,{requires:['node', 'widget-base', 'widget-htmlparser', 'substitute', 'swf']});
