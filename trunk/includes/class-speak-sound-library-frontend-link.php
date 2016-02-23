<?php
/**
 * Created by PhpStorm.
 * User: vcimo5
 * Date: 1/29/15
 * Time: 7:21 PM
 */

class Speak_Sound_Library_Frontend_Link {
    private $custom_post_name;

    public function __construct( $custom_post_name ) {
        $this->custom_post_name = $custom_post_name;

    }
    function addPlay(){
        $post_id = intval( $_POST['postid'] );
        $numplays = get_post_meta( $post_id, 'numplays')[0];
        update_post_meta($post_id, 'numplays', $numplays+1);
        die();
    }
    function getAudioAttachments(){
        $args = array
        (
            'post_type' => 'attachment',
            'post_mime_type' => 'audio',
            'numberposts' => -1
        );
        $audiofiles = get_posts($args);
        $songs = array();
        foreach ($audiofiles as $file)
        {
            $thumbnail_id = get_post_thumbnail_id($file->ID);
            $thumbnail_object = get_post($thumbnail_id);
            $meta = get_post_meta( $file->ID, '_wp_attachment_metadata')[0];
            error_log(print_r($meta, true));

            $song = array(
                "id" => $file->post_name,
                "songName" => $meta['title'],   //song name
                "songUrl" => $file->guid,
                "artistName" => $meta['artist'],
                "albumName" => $meta['album'], //album
                "albumArtUrl" => wp_get_attachment_image_src( $thumbnail_object->ID, 'thumbnail')[0],
                "genre" => $meta['genre'],
                "releaseDate" => $meta['year'],
                "isFeatured" => false,
                "trackInfo" =>  $file->post_content,
                "artistLink" =>  '',
                "duration" => $meta['length']
            );
            array_push($songs, $song);
        }
        $json = json_encode($songs);
        echo $json;

        die();
    }
    public function add_ajax_library() {
        $html = '<script type="text/javascript">';
        $html .= 'var ajaxurl = "' . admin_url( 'admin-ajax.php' ) . '"';
        $html .= '</script>';

        echo $html;

    } // end add_ajax_library
    function getSongs(){

        $artistFilter = $_POST['artistFilter'];
        $genreFilter = $_POST['genreFilter'];
        $albumFilter = $_POST['albumFilter'];

        $args = array( 'post_type' => $this->custom_post_name, 'numberposts' => -1 );


        if($genreFilter != ''){
            $args['meta_key'] = 'genre';
            $args['meta_value'] = $genreFilter;
        }
        if($albumFilter != ''){
            $args['meta_key'] = 'album';
            $args['meta_value'] = $albumFilter;
        }
        if($artistFilter != ''){
            $args['meta_key'] = 'artist';
            $args['meta_value'] = $artistFilter;
        }

        $postArray = get_posts($args);
        $i = 0;
        $songs = array();
        foreach($postArray as $post){
            $meta = get_post_meta( $post->ID);

            $thumbnail_id = get_post_thumbnail_id($post->ID);
            $thumbnail_object = get_post($thumbnail_id);
            $song = array(
                "id" => $post->ID,
                "songName" => htmlspecialchars_decode($post->post_title) ,   //song name
                "songUrl" => get_post_meta($post->ID, 'wp_custom_attachment', true), //song url
                "artistName" => $meta['artist'],
                "albumName" => $meta['album'], //album
                "albumArtUrl" => wp_get_attachment_image_src( $thumbnail_object->ID, 'thumbnail')[0],
                "albumArtLargeUrl" => wp_get_attachment_image_src( $thumbnail_object->ID, 'large')[0],
                "genre" => htmlspecialchars_decode(wp_get_post_terms($post->ID, 'genres')[0]->name),
                "releaseDate" => mysql2date('j M Y', $post->post_date),
                "numPlays" => get_post_meta($post->ID, 'numplays', 0),
                "nonformattedDate" => $post->post_date,
                "isFeatured" => in_category("featured", $post->ID),
                "trackInfo" => $post->post_content,
                "artistLink" =>  get_post_meta($post->ID, 'artist_link', true),
                "duration" => $meta['length']            );
            array_push($songs, $song);
            $i++;
        }
        $json = json_encode($songs);
        echo $json;

        die();
    }

    public static function getSound( $atts )
    {
        $atts = shortcode_atts(array(
            'id' => ''), $atts, 'sound');

        return "<div class='soundPost cf' data-soundid='{$atts['id']}'></div>";    }
}



    /* @Recreate the default filters on the_content so we can pull formated content with get_post_meta
    -------------------------------------------------------------- */
    add_filter( 'meta_content', 'wptexturize'        );
    add_filter( 'meta_content', 'convert_smilies'    );
    add_filter( 'meta_content', 'convert_chars'      );
    add_filter( 'meta_content', 'wpautop'            );
    add_filter( 'meta_content', 'shortcode_unautop'  );
    add_filter( 'meta_content', 'prepend_attachment' );

add_shortcode( 'sound', array( 'Speak_Sound_Library_Frontend_Link', 'getSound' ) );