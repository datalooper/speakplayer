<?php
/**
 * Created by PhpStorm.
 * User: vcimo5
 * Date: 1/29/15
 * Time: 5:38 PM
 */

class Speak_Sound_Library_Post_Creator {

    public $attachment;
    public $custom_post_type;
    public function __construct($custom_post_type)
    {
        $this->custom_post_type = $custom_post_type;
        $this->load_dependencies();
    }

    private function load_dependencies()
    {
    }

    function uploaderCallback() {
        $this->attachment = $_POST['attachment'];

        if($this->attachment[meta][artist] != null){
            echo $this->attachment[id];
        } else{
            echo false;
        }
        die();
    }

    function uploaderFailed(){
        echo '<div style="display:none;" class="error"></div>';
        echo '<div style="display:none;" class="updated"></div>';

    }

    function processAlbumArtwork($image, $filePath){
        $filePath = preg_replace("/\\.[^.\\s]{3,4}$/", "", $filePath);
        $filePath = $filePath . '-artwork.jpg';
        $image = base64_decode($image);
        $success = file_put_contents($filePath, $image);
        if($success){
            return $filePath;
        }
    }


    function createNewSoundsFromFolderSubmit(){

        try {
            //get value of folder url

            $soundsUrl = strval($_POST['soundsUrl']);
            $soundsUrlParsed = parse_url($soundsUrl);

            //check for trailing slash
            if (substr($soundsUrlParsed['path'], -1) == '/') {
                $localPath = $_SERVER['DOCUMENT_ROOT'] . $soundsUrlParsed['path'];
            } else {
                $localPath = $_SERVER['DOCUMENT_ROOT'] . $soundsUrlParsed['path'] . "/";
            }

            $dir = new RecursiveDirectoryIterator($localPath, RecursiveDirectoryIterator::SKIP_DOTS);
            $files = new RecursiveIteratorIterator($dir, RecursiveIteratorIterator::SELF_FIRST);

            foreach ($files as $file) {
                if ($file->getExtension() == "mp3") {
                    $friendlyPath = $this->renameFriendly($file->getPath() . "/", $file->getFilename());
                    //Valid file found, add to wordpress attachment database
                    // Prepare an array of post data for the attachment.
                    $attachment = array(
                        'post_mime_type' => 'audio/mpeg',
                        'post_title' => $file->getFilename(),
                        'post_content' => '',
                        'post_status' => 'inherit'
                    );
                    $attachment_id = wp_insert_attachment($attachment, $friendlyPath);
                    $meta = wp_generate_attachment_metadata($attachment_id, $friendlyPath);
                    $this->createPostFromFolder($attachment_id, $meta);

                }
            }
        } catch(Exception $e) {
            error_log($e);
            die();
        }
        echo admin_url( "edit.php?post_type=sounds" );

        die();
    }
    function createPostFromFolder($attachment_id, $meta){
            $attachment = get_post( $attachment_id );
            if(!empty($attachment->post_title)){
                // Create post object
                $new_post = array(
                    'post_title'    => $meta['title'],
                    'post_content'  => $attachment->post_content,
                    'post_status'   => 'publish',
                    'post_type'     => $this->custom_post_type,
                    'post_author'   => 1,
                );
                // Insert the post into the database
                $post_id = wp_insert_post( $new_post );
                if($post_id != 0){

                    set_post_thumbnail( $post_id, get_post_thumbnail_id($attachment_id));

                    $this->addToTax($post_id, $meta['artist'], "artists", "", $this->sanitize($meta['artist']) );
                    $this->addToTax($post_id, $meta['album'] , "albums", "", $this->sanitize($meta['album']) );

                    //links to media library item
                    add_post_meta($post_id, 'attachment_id', $attachment_id);

                    add_post_meta($post_id, 'artist', $meta['artist']);
                    add_post_meta($post_id, 'album', $meta['album']);
                    add_post_meta($post_id, 'genre', $meta['genre']);
                    add_post_meta($post_id, 'length', $meta['length']);


                    //sound file url
                    add_post_meta($post_id, 'wp_custom_attachment', wp_get_attachment_url( $attachment->ID ));
                    update_post_meta($post_id, 'wp_custom_attachment', wp_get_attachment_url( $attachment->ID ));

                    wp_set_object_terms( $post_id, $meta['genre'], 'genres' );



            }
        }
    }
    function renameFriendly($dir, $unfriendlyName){
        $friendlyName = str_replace(' ', '-', $unfriendlyName);
        rename($dir.$unfriendlyName, $dir.$friendlyName);
        return $dir.$friendlyName;
    }



