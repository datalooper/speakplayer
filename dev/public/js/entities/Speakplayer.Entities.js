/*
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









});