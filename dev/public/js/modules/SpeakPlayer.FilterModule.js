/*
 Sample Module definition for Library module
 */
SpeakPlayer.module("Filter", function(Filter, App, Backbone, Marionette, $, _){

    var filterChannel = Backbone.Radio.channel('filter'),
        genreFilterView,
        libraryFilterView;

    Filter.addInitializer(function(options) {
        console.log('Filter initialize');
        Filter.controller = new Controller();
        libraryFilterView = new LibraryFilterView();
        genreFilterView = new GenreFilterView({
            collection : new Genres()
        });
        SpeakPlayer.channel.on("songListSynced", function() {
            SpeakPlayer.filterRegion.show(libraryFilterView);
            libraryFilterView.genresRegion.show(genreFilterView);
        });
    });

    //*********** Declaring Views ***********//

    var LibraryFilterView = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.templates['filterView.hbs'],
        //Define UI Components
        className : "filter header",
        ui: {
            search: ".search",
            clearFilter : ".clearFilter",
            clearPlaylist : ".clearPlaylist",
            genreButton : ".genreButton"
        },
        regions: {
            genresRegion : '.genres'
        },

        events : {
            'keyup @ui.search' : function(e){
                e.preventDefault();
                var searchVal = this.ui.search.val();
                if(this.ui.clearFilter.hasClass('hide') && searchVal != ''){
                    this.ui.clearFilter.removeClass('hide');
                } else if(searchVal == '' && !this.ui.clearFilter.hasClass('hide')){
                    this.ui.clearFilter.addClass('hide');
                }
                SpeakPlayer.channel.trigger('search', searchVal);
            },
            'click @ui.clearFilter' : function(e){
                e.preventDefault();
                this.ui.search.val('');
                SpeakPlayer.channel.trigger('search', '');
                this.ui.clearFilter.addClass('hide');

            },
            'click @ui.clearPlaylist' : function(e){
                e.preventDefault();
                SpeakPlayer.channel.trigger('clearPlaylist');
            },
            'click @ui.genreButton' : function(e){
                e.preventDefault();
                this.toggleGenreFilter();
            }

        },
        toggleGenreFilter : function(){
            filterChannel.trigger('toggleGenreFilter');
        }
    });
    var GenreView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.templates['genreFilter.hbs'],
        tagName : "li",
        modelEvents : {
            'change:active': function(){
                console.log("model changed");
                this.$el.toggleClass("active", this.model.get('active'));

            }
        },
        events: {
            "click": function () {
                SpeakPlayer.channel.trigger("filterGenre", this.model.get('genre'));
                this.model.set("active", true);

            }
        }
    });
    var GenreFilterView = Backbone.Marionette.CollectionView.extend({
        childView : GenreView,
        tagName : "ul",
        initialize : function(){
            this.$el.addClass('hide');
            this.listenTo(SpeakPlayer.channel,"songListSynced", this.populateGenreList);
            this.listenTo(SpeakPlayer.channel, "filterGenre", this.filterGenre);
        },
        filterGenre: function(){

            this.collection.each(function(model) {
                model.set("active", false);
            });
        },
        populateGenreList : function(){
            var songCollection = SpeakPlayer.channel.request('getSongList');
            var genreArray = _.uniq(songCollection.pluck('genre'));
            var collection = this.collection;
            collection.add({
                genre: 'All'
            }),
            $.each(genreArray, function(i, val){
                if(val != '') {
                    collection.add([
                        {genre: val}

                    ]);
                }
            })

        }
    });

    var Genre = Backbone.Model.extend({});
    var Genres = Backbone.Collection.extend({
        model: Genre
    });
        //*********** Controller and Logic ***********//

    var Controller = Backbone.Marionette.Controller.extend({
        initialize: function (options) {
            filterChannel.on('toggleGenreFilter', function(){
                genreFilterView.$el.toggleClass('hide');
                SpeakPlayer.channel.trigger('resize');
            });


        }
    });

});

