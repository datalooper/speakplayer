<?php
/**
 * Created by PhpStorm.
 * User: vcimo5
 * Date: 1/29/15
 * Time: 4:25 PM
 */
class Speak_Sound_Library_Admin_Meta
{
    private $custom_post_name;

    /**
     * The ID of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $plugin_name    The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $version    The current version of this plugin.
     */
    private $version;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     * @var      string    $plugin_name       The name of this plugin.
     * @var      string    $version    The version of this plugin.
     */

    public function __construct( $plugin_name, $version, $custom_post_name ) {
        $this->custom_post_name = $custom_post_name;
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }
    public function create_custom_metaboxes()
    {
        add_meta_box(
            'sound_file',
            'Sound File',
            array($this, 'sound_file_metabox'),
            $this->custom_post_name,
            'side'
        );

        add_meta_box(
            'video_link',
            'YouTube ID',
            array($this, 'video_link_metabox'),
            $this->custom_post_name

        );
        add_meta_box(
            'artist_link',
            'Artist Link',
            array($this, 'artist_link_metabox'),
            $this->custom_post_name

        );
        // Define additional "post thumbnails". Relies on MultiPostThumbnails to work
        if (class_exists('MultiPostThumbnails')) {
            new MultiPostThumbnails(array(
                    'label' => 'Featured Video First Frame (1920x1080)',
                    'id' => 'first-frame',
                    'post_type' => $this->custom_post_name
                )
            );

        };
    }

    function artist_link_metabox()
    {
        wp_nonce_field(plugin_basename(__FILE__), 'wp_artist_link_nonce');
        $artistLink = get_post_meta(get_the_ID(), 'artist_link', true);
        $html = '';
        if (!empty($artistLink)) {
            $html .= "<div class='artistLinkContainer'><p class='description'>Current Artist Link: </p><a href='";
            $html .= $artistLink . "'>" . $artistLink . "</a><a data-post-id='" . get_the_ID() . "' href='#' style='padding-left:20px;' class='removeArtistLink'>Remove</a></div>";

        }
        $html .= "<p style='margin-top:10px;' class='description'>Specify Artist Link, (http://www.redwillowsband.com)</p>";
        $html .= "<input type='text' name='artistLink' id='artist_link' size='40'/>";
        echo $html;
    }

    function save_artist_link($id)
    {
        $artistLink = $_POST['artistLink'];
        if (!empty($_POST['artistLink']) && $this->verifySecurity($id) && wp_verify_nonce($_POST['wp_artist_link_nonce'], plugin_basename(__FILE__))) {
            add_post_meta($id, 'artist_link', $artistLink);
            update_post_meta($id, 'artist_link', $artistLink);
        } // end save_custom_meta_data
    }

    function remove_artist_link_callback()
    {
        delete_post_meta($_POST['post_id'], 'artist_link');
    }

    function video_link_metabox()
    {
        wp_nonce_field(plugin_basename(__FILE__), 'wp_video_link_nonce');
        $videoLink = get_post_meta(get_the_ID(), 'video_link', true);
        $html = '';
        if (!empty($videoLink)) {
            $html .= "<p class='description'>Current YouTube ID: ".$videoLink."</p>";
        } else {
            $html .= "<p style='margin-top:10px;' class='description'>Specify YouTube ID, for example: id2i49</p>";
        }
        $html .= "<input type='text' name='videoLink' id='video_link' size='40'/>";

        echo $html;
    }

    function save_video_meta($id)
{
    $videoLink = $_POST['videoLink'];
    if (!empty($_POST['videoLink']) && $this->verifySecurity($id) && wp_verify_nonce($_POST['wp_video_link_nonce'], plugin_basename(__FILE__))) {
        add_post_meta($id, 'video_link', $videoLink);
        update_post_meta($id, 'video_link', $videoLink);
    } // end save_custom_meta_data
}

// design sound file metabox
    function sound_file_metabox()
    {

        wp_nonce_field(plugin_basename(__FILE__), 'wp_custom_attachment_nonce');
        $sound = get_post_meta(get_the_ID(), 'wp_custom_attachment', true);
        $html = '<p class="description">';
        if (!empty($sound)) {
            $html .= "Current Song File: </p><a href='";
            $html .= $sound . "'>" . get_the_title() . "</a>";
            $html .= "<p style='margin-top:10px;' class='description'>Upload new sound</p>";
        } else {
            $html .= 'Upload your Sound here.';
            $html .= '</p>';
        }
        $html .= '<input type="file" id="wp_custom_attachment" name="wp_custom_attachment" value="" size="25">';
        echo $html;
    }

    function verifySecurity($id){
        /* --- security verification --- */

        if(defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return false;
        } // end if

        if('page' == $_POST['post_type']) {
            if(!current_user_can('edit_page', $id)) {
                return false;
            } // end if
        } else {
            if(!current_user_can('edit_page', $id)) {
                return false;
            } // end if
        } // end if
        return true;
        /* - end security verification - */
    }

    function mt_save_sound_file($id) {
        // Make sure the file array isn't empty
        if(!empty($_FILES['wp_custom_attachment']['name']) && $this->verifySecurity($id) && wp_verify_nonce($_POST['wp_custom_attachment_nonce'], plugin_basename(__FILE__))) {

            // Setup the array of supported file types. In this case, it's just MP3.
            $supported_types = array('audio/mpeg');

            // Get the file type of the upload
            $arr_file_type = wp_check_filetype(basename($_FILES['wp_custom_attachment']['name']));
            $uploaded_type = $arr_file_type['type'];

            // Check if the type is supported. If not, throw an error.
            if(in_array($uploaded_type, $supported_types)) {

                // Use the WordPress API to upload the file
                $upload = wp_upload_bits($_FILES['wp_custom_attachment']['name'], null, file_get_contents($_FILES['wp_custom_attachment']['tmp_name']));
                updatePostSound($upload['url'], $id);

                if(isset($upload['error']) && $upload['error'] != 0) {
                    wp_die('There was an error uploading your file. The error is: ' . $upload['error']);
                } else {
                    add_post_meta($id, 'wp_custom_attachment', $upload['url']);
                    update_post_meta($id, 'wp_custom_attachment', $upload['url']);
                } // end if/else

            } else {
                wp_die("The file type that you've uploaded is not an MP3.");
            } // end if/else

        } // end if

    } // end save_custom_meta_data
}