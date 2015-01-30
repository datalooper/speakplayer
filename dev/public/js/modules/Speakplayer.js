var SpeakPlayer = new Backbone.Marionette.Application();

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
	SpeakPlayer.events = loadEventStrings();
});

SpeakPlayer.on('initialize:after', function(options) {
  console.log('Initialization finished');

});

SpeakPlayer.on('start', function(options) {
  	//Dont know what this does... but it was in some sample code durr
    console.log("backbone started")
  	Backbone.history.start(); 
});

//Initializers are called when App starts
SpeakPlayer.addInitializer(function(options) {
	//add regions
	SpeakPlayer.addRegions({
		//TODO: Add the rest of the regions.
		libraryRegion: jQuery('#libraryContainer'),
		playerRegion: jQuery('#playerContainer'),
		playlistRegion: jQuery('#playlistContainer')
	});

	SpeakPlayer.isTouchDevice = isTouchDevice();

});

//Start the application. Options should contain 'libraryContainer', 'playerContainer', 'playlistContainer'
//SpeakPlayer.start();

