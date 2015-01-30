/*
    Sample Module definition for Library module
*/
SpeakPlayer.module("Library", function(Library, App, Backbone, Marionette, $, _){
    libraryContainer : "",
    feature : "",
    list : '',
    init: function () {
        this.libraryContainer = libraryContainer;
        this.feature = libraryContainer.find('#featured');
        this.preparePlayerData();
    },

    preparePlayerData: function () {
        var data = {
            action: 'get_songs',
            security: MyAjax.security,
            whatever: 1234
        };

        // since 2.8 ajaxurl is always defined in the admin header and points to admin-ajax.php
        $.post(MyAjax.ajaxurl, data, function (response) {
            var obj = jQuery.parseJSON(response);
            SpeakPlayer.Library.populatePlayer(obj);
        });
    },

    sizeLibraryContainer: function () {
        console.log("sizing container");
        var playlistHeight = SpeakPlayer.Playlist.playlistContainer.hasClass('active') ? SpeakPlayer.Playlist.playlistContainer.outerHeight() : 0,
            playerHeight = SpeakPlayer.Player.playerContainer.is(':visible') ? SpeakPlayer.Player.playerContainer.outerHeight() : 0,
            headerOffset = SpeakPlayer.Library.libraryContainer.find('#songContainer').offset().top ,
            headerHeight = SpeakPlayer.Library.libraryContainer.find('#songContainer .header').is(':visible') ? SpeakPlayer.Library.libraryContainer.find('#songContainer .header').outerHeight() : 0,
            bottomMargin = parseInt(SpeakPlayer.Library.libraryContainer.find("#library").css('margin-bottom')),
            libHeight = $(window).height()-headerOffset-headerHeight-bottomMargin-playlistHeight-playerHeight;
            SpeakPlayer.Library.libraryContainer.find("#library").height(libHeight);


    },
    renderHeaderFilter: function () {
        var htmlHeader = Handlebars.templates['headerFilter.hbs'];
        this.libraryContainer.append(htmlHeader);
    },
    populatePlayer: function (obj) {
        var songFeature;
        $.each(obj, function (key, song) {
            var songObj = new SpeakPlayer.Song(song);

            if(songObj.isFeatured && songFeature == null){
                songFeature = songObj;
            } else if(window.location.hash.substring(1) == songObj.id){
                songFeature = songObj;
            }


            if($.inArray(songObj.genre, SpeakPlayer.Player.genres) == -1){
                SpeakPlayer.Player.genres.push(songObj.genre);
            }

            SpeakPlayer.Player.songs.push(songObj);

        });

        this.renderFeature(songFeature);
        this.renderHeaderFilter();
        this.renderGenreList();
        this.renderSongs();
        this.sizeLibraryContainer();
    },
    renderFeature : function(song){
        this.feature = this.libraryContainer.find('#featured');
        var htmlFeature = Handlebars.templates['featuredTrack.hbs'](song);

        if(this.feature.length > 0){
            this.feature.html(htmlFeature);
        } else{
            SpeakPlayer.Library.libraryContainer.prepend(htmlFeature);

        }

    },
    renderGenreList : function(){
        var html = "<div class='genres'><a href='#'>All</a>";
        $.each(SpeakPlayer.Player.genres, function(index, element){
            html += '<a href="#">'+element+'</a>';
        });
        html += "</div>";
        SpeakPlayer.Library.libraryContainer.append(html);

    },
    renderSongs : function(){

        var htmlSongs = Handlebars.templates['viewBySong.hbs'](SpeakPlayer.Player.songs);
        SpeakPlayer.Library.libraryContainer.append(htmlSongs);
        var options = {
            valueNames: [ 'songName','artistName', 'albumName','date','genre' ]
        };
        this.list = new List('libraryContainer', options);
}
});