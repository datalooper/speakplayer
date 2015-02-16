/**
 * Created by vcimo5 on 9/30/14.
 */
//defines song model

SpeakPlayer.Song = function(obj) {
    this.isFeatured = false;
    this.isPlaying = false,
    this.isLoaded = false,
    this.trackInfo = '',
    this.artistName = 'artist',
    this.albumName = 'album',
    this.songName = 'track',
    this.songUrl = '',
    this.releaseDate = '',
    this.albumArtUrl = '',
    this.id = '-1',
    this.genre = '',
    this.artistLink = ''


    // IF AN OBJECT WAS PASSED THEN INITIALISE PROPERTIES FROM THAT OBJECT
    for (var prop in obj) this[prop] = obj[prop];
}