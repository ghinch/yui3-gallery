function Video () {
	Video.superclass.constructor.apply(this, arguments);
}

Y.mix(Video, {
	NAME : 'video',
	
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
		},
		methods : {
			value : ['html', 'quicktime'],
			validator : this._validateMethods
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

Y.extend(Video, Y.Widget, {
	_videoNode : null,
	
	_methodIndex : 0,
	
	_validateMethods : function (val) {
		if (Y.Lang.isArray(val) === false) {
			Y.log("Must be an array of one or more valid methods: html, flash, or quicktime", "error");
			return false;
		}
		
		var validStrings = /(html|flash|quicktime)/,
			i, len;
		
		for (i = 0, len = val.length; i < len; i++) {
			if (validStrings.test(val[i]) === false) {
				return false;
			}
		}
		
		return true;
	},
	
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
		if (Y.UA.gecko > 1.9 || Y.UA.webkit > 500) {
			var contentBox = this.get('contentBox'),
				src = this.get('src'),
				mimeType = this.get('mimeType'),
				tagString = Y.substitute(videoTemplate, {
					poster : '',
					autoplay : String(this.get('autoplay')),
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
				this._renderPlayer();
			}, this));
			contentBox.append(tag);
			
			this._videoNode = tag;
		} else {
			this._renderPlayer();
		}
	},
	
	_drawFlashPlayer : function () {
		// Not implemented
		this._renderPlayer();
		return;
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
		var methods = this.get('methods'),
			renderMethods = {
				html : this._drawHtml5VideoTag,
				flash : this._drawFlashPlayer,
				quicktime : this._drawVideoObjectTag
			};

		if (methods[this._methodIndex]) {
			renderMethods[methods[this._methodIndex]].call(this);
			this._methodIndex++;			
		} else {
			Y.log ('No valid player could be found for this video', 'error');
		}
	},
	
	renderUI : function () {
		this._renderPlayer();
	},
	
	bindUI : function () {
	
	},
	
	syncUI : function () {
	
	}
});

Y.Video = Video;
