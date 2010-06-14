package 
{ 
	import flash.display.Sprite;
    import flash.display.StageAlign;
    import flash.display.StageScaleMode;
	import flash.external.ExternalInterface;
	import flash.events.Event;

	import org.osmf.media.MediaPlayer;
	import org.osmf.media.URLResource;
	import org.osmf.containers.MediaContainer;
	import org.osmf.elements.VideoElement;
	import org.osmf.layout.LayoutMetadata;
	
	//import mx.logging.targets.*;
	//import mx.logging.*;
	
	public class GalleryVideoPlayer extends Sprite 
	{ 
		private var videoElement:VideoElement; 
		private var mediaPlayer:MediaPlayer;
		private var mediaContainer:MediaContainer;

		private var flashVars:Object;
	
		//private var myLogger:ILogger;

		public function GalleryVideoPlayer()
		{
		    super();
		    
			if (stage) init();
			else addEventListener(Event.ADDED_TO_STAGE, init);
		}
		
		private function init(e:Event = null):void
		{
			removeEventListener(Event.ADDED_TO_STAGE, init);

            stage.scaleMode = StageScaleMode.NO_SCALE;
            stage.align = StageAlign.TOP_LEFT;

			//initLogging();
			
			flashVars = loaderInfo.parameters;

			videoElement = new VideoElement(new URLResource(flashVars.file));
			videoElement.smoothing = true;

			//Create new layoutMetadata and add parameters to it
			var layout:LayoutMetadata = new LayoutMetadata();
			layout.scaleMode = 'none';
		
			//Assign layoutMetadata to currentMediaElement
			videoElement.addMetadata(LayoutMetadata.LAYOUT_NAMESPACE, layout);

			mediaPlayer = new MediaPlayer();
			mediaPlayer.media = videoElement;
			initListeners();

			mediaContainer = new MediaContainer();

			mediaContainer.addMediaElement(videoElement); 

			addChild(mediaContainer);

			initExternalInterface();
		}
		
		public function playMedia():void
		{
			mediaPlayer.play();
		}
		
		public function pauseMedia():void
		{
			mediaPlayer.pause();
		}
		
		public function getTotalTime():Number
		{
			return mediaPlayer.duration;
		}
		
		public function getCurrentTime():Number
		{
			return mediaPlayer.currentTime;
		}
		
		public function setCurrentTime(seconds:Number):void
		{
			mediaPlayer.seek(seconds);
		}
		
		public function setVolume(level:Number):void
		{
			mediaPlayer.volume = level;
		}
		
		public function getCurrentBytes():Number
	    {
	        return mediaPlayer.bytesLoaded;
	    }
	    
	    public function getTotalBytes():Number
	    {
	        return mediaPlayer.bytesTotal;
	    }
		
		private function initExternalInterface():void
		{
			ExternalInterface.addCallback("playMedia", playMedia);
			ExternalInterface.addCallback("pauseMedia", pauseMedia);
			ExternalInterface.addCallback("getTotalTime", getTotalTime);
			ExternalInterface.addCallback("getCurrentTime", getCurrentTime);
			ExternalInterface.addCallback("setCurrentTime", setCurrentTime);
			ExternalInterface.addCallback("getCurrentBytes", getCurrentBytes);
			ExternalInterface.addCallback("getTotalBytes", getTotalBytes);
			ExternalInterface.addCallback("setVolume", setVolume);
		}
		
		private function fireEvent(eventName:String):void {
        	ExternalInterface.call(flashVars.jsCallback, flashVars.playerId, eventName);
		}
		
		private function initListeners():void
		{
			mediaPlayer.addEventListener("currentTimeChange", function ():void {
				fireEvent("currentTimeChange");
			});
						
			mediaPlayer.addEventListener("complete", function ():void {
				fireEvent("complete");
			});
				 	 	
			mediaPlayer.addEventListener("bytesLoadedChange", function ():void {
				fireEvent("bytesLoadedChange");
			});
				 	 	
			mediaPlayer.addEventListener("mediaPlayerStateChange", function (e:Event):void {
				//myLogger.log(LogEventLevel.DEBUG, mediaPlayer.state);
				fireEvent('stateChange');
				
				if (mediaPlayer.state == 'playing') {
					fireEvent('play');
				} else if (mediaPlayer.state == 'paused') {
					fireEvent('pause');
				}
			});
		}

		/*private function initLogging():void {
			// Create a target. 
			var logTarget:TraceTarget = new TraceTarget();

			// Log only messages for the classes in the mx.rpc.* and mx.messaging packages.
			logTarget.filters=["mx.rpc.*","mx.messaging.*"];

			// Log all log levels.
			logTarget.level = LogEventLevel.DEBUG;

			// Add date, time, category, and log level to the output.
			logTarget.includeDate = true;
			logTarget.includeTime = true;
			logTarget.includeCategory = true;
			logTarget.includeLevel = true;

			// Begin logging.
			Log.addTarget(logTarget);
			myLogger = Log.getLogger("mx.messaging.Channel");
		}*/
	}
}