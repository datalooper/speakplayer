<?php
/**
 * Created by PhpStorm.
 * User: vcimo5
 * Date: 1/29/15
 * Time: 4:48 PM
 */

function sound_manager_folder_page(){
    //must check that the user has the required capability
    if (!current_user_can('manage_options'))
    {
        wp_die( __('You do not have sufficient permissions to access this page.') );
    }

    // variables for the field and option names
    $opt_name = 'mt_favorite_color';
    $hidden_field_name = 'mt_submit_hidden';
    $data_field_name = 'mt_favorite_color';

    // Read in existing option value from database
    $opt_val = get_option( $opt_name );

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

    // Now display the settings editing screen

    echo '<div class="wrap">';

    // header

    echo "<h2>" . __( 'Sound Manager', 'menu-test' ) . "</h2>";

    // settings form

    ?>
    </div>
    <p class="description">Specify a local url containing mp3's and the meta-data for your new sounds will be auto-populated based on the ID3 tags. Folder <strong>MUST</strong> be located inside the wp-uploads dir. </p>
    <h3>Enter Folder Path</h3>
    <label for="upload_sound">
        <input id="upload_sound" type="text" size="36" name="ad_sound" placeholder="http://www.mysite.com/wp-content/uploads/my-sounds" />
        <input id="create_sounds_button" class="button" type="button" value="Create Sounds" />
        <br />Enter a local URL here
    </label>


    <div id="upload_status"></div>
    <h3>Support further development!</h3>

    <p class="description">This plugin was developed with love to help musicians and sound artists organize and control their musical distribution. <br/> If this plugin helps you, or you
        would like to see new features added, donate a few dollars to help the cause! Good luck with your sounds!</p>

    <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
        <input type="hidden" name="cmd" value="_s-xclick">
        <input type="hidden" name="hosted_button_id" value="2TAECXLXUE2ZA">
        <input type="submit" value="Donate using PayPal" class="button-primary" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
        <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
    </form>


<?php
}