/**
 * Created by vcimo5 on 1/29/15.
 */

SpeakPlayer = new Backbone.Marionette.Application();

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


SpeakPlayer.on('start', function(options) {
    console.log("start history");

    Backbone.history.start({pushState: true, hashChange: false});

});

//Initializers are called when App starts
SpeakPlayer.addInitializer(function(options) {

	//add regions
	SpeakPlayer.addRegions({
		//TODO: Add the rest of the regions.
		libraryRegion: options.libraryContainer,
        featuredRegion : options.featuredContainer,
        filterRegion : options.filterContainer,
		playerRegion: options.playerContainer,
		playlistRegion: options.playlistContainer,
        loaderRegion : options.loaderContainer
	});

	SpeakPlayer.isTouchDevice = isTouchDevice();

});




