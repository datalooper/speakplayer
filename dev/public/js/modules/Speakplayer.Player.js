/*
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

});