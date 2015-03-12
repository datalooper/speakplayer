/*
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
            SpeakPlayer.channel.trigger('clearSong');

            if(this.collection.length > 0) {
                SpeakPlayer.channel.trigger('nextSong');
            }
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

