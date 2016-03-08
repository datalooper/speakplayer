<?php

/**
 * Created by PhpStorm.
 * User: vincentcimo
 * Date: 2/24/16
 * Time: 8:41 AM
 */
class Settings_Page
{
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

}