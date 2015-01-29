<?php

/**
 * Fired during plugin activation
 *
 * @link       http://example.com
 * @since      1.0.0
 *
 * @package    Speak_Player
 * @subpackage Speak_Player/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    Speak_Player
 * @subpackage Speak_Player/includes
 * @author     Your Name <email@example.com>
 */
class Speak_Player_Activator {

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.0
	 */
	public static function activate() {
        global $post_type_slug;

        $args = array(
            'labels' => array(
                'name' => __( 'Sounds' ), // general name in menu & admin page
                'singular_name' => __( 'Sound' )
            ),
            'taxonomies' => array('category'),
            'public' => true,
            'has_archive' => true,
            'supports' => array( 'title', 'editor', 'thumbnail' ),
        );

        // now register the post type

        register_post_type( $post_type_slug, $args );
        print_r($post_type_slug);
	}

}
