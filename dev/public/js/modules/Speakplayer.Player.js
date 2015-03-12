/*
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

});