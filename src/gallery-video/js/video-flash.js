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

        eventMap.metadataReceived = function (e) {            	
        	this.set('totalTime', vDOMNode.getTotalTime());
        	this.set('totalBytes', vDOMNode.getTotalBytes());
        };
        
        eventMap.playheadUpdate = function (e) {
            this.set('currentTime', vDOMNode.getCurrentTime(), {source : 'self'});
        };
        
        eventMap.progress = function (e) {
            this.set('currentBytes', vDOMNode.getCurrentBytes());
            this.set('percentLoaded', (vDOMNode.getCurrentBytes() * 100) / this.get('totalBytes'));
        };
        
        eventMap.ready = function (e) {
            this.set('percentLoaded', 100);
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
    console.log(id, event);
    Y.VideoFlash.flashEventTarget.fire('flashEvent', {
        id : id,
        event : event
    });
};