<?php

/**
 * Created by PhpStorm.
 * User: vincentcimo
 * Date: 2/24/16
 * Time: 8:35 AM
 */
class Soundcloud_Manager
{
    function get_soundcloud(){

        ?>
        <script>
            SC.initialize({
                client_id: 'd888e0c4025ee3dd90556fd03df376dc',
                redirect_uri: 'http://localhost/vanilla/wp-content/plugins/trunk/callback.html'
            });
        </script>
        <?php


        $settings = '<div class="wrap">';

// header

        $settings .= "<h2>" . __('Speak Sound Library', 'menu-test') . "</h2>";

        $settings .= ' <input id="client_id" type="text" size="36" name="client_id" placeholder="SoundCloud client_id" />
 <input id="client_id" type="text" size="36" name="redirect_url" placeholder="SoundCloud redirect_url" />
        <input id="update_sc_app" class="button" type="button" value="Update Info" />
        <br/>
        <br/>
         <input id="add_user" type="text" size="36" name="add_user" placeholder="https://soundcloud.com/user-x/" />
        <input id="add_user_button" class="button" type="button" value="Add User" />

       ';

        // settings form
        ?><script>
            SC.resolve('https://soundcloud.com/user-741516108').then(function(userinfo){
                var getString = '/users/' + userinfo.id + "/tracks";
                SC.get(getString).then(function(tracks){
                    var el = document.getElementById('soundcloudsounds');
                    var tracklist = '';
                    jQuery.each(tracks, function(index, value){
                        console.log(value);
                        tracklist += "<h2>" + value.title + "</h2>";
                    });

                    jQuery(el).html(tracklist);
                });
            });



        </script><?php
        $users = unserialize(get_option('soundcloud_users'));

        foreach($users as $user){
            $settings .= "<h1>" .$user . "</h1>";
        }
        $settings .= '<div id="soundcloudsounds">cool</div>';
        return $settings;
    }
}