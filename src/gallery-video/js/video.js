    function Video (config) {
        Video.superclass.constructor.apply(this, arguments);
    }
        
    Y.mix(Video, {
        NAME : 'video', 
        
        SWF_PLAYER_SRC : 'assets/player.swf',
        
        RENDER_ORDER : ['html5', 'quicktime', 'flash'],
        
        ATTRS : {
            media : {
                validator : function (val) {
                    return this._validateMedia(val);
                }
            },
            
            autoCreate: {
                value : true,
                validator : Y.Lang.isBoolean
            }
        }
    });
    
    Y.extend(Video, Y.Widget, {		
        initializer : function () {
            Y.publish('canPlay');
            Y.publish('ended');
            Y.publish('loadedMetadata');
            Y.publish('progress');
            Y.publish('playheadUpdate');
            Y.publish('error');
            Y.publish('pause');
            Y.publish('play');			
            
            if (this.get('autoCreate') === true) {
                this._findPlayer();
            }
        },
        
        _findPlayer : function () {
            var media = this.get('media'),
                playerMap = {
                    html5 : VideoHTML5,
                    flash : VideoFlash,
                    quicktime : VideoQuicktime
                },
                player;
            
            Y.Array.some(media, Y.bind(function (m) {
                Y.Array.some(Y.Video.RENDER_ORDER, function (key) {
                    player = playerMap[key];
                    var canUse = player.checkCompatibility(m.mimeType, m.codecs);
                    
                    if (canUse === false) {
                        player = null;
                    }
                    
                    return canUse;
                });
                
                if (player) {
                    this.plug(player, m);				
                    return true;
                }
            }, this));
        },
        
        _validateMedia : function (val) {
            if (Y.Lang.isArray(val) === true) {
                return true;
            }
            
            return false;
        }
    });
    
    Y.Video = Video;