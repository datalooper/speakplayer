<?php

/**
 * The dashboard-specific functionality of the plugin.
 *
 * @link       http://example.com
 * @since      1.0.0
 *
 * @package    Speak_Sound_Library
 * @subpackage Speak_Sound_Library/admin
 */

/**
 * The dashboard-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the dashboard-specific stylesheet and JavaScript.
 *
 * @package    Speak_Sound_Library
 * @subpackage Speak_Sound_Library/admin
 * @author     Your Name <email@example.com>
 */
class Speak_Sound_Library_Admin {


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

	/**
	 * Register the stylesheets for the Dashboard.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Speak_Sound_Library_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Speak_Sound_Library_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/speak-sound-library-admin.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the dashboard.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Speak_Sound_Library_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Speak_Sound_Library_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */
        wp_enqueue_media();
		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/speak-sound-library-admin.js', array( 'jquery' ), $this->version, false );
        // in javascript, object properties are accessed as ajax_object.ajax_url, ajax_object.we_value
        wp_localize_script( $this->plugin_name, 'ajax_object',
            array( 'ajax_url' => admin_url( 'admin-ajax.php' ), 'attachment' => "" ) );
    }


    public function initialize_player(){

        // Create Sound Post Type
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
        register_post_type( $this->custom_post_name, $args );
        // Add custom taxonomies to be used with sounds
        $this->create_taxonomy("Genres", "Genre", "genres");
        $this->create_taxonomy("Artists", "Artist", "artists");
        $this->create_taxonomy("Albums", "Album", "albums");
    }

    public function edit_columns($columns){
        $columns = array(
            'cb' => '<input type="checkbox" />',
            'title' => __( 'Song Title' ),
            'artist' => __( 'Artist' ),
            'album' => __( 'Album' ),
            'genre' => __( 'Genre' )
        );

        return $columns;

    }

function edit_sort_orderby( $query ) {

    /**
     * We only want our code to run in the main WP query
     * AND if an orderby query variable is designated.
     */
    if ( $query->is_main_query() && ( $orderby = $query->get( 'orderby' ) ) ) {

        switch( $orderby ) {

            case 'artist':
                // set our query's meta_key, which is used for custom fields
                $query->set( 'meta_key', 'artist' );
                $query->set( 'orderby', 'meta_value' );

                break;
            case 'album':
                // set our query's meta_key, which is used for custom fields
                $query->set( 'meta_key', 'album' );
                $query->set( 'orderby', 'meta_value' );

                break;
            case 'genre':
                // set our query's meta_key, which is used for custom fields
                $query->set( 'meta_key', 'genre' );
                $query->set( 'orderby', 'meta_value' );

                break;
        }

    }

}

    public function edit_sortable_columns($columns){
        $columns['artist'] = 'artist';
        $columns['album'] = 'album';
        $columns['genre'] = 'genre';

        //To make a column 'un-sortable' remove it from the array
        //unset($columns['date']);

        return $columns;
    }
    public function manage_column($column, $post_id){
        global $post;
        echo array_pop(get_post_meta($post_id, $column));

    }
    public function create_taxonomy($name, $singular_name, $slug){
    // add a hierarchical taxonomy called Genre (same as Post Categories)

        // create the array for 'labels'
        $labels = array(
            'name' => ( $name ),
            'singular_name' => ( $singular_name),
            'search_items' =>  ( 'Search '.$name ),
            'all_items' => ( 'All '.$name ),
            'parent_item' => ( 'Parent '.$singular_name ),
            'parent_item_colon' => ( 'Parent '.$singular_name.':' ),
            'edit_item' => ( 'Edit '.$singular_name ),
            'update_item' => ( 'Update '.$singular_name ),
            'add_new_item' => ( 'Add New '.$singular_name ),
            'new_item_name' => ( 'New '.$singular_name.' Name' ),
        );

        // register your Groups taxonomy
        register_taxonomy( $slug, 'sounds', array(
            'hierarchical' => true,
            'labels' => $labels, // adds the above $labels array
            'show_ui' => true,
            'query_var' => true,
            'rewrite' => array( 'slug' => $slug ), // changes name in permalink structure
        ));


    }

    public function create_admin_menu(){
        $menuSlug = 'sound_manager_options';
        $menuSlug2 = 'sound_manager_folder';
        add_submenu_page('edit.php?post_type='.$this->custom_post_name, 'Add New Sound', 'Add New Sound', 'manage_options', $menuSlug, 'sound_manager_admin_page');
        add_submenu_page('edit.php?post_type='.$this->custom_post_name, 'Add Sounds from Folder', 'Add Sounds from Folder', 'manage_options', $menuSlug2, 'sound_manager_folder_page');
    }





}
