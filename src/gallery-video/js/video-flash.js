    var et = new Y.EventTarget();
    et.publish('flashEvent');

    function VideoFlash () {
        VideoFlash.superclass.constructor.apply(this, arguments);
    }
    
    Y.mix(VideoFlash, {
        NAME : 'video-flash',
        
        NS : 'player',
        
        EVENT_MAP : {
            'complete' : 'ended',
            'metadataReceived' : 'loadedMetadata',
            'playheadUpdate' : 'playheadUpdate',
            'bytesLoadedChange' : 'progress',
            'ready'	: 'canPlay',
            'play' : 'play',
            'pause'	: 'pause'
        },
        
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
        Y.VideoFlash.flashEventTarget.fire('flashEvent', {
            id : id,
            event : event
        });
    };
    
    Y.extend(VideoFlash, ObjectPluginBase, {
        initializer : function () {
            var host = this.get('host');
            
            VideoFlash.flashEventTarget.on('flashEvent', function (args) {
                if (args.id == host.get('id')) {
                    host.fire(VideoFlash.EVENT_MAP[args.event]);
                }
            });
        },
        
        _renderPlayer : function () {
            VideoFlash.superclass._renderPlayer.apply(this, arguments);
        
            var widget = this.get('host'),
                src = this.get('src'),
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
                        playerId : widget.get('id'),
                        jsCallback : 'YUI.galleryVideoListener'
                    })
                };
            
            if (Y.UA.ie) {
                paramMap.movie = swf;
            }

            this._videoNode = this._createObjectNode(swf, 'application/x-shockwave-flash', VideoFlash.CID, VideoFlash.CODEBASE, paramMap);
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