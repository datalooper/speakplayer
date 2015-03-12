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
;/*
    Sample Module definition for Library module
*/
SpeakPlayer.module("Entities", function(Entities, App, Backbone, Marionette, $, _){


    Entities.addInitializer(function(options) {
        var SongItemModel = Backbone.Model.extend({});
        var SongItemList = Backbone.Collection.extend({
            url: ajaxurl,
            model: SongItemModel,
            parse: function (resp) {
                return resp;
            }
        });
        var CurrentSongItemModel = Backbone.Model.extend({
            defaults : {
                isPlaying : false
            }
        });
        var currentSong = new CurrentSongItemModel();
        var songList;

        SpeakPlayer.channel.on('pause', function(){
           currentSong.set('isPlaying', false);
        });

        SpeakPlayer.channel.on('resume', function(){
            currentSong.set('isPlaying', true);
        });

        SpeakPlayer.channel.on('setSong', function(song){

            currentSong.set('isPlaying', false);
            currentSong.set('song', song);

        });

        SpeakPlayer.channel.on('removeFromPlaylist', function(song){
          if(song == currentSong.get("song")){
              currentSong.set("isPlaying", false);
              currentSong.set("song", null);
          }
        });


        songList = new SongItemList();
        songList.fetch({data: {action: 'get_songs'}});
        SpeakPlayer.channel.reply('getSongList', songList);
        SpeakPlayer.channel.reply('currentSong', currentSong);
        SpeakPlayer.channel.reply('isCurrentSong', function(song){
            return song === currentSong.get('song');
        });
    });









});;/*
 Sample Module definition for Library module
 */
SpeakPlayer.module("AudioModule", function(AudioModule, App, Backbone, Marionette, $, _){

    AudioModule.addInitializer(function() {
        console.log('Audio Module initialize');
        AudioModule.controller = new Controller();

    });

    //*********** Declaring Models and Collections ***********//

    var audioElement = new Audio();



    //*********** Controller and Logic ***********//

    var Controller = Backbone.Marionette.Controller.extend({

        initialize: function (options) {
            var currentSong = SpeakPlayer.channel.request('currentSong');
            var NOT_SET = -1;
            var prevVolume = -1;
            var togglePlayPause = function(song){
                console.log("isplaying changed");
                song.get("isPlaying") ? audioElement.play() : audioElement.pause();
            };
            currentSong.on('change:isPlaying', togglePlayPause);

            audioElement.addEventListener("playing", function() {
                currentSong.set('isPlaying', true);

            });

            audioElement.addEventListener("ended", function() {
                SpeakPlayer.channel.trigger('songEnded');
            });

            audioElement.addEventListener("timeupdate", function() {
                SpeakPlayer.channel.trigger('audioTimeUpdate', audioElement.currentTime);
            });

            SpeakPlayer.channel.on('setSong', function (song) {
                audioElement.src = song.get('songUrl');
                audioElement.volume = .03;
                audioElement.play();
            });

            SpeakPlayer.channel.on('seekTo', function(percentage){
                console.log(currentSong);
                audioElement.currentTime = currentSong.get('song').get('duration')*(percentage / 100);
            });

            SpeakPlayer.channel.on('setVolume', function(percentage){
                audioElement.volume = percentage / 100;
            });

            SpeakPlayer.channel.on('volumeClick', function(){
                if(prevVolume == NOT_SET){
                    prevVolume = audioElement.volume;
                    audioElement.volume = 0;
                } else{
                    audioElement.volume = prevVolume;
                    prevVolume = NOT_SET;
                }
            });

        }
    });

});;/*
    Sample Module definition for Library module
*/
SpeakPlayer.module("FeaturedSound", function(FeaturedSound, App, Backbone, Marionette, $, _){
    
});;/*
    Sample Module definition for Library module
*/
SpeakPlayer.module("Library", function(Library, App, Backbone, Marionette, $, _){

    Library.addInitializer(function(options) {
        console.log('Library initialize');
    	Library.controller = new Controller();


        var songItemListView = new SongItemListView({collection:SpeakPlayer.channel.request('getSongList')});
        var libraryLayout = new LibraryLayout();

        SpeakPlayer.libraryRegion.show(libraryLayout);
        libraryLayout.songsRegion.show(songItemListView);
    });

    //*********** Declaring Models and Collections ***********//



    //*********** Declaring Views ***********//

    var LibraryLayout = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.templates['libraryLayout.hbs'],
        regions: {
            controlRegion : '#controlRegion',
            songsRegion : '#songRegion'
        },
        events:{
            'click .playAll' : 'playAll'
        },
        playAll : function(){
            SpeakPlayer.channel.trigger('playAll', this.model);
        }

    });


    var SongItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.templates['songItemView.hbs'],
        tagName: 'li',

        //Define UI Components
        ui: {
            playNow : ".playNow",
            pause : ".pause",
            removeFromPlaylist : ".removeFromPlaylist",
            likeTrack : '.likeTrack',
            addToPlaylist : '.addToPlaylist'
        },
        onShow : function(){

            //TODO maybe make this an addClass('hide')
            this.ui.pause.hide();
            this.ui.removeFromPlaylist.hide();
        },
        initialize: function(){
            this.currentSong = SpeakPlayer.channel.request('currentSong');
            this.listenTo(this.currentSong, "change:isPlaying", this.togglePlayPause);
            this.listenTo(SpeakPlayer.channel,"removeFromPlaylist", this.removeFromPlaylist);
        },
        //Listens to Song Change events
        modelEvents:{
            "change:isLiked" : function(){
                console.log("Song Liked Set To", this.model.get("isLiked"));
            }
        },
        events: {
            'click @ui.playNow': function(e){
                e.preventDefault();
                if(SpeakPlayer.channel.request('isCurrentSong', this.model)){
                    SpeakPlayer.channel.trigger('resume');
                } else{
                    console.log("library setting song");
                    SpeakPlayer.channel.trigger('setSong', this.model);
                    this.toggleAddRemove(true);
                }
            },

            'click @ui.pause' : function(e){
                e.preventDefault();
                SpeakPlayer.channel.trigger('pause');
            },

            'click @ui.removeFromPlaylist' : function(e){
                e.preventDefault();
                SpeakPlayer.channel.trigger('removeFromPlaylist', this.model);
                this.toggleAddRemove(false);
            },

            'click @ui.likeTrack' : function(e){
                e.preventDefault();
                SpeakPlayer.channel.trigger('likeTrack', this.model);
            },

            'click @ui.addToPlaylist' : function(e){
                e.preventDefault();
                SpeakPlayer.channel.trigger('addToPlaylist', this.model);
                this.toggleAddRemove(true);

            }
        },
        removeFromPlaylist : function(song){
          if(this.model === song){
              this.toggleAddRemove(false);
          }
        },
        togglePlayPause : function(currentSong){
           if(currentSong.get('song') === this.model) {
               var playing = currentSong.get("isPlaying");
               this.ui.playNow.toggle(!playing);
               this.ui.pause.toggle(playing);
           }
        },
        toggleAddRemove : function(added){
            this.ui.addToPlaylist.toggle(!added);
            this.ui.removeFromPlaylist.toggle(added);
        }
    });

    var SongItemListView = Backbone.Marionette.CollectionView.extend({
        childView: SongItemView,
        tagName:'ul'
    });



    //*********** Controller and Logic ***********//

    var Controller = Backbone.Marionette.Controller.extend({
        initialize: function (options) {

            ///* Song Item View Events */
            //
            //SpeakPlayer.channel.on('playSong', function (song) {
            //    console.log('SpeakPlayer.Library caught event: ' + 'playSong');
            //});
            //
            //SpeakPlayer.channel.on('pauseSong', function (song) {
            //
            //    console.log('SpeakPlayer.Library caught event: ' + 'pauseSong');
            //});
            //
            //SpeakPlayer.channel.on('addToPlaylist', function (song) {
            //    console.log('SpeakPlayer.Library caught event: ' + 'addToPlaylist');
            //});
            //
            //SpeakPlayer.channel.on('removeFromPlaylist', function (song) {
            //    console.log('SpeakPlayer.Library caught event: ' + 'removeFromPlaylist');
            //});
            //
            //SpeakPlayer.channel.on('likeTrack', function (song) {
            //    console.log('SpeakPlayer.Library caught event: ' + 'likeTrack');
            //});


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
SpeakPlayer.module("Player", function(Player, App, Backbone, Marionette, $, _){

    var seekBar;
    var volumeSlider;

    Player.addInitializer(function(options) {
        Player.controller = new Controller();
        var playerView = new PlayerView({model:SpeakPlayer.channel.request('currentSong')});
        SpeakPlayer.playerRegion.show(playerView);
    });

    //*********** Declaring Views ***********//


    var PlayerView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.templates['player.hbs'],

        ui: {
            seekBar : '.seekBar',
            controls : '.controls',
            startTime : '#startTime',
            endTime : '#endTime',
            playlistButton : '.controls .playlist',
            volumeButton : '.controls .volume',
            volumeSlider : '#volumeSlider',
            previousButton : '.controls .previous',
            resume : '.controls .resume',
            pause : '.controls .pause',
            nextButton : '.controls .next'
        },

        initialize : function(){
            this.listenTo(SpeakPlayer.channel, "setSong", this.setSong);
            this.listenTo(SpeakPlayer.channel, "audioTimeUpdate", this.audioTimeUpdate);
        },

        modelEvents: {
            'change:song' : "render"
        },

        events: {
            'click @ui.resume': function(e){
                e.preventDefault();
                this.model.set("isPlaying", true);
            },
            'click @ui.pause' : function(e){
                e.preventDefault();

                this.model.set("isPlaying", false);
            },
            'click @ui.playlistButton' : function(e){
                e.preventDefault();

                console.log("playlist clicked");
            },
            'click @ui.nextButton' : function(e){
                e.preventDefault();

                SpeakPlayer.channel.trigger('nextSong');
            },
            'click @ui.previousButton' : function(e){
                e.preventDefault();

                SpeakPlayer.channel.trigger('previousSong');
            },
            'click @ui.volumeButton' : function(e){
                e.preventDefault();
                SpeakPlayer.channel.trigger('volumeClick');

                console.log("volume clicked");
            },
            'hover @ui.volumeButton' : function(hoverState){

                if(hoverState.type == 'mouseenter'){
                    console.log("hovering over volume button");
                } else{
                    console.log("hovering off volume button");
                }
            }
        },
        render: function(){
            if(this.$el.html() == "") {
                this.$el.html(this.template(options));
            }
            return this;
        },
        onAttach: function(){
            $(this.ui.seekBar).slider({
                range: "min",
                value: 0,
                min: 1
            });

            $(this.ui.volumeSlider).slider({
                orientation: "vertical",
                range: "min",
                min: 0,
                max: 100,
                value: 60
            });
            $(this.ui.volumeSlider).on( "slidechange", function( event, ui ) {
                SpeakPlayer.channel.trigger('setVolume', ui.value);
            } );
            $(this.ui.seekBar).on( "slidechange", function( event, ui ) {
                SpeakPlayer.channel.trigger('seekTo', ui.value);
            } );
        },


        audioTimeUpdate : function(time){
            var prevTime, newTime;
            newTime = secondsToTime(time);
            if( newTime != prevTime) {
                $(this.ui.startTime).html(newTime);
                prevTime = newTime;
            }
        },

        //Called everytime a new song is set. Re-Binds all the things
        setSong : function(song){
            //setting underlying song model for player to use
            this.model.set('song', song);
            $(this.ui.endTime).html(secondsToTime(song.get('duration')));

        },
        togglePlayPause : function(){

            var playing = this.model.get('isPlaying');
            $(this.ui.pause).toggle(playing);
            $(this.ui.resume).toggle(!playing);
        }


    });


    //*********** Controller and Logic ***********//


    var Controller = Backbone.Marionette.Controller.extend({
        initialize: function (options) {


        }
    });


    function secondsToTime(raw) {
        var time = parseInt(raw, 10);
        time = time < 0 ? 0 : time;

        var minutes = Math.floor(time / 60);
        var seconds = time % 60;

        seconds = seconds < 10 ? "0" + seconds : seconds;
        return minutes + ":" + seconds;
    }

});;/*
    Sample Module definition for Library module
*/
SpeakPlayer.module("Playlist", function(Playlist, App, Backbone, Marionette, $, _){

    var playlistCollection;
    var playlistView;

    Playlist.addInitializer(function(options) {
        console.log('Playlist initialize');
        Playlist.controller = new Controller();
        playlistCollection = new PlaylistCollection();

        playlistView = new PlaylistView({collection:playlistCollection});
        SpeakPlayer.playlistRegion.show(playlistView);

    });

    //*********** Declaring Views ***********//

    var PlaylistCollection = Backbone.Collection.extend({});

    var PlaylistItem = Backbone.Marionette.ItemView.extend({
        template: Handlebars.templates['playlistItem.hbs'],
        tagName : 'li',
        ui: {
            removeFromPlaylist : '.controls .removeFromPlaylist',
            play : '.controls .play',
            pause : '.controls .pause',
            nextButton : '.controls .next'
        },

        modelEvents:{

            "change:isLiked" : function(){
                console.log("Song Liked Set To", this.model.get("isLiked"));
            }
        },
        events:{
            'click @ui.play': function(){
                //TODO May be better to trigger this event from Audio Player callback
                if(SpeakPlayer.channel.request('isCurrentSong', this.model)){
                    SpeakPlayer.channel.trigger('resume', this.model);
                } else{
                    console.log("playlist setting song");
                    SpeakPlayer.channel.trigger('setSong', this.model);
                }
            },

            'click @ui.pause' : function(){
                SpeakPlayer.channel.trigger('pause');
            },

            'click @ui.removeFromPlaylist' : function(){
                SpeakPlayer.channel.trigger('removeFromPlaylist', this.model);
            },

            'click @ui.likeTrack' : function(){
                SpeakPlayer.channel.trigger('likeTrack', this.model);
            }
        },
        togglePlayPause : function(playing){
            //TODO change to css classes
            this.ui.play.toggle(!playing);
            this.ui.pause.toggle(playing);
        }
    });
    var PlaylistView = Backbone.Marionette.CollectionView.extend({
        initialize : function(){
            this.currentSong = SpeakPlayer.channel.request('currentSong');
            this.listenTo(this.currentSong, "change:isPlaying", this.onPlayStatusChange);
            this.listenTo(SpeakPlayer.channel, "addToPlaylist", this.addToPlaylist);
            this.listenTo(SpeakPlayer.channel, "removeFromPlaylist", this.removeFromPlaylist);
            this.listenTo(SpeakPlayer.channel, "setSong", this.setSong);
            this.listenTo(SpeakPlayer.channel, "nextSong", this.nextSong);
            this.listenTo(SpeakPlayer.channel, "previousSong", this.previousSong);

        },
        tagName : 'ul',
        childView: PlaylistItem,

        addToPlaylist : function(song){
            if(this.collection.length == 0){
                SpeakPlayer.channel.trigger("setSong", song);
            }
            this.collection.add(song);
            if(SpeakPlayer.channel.request('isCurrentSong', song)){
                this.children.findByModel(song).togglePlayPause(this.currentSong.get('isPlaying'));
            } else{
                this.children.findByModel(song).togglePlayPause(false);

            }

        },
        removeFromPlaylist : function(song){
            this.collection.remove(song);

        },
        setSong : function(song){
            var index = this.collection.indexOf(song);
            if(index == -1) {
                this.collection.add(song, {at: 0});
                index = 0;
            }
        },
        nextSong : function(){

            //find current song in collection
            var nextSongIndex = this.collection.indexOf(this.currentSong.get('song')) + 1;
            if(this.collection.length > nextSongIndex){
                var newSong = this.collection.at(nextSongIndex);
                SpeakPlayer.channel.trigger("setSong", newSong);
            }
        },
        previousSong : function(song){
            var prevSongIndex = this.collection.indexOf(this.currentSong.get('song')) - 1;

            if(prevSongIndex >= 0){
                var newSong = this.collection.at(prevSongIndex);
                SpeakPlayer.channel.trigger("setSong", newSong);
                newSong.set("isPlaying", true);

            }
        },
        onPlayStatusChange : function(){
            var song = this.currentSong.get('song');
            this.children.findByModel(song).togglePlayPause(this.currentSong.get('isPlaying'));
        }


    });

    //*********** Controller and Logic ***********//

    var Controller = Backbone.Marionette.Controller.extend({
        initialize: function (options) {


            SpeakPlayer.channel.on('playSong', function (song) {

            });

            SpeakPlayer.channel.on('pauseSong', function (song) {

            });

            SpeakPlayer.channel.on('removeFromPlaylist', function(song){

            });

            SpeakPlayer.channel.on('addToPlaylist', function(song){

            });
        }
    });

});

;/*
    Sample Module definition for Library module
*/
SpeakPlayer.module("Search", function(Search, App, Backbone, Marionette, $, _){
    
});