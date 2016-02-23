=== Speak Sound Library ===
Contributors: vince.cimo@gmail.com
Donate link: http://www.speakstudioscoop.com/
Tags: music, player, library, itunes, mp3, sound, html5
Requires at least: 3.8.1
Tested up to: 4.1
Stable tag: 1.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Plugin for managing a library of sounds with simple frontend hooks.

== Description ==

Speak Sound Library allows tight management and presentation of a music library. Users can import mp3’s into the system with an individual uploader or by recursively scanning a folder uploaded via ftp. Once scanned, the ID3 information is extracted out of the mp3 files and used to create a SQL entry. The resulting ‘posts’ are then organized and filterable by artist, genre, album, etc. Users can also attach additional meta-data, such as a youtube link to each song. This song data can be presented on the front-end using our plugin’s short code methods, which returns PHP objects, or using an ajax hook, which returns formatted JSON data. An example implementation (still beta), can be seen at http://www.speakstudioscoop.com/music.

== Installation ==

1. Upload the entire contents of the speak-sound-library.zip file to the wp-content/plugins/ directory.
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Create and manage your sounds using the newly created 'sounds' section.

== Frequently Asked Questions ==

= How does this plugin grab meta-data from mp3 files? =

The plugin works with the generated meta from the Wordpress Media Library, pulled from id3 tags.

= How do I create many sounds at once? =

Using the "Add sounds from folder" section, you can upload your mp3s via ftp to any subdirectory of the wp-uploads folder. Go to the 'add sounds from folder' section, and enter the path you just uploaded, in URL format. After you hit "Create Sounds", the plugin will recursively scan the specified directory and add posts for each file.

== Screenshots ==

1. This is the primary sound management page.


== Changelog ==

= 1.0 =
* Initial Release

== Upgrade Notice ==
Nothing here, really.

== Wiring up a Frontend Player ==

This plugin is merely a backend management system and can be extended using any type of front-end player. You can either use PHP hooks to prepare html, or use a jQuery ajax method, which returns sound data formatted in JSON.

This method will return a JSON string of all of the sounds in your library:

var data = {
            action: 'get_songs'
        };

        jQuery.post(ajaxurl, data, function (response) { console.log(response);
        });

You can also filter by genre, album or artist (mutually exclusive), like this:

var data = {
            action: 'get_songs', 
            albumFilter: 'Dark Side of the Moon',
            artistFilter: 'Pink Floyd',
            genreFilter: 'Rock'
        };

        jQuery.post(ajaxurl, data, function (response) { console.log(response);
        });

Using PHP, you can retrieve sounds the same as you would any other post, just add 'post_type' => 'sounds' to your get_posts() query. 

Enjoy :)
