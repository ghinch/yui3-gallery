function VideoControls () {
    VideoControls.superclass.constructor.apply(this, arguments);
}

Y.mix(VideoControls, {
    NAME : 'video-controls',
    
    NS : 'controls'
});

Y.extend(VideoControls, Y.Plugin.Base, {
    initializer : function () {
    
    }
});