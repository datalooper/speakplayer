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









});