<?php
/**
 * Created by PhpStorm.
 * User: vcimo5
 * Date: 1/29/15
 * Time: 7:21 PM
 */

class Speak_Player_Frontend_Link {

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

    function getSongs(){
        $args = array( 'post_type' => 'sounds', 'numberposts' => -1 );
        $postArray = get_posts($args);
        $i = 0;
        $songs = array();
        foreach($postArray as $post){
            $thumbnail_id = get_post_thumbnail_id($post->ID);
            $thumbnail_object = get_post($thumbnail_id);
            $firstGenre =reset( get_the_terms( $post->ID, 'genres' ))->name;

            $song = array(
                "id" => $post->post_name,
                "songName" => $post->post_title ,   //song name
                "songUrl" => get_post_meta($post->ID, 'wp_custom_attachment', true), //song url
                "artistName" => getArtist($post->ID), //artist
                "albumName" => getAlbum($post->ID), //album
                "albumArtUrl" => wp_get_attachment_image_src( $thumbnail_object->ID, 'thumbnail')[0],
                "genre" => $firstGenre,
                "releaseDate" => mysql2date('j M Y', $post->post_date),
                "isFeatured" => in_category("featured", $post->ID),
                "trackInfo" => $post->post_content,
                "artistLink" =>  get_post_meta($post->ID, 'artist_link', true)
            );
            array_push($songs, $song);
            $i++;
        }
        $json = json_encode($songs);
        echo $json;

        die();
    }

} 