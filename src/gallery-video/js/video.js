Y.Video = Y.Base.create('video', Y.Widget, [Y.WidgetParent], {		
    _validateMedia : function (val) {
        if (Y.Lang.isArray(val) === true) {
            return true;
        }
        
        return false;
    },
    
    _validateCustomControls : function (val) {
        if (val === false) {
            return true;
        }
        
        if (val instanceof Y.VideoControls) {
            return true;
        }
        
        return false;
    },

    initializer : function () {            
        if (this.get('autoCreate') === true) {
            this._findPlayer();
            this._setControls();
        }
    },
    
    // @TODO : Refactor all of this, too messy
    _findPlayer : function () {
        var media = this.get('media'),
            playerMap = {
                html5 : Y.VideoHTML5,
                flash : Y.VideoFlash,
                quicktime : Y.VideoQuicktime
            },
            usableMap = [],
            playerIndex,
            useIndex, 
            useMedia,
            player;
        
        // Loop through each of the media and find the best (lowest indexed)
        // player to use for that media. Store that in an array to find the
        // best value from
        Y.Array.each(media, Y.bind(function (m, index) {
            Y.Array.some(Y.Video.RENDER_ORDER, function (key, rendererIndex) {
                var player = playerMap[key],
                    canUse = player.checkCompatibility(m.mimeType, m.codecs);
                
                usableMap[index] = (canUse === true) ? rendererIndex : false;
                
                return canUse;
            });
        }, this));
        
        // In the array of player indexes to use for each media, find the
        // best (lowest player index) media to use
        Y.Array.each(usableMap, Y.bind(function (val, mediaIndex) {
            if (Y.Lang.isNumber(val) && (playerIndex === undefined || val < playerIndex)) {
                playerIndex = val;
                useIndex = mediaIndex;
            } else if (val === 0 && !Y.Lang.isNumber(useIndex)) {
                useIndex = mediaIndex;
            }
        }, this));
        
        // If there is a player to use, render it
        if (Y.Lang.isNumber(useIndex)) {
            player = playerMap[Y.Video.RENDER_ORDER[playerIndex]];
            useMedia = media[useIndex];
            useMedia.width = this.get('width');
            useMedia.height = this.get('height');
            useMedia.controls = (this.get('customControls') === false);
            this.add((new player(useMedia)));
            return true;
        }
        
        return false;
    },
    
    _setControls : function () {
        var ctrls = this.get('customControls'),
            player = this.getPlayer(),
            height = this.get('height');
        
        if (!player) {
            return;
        }
        
        if (ctrls === false) {
            this.set('height', height + player.getControlsHeight());
            return;
        }
        
        if (!ctrls) {
            ctrls = new Y.VideoControls({
                width : this.get('width')
            });
            this.set('customControls', ctrls);
        }
        
        this.add(ctrls);
        this.set('height', height + ctrls.get('height'));
    },
    
    _syncPlaying : function (val) {
        var contentBox = this.get('contentBox');
        
        if (val === true) {
            contentBox.addClass('video-playing');
            contentBox.removeClass('video-paused');
        } else {
            contentBox.removeClass('video-playing');
            contentBox.addClass('video-paused');            
        }
    },
    
    bindUI : function () {
        var player = this.getPlayer();
        if (player) {
            player.after('playingChange', Y.bind(function (e) {
                this._syncPlaying(e.newVal);
            }, this));
        }
    },
    
    syncUI : function () {
        var player = this.getPlayer();
        if (player) {
            this._syncPlaying(player.get('playing'));
        }
    },
    
    getPlayer : function () {
        var player = null;
        this.some(function (item, index) {
            if (item instanceof Y._VideoBase) {
                player = item;
                return true;
            }
        }, this);
        
        return player;
    }
}, {
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
        },
        
        customControls : {
            value : null,
            writeOnce : true,
            validator : function (val) {
                return this._validateCustomControls(val);
            }
        }
    }
});