    function createNewSoundSubmit(){
        $this->createPost($_POST['attachment']);
        die();

    }


    function createPost($form_data){
        $attachment = get_post( $form_data['attachmentId'] );
        $meta = get_post_meta( $form_data['attachmentId'], '_wp_attachment_metadata')[0];
        $isFeatured = $form_data['isFeatured'];
    if(!empty($attachment->post_title)){
            // Create post object
            $new_post = array(
                'post_title'    => $attachment->post_title,
                'post_content'  => $attachment->post_content,
                'post_status'   => 'publish',
                'post_type'     => $this->custom_post_type,
                'post_author'   => 1,
            );

            // Insert the post into the database
        $post_id = wp_insert_post( $new_post );
            if($post_id != 0){
                if($isFeatured){
                    $this->addToTax($post_id, "Featured", "category", "Featured Sounds", "featured" );
                }

                set_post_thumbnail( $post_id, get_post_thumbnail_id($form_data['attachmentId']));

                $this->addToTax($post_id, $meta['artist'], "artists", "", $this->sanitize($meta['artist']) );
                $this->addToTax($post_id, $meta['album'] , "albums", "", $this->sanitize($meta['album']) );

                //links to media library item
                add_post_meta($post_id, 'attachment_id', $form_data['attachmentId']);

                add_post_meta($post_id, 'artist', $meta['artist']);
                add_post_meta($post_id, 'album', $meta['album']);
                add_post_meta($post_id, 'genre', $meta['genre']);


                //sound file url
                add_post_meta($post_id, 'wp_custom_attachment', $attachment->guid);
                update_post_meta($post_id, 'wp_custom_attachment', $attachment->guid);

                //video url
                add_post_meta($post_id, 'video_link', $form_data['videoLink']);
                update_post_meta($post_id, 'video_link', $form_data['videoLink']);

                //artist link
                add_post_meta($post_id, 'artist_link', $form_data['artistLink']);
                update_post_meta($post_id, 'artist_link', $form_data['artistLink']);

                wp_set_object_terms( $post_id, $meta['genre'], 'genres' );
                echo get_edit_post_link( $post_id );

            }
        }
    }

    function releaseSession($sessionVar){
        if(isset($sessionVar)){
            unset($sessionVar);
        }
        session_destroy();
    }
    function sanitize($str){
        $invalid_characters = array("$", "%", "#", "<", ">", "|");
        return str_replace($invalid_characters, "", $str);
    }
    function addToTax($post_id, $taxName, $taxonomy, $description, $slug){
        if(!term_exists( $taxName, $taxonomy )){ // array is returned if taxonomy is given

            wp_insert_term(
                $taxName, // the term
                $taxonomy, // the taxonomy
                array(
                    'description'=> $description,
                    'slug' => $slug,
                )
            );
        }
        wp_set_object_terms($post_id, $slug, $taxonomy, true);
    }

function updatePostSound($urlPath, $id){
    global $wpdb;
    $absPath = getAbsPath($urlPath);

    $id3 = get_ID3($absPath);
    $_POST['mt_field_one'] = $id3['artist'];
    $_POST['mt_field_two'] = $id3['album'];
    $post_title = $id3['title'];
    $where = array( 'ID' => $id );
    $wpdb->update( $wpdb->posts, array( 'post_title' => $post_title ), $where );
}

} 