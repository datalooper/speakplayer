SpeakPlayer.module("RouterModule", function(RouterModule, App, Backbone, Marionette, $, _) {

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
});