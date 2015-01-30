<?php
/**
 * Created by PhpStorm.
 * User: vcimo5
 * Date: 1/29/15
 * Time: 5:38 PM
 */

class Speak_Player_Post_Creator {

    public $attachment;

    public function __construct()
    {
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

        //get value of folder url
        $soundsUrl = strval($_POST['soundsUrl']);
        $soundsUrlParsed = parse_url($soundsUrl);

        //check for trailing slash
        if(substr($soundsUrlParsed['path'], -1) == '/') {
            $localPath = $_SERVER['DOCUMENT_ROOT'].$soundsUrlParsed['path'];
        } else{
            $localPath = $_SERVER['DOCUMENT_ROOT'].$soundsUrlParsed['path']."/";
        }

        $dir  = new RecursiveDirectoryIterator($localPath, RecursiveDirectoryIterator::SKIP_DOTS);
        $files = new RecursiveIteratorIterator($dir, RecursiveIteratorIterator::SELF_FIRST);

        foreach ($files as $file) {
            if($file->getExtension() == "mp3"){
                echo $file;
                $friendlyPath = $this->renameFriendly($file->getPath()."/", $file->getFilename());
                $id3info = get_id3($friendlyPath);
                //Valid file found, add to wordpress attachment database
                // Prepare an array of post data for the attachment.
                $attachment = array(
                    'guid'           => $friendlyPath,
                    'post_mime_type' => 'audio/mpeg',
                    'post_title'     => $id3info['title'],
                    'post_content'   => '',
                    'post_status'    => 'inherit'
                );
                $attachment = wp_insert_attachment( $attachment, $friendlyPath);
                error_log(wp_get_attachment_url( $attachment ));
                $fileUrl = wp_slash(wp_get_attachment_url( $attachment ));
                $id3info['url'] = $fileUrl;
                $id3info['image'] = processAlbumArtwork($id3info['image'], $friendlyPath);
                $this->createPost($id3info);

            }
        }
        die();

    }

    function renameFriendly($dir, $unfriendlyName){
        $friendlyName = str_replace(' ', '-', $unfriendlyName);
        rename($dir.$unfriendlyName, $dir.$friendlyName);
        return $dir.$friendlyName;
    }



    function createNewSoundSubmit(){
        error_log(print_r($_SESSION['attachment']));
        //echo $this->createPos$_SESSION['post_details']]);
        //$this->releaseSession($_SESSION['post_details']);
        die();

    }


    function createPost($attachment){
        global $post_type_slug;

        if(!empty($attachment['title'])){
            // Create post object
            $new_post = array(
                'post_title'    => $attachment['title'],
                'post_content'  => '',
                'post_status'   => 'publish',
                'post_type'     => $post_type_slug,
                'post_author'   => 1,

            );

            // Insert the post into the database

            $post_id = wp_insert_post( $new_post );
            if($post_id != 0){
                if($isFeatured){
                    addToTax($post_id, "Featured", "category", "Featured Sounds", "featured" );
                }
                addFeaturedImage($post_id, $attachment['image']);
                addToTax($post_id, $attachment['artist'], "artists", "", sanitize($attachment['artist']) );
                addToTax($post_id, $attachment['album'] , "albums", "", sanitize($attachment['album']) );

                //sound file url
                add_post_meta($post_id, 'wp_custom_attachment', $attachment['url']);
                update_post_meta($post_id, 'wp_custom_attachment', $attachment['url']);

                //video file url
                add_post_meta($post_id, 'video_link', $attachment['videoLink']);
                update_post_meta($post_id, 'video_link', $attachment['videoLink']);

                wp_set_object_terms( $post_id, $attachment['genre'], 'genres' );
                attachSoundtoPost($attachment, $attachment['url'], $post_id);
                return admin_url( 'post.php?post=' . $post_id ) . '&action=edit';
            }
        }
        return 0;
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
    function addFeaturedImage($post_id, $image){
        $filetype = wp_check_filetype( basename( $image ), null );
        // Prepare an array of post data for the attachment.
        $attachment = array(
            'guid'           => $wp_upload_dir['url'] . '/' . basename( $image ),
            'post_mime_type' => $filetype['type'],
            'post_title'     => preg_replace( '/\.[^.]+$/', '', basename( $image  ) ),
            'post_content'   => '',
            'post_status'    => 'inherit'
        );

        $attachmentId = wp_insert_attachment( $attachment, $image , $post_id);
        wp_update_attachment_metadata( $attachmentId, wp_generate_attachment_metadata( $attachmentId, $image ));
        add_post_meta( $post_id, '_thumbnail_id', $attachmentId, true );
    }

    function attachSoundtoPost($details, $filePath, $post_id){
        // Check the type of tile. We'll use this as the 'post_mime_type'.
        $filetype = wp_check_filetype( $filePath, null );
        getAbsPath($filePath);
        // Prepare an array of post data for the attachment.
        $attachment = array(
            'guid'           => $absPath,
            'post_mime_type' => $filetype['type'],
            'post_title'     => preg_replace('/\.[^.]+$/', '', basename($filePath)),
            'post_content'   => '',
            'post_status'    => 'inherit'
        );

        // Insert the attachment.
        $attach_id = wp_insert_attachment( $attachment, $absPath, $post_id  );
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