/*
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

