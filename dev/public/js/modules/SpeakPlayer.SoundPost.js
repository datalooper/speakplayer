/*
 Sample Module definition for Library module
 */
SpeakPlayer.module("SoundPost", function(SoundPost, App, Backbone, Marionette, $, _){

    SoundPost.addInitializer(function(options) {

        SpeakPlayer.channel.on('songListSynced', function(){
            setupPosts();
        });
        $(document).ajaxComplete(function (event) {
            setupPosts();
        });
        function setupPosts(){
            $('.soundPost').each(function(index, value){
                var model = SpeakPlayer.channel.request('songById', $(value).data('soundid'));
                new SoundPostItemView({
                    el : value,
                    model : model
                }).render();
            });
        }
    });

    //*********** Declaring Views ***********//


    var SoundPostItemView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.templates['soundPost.hbs'],
        tagName : 'div',

        initialize : function(){
            this.currentSong = SpeakPlayer.channel.request('currentSong');
            this.listenTo(this.currentSong, "change:isPlaying", this.togglePlayPause);
            this.listenTo(SpeakPlayer.channel, "setSong", this.togglePlayPause);
            this.togglePlayPause();
            this.listenTo(SpeakPlayer.channel,"removeFromPlaylist", this.removeFromPlaylist);
            this.listenTo(SpeakPlayer.channel,"addToPlaylist", this.addToPlaylist);
        },
        ui: {
            removeFromPlaylist : '.controls .removeFromPlaylist',
            play : '.controls .play',
            pause : '.controls .pause',
            nextButton : '.controls .next',
            addToPlaylist : '.controls .addToPlaylist'
        },


        events:{
            'click @ui.play': function(){
                //TODO May be better to trigger this event from Audio Player callback
                if(SpeakPlayer.channel.request('isCurrentSong', this.model)){
                    SpeakPlayer.channel.trigger('resume', this.model);
                } else{
                    SpeakPlayer.channel.trigger('setSong', this.model);
                }

                return false;
            },

            'click @ui.pause' : function(){
                SpeakPlayer.channel.trigger('pause');
                return false;
            },

            'click @ui.removeFromPlaylist' : function(){
                SpeakPlayer.channel.trigger('removeFromPlaylist', this.model);
                return false;
            },
            'click @ui.addToPlaylist' : function(){
              SpeakPlayer.channel.trigger('addToPlaylist', this.model);
                return false;
            },
            'click @ui.likeTrack' : function(){
                SpeakPlayer.channel.trigger('likeTrack', this.model);
            }
        },
        togglePlayPause : function(){
            var playing = false;

            if(this.currentSong.get('song') == this.model && this.currentSong.get('isPlaying') ){
                playing = true;
            } else if(this.currentSong.get('song') == this.model){
                this.toggleAddRemove(true);
            }

            this.$el.toggleClass("playing", playing);

        },
        addToPlaylist : function(song){
            if(this.model === song) {
                this.toggleAddRemove(true);
            }
        },
        removeFromPlaylist : function(song){
            if(this.model === song){
                this.toggleAddRemove(false);
            }
        },
        toggleAddRemove : function(added){
            added ? this.$el.addClass('inPlaylist') : this.$el.removeClass('inPlaylist');
        },
        setCurrent : function(isCurrent){
            this.$el.toggleClass("current", isCurrent);
        }
    });


    //*********** Controller and Logic ***********//

    var Controller = Backbone.Marionette.Controller.extend({
        initialize: function (options) {


            SpeakPlayer.channel.on('addSoundPost', function (id) {
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

