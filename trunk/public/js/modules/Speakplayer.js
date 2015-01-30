/**
 * Created by vcimo5 on 1/29/15.
 */

var SpeakPlayer = new Backbone.Marionette.Application();

function is_touch_device() {
    return 'ontouchstart' in window // works on most browsers
    || 'onmsgesturechange' in window; // works on ie10
};

//Initialization Events
SpeakPlayer.on('initialize:before', function(options) {
	console.log('Initialization starting.');
});

SpeakPlayer.on('initialize:after', function(options) {
  console.log('Initialization finished');
});

SpeakPlayer.on('start', function(options) {
  	//Dont know what this does... but it was in some sample code durr
  	Backbone.history.start(); 
});

//Initializers are called when App starts
SpeakPlayer.addInitializer(function(options) {
	//add regions
	SpeakPlayer.addRegions({
		libraryRegion: options.libraryContainer,
		playerRegion: options.playerContainer,
		playlistRegion: options.playlistContainer
	});

	SpeakPlayer.isTouchDevice = is_touch_device();

	//Init Modules
	SpeakPlayer.Library.init();
	SpeakPlayer.Playlist.init();
	SpeakPlayer.Seekbar.init();
	SpeakPlayer.VolumeSlider.init();
	SpeakPlayer.Search.init();
	SpeakPlayer.FeaturedSong.init();
});

//Start the application. Options should contain 'libraryContainer', 'playerContainer', 'playlistContainer'
App.start(options);