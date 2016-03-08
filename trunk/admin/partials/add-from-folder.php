<?php

/**
 * Created by PhpStorm.
 * User: vincentcimo
 * Date: 2/24/16
 * Time: 8:40 AM
 */
class Add_From_Folder
{
    function get_folder_upload_screen_html(){
        // Now display the settings editing screen
        $settings = '<div class="wrap">';

        // header

        $settings .= "<h2>" . __( 'Sound Manager', 'menu-test' ) . "</h2>";

        // settings form

        $settings .= '</div>
    <p class="description">Specify a local url containing mp3\'s and the meta-data for your new sounds will be auto-populated based on the ID3 tags. Folder <strong>MUST</strong> be located inside the wp-uploads dir. </p>
    <h3>Enter Folder Path</h3>
    <label for="upload_sound">
        <input id="upload_sound" type="text" size="36" name="ad_sound" placeholder="http://www.mysite.com/wp-content/uploads/my-sounds" />
        <input id="create_sounds_button" class="button" type="button" value="Create Sounds" />
        <br />Enter a local URL here
    </label>


    <div id="upload_status"></div>';
        return $settings;

    }
}