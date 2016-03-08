<?php

/**
 * Created by PhpStorm.
 * User: vincentcimo
 * Date: 2/24/16
 * Time: 8:40 AM
 */
class Add_From_File
{
    public function get_file_upload_screen_html()
    {


// Now display the settings editing screen

        $settings = '<div class="wrap">';

// header

        $settings .= "<h2>" . __('Speak Sound Library', 'menu-test') . "</h2>";

// settings form

        $settings .= '
    </div>
    <p class="description">Upload an .mp3 file and the meta-data for your new sound will be auto-populated based on the ID3 tags.</p>
    <h3>Upload New Sound</h3>
    <label for="upload_sound">
        <input id="upload_sound" type="text" size="36" name="ad_sound" value="http://" />
        <input id="upload_sound_button" class="button" type="button" value="Upload Sound" />
        <br />Enter a URL or upload a sound
    </label>

    <h3>New Sound Info</h3>

    <form id ="soundForm">
        <p>Sound Name: </p>
        <input class="soundName" name="title" readonly type="text" />
        <p>Artist Name:</p>
        <input class="artist" name="artist" readonly type="text" />
        <p>Album Name:</p>
        <input class="album" name="album" readonly type="text" />
       <p>Artist Link:</p>
        <input class="artistLink" size="20" name="artistLink" type="text" />
        <br/>
        <br/>
        <input type="submit" value="Create New Sound" class="createSound button-primary" />
    </form>

    <div id="upload_status"></div>
   ';
        return $settings;
    }
}