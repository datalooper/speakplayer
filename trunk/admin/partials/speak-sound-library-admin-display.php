<?php

/**
 * Provide a dashboard view for the plugin
 *
 * This file is used to markup the public-facing aspects of the plugin.
 *
 * @link       http://example.com
 * @since      1.0.0
 *
 * @package    Speak_Sound_Library
 * @subpackage Speak_Sound_Library/admin/partials
 */
function checkUser(){
        //must check that the user has the required capability
    if (!current_user_can('manage_options'))
    {
    wp_die( __('You do not have sufficient permissions to access this page.') );
    }

    // variables for the field and option names
    $opt_name = 'mt_favorite_color';
    $hidden_field_name = 'mt_submit_hidden';
    $data_field_name = 'mt_favorite_color';

    // See if the user has posted us some information
    // If they did, this hidden field will be set to 'Y'
    if( isset($_POST[ $hidden_field_name ]) && $_POST[ $hidden_field_name ] == 'Y' ) {
    // Read their posted value
    $opt_val = $_POST[ $data_field_name ];

    // Save the posted value in the database
    update_option( $opt_name, $opt_val );

    // Put an settings updated message on the screen

    ?>
    <div class="updated"><p><strong><?php _e('settings saved.', 'menu-test' ); ?></strong></p></div>
<?php

}
    }

    //Constructs Tabs
    function sm_admin_tabs( $current = 'uploadnew' ) {
        $tabs = array( 'uploadnew' => 'Upload New Sound', 'folder' => 'Add from Folder', 'soundcloud' => 'Add from Soundcloud' );
        echo '<div id="icon-themes" class="icon32"><br></div>';
        echo '<h2 class="nav-tab-wrapper">';
        foreach( $tabs as $tab => $name ){
            $class = ( $tab == $current ) ? ' nav-tab-active' : '';
            echo "<a class='nav-tab$class' href='?post_type=sounds&page=add_new_sounds&tab=$tab'>$name</a>";

        }
        echo '</h2>';
    }

    //constructs admin page
    function sound_manager_admin_page()
    {
        checkUser();
        if (isset ($_GET['tab'])) $tab = $_GET['tab'];
        else $tab = 'uploadnew';
        sm_admin_tabs($tab);
        $settings = '';
        if ($tab == 'uploadnew') {
            $settings = get_upload_new();
        } else if($tab == 'folder'){
            $settings = get_folder();
        } else if($tab == 'soundcloud'){
            $settings = get_soundcloud();

        }
        $settings .= get_donation_info();

        echo $settings;

    }
function get_donation_info(){
    return ' <h3>Support further development!</h3>

    <p class="description">This plugin was developed with love to help musicians and sound artists organize and control their musical distribution. <br/> If this plugin helps you, or you
        would like to see new features added, donate a few dollars to help the cause! Good luck with your sounds!</p>

    <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
        <input type="hidden" name="cmd" value="_s-xclick">
        <input type="hidden" name="hosted_button_id" value="2TAECXLXUE2ZA">
        <input type="submit" value="Donate using PayPal" class="button-primary" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
        <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
    </form>';
}



function get_upload_new()
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

function get_folder(){
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



//Sound Manager Options Page
function smoptionspage(){

    echo '<p>Soundcloud API Key</p>';
    echo 'Enable Continuous Integration';
    ?>

    <script src="https://connect.soundcloud.com/sdk/sdk-3.0.0.js"></script>
    <script>
        SC.initialize({
            client_id: 'd888e0c4025ee3dd90556fd03df376dc',
            redirect_uri: 'http://localhost/vanilla/wp-content/plugins/trunk/callback.html'
        });

        // initiate auth popup
        SC.connect().then(function() {
            return SC.get('/me');
        }).then(function(me) {
            alert('Hello, ' + me.username);
        });
    </script>
    <?php
}
