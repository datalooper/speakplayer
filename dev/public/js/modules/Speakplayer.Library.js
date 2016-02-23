/*
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
});