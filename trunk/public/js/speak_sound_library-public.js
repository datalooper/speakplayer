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
            },

            currentStatus : function(status){
                return _(this.filter(function(data) {
                    return data.get("completed") == status;
                }));
            },
            search : function(letters, key, key2, key3){
                if(letters == "") return this;

                var pattern = new RegExp(letters,"gi");
                return _(this.filter(function(data) {
                    if(!pattern.test(data.get(key)) && !pattern.test(data.get(key2)) && !pattern.test(data.get(key3))){
                        return false;
                    } else{
                        return true;
                    }
                }));
            }
        });
        var CurrentSongItemModel = Backbone.Model.extend({
            defaults : {
                isPlaying : false
            }
        });
        var currentSong = new CurrentSongItemModel();
        var songList;


        songList = new SongItemList();
        songList.on("sync", function(songs){

            SpeakPlayer.channel.trigger("songListSynced");

        });
        SpeakPlayer.channel.on('pause', function(){
           currentSong.set('isPlaying', false);
        });

        SpeakPlayer.channel.on('resume', function(){
            currentSong.set('isPlaying', true);
        });

        SpeakPlayer.channel.on('likeTrack', function(song){
            var winTop = (screen.height / 2) - (520 / 2);
            var winLeft = (screen.width / 2) - (350 / 2);
            var re = new RegExp(/^.*\//), url = re.exec(window.location.href);
            var trackInfo = song.get('trackInfo') == "" ? "Check out this track by " + song.get('artistName') : song.get('trackInfo');
            console.log(trackInfo);
            if(FB) {
                FB.ui(
                    {
                        method: 'feed',
                        name: song.get('songName'),
                        caption: song.get('artistName'),
                        link: url + '#mp:' + song.get('id'),
                        picture: song.get('albumArtLargeUrl'),
                        description: trackInfo,
                        message: ""
                    });

            }
        });

        SpeakPlayer.channel.on('setSong', function(song){
            currentSong.set('isPlaying', false);
            currentSong.set('song', song);
            currentSong.set('isPlaying', true);


            //add play to song metadata
            var data = {
                'action': 'addPlay',
                'postid': song.id
            };
            jQuery.post(ajaxurl, data, function(response) {

            });
        });

        SpeakPlayer.channel.on('removeFromPlaylist', function(song){
          if(song == currentSong.get("song")){
              currentSong.set("isPlaying", false);
              currentSong.set("song", null);
          }
        });


        songList.fetch({data: {action: 'get_songs'}});
        SpeakPlayer.channel.reply('featuredSong', function(){
            var featuredSong;
            songList.each(function(song, i){
                if(song.get("isFeatured")){
                    featuredSong = song;
                }
            });
            return featuredSong;
        });



        SpeakPlayer.channel.on('setSongById', function (id) {
            var songList = SpeakPlayer.channel.request('getSongList'), song = songList.findWhere({id: id});
            SpeakPlayer.channel.trigger('setSong',  song);
        });

        SpeakPlayer.channel.reply('songById', function(id){
            var songList = SpeakPlayer.channel.request('getSongList'), song = songList.findWhere({id: id});
            return song;
        } );

        SpeakPlayer.channel.reply('getSongList', songList);
        SpeakPlayer.channel.reply('currentSong', currentSong);
        SpeakPlayer.channel.reply('isCurrentSong', function(song){
            return song === currentSong.get('song');
        });
    });









});;/*
 Sample Module definition for Library module
 */
SpeakPlayer.module("Loader", function(Loader, App, Backbone, Marionette, $, _){



    Loader.addInitializer(function(options) {
        console.log('Loader initialize');
        var loaderView = new LoaderView();

        SpeakPlayer.loaderRegion.show(loaderView);
        SpeakPlayer.channel.on("songListSynced", function(){
            loaderView.remove();
        });

    });

    var LoaderView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.templates['loader.hbs'],
        id: "ajaxLoader"
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
            audioElement.addEventListener('loadedmetadata', function() {
                console.log("metadata loaded");
                if(currentSong.get('duration') == null) {
                    currentSong.get('song').set('duration', audioElement.duration);
                    SpeakPlayer.channel.trigger('setSongDuration', currentSong.get('song'));
                }
            });
            audioElement.addEventListener("ended", function() {
                SpeakPlayer.channel.trigger('nextSong');
            });

            audioElement.addEventListener("timeupdate", function() {
                SpeakPlayer.channel.trigger('audioTimeUpdate', audioElement.currentTime);
            });

            SpeakPlayer.channel.on('setSong', function (song) {
                audioElement.src = song.get('songUrl');
                audioElement.play();
            });


            SpeakPlayer.channel.on('clearSong', function(){
               audioElement.src = "";
            });
            SpeakPlayer.channel.on('clearPlaylist', function(){
                audioElement.src = "";
            });
            SpeakPlayer.channel.on('seekTo', function(percentage){
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

    var currentSong, featuredTrackView;
    FeaturedSound.addInitializer(function(options) {

        SpeakPlayer.channel.on("songListSynced", function() {
            currentSong = SpeakPlayer.channel.request("featuredSong");
            featuredTrackView = new FeaturedTrackView({model : currentSong});

            SpeakPlayer.featuredRegion.show(featuredTrackView);
        });
    });

    //*********** Declaring Views ***********//

    var FeaturedTrackView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.templates['featuredTrack.hbs'],

    //Define UI Components
        id : "feature",
        ui: {
            play: ".playNow",
            pause : ".pause"
        },
        initialize : function(){
            this.listenTo(SpeakPlayer.channel, "setSong", this.setSong);
            this.listenTo(SpeakPlayer.channel.request("currentSong"), "change:isPlaying", this.togglePlayPause);

        },
        setSong : function(song){
            console.log("setSong", song);
            currentSong = SpeakPlayer.channel.request("currentSong");
            this.togglePlayPause();
            this.model = song;
            this.render();
        },
        events: {
            'click @ui.play': function (e) {
                e.preventDefault();
                currentSong = SpeakPlayer.channel.request("currentSong");
                if(currentSong.get('song') == this.model && !currentSong.get('isPlaying')){
                    SpeakPlayer.channel.trigger('resume');
                }
                else{
                    SpeakPlayer.channel.trigger('setSong', this.model);
                }
                this.togglePlayPause();
            },
            'click @ui.pause': function (e) {
                e.preventDefault();
                if(currentSong.get('song') == this.model && currentSong.get('isPlaying')) {
                    SpeakPlayer.channel.trigger('pause');
                    this.togglePlayPause();
                }

            }
        },
        regions: {
            genresRegion : '.genres'
        },



        togglePlayPause : function(){
            console.log("toggling play pause");

            this.$el.toggleClass("playing", currentSong.get("isPlaying"));
        }
    });


});

;/*
 Sample Module definition for Library module
 */
SpeakPlayer.module("Filter", function(Filter, App, Backbone, Marionette, $, _){

    var filterChannel = Backbone.Radio.channel('filter'),
        genreFilterView,
        libraryFilterView;

    Filter.addInitializer(function(options) {
        console.log('Filter initialize');
        Filter.controller = new Controller();
        libraryFilterView = new LibraryFilterView();
        genreFilterView = new GenreFilterView({
            collection : new Genres()
        });
        SpeakPlayer.channel.on("songListSynced", function() {
            SpeakPlayer.filterRegion.show(libraryFilterView);
            libraryFilterView.genresRegion.show(genreFilterView);
        });
    });

    //*********** Declaring Views ***********//

    var LibraryFilterView = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.templates['filterView.hbs'],
        //Define UI Components
        className : "filter header",
        ui: {
            search: ".search",
            clearFilter : ".clearFilter",
            clearPlaylist : ".clearPlaylist",
            genreButton : ".genreButton"
        },
        regions: {
            genresRegion : '.genres'
        },

        events : {
            'keyup @ui.search' : function(e){
                e.preventDefault();
                var searchVal = this.ui.search.val();
                if(this.ui.clearFilter.hasClass('hide') && searchVal != ''){
                    this.ui.clearFilter.removeClass('hide');
                } else if(searchVal == '' && !this.ui.clearFilter.hasClass('hide')){
                    this.ui.clearFilter.addClass('hide');
                }
                SpeakPlayer.channel.trigger('search', searchVal);
            },
            'click @ui.clearFilter' : function(e){
                e.preventDefault();
                this.ui.search.val('');
                SpeakPlayer.channel.trigger('search', '');
                this.ui.clearFilter.addClass('hide');

            },
            'click @ui.clearPlaylist' : function(e){
                e.preventDefault();
                SpeakPlayer.channel.trigger('clearPlaylist');
            },
            'click @ui.genreButton' : function(e){
                e.preventDefault();
                this.toggleGenreFilter();
            }

        },
        toggleGenreFilter : function(){
            filterChannel.trigger('toggleGenreFilter');
        }
    });
    var GenreView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.templates['genreFilter.hbs'],
        tagName : "li",
        modelEvents : {
            'change:active': function(){
                console.log("model changed");
                this.$el.toggleClass("active", this.model.get('active'));

            }
        },
        events: {
            "click": function () {
                SpeakPlayer.channel.trigger("filterGenre", this.model.get('genre'));
                this.model.set("active", true);

            }
        }
    });
    var GenreFilterView = Backbone.Marionette.CollectionView.extend({
        childView : GenreView,
        tagName : "ul",
        initialize : function(){
            this.$el.addClass('hide');
            this.listenTo(SpeakPlayer.channel,"songListSynced", this.populateGenreList);
            this.listenTo(SpeakPlayer.channel, "filterGenre", this.filterGenre);
        },
        filterGenre: function(){

            this.collection.each(function(model) {
                model.set("active", false);
            });
        },
        populateGenreList : function(){
            var songCollection = SpeakPlayer.channel.request('getSongList');
            var genreArray = _.uniq(songCollection.pluck('genre'));
            var collection = this.collection;
            collection.add({
                genre: 'All'
            }),
            $.each(genreArray, function(i, val){
                if(val != '') {
                    collection.add([
                        {genre: val}

                    ]);
                }
            })

        }
    });

    var Genre = Backbone.Model.extend({});
    var Genres = Backbone.Collection.extend({
        model: Genre
    });
        //*********** Controller and Logic ***********//

    var Controller = Backbone.Marionette.Controller.extend({
        initialize: function (options) {
            filterChannel.on('toggleGenreFilter', function(){
                genreFilterView.$el.toggleClass('hide');
                SpeakPlayer.channel.trigger('resize');
            });


        }
    });

});

;/*
    Sample Module definition for Library module
*/
SpeakPlayer.module("Library", function(Library, App, Backbone, Marionette, $, _){

    var songItemListView;
    var libraryChannel = Backbone.Radio.channel('library');

    Library.addInitializer(function(options) {
        console.log('Library initialize');
    	Library.controller = new Controller();

        SpeakPlayer.channel.on("songListSynced", function(){
            songItemListView = new SongItemListView({collection:SpeakPlayer.channel.request('getSongList')});
            var libraryLayout = new LibraryLayout();
            var exitMusic = new ExitMusic();
            exitMusic.render();
            SpeakPlayer.libraryRegion.show(libraryLayout);
            libraryLayout.controlRegion.show(new LibraryControlsView());
            libraryLayout.songsRegion.show(songItemListView);
            SpeakPlayer.channel.trigger("libraryRendered");
        });
    });

    //*********** Declaring Models and Collections ***********//



    //*********** Declaring Views ***********//
    var ExitMusic = Backbone.Marionette.ItemView.extend({
        template: false,
        el : "#exitMusic",

        events : {
            'click' : function(e){
                $('#libraryContainer').toggleClass('active');
            }
        }
    });

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

    var LibraryControlsView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.templates['libraryControls.hbs'],

        //Define UI Components
        ui: {
            playAll: ".playAll",
            songName: ".songName",
            artistName: ".artistName",
            albumName: '.albumName',
            date: '.date',
            genre: '.genre'
        },
        events : {
            'click @ui.playAll' : function(e){
                libraryChannel.trigger('playAll');
            },
            'click @ui.songName' : function(e){
                e.preventDefault();
                libraryChannel.trigger('sortByName');
                this.toggleSortOrder(this.ui.songName);

            },
            'click @ui.artistName' : function(e){
                e.preventDefault();
                libraryChannel.trigger('sortByArtist');
                this.toggleSortOrder(this.ui.artistName);

            },
            'click @ui.albumName' : function(e){
                e.preventDefault();
                libraryChannel.trigger('sortByAlbum');
                this.toggleSortOrder(this.ui.albumName);

            },
            'click @ui.date' : function(e){
                e.preventDefault();
                libraryChannel.trigger('sortByDate');
                this.toggleSortOrder(this.ui.date);

            },
            'click @ui.genre' : function(e){
                e.preventDefault();
                libraryChannel.trigger('sortByGenre');
                this.toggleSortOrder(this.ui.genre);
            }

        },
        toggleSortOrder : function(el){
            el.parent().find('.desc').removeClass('desc').removeClass('asc');
            if(el.hasClass('desc')){
                el.removeClass('desc');
                el.addClass('asc');
            } else if(el.hasClass('asc')){
                el.removeClass('asc');
                el.addClass('desc');
            } else{
                el.addClass('asc');
            }
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
        initialize: function(){
            this.currentSong = SpeakPlayer.channel.request('currentSong');
            this.listenTo(this.currentSong, "change:isPlaying", this.togglePlayPause);
            this.listenTo(SpeakPlayer.channel,"removeFromPlaylist", this.removeFromPlaylist);
            this.listenTo(SpeakPlayer.channel,"addToPlaylist", this.addToPlaylist);
        },
        //Listens to Song Change events
        modelEvents:{
            "change:isLiked" : function(){
                console.log("Song Liked Set To", this.model.get("isLiked"));
            }
        },
        playNow : function(e){
            e.preventDefault();
            if(SpeakPlayer.channel.request('isCurrentSong', this.model)){
                SpeakPlayer.channel.trigger('resume');
            } else{
                console.log("library setting song");
                this.toggleAddRemove(true);
                SpeakPlayer.channel.trigger('setSong', this.model);
            }
        },
        events: {
            'click' : function(e){
                if($(e.target).is('li') || $(e.target).is('p') || $(e.target).is('div')){
                    this.playNow(e);

                }
            },
            'click @ui.playNow': function(e){
               this.playNow(e);
                return false;
            },

            'click @ui.pause' : function(e){
                e.preventDefault();
                SpeakPlayer.channel.trigger('pause');
            },

            'click @ui.removeFromPlaylist' : function(e){
                console.log("remove from playlist clicked");
                e.preventDefault();
                SpeakPlayer.channel.trigger('removeFromPlaylist', this.model);
            },

            'click @ui.likeTrack' : function(e){
                e.preventDefault();
                SpeakPlayer.channel.trigger('likeTrack', this.model);
            },

            'click @ui.addToPlaylist' : function(e){
                e.preventDefault();
                SpeakPlayer.channel.trigger('addToPlaylist', this.model);

            }
        },
        removeFromPlaylist : function(song){
          if(this.model === song){
              this.toggleAddRemove(false);
          }
        },
        addToPlaylist : function(song){
            if(this.model === song) {
                this.toggleAddRemove(true);
            }
        },
        togglePlayPause : function(currentSong){
           if(currentSong.get('song') === this.model) {
               var playing = currentSong.get("isPlaying");
               this.$el.toggleClass('playing', playing)

               this.ui.playNow.toggle(!playing);
               this.ui.pause.toggle(playing);
           }
        },
        toggleAddRemove : function(added){
            console.log("toggling addremove", added);
            added ? this.$el.addClass('inPlaylist') : this.$el.removeClass('inPlaylist');
        }
    });

    var SongItemListView = Backbone.Marionette.CollectionView.extend({
        childView: SongItemView,
        tagName:'ul',

        initialize: function(){
            this.listenTo(libraryChannel, 'sortByName', this.sortByName);
            this.listenTo(libraryChannel, 'sortByDate', this.sortByDate);
            this.listenTo(libraryChannel, 'sortByGenre', this.sortByGenre);
            this.listenTo(libraryChannel, 'sortByArtist', this.sortByArtist);
            this.listenTo(libraryChannel, 'sortByAlbum', this.sortByAlbum);
            this.listenTo(libraryChannel, 'playAll', this.playAll);
            this.listenTo(SpeakPlayer.channel,"search", this.search);
            this.listenTo(SpeakPlayer.channel,"clearPlaylist", this.clearPlaylist);
            this.listenTo(SpeakPlayer.channel,"filterGenre", this.filterGenre);
            this.listenTo(SpeakPlayer.channel, 'resize', this.onResize);
            //this.listenTo(this.collection, 'reset sort', this.render);
            $(window).bind("resize.app", _.bind(this.onResize, this));
        },

        remove: function() {
            // unbind the namespaced event (to prevent accidentally unbinding some
            // other resize events from other code in your app
            // in jQuery 1.7+ use .off(...)
            $(window).unbind("resize.app");

            // don't forget to call the original remove() function
            Backbone.View.prototype.remove.call(this);
            // could also be written as:
            // this.constructor.__super__.remove.call(this);
        },
        onResize : function(){
            var marginBottom = this.$el.outerHeight(true) - this.$el.height();
            this.$el.outerHeight($(window).height() - this.$el.position().top - marginBottom - $('#player').height() - $('#playlistContainer>ul').height());
        },
        onShow : function(){
            this.onResize();
        },
        ascendingViewComparator: function(a, b) {
            // Assuming that the sort_key values can be compared with '>' and '<',
            // modifying this to account for extra processing on the sort_key model
            // attributes is fairly straight forward.
            a = a.get(this.sort_key);
            b = b.get(this.sort_key);
            return a > b ?  1
                : a < b ? -1
                :          0;
        },
        descendingViewComparator : function(a, b){
            a = a.get(this.sort_key);
            b = b.get(this.sort_key);
            return a > b ?  -1
                : a < b ?  1
                :          0;
        },
        nameAscendingSort : true,
        dateAscendingSort : true,
        genreAscendingSort : true,
        artistAscendingSort : true,
        albumAscendingSort : true,
        sortByName : function(){
            this.viewComparator = this.nameAscendingSort ? this.ascendingViewComparator : this.descendingViewComparator;
            this.nameAscendingSort = !this.nameAscendingSort;

            this.sort_key = 'songName';
            this.reorder();
        },
        sortByDate : function(){
            this.viewComparator = this.dateAscendingSort ? this.ascendingViewComparator : this.descendingViewComparator;
            this.dateAscendingSort = !this.dateAscendingSort;

            this.sort_key = 'nonformattedDate';
            this.reorder();
        },
        sortByGenre : function(){
            this.viewComparator = this.genreAscendingSort ? this.ascendingViewComparator : this.descendingViewComparator;
            this.genreAscendingSort = !this.genreAscendingSort;
            this.sort_key = 'genre';
            this.reorder();
        },
        sortByArtist : function(){
            this.viewComparator = this.artistAscendingSort ? this.ascendingViewComparator : this.descendingViewComparator;
            this.artistAscendingSort = !this.artistAscendingSort;

            this.sort_key = 'artistName';
            this.reorder();
        },
        sortByAlbum : function(){
            this.viewComparator = this.albumAscendingSort ? this.ascendingViewComparator : this.descendingViewComparator;
            this.albumAscendingSort = !this.albumAscendingSort;

            this.sort_key = 'albumName';
            this.reorder();
        },
        playAll : function(){
            this.collection.each(function(model,index){
                SpeakPlayer.channel.trigger('addToPlaylist', model);
            });
        },
        clearPlaylist : function(){
            this.collection.each(function(model,index){
                SpeakPlayer.channel.trigger('removeFromPlaylist', model);
            });
        },
        search : function(letters) {
            this.filterCollection = this.collection.search(letters, "songName", "artistName", "albumName");

            this.filter = this.filterLetters;
            this.render();
        },
        filterLetters : function(child, index, collection) {
            return this.filterCollection.contains(child);
        },
        filterGenre: function(genre){
            if(genre == "All"){
                this.filterCollection = this.collection.search('', "songName");

            } else{
                this.filterCollection = this.collection.search(genre, "genre");

            }
            this.filter = this.filterLetters;
            this.render();
        }





    });



    //*********** Controller and Logic ***********//

    var Controller = Backbone.Marionette.Controller.extend({
        initialize: function (options) {


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
SpeakPlayer.module("Playlist", function(Playlist, App, Backbone, Marionette, $, _){

    var playlistCollection;
    var playlistView;

    Playlist.addInitializer(function(options) {
        console.log('Playlist initialize');
        Playlist.controller = new Controller();
        playlistCollection = new PlaylistCollection();

        playlistView = new PlaylistView({collection:playlistCollection});
        SpeakPlayer.playlistRegion.show(playlistView);
        SpeakPlayer.channel.reply('currentPlaylist', playlistCollection);


    });

    //*********** Declaring Views ***********//

    var PlaylistCollection = Backbone.Collection.extend({});

    var PlaylistItem = Backbone.Marionette.ItemView.extend({
        template: Handlebars.templates['playlistItem.hbs'],
        tagName : 'li',

        ui: {
            removeFromPlaylist : '.controls .remove',
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
                return false;
            },

            'click @ui.pause' : function(){
                SpeakPlayer.channel.trigger('pause');
                return false;
            },

            'click @ui.removeFromPlaylist' : function(){
                SpeakPlayer.channel.trigger('removeFromPlaylist', this.model);
                return false;
            },

            'click @ui.likeTrack' : function(){
                SpeakPlayer.channel.trigger('likeTrack', this.model);
            }
        },
        togglePlayPause : function(playing){
            this.$el.toggleClass("playing", playing);
        },
        setCurrent : function(isCurrent){
            this.$el.toggleClass("current", isCurrent);
        }
    });
    var PlaylistView = Backbone.Marionette.CollectionView.extend({

        initialize : function(){
            this.$el.sortable({
                containment: "parent",
                delay : 100,
                revert: true,
                tolerance: "intersect"
            });
            this.$el.disableSelection();
            this.$el.addClass('hide');
            this.currentSong = SpeakPlayer.channel.request('currentSong');
            this.listenTo(SpeakPlayer.channel, "setSong", this.setSong);

            this.listenTo(this.currentSong, "change:isPlaying", this.onPlayStatusChange);
            this.listenTo(SpeakPlayer.channel, "addToPlaylist", this.addToPlaylist);
            this.listenTo(SpeakPlayer.channel, "removeFromPlaylist", this.removeFromPlaylist);
            this.listenTo(SpeakPlayer.channel, "nextSong", this.nextSong);
            this.listenTo(SpeakPlayer.channel, "previousSong", this.previousSong);
            this.listenTo(SpeakPlayer.channel, "playlistToggle", this.playlistToggle);
            this.listenTo(SpeakPlayer.channel, "clearPlaylist", this.clearPlaylist);
        },
        tagName : 'ul',
        childView: PlaylistItem,

        addToPlaylist : function(song){
            if(this.collection.length == 0){
                SpeakPlayer.channel.trigger("setSong", song);
            }

            this.collection.add(song);
            console.log("added to playlist, current song:",SpeakPlayer.channel.request('isCurrentSong', song));
            if(SpeakPlayer.channel.request('isCurrentSong', song)){
                this.children.findByModel(song).togglePlayPause(true);
            } else{
                this.children.findByModel(song).togglePlayPause(false);

            }

        },
        removeFromPlaylist : function(song){
            this.collection.remove(song);
            if(song.get('isPlaying')) {
                SpeakPlayer.channel.trigger('clearSong');
            }
            if(this.collection.length > 0) {
                //SpeakPlayer.channel.trigger('nextSong');
            } else if(!this.$el.hasClass('hide')){
                this.playlistToggle();
            }
        },
        setSong : function(song){

            var index = this.collection.indexOf(song);
            if(index == -1) {
                this.collection.add(song, {at: 0});

            }

            this.children.each(function(view){
                if(view.model != song) {
                    view.setCurrent(false);
                } else{
                    view.togglePlayPause(true);
                    view.setCurrent(true);
                }
            });

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
            if(song != null) {
                var matchingChildView =  this.children.findByModel(song);
                if(matchingChildView != null) {

                    matchingChildView.togglePlayPause(this.currentSong.get('isPlaying'));
                }
            }
        },
        playlistToggle : function(){
            console.log("toggle playlist");
            this.$el.toggleClass('hide');
            setTimeout(function(){
                SpeakPlayer.channel.trigger('resize');
            }, 1);
        },
        clearPlaylist : function(){
            this.collection.reset();
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
SpeakPlayer.module("Player", function(Player, App, Backbone, Marionette, $, _){


    var currentSong;
    Player.addInitializer(function(options) {
        currentSong = SpeakPlayer.channel.request('currentSong');

        Player.controller = new Controller();
        SpeakPlayer.channel.on("songListSynced", function() {

            var playerView = new PlayerView({model: currentSong });
            SpeakPlayer.playerRegion.show(playerView);
        });
    });

    //*********** Declaring Views ***********//

    var seekBar;
    var volumeSlider;
    var PlayerView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.templates['player.hbs'],
        id: "player",
        NOT_SET : -1,
        prevVolume : -1,
        ui: {
            seekBar : '.seekBar',
            controls : '.controls',
            startTime : '#startTime',
            endTime : '#endTime',
            playlistButton : '.controls .playlist',
            volumeButton : '.controls .volume svg',
            volumeSlider : '#volumeSlider',
            previousButton : '.controls .previous',
            resume : '.controls .resume',
            pause : '.controls .pause',
            nextButton : '.controls .next',
            songName : ".currentlyPlaying .songName",
            artistName : ".currentlyPlaying .artist",
            playlistHelper : '.controls .playlistHelper'
        },

        initialize : function() {
            this.$el.addClass('hide');
            this.listenTo(SpeakPlayer.channel, "setSong", this.setSong);
            this.listenTo(SpeakPlayer.channel, "setSongDuration", this.setSongDuration);
            this.listenTo(SpeakPlayer.channel, "audioTimeUpdate", this.audioTimeUpdate);
            this.listenTo(SpeakPlayer.channel, "addToPlaylist", this.togglePlayerVisibility);
            this.listenTo(SpeakPlayer.channel, "pause", this.togglePlayPause);
            this.listenTo(SpeakPlayer.channel, "resume", this.togglePlayPause);
            this.listenTo(SpeakPlayer.channel, "seekStarted", this.seekStarted);
            this.listenTo(SpeakPlayer.channel, "seekTo", this.seekStopped);
            this.listenTo(SpeakPlayer.channel, "addToPlaylist", this.showPlaylistCounter);
            this.listenTo(SpeakPlayer.channel, "setSong", this.showPlaylistCounter);
            this.listenTo(SpeakPlayer.channel, "removeFromPlaylist", this.showPlaylistCounter);

            this.listenTo(SpeakPlayer.channel, "removeFromPlaylist", this.togglePlayerVisibility);

        },
        modelEvents: {
            'change:isPlaying' : function () {
                this.togglePlayPause();
            }
        },

        sliding : false,
        events: {
            'click @ui.volumeSlider' : function(e){
                e.preventDefault();
            },
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
                SpeakPlayer.channel.trigger('playlistToggle');

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
                if(this.prevVolume == this.NOT_SET){
                    this.prevVolume = this.volumeSlider.slider('value');
                    SpeakPlayer.channel.trigger('setVolume', 0);
                    this.volumeSlider.slider('value', 0)
                } else{
                    SpeakPlayer.channel.trigger('setVolume', this.prevVolume);
                    this.volumeSlider.slider('value', this.prevVolume);
                    this.prevVolume = this.NOT_SET;

                }
            },
            'hover @ui.volumeButton' : function(hoverState){

                if(hoverState.type == 'mouseenter'){
                } else{
                }
            }
        },
        seekStarted : function(){
          this.sliding = true;
        },
        seekStopped : function(){
          this.sliding = false;
        },
        onShow: function(){
            this.seekBar = this.ui.seekBar.slider({
                range: "min",
                value: 0,
                min: 1
            });
            this.volumeSlider = this.ui.volumeSlider.slider({
                orientation: "vertical",
                range: "min",
                min: 0,
                max: 100,
                value: 100
            });

            this.seekBar.on('slidestop', function(event, ui){
                SpeakPlayer.channel.trigger('seekTo', ui.value);
            });

            this.seekBar.on('slidestart', function(event, ui){
                SpeakPlayer.channel.trigger('seekStarted');

            });
            this.volumeSlider.on('slidechange', function(event, ui){
                SpeakPlayer.channel.trigger('setVolume', ui.value);
            });

        },

        togglePlayerVisibility : function(){
            var shouldShow = false;
            if(SpeakPlayer.channel.request('currentPlaylist').length > 0){
                shouldShow = true;
            }
            this.$el.toggleClass('hide', !shouldShow);
            SpeakPlayer.channel.trigger("resize");

        },
        audioTimeUpdate : function(time){
            var prevTime, newTime, currentModel = currentSong.get('song');

            newTime = secondsToTime(time);
            if( newTime != prevTime) {
                $(this.ui.startTime).html(newTime);
                prevTime = newTime;
            }

            if( !this.sliding && currentModel != null) {
                this.seekBar.slider("value", (time / currentModel.get('duration') * 100 ));
            }
        },

        //Called everytime a new song is set. Re-Binds all the things
        setSong : function(song){

            //setting underlying song model for player to use
            this.model.set('song', song);

            this.togglePlayerVisibility();
            this.togglePlayPause();
            $(this.ui.songName).html(song.get("songName"));
            $(this.ui.artistName).html(song.get("artistName"));


        },
        setSongDuration : function(song){
            $(this.ui.endTime).html(secondsToTime(song.get('duration')));

        },
        togglePlayPause : function(){

            var playing = this.model.get('isPlaying');
            $(this.ui.pause).toggleClass("hide", !playing);
            $(this.ui.resume).toggleClass("hide", playing);
        },
        showPlaylistCounter : function(){
            var currentPlaylist = SpeakPlayer.channel.request('currentPlaylist'), helper = this.ui.playlistHelper;

            helper.html(currentPlaylist.length).fadeIn(200);
            setTimeout(function(){
                helper.fadeOut(200);
            }, 2000);
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

});;SpeakPlayer.module("RouterModule", function(RouterModule, App, Backbone, Marionette, $, _) {

    RouterModule.addInitializer(function () {
        console.log("router initialized");

        //this needs to be modularized.....it really only works in this single scenario right now.
        $(document).ready(function(){
            var songName = window.location.hash.replace('#', "").split(':');
            if(songName[0] == "mp"){
                if(songName[1]){
                    songName = songName[1].replace('-',' ');
                    SpeakPlayer.channel.on('songListSynced', function(){
                        var songList = SpeakPlayer.channel.request('getSongList'), songToLoad = songList.findWhere({id : songName});
                        console.log(songToLoad);
                        SpeakPlayer.channel.trigger('setSong', songToLoad);

                    });
                }
            }


        });
    });
});;/*
    Sample Module definition for Library module
*/
SpeakPlayer.module("Search", function(Search, App, Backbone, Marionette, $, _){
    
});;/*
 Sample Module definition for Library module
 */
SpeakPlayer.module("SoundPost", function(SoundPost, App, Backbone, Marionette, $, _){

    SoundPost.addInitializer(function(options) {

        SpeakPlayer.channel.on('songListSynced', function(){
            setupPosts();
        });
        $(document).ajaxComplete(function (event) {
            setupPosts();
        });
        function setupPosts(){
            $('.soundPost').each(function(index, value){
                var model = SpeakPlayer.channel.request('songById', $(value).data('soundid'));
                new SoundPostItemView({
                    el : value,
                    model : model
                }).render();
            });
        }
    });

    //*********** Declaring Views ***********//


    var SoundPostItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.templates['soundPost.hbs'],
        tagName : 'div',

        initialize : function(){
            this.currentSong = SpeakPlayer.channel.request('currentSong');
            this.listenTo(this.currentSong, "change:isPlaying", this.togglePlayPause);
            this.listenTo(SpeakPlayer.channel, "setSong", this.togglePlayPause);
            this.togglePlayPause();
            this.listenTo(SpeakPlayer.channel,"removeFromPlaylist", this.removeFromPlaylist);
            this.listenTo(SpeakPlayer.channel,"addToPlaylist", this.addToPlaylist);
        },
        ui: {
            removeFromPlaylist : '.controls .removeFromPlaylist',
            play : '.controls .play',
            pause : '.controls .pause',
            nextButton : '.controls .next',
            addToPlaylist : '.controls .addToPlaylist'
        },


        events:{
            'click @ui.play': function(){
                //TODO May be better to trigger this event from Audio Player callback
                if(SpeakPlayer.channel.request('isCurrentSong', this.model)){
                    SpeakPlayer.channel.trigger('resume', this.model);
                } else{
                    SpeakPlayer.channel.trigger('setSong', this.model);
                }

                return false;
            },

            'click @ui.pause' : function(){
                SpeakPlayer.channel.trigger('pause');
                return false;
            },

            'click @ui.removeFromPlaylist' : function(){
                SpeakPlayer.channel.trigger('removeFromPlaylist', this.model);
                return false;
            },
            'click @ui.addToPlaylist' : function(){
              SpeakPlayer.channel.trigger('addToPlaylist', this.model);
                return false;
            },
            'click @ui.likeTrack' : function(){
                SpeakPlayer.channel.trigger('likeTrack', this.model);
            }
        },
        togglePlayPause : function(){
            var playing = false;

            if(this.currentSong.get('song') == this.model && this.currentSong.get('isPlaying') ){
                playing = true;
            } else if(this.currentSong.get('song') == this.model){
                this.toggleAddRemove(true);
            }

            this.$el.toggleClass("playing", playing);

        },
        addToPlaylist : function(song){
            if(this.model === song) {
                this.toggleAddRemove(true);
            }
        },
        removeFromPlaylist : function(song){
            if(this.model === song){
                this.toggleAddRemove(false);
            }
        },
        toggleAddRemove : function(added){
            added ? this.$el.addClass('inPlaylist') : this.$el.removeClass('inPlaylist');
        },
        setCurrent : function(isCurrent){
            this.$el.toggleClass("current", isCurrent);
        }
    });


    //*********** Controller and Logic ***********//

    var Controller = Backbone.Marionette.Controller.extend({
        initialize: function (options) {


            SpeakPlayer.channel.on('addSoundPost', function (id) {
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

