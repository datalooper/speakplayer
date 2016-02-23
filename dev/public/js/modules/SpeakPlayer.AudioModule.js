/*
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

});