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
function checkUser()
{
    //must check that the user has the required capability
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    // variables for the field and option names
    $opt_name = 'mt_favorite_color';
    $hidden_field_name = 'mt_submit_hidden';
    $data_field_name = 'mt_favorite_color';

    // See if the user has posted us some information
    // If they did, this hidden field will be set to 'Y'
    if (isset($_POST[$hidden_field_name]) && $_POST[$hidden_field_name] == 'Y') {
        // Read their posted value
        $opt_val = $_POST[$data_field_name];

        // Save the posted value in the database
        update_option($opt_name, $opt_val);

        // Put an settings updated message on the screen

        ?>
        <div class="updated"><p><strong><?php _e('settings saved.', 'menu-test'); ?></strong></p></div>
        <?php

    }
}

//Constructs Tabs
function sm_admin_tabs($current = 'uploadnew')
{
    $tabs = array('uploadnew' => 'Upload New Sound', 'folder' => 'Add from Folder', 'soundcloud' => 'Add from Soundcloud');
    echo '<div id="icon-themes" class="icon32"><br></div>';
    echo '<h2 class="nav-tab-wrapper">';
    foreach ($tabs as $tab => $name) {
        $class = ($tab == $current) ? ' nav-tab-active' : '';
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
        $settings = Add_From_File::get_file_upload_screen_html();
    } else if ($tab == 'folder') {
        $settings = Add_From_Folder::get_folder_upload_screen_html();
    } else if ($tab == 'soundcloud') {
        $settings = Add_From_Soundcloud::get_soundcloud_upload_screen_html();
        $wp_list_table = new Soundcloud_List_Table();
        $wp_list_table->prepare_items();
        ob_start();
        $settings .='
<form id="soundcloud-tracks" method="post">
			<input type="hidden" name="page" value="'.$_REQUEST['page'].'" />';

        $wp_list_table->display();
        $settings .= ob_get_contents();
        $settings .= "</form>";
        ob_clean();
    }
    $settings .= get_donation_info_html();

    echo $settings;




}

function get_donation_info_html()
{
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









