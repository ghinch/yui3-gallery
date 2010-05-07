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