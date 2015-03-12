/*
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
});