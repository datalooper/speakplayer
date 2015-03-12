/**
 * Created by vcimo5 on 1/29/15.
 */

var SpeakPlayer = new Backbone.Marionette.Application();

var channel;
var songList;
function isTouchDevice() {
    return 'ontouchstart' in window // works on most browsers
    || 'onmsgesturechange' in window; // works on ie10
};

function loadEventStrings() {
	return {	
			"songsRetrieved": "songsRetrieved",
			"songLoaded" : "songLoaded",
			"songStarted" : "songStarted",
			"songSelected" : "songStarted",
			"next" : "next",
			"play" : "play",
			"pause" : "pause",
			"stop" : "stop"
		}
};

//Initialization Events
SpeakPlayer.on('initialize:before', function(options) {
	console.log('Initialization starting.');
    channel = Backbone.Wreqr.radio.channel('app');

});

SpeakPlayer.on('initialize:after', function(options) {

});

SpeakPlayer.on('start', function(options) {
  	Backbone.history.start();

});

//Initializers are called when App starts
SpeakPlayer.addInitializer(function(options) {

	//add regions
	SpeakPlayer.addRegions({
		//TODO: Add the rest of the regions.
		libraryRegion: options.libraryContainer,
		playerRegion: options.playerContainer,
		playlistRegion: options.playlistContainer
	});

	SpeakPlayer.isTouchDevice = isTouchDevice();
});




//Start the application. Options should contain 'libraryContainer', 'playerContainer', 'playlistContainer'
var options = {
	//this object will get passed to initialization events
    libraryContainer : "#library",
    playerContainer : "#player",
    playlistContainer : "#playlist"
};

SpeakPlayer.start(options);
