<?php

/**
 * The file that defines the core plugin class
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the dashboard.
 *
 * @link       http://example.com
 * @since      1.0.0
 *
 * @package    Speak_Sound_Library
 * @subpackage Speak_Sound_Library/includes
 */

/**
 * The core plugin class.
 *
 * This is used to define internationalization, dashboard-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      1.0.0
 * @package    Speak_Sound_Library
 * @subpackage Speak_Sound_Library/includes
 * @author     Your Name <email@example.com>
 */
class Speak_Sound_Library {

	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      Speak_Sound_Library_Loader    $loader    Maintains and registers all hooks for the plugin.
	 */
	protected $loader;

	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $plugin_name    The string used to uniquely identify this plugin.
	 */
	protected $plugin_name;

	/**
	 * The current version of the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $version    The current version of the plugin.
	 */
	protected $version;
    private $custom_post_type = "sounds";

    /**
	 * Define the core functionality of the plugin.
	 *
	 * Set the plugin name and the plugin version that can be used throughout the plugin.
	 * Load the dependencies, define the locale, and set the hooks for the Dashboard and
	 * the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function __construct() {

		$this->plugin_name = 'speak-sound-library';
		$this->version = '1.0.0';

		$this->load_dependencies();
		$this->set_locale();
		$this->define_admin_hooks();
		$this->define_public_hooks();

	}

	/**
	 * Load the required dependencies for this plugin.
	 *
	 * Include the following files that make up the plugin:
	 *
	 * - Speak_Sound_Library_Loader. Orchestrates the hooks of the plugin.
	 * - Speak_Sound_Library_i18n. Defines internationalization functionality.
	 * - Speak_Sound_Library_Admin. Defines all hooks for the dashboard.
	 * - Speak_Sound_Library_Public. Defines all hooks for the public side of the site.
	 *
	 * Create an instance of the loader which will be used to register the hooks
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function load_dependencies() {

		/**
		 * The class responsible for orchestrating the actions and filters of the
		 * core plugin.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-speak-sound-library-loader.php';

		/**
		 * The class responsible for defining internationalization functionality
		 * of the plugin.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-speak-sound-library-i18n.php';

		/**
		 * The class responsible for defining all actions that occur in the Dashboard.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-speak-sound-library-admin.php';

        /**
         * The class responsible for defining all custom metaboxes.
         */
        require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-speak-sound-library-admin-meta.php';

        /**
         * The class responsible for defining the create sound page.
         */
        require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/partials/speak-sound-library-admin-display.php';

        /**
         * The class responsible for defining the create sound from folder page.
         */
        require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/partials/speak-sound-library-sounds-from-folder.php';

		/**
		 * The class responsible for defining all actions that occur in the public-facing
		 * side of the site.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-speak-sound-library-public.php';

        /**
         * The class responsible for creating a post from the uploader callback
         */
        require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-speak-sound-library-post-creator.php';

        /**
         * The class responsible for creating a post from the uploader callback
         */
        require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-speak-sound-library-frontend-link.php';

		$this->loader = new Speak_Sound_Library_Loader();

	}

	/**
	 * Define the locale for this plugin for internationalization.
	 *
	 * Uses the Speak_Sound_Library_i18n class in order to set the domain and to register the hook
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function set_locale() {

		$plugin_i18n = new Speak_Sound_Library_i18n();
		$plugin_i18n->set_domain( $this->get_plugin_name() );

		$this->loader->add_action( 'plugins_loaded', $plugin_i18n, 'load_plugin_textdomain' );

	}

	/**
	 * Register all of the hooks related to the dashboard functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_admin_hooks() {

		$plugin_admin = new Speak_Sound_Library_Admin( $this->get_plugin_name(), $this->get_version(), $this->custom_post_type );
        $plugin_admin_meta = new Speak_Sound_Library_Admin_Meta($this->get_plugin_name(), $this->get_version(), $this->custom_post_type);
        $plugin_post_creator = new Speak_Sound_Library_Post_Creator($this->custom_post_type);
        $frontend_link = new Speak_Sound_Library_Frontend_Link($this->custom_post_type);

		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_styles' );
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts' );
        $this->loader->add_action( 'init', $plugin_admin, 'initialize_player' );
        $this->loader->add_action( 'admin_menu', $plugin_admin, 'create_admin_menu' );
        $this->loader->add_action( 'admin_init', $plugin_admin_meta, 'create_custom_metaboxes' );
        $this->loader->add_action( 'save_post', $plugin_admin_meta, 'mt_save_sound_file' );
        $this->loader->add_action( 'save_post', $plugin_admin_meta, 'save_video_meta' );
        $this->loader->add_action( 'save_post', $plugin_admin_meta, 'save_artist_link' );
        $this->loader->add_action( 'wp_ajax_remove_artist_link', $plugin_admin_meta, 'remove_artist_link_callback' );
        $this->loader->add_action('admin_notices', $plugin_post_creator, "uploaderFailed");
        $this->loader->add_action( 'wp_ajax_createNewSoundsFromFolderSubmit', $plugin_post_creator, 'createNewSoundsFromFolderSubmit' );
        $this->loader->add_action( 'wp_ajax_createNewSoundSubmit', $plugin_post_creator, 'createNewSoundSubmit' );
        $this->loader->add_action( 'wp_ajax_create_post', $plugin_post_creator, 'createPost' );
        $this->loader->add_action( 'wp_ajax_uploader_callback',$plugin_post_creator, 'uploaderCallback' );
        $this->loader->add_action('wp_ajax_get_songs', $frontend_link, 'getSongs');
        $this->loader->add_action('wp_ajax_nopriv_get_songs', $frontend_link, 'getSongs');
        $this->loader->add_action( 'wp_head', $frontend_link, 'add_ajax_library'  );


        $this->loader->add_action( 'manage_edit-'.$this->custom_post_type.'_columns', $plugin_admin, 'edit_columns' );
        $this->loader->add_action( 'manage_'.$this->custom_post_type.'_posts_custom_column', $plugin_admin, 'manage_column',10,2 );
        $this->loader->add_action( 'manage_edit-'.$this->custom_post_type.'_sortable_columns', $plugin_admin, 'edit_sortable_columns' );
        $this->loader->add_action( 'pre_get_posts', $plugin_admin, 'edit_sort_orderby', 1 );


    }

	/**
	 * Register all of the hooks related to the public-facing functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_public_hooks() {

		 $plugin_public = new Speak_Sound_Library_Public( $this->get_plugin_name(), $this->get_version() );

		 $this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_styles' );
		 $this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_scripts' );

	}

	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 *
	 * @since    1.0.0
	 */
	public function run() {
		$this->loader->run();
	}

	/**
	 * The name of the plugin used to uniquely identify it within the context of
	 * WordPress and to define internationalization functionality.
	 *
	 * @since     1.0.0
	 * @return    string    The name of the plugin.
	 */
	public function get_plugin_name() {
		return $this->plugin_name;
	}

	/**
	 * The reference to the class that orchestrates the hooks with the plugin.
	 *
	 * @since     1.0.0
	 * @return    Speak_Sound_Library_Loader    Orchestrates the hooks of the plugin.
	 */
	public function get_loader() {
		return $this->loader;
	}

	/**
	 * Retrieve the version number of the plugin.
	 *
	 * @since     1.0.0
	 * @return    string    The version number of the plugin.
	 */
	public function get_version() {
		return $this->version;
	}

}
