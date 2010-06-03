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
        }
        
        this._setControls();
    },
    
    _findPlayer : function () {
        var media = this.get('media'),
            playerMap = {
                html5 : Y.VideoHTML5,
                flash : Y.VideoFlash,
                quicktime : Y.VideoQuicktime
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
                m.width = this.get('width');
                m.height = this.get('height');
                m.controls = (this.get('customControls') === false);
                this.add((new player(m)));
                return true;
            }
        }, this));
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
            
        player.after('playingChange', Y.bind(function (e) {
            this._syncPlaying(e.newVal);
        }, this));
    },
    
    syncUI : function () {
        this._syncPlaying(this.getPlayer().get('playing'));
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