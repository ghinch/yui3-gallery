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
        var contentBox = this.get('contentBox'),
            controlWidth = this.get('width'),
            curTimeBox, remTimeBox, playBarWidth;
        
        contentBox.set('innerHTML',
            '<button class="yui3-video-controls-button yui3-video-controls-button-play">&nbsp;</button>' + 
            '<button class="yui3-video-controls-button yui3-video-controls-button-pause">&nbsp;</button>' + 
            '<button class="yui3-video-controls-button yui3-video-controls-button-stop">&nbsp;</button>' + 
            '<span class="yui3-video-controls-current-time">00:00:00</span>' +
            '<span class="yui3-video-controls-total"><span class="yui3-video-controls-loaded"></span></span>' +
            '<span class="yui3-video-controls-remaining-time">00:00:00</span>' +
            '<button class="yui3-video-controls-button yui3-video-controls-button-volume">&nbsp;</button>' +
            '<span class="yui3-video-controls-volume-slider"></span>');
        
        curTimeBox = contentBox.one('.yui3-video-controls-current-time');
        remTimeBox = contentBox.one('.yui3-video-controls-remaining-time');
        
        playBarWidth = Math.floor(controlWidth -
                        parseInt(curTimeBox.getStyle('left'), 10) -
                        parseInt(curTimeBox.getComputedStyle('width'), 10) -
                        parseInt(remTimeBox.getStyle('right'), 10) -
                        parseInt(remTimeBox.getComputedStyle('width'), 10) -
                        24);
            
        this._progressSlider = new Y.Slider({
        	min : 0,
        	max : playBarWidth,
        	length : playBarWidth,
        	thumbUrl : Y.VideoControls.PLAYHEAD_IMG
        });
        this._progressSlider.render(contentBox.one('.yui3-video-controls-total'));
        
        this._volumeSlider = new Y.Slider({
        	min : 100,
        	max : 0,
        	length : 100,
        	value : 100,
        	thumbUrl : Y.VideoControls.VOLUME_IMG,
        	axis : 'y',
        	boundingBox : contentBox.one('.yui3-video-controls-volume-slider')
        });
        this._volumeSlider.render();
    },
    
    bindControls : function () {
        var parent = this.get('parent'),
            player = parent.getPlayer(),
            contentBox = this.get('contentBox'),
            loadedBar = contentBox.one('.yui3-video-controls-loaded'),
            curTimeDisplay = contentBox.one('.yui3-video-controls-current-time'),
            remTimeDisplay = contentBox.one('.yui3-video-controls-remaining-time'),
            prefix = '';
        
        if (player) {
            prefix = player.name + ':';
        }
        
        parent.after(prefix + 'totalTimeChange', Y.bind(function (e) {
            this._totalTime = e.newVal;
        }, this));
        
        parent.after(prefix + 'currentTimeChange', Y.bind(function (e) {
            var remTime = this._totalTime - e.newVal;
            curTimeDisplay.set('innerHTML', Y.VideoControls.secondsToTimestamp(e.newVal));
            remTimeDisplay.set('innerHTML', Y.VideoControls.secondsToTimestamp(remTime));
            
            if (this._seeking === false) {
            	this._progressSlider.set('value', Math.ceil((e.newVal * this._progressSlider.get('max')) / this._totalTime));
            }
        }, this));
        
        parent.after(prefix + 'percentLoadedChange', Y.bind(function (e) {            
            loadedBar.setStyle('width', Math.ceil((e.newVal / 100) * this._progressSlider.get('max')) + 'px');
        }, this));
        
        contentBox.one('.yui3-video-controls-button-play').after('click', function (e) {
            player.set('playing', true);
        });
        
        contentBox.one('.yui3-video-controls-button-pause').after('click', function (e) {
            player.set('playing', false);
        });
        
        contentBox.one('.yui3-video-controls-button-stop').after('click', function (e) {
            player.set('playing', false);
            player.set('currentTime', 0);
        });
        
        contentBox.one('.yui3-video-controls-button-volume').after('click', Y.bind(function (e) {
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
    
    PLAYHEAD_IMG : 'assets/playhead_slider.png',
    
    VOLUME_IMG : 'assets/volume_slider.png',
    
    BUTTON_WIDTH : 32,
    
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