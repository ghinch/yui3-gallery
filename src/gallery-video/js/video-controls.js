Y.VideoControls = Y.Base.create('video-controls', Y.Widget, [Y.WidgetParent, Y.WidgetChild], {
    _totalTime : null,
    
    _progressSlider : null,
    
    _volumeSlider : null,
    
    _seeking : false,
    
    initializer : function () {},
    
    destructor : function () {},
    
    renderUI : function () {
        this.renderControls();
    },
    
    bindUI : function () {
        this.bindControls();
    },
    
    syncUI : function () {
        this.syncControls();
    },
    
    _fadeOut : function () {
        var bb = this.get('boundingBox'),
            anim = new Y.Anim({
                node : bb,
                to : {
                    opacity : 0
                }
            });
        anim.after('end', function () {
            bb.setStyle('display', 'none');
        });
        anim.run();
    },
    
    _fadeIn : function () {
        var bb = this.get('boundingBox'),
            anim = new Y.Anim({
                node : bb,
                to : {
                    opacity : 1
                }
            });
        anim.on('start', function () {
            bb.setStyle('display', '');
        });
        anim.run();
    },
    
    _toggleVolume : function () {
        var cb = this.get('contentBox'),
            volBB = this._volumeSlider.get('boundingBox'),
            anim = new Y.Anim({
                node : volBB,
                duration : 0.3,
                easing : Y.Easing.easeOut
            });
            
        if (cb.hasClass('video-volume-showing') === true) {
            anim.set('to', {
                height : 0
            });
        } else {
            anim.set('to', {
                height : 106
            });
        }
        anim.after('end', function () {
            cb.toggleClass('video-volume-showing');
        });
        anim.run();
    },
    
    renderControls : function () {
        var contentBox = this.get('contentBox');
        contentBox.set('innerHTML',
            '<button class="yui-video-controls-button yui-video-controls-button-play">&nbsp;</button>' + 
            '<button class="yui-video-controls-button yui-video-controls-button-pause">&nbsp;</button>' + 
            '<button class="yui-video-controls-button yui-video-controls-button-stop">&nbsp;</button>' + 
            '<span class="yui-video-controls-current-time">00:00:00</span>' +
            '<span class="yui-video-controls-total"><span class="yui-video-controls-loaded"></span></span>' +
            '<span class="yui-video-controls-remaining-time">00:00:00</span>' +
            '<button class="yui-video-controls-button yui-video-controls-button-volume">&nbsp;</button>' +
            '<span class="yui-video-controls-volume-slider"></span>');
            
        this._progressSlider = new Y.Slider({
        	min : 0,
        	max : 600,
        	length : 600,
        	thumbUrl : 'playhead.png'
        });
        this._progressSlider.render(contentBox.one('.yui-video-controls-total'));
        
        this._volumeSlider = new Y.Slider({
        	min : 100,
        	max : 0,
        	length : 100,
        	value : 100,
        	axis : 'y',
        	boundingBox : contentBox.one('.yui-video-controls-volume-slider')
        });
        this._volumeSlider.render();
    },
    
    bindControls : function () {
        var parent = this.get('parent'),
            player = parent.getPlayer(),
            contentBox = this.get('contentBox'),
            //parentBoundingBox = parent.get('boundingBox'),
            loadedBar = contentBox.one('.yui-video-controls-loaded'),
            curTimeDisplay = contentBox.one('.yui-video-controls-current-time'),
            remTimeDisplay = contentBox.one('.yui-video-controls-remaining-time'),
            prefix = '';
        
        if (player) {
            prefix = player.name + ':';
        }
        
        parent.after(prefix + 'totalTimeChange', Y.bind(function (e) {
            this._totalTime = e.newVal;
            //this._fadeOut();
        }, this));
        
        parent.after(prefix + 'currentTimeChange', Y.bind(function (e) {
            var remTime = this._totalTime - e.newVal;
            curTimeDisplay.set('innerHTML', Y.VideoControls.secondsToTimestamp(e.newVal));
            remTimeDisplay.set('innerHTML', Y.VideoControls.secondsToTimestamp(remTime));
            
            if (this._seeking === false) {
            	this._progressSlider.set('value', Math.ceil((e.newVal * this._progressSlider.get('max')) / this._totalTime));
            }
        }, this));
        
        /**parentBoundingBox.after('mouseout', Y.bind(function (e) {
            var pX = e.pageX,
                pY = e.pageY,
                bbX = parentBoundingBox.getX(),
                bbY = parentBoundingBox.getY();
                
            if ((pX > bbX && pX < bbX + parent.get('width')) &&
                (pY > bbY && pY < bbY + parent.get('height'))) {
                 return;
            }
            
            this._fadeOut();
        }, this));
        
        parent.after('mouseover', Y.bind(function () {
            this._fadeIn();
        }, this));*/
        
        parent.after(prefix + 'percentLoadedChange', function (e) {            
            loadedBar.setStyle('width', Math.ceil((e.newVal / 100) * 600) + 'px');
        });
        
        contentBox.one('.yui-video-controls-button-play').after('click', function (e) {
            player.set('playing', true);
        });
        
        contentBox.one('.yui-video-controls-button-pause').after('click', function (e) {
            player.set('playing', false);
        });
        
        contentBox.one('.yui-video-controls-button-stop').after('click', function (e) {
            player.set('playing', false);
            player.set('currentTime', 0);
        });
        
        contentBox.one('.yui-video-controls-button-volume').after('click', Y.bind(function (e) {
            this._toggleVolume();
        }, this));
        
        this._progressSlider.rail.on('mousedown', Y.bind(function (e) {
        	this._seeking = true;
        }, this));
        
        this._progressSlider.rail.on('mouseup', Y.bind(function (e) {
        	var s = (this._progressSlider.get('value') * this._totalTime) / this._progressSlider.get('max');
        	player.set('currentTime', s);
        	this._seeking = false;
        }, this));

        this._volumeSlider.after('valueChange', function (e) {
        	player.set('volume', e.newVal);
        });
    },
    
    syncControls : function () {
    
    }
}, {
    ATTRS : {
        height : {
            value : 32
        }
    },
    
    secondsToTimestamp : function (seconds) {
    	var whole = Math.floor(seconds),
    		h = whole / 3600,
    		m = whole / 60,
    		s = seconds - (Math.floor(m) * 60),
    		timestamp = '';
    	
    	timestamp += (h >= 10 ? Math.floor(h) : '0' + Math.floor(h)) + ':';
    	timestamp += (m >= 10 ? Math.floor(m) : '0' + Math.floor(m)) + ':';
    	timestamp += (s >= 10 ? Math.floor(s) : '0' + Math.floor(s));
    	return timestamp;
    }
});