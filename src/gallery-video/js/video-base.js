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