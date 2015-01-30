/**
 * Created by vcimo5 on 1/29/15.
 */
(function( $ ) {
    'use strict';

      $(function() {
          console.log("operating");
      });


})( jQuery );
;var SpeakPlayer = new Backbone.Marionette.Application();

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

;/*
    Sample Module definition for Library module
*/
SpeakPlayer.module("FeaturedSound", function(Library, App, Backbone, Marionette, $, _){
    
});;/*
    Sample Module definition for Library module
*/
SpeakPlayer.module("Library", function(Library, App, Backbone, Marionette, $, _){
    var featuredSong;
    var songs; 

    Library.addInitializer(function(options) {
    	Library.controller = new Controller({
    		//set any controller fields passed in from options
    	});

        //TODO: Update this to have 'featured' by the song object.
        this.featuredSong = libraryContainer.find('#featured');
        this.preparePlayerData();
    });

    //Declare Song model and Song Collection
    var SongItemModel = Backbone.Model.extend({});
    var SongItemList = Backbone.Collection.extend({});

    var SongItemView = Backbone.Marionette.ItemView.extend({
    	model: SongItemModel,
    	template: '',
        events: {'click': function() {
            console.log('SpeakPlayer.events.songSelected' + this.model.get('name'));
            // Viewer.vent.trigger(this.model.get('eventToRaise'), this);
        }}

    });

    var SongListView = Backbone.Marionette.CollectionView.extend({
    	ItemView: SongItemView,
    	tagName: ''
    });

    var Controller = Backbone.Marionette.Controller.extend({
        initialize: function (options) {
            //_.bindAll(this);
            //this.region = options.region;
            ////convert tools array to a collection
            //this.collection = new ToolItemCollection(options.toolItems);
            ////create the list view and pass in the collection
            //this.view = new ToolListView({ collection: this.collection });
            ////render it all once, now. Since the items don't change
            ////while the app is running, we never need to re-render
            //this.region.show(this.view);

            /*hook into App events*/
            SpeakPlayer.vent.on(SpeakPlayer.events.songsRetrieved, function (data) {
                console.log('SpeakPlayer.Library caught event: ' + SpeakPlayer.events.songsRetrieved);

            });     

            SpeakPlayer.vent.on(SpeakPlayer.events.songSelected, function (song) {
                console.log('SpeakPlayer.Library caught event: ' + SpeakPlayer.events.songSelected);
            });     
        },

	    preparePlayerData: function () {
	        var data = {
	            action: 'get_songs'
	        };

	        // since 2.8 ajaxurl is always defined in the admin header and points to admin-ajax.php
	        $.post(ajaxurl, data, function (response) {
	            var jsonResponse = $.parseJSON(response);
	            Library.trigger(SpeakPlayer.events.songsRetrieved, jsonResponse);
	        });
	    }
    });



 //    sizeLibraryContainer: function () {
 //        console.log("sizing container");
 //        var playlistHeight = SpeakPlayer.Playlist.playlistContainer.hasClass('active') ? SpeakPlayer.Playlist.playlistContainer.outerHeight() : 0,
 //            playerHeight = SpeakPlayer.Player.playerContainer.is(':visible') ? SpeakPlayer.Player.playerContainer.outerHeight() : 0,
 //            headerOffset = SpeakPlayer.Library.libraryContainer.find('#songContainer').offset().top ,
 //            headerHeight = SpeakPlayer.Library.libraryContainer.find('#songContainer .header').is(':visible') ? SpeakPlayer.Library.libraryContainer.find('#songContainer .header').outerHeight() : 0,
 //            bottomMargin = parseInt(SpeakPlayer.Library.libraryContainer.find("#library").css('margin-bottom')),
 //            libHeight = $(window).height()-headerOffset-headerHeight-bottomMargin-playlistHeight-playerHeight;
 //            SpeakPlayer.Library.libraryContainer.find("#library").height(libHeight);
 //    },
    
 //    renderHeaderFilter: function () {
 //        var htmlHeader = Handlebars.templates['headerFilter.hbs'];
 //        this.libraryContainer.append(htmlHeader);
 //    },
    
 //    populatePlayer: function (obj) {
 //        var songFeature;
 //        $.each(obj, function (key, song) {
 //            var songObj = new SpeakPlayer.Song(song);

 //            if(songObj.isFeatured && songFeature == null){
 //                songFeature = songObj;
 //            } else if(window.location.hash.substring(1) == songObj.id){
 //                songFeature = songObj;
 //            }


 //            if($.inArray(songObj.genre, SpeakPlayer.Player.genres) == -1){
 //                SpeakPlayer.Player.genres.push(songObj.genre);
 //            }

 //            SpeakPlayer.Player.songs.push(songObj);

 //        });

 //        this.renderFeature(songFeature);
 //        this.renderHeaderFilter();
 //        this.renderGenreList();
 //        this.renderSongs();
 //        this.sizeLibraryContainer();
 //    },

 //    renderFeature : function(song){
 //        this.featuredSong = this.libraryContainer.find('#featured');
 //        var htmlFeature = Handlebars.templates['featuredTrack.hbs'](song);

 //        if(this.featuredSong.length > 0){
 //            this.featuredSong.html(htmlFeature);
 //        } else{
 //            SpeakPlayer.Library.libraryContainer.prepend(htmlFeature);

 //        }

 //    },

 //    renderGenreList : function(){
 //        var html = "<div class='genres'><a href='#'>All</a>";
 //        $.each(SpeakPlayer.Player.genres, function(index, element){
 //            html += '<a href="#">'+element+'</a>';
 //        });
 //        html += "</div>";
 //        SpeakPlayer.Library.libraryContainer.append(html);

 //    },

 //    renderSongs : function(){

 //        var htmlSongs = Handlebars.templates['viewBySong.hbs'](SpeakPlayer.Player.songs);
 //        SpeakPlayer.Library.libraryContainer.append(htmlSongs);
 //        var options = {
 //            valueNames: [ 'songName','artistName', 'albumName','date','genre' ]
 //        };
 //        this.list = new List('libraryContainer', options);
	// }
});;/*
    Sample Module definition for Library module
*/
SpeakPlayer.module("Player", function(Library, App, Backbone, Marionette, $, _){
    
});;/*
    Sample Module definition for Library module
*/
SpeakPlayer.module("Playlist", function(Library, App, Backbone, Marionette, $, _){
    
});;/*
    Sample Module definition for Library module
*/
SpeakPlayer.module("Search", function(Library, App, Backbone, Marionette, $, _){
    
});;/*
    Sample Module definition for Library module
*/
SpeakPlayer.module("Seekbar", function(Library, App, Backbone, Marionette, $, _){
    
});;/*
    Sample Module definition for Library module
*/
SpeakPlayer.module("VolumeSlider", function(Library, App, Backbone, Marionette, $, _){
    
});