/*
 Sample Module definition for Library module
 */
SpeakPlayer.module("Loader", function(Loader, App, Backbone, Marionette, $, _){



    Loader.addInitializer(function(options) {
        console.log('Loader initialize');
        var loaderView = new LoaderView();

        SpeakPlayer.loaderRegion.show(loaderView);
        SpeakPlayer.channel.on("songListSynced", function(){
            loaderView.remove();
        });

    });

    var LoaderView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.templates['loader.hbs'],
        id: "ajaxLoader"
    });

    });