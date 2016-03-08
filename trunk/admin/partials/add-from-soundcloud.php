<?php

/**
 * Created by PhpStorm.
 * User: vincentcimo
 * Date: 2/24/16
 * Time: 8:35 AM
 */
class Add_From_Soundcloud
{
    function get_soundcloud_upload_screen_html(){
        $settings = "";
        ?>
        <script>
            SC.initialize({
                client_id: 'd888e0c4025ee3dd90556fd03df376dc',
                redirect_uri: 'http://localhost/vanilla/wp-content/plugins/trunk/callback.html'
            });
        </script>
        <?php

        $users = unserialize(get_option('soundcloud_users'));

        $tab = $_GET['tab'];
        $screen = get_current_screen();
        if(( isset($tab) && isset($screen)) && ('soundcloud' == $tab && 'sounds_page_add_new_sounds' == $screen->id) && isset($users)) {

            ?>
            <script>
                jQuery(document).ready(function(){
                    jQuery(window).trigger('getTracks', [<?php echo json_encode($users) ?>]);
                });
</script>
<?php
        }

        $settings .= '<div class="wrap">';

// header

        $settings .= "<h2>" . __('Speak Sound Library', 'menu-test') . "</h2>";

        $settings .= ' <input id="client_id" type="text" size="36" name="client_id" placeholder="SoundCloud client_id" />
 <input id="client_id" type="text" size="36" name="redirect_url" placeholder="SoundCloud redirect_url" />
        <input id="update_sc_app" class="button" type="button" value="Update Info" />
        <br/>
        <br/>
         <input id="add_user" type="text" size="36" name="add_user" placeholder="https://soundcloud.com/user-x/" />
        <input id="add_user_button" class="button" type="button" value="Add User" />
        <div id="soundcloud_sounds"></div>
       ';

        // settings form

        return $settings;
    }

    /**
     * Callback function for 'wp_ajax__ajax_fetch_custom_list' action hook.
     *
     * Loads the Custom List Table Class and calls ajax_response method
     */
    function _ajax_fetch_custom_list_callback() {

        global $wpdb;
        $tracklist = $_POST['tracklist'];
        $wp_list_table = new Soundcloud_List_Table();

        if($tracklist) {
            update_option('sm_soundcloud_tracklist', serialize($tracklist));
        }
        $wp_list_table->ajax_response();

    }

    function add_from_soundcloud() {
        //ignore any other actions
        if($_POST['action'] === 'add_from_soundcloud'){
            $ids = $_POST['track'];

            foreach($ids as $id){
                createSoundFromSoundcloudId($id);
            }

        }
    }


    function createSoundFromSoundcloudId($id){

    }

    //Ajax callback function from new user submission
    function addSoundcloudUser(){
        global $wpdb; // this is how you get access to the database

        $user = $_POST['user'];

        //Check if user string is valid
        if ($user) {

            $users = unserialize(get_option('soundcloud_users'));
            if (!$users) {
                $users = array();
            }
            if(!in_array($user, $users)) {
                array_push($users, $user);
                update_option('soundcloud_users', serialize($users));
            } else{
                echo "User already exists";
            }
        } else{
            echo "Invalid Soundcloud User Page";
        }
        wp_die();
    }
}