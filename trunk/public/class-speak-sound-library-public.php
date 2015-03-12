<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       http://www.speakstudioscoop.com
 * @since      1.0.0
 *
 * @package    Speak_Sound_Library
 * @subpackage Speak_Sound_Library/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the dashboard-specific stylesheet and JavaScript.
 *
 * @package    Speak_Sound_Library
 * @subpackage Speak_Sound_Library/public
 * @author     Vince Cimo <vince.cimo@gmail.com>
 */
class Speak_Sound_Library_Public {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $speak_sound_library    The ID of this plugin.
	 */
	private $speak_sound_library;

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
	 * @var      string    $speak_sound_library       The name of the plugin.
	 * @var      string    $version    The version of this plugin.
	 */
	public function __construct( $speak_sound_library, $version ) {

		$this->speak_sound_library = $speak_sound_library;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
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

		wp_enqueue_style( $this->speak_sound_library, plugin_dir_url( __FILE__ ) . 'css/speaksound_library-public.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
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
        wp_enqueue_script( 'underscore', plugin_dir_url( __FILE__ ) . 'js/underscore.js', array( 'jquery' ), $this->version, true );

        wp_enqueue_script( 'backbone', plugin_dir_url( __FILE__ ) . 'js/backbone.js', array( 'jquery' ), $this->version, true );

        wp_enqueue_script( 'marionette', plugin_dir_url( __FILE__ ) . 'js/backbone.marionette.js', array( 'jquery' ), $this->version, true );
        wp_enqueue_script( 'radio', plugin_dir_url( __FILE__ ) . 'js/backbone.radio.js', array( 'jquery' ), $this->version, true );

        wp_enqueue_script( 'radioshim', plugin_dir_url( __FILE__ ) . 'js/radio.shim.js', array( 'jquery' ), $this->version, true );

        wp_enqueue_script( 'handlebars', plugin_dir_url( __FILE__ ) . 'js/handlebars.runtime-v3.0.0.js', array( 'jquery' ), $this->version, true );
        wp_enqueue_script( 'handlebars_templates', plugin_dir_url( __FILE__ ) . 'js/renderedTemplates.js', array( 'jquery' ), $this->version, true );


        wp_enqueue_script('jquery-ui-sortable');
        wp_enqueue_script('jquery-ui-tabs');
        wp_enqueue_script('jquery-ui-slider');
        wp_enqueue_script('jquery-ui-tooltip');
        wp_enqueue_script('custom-scrollbar');
        wp_enqueue_script('sketch');

        wp_enqueue_script( $this->speak_sound_library, plugin_dir_url( __FILE__ ) . 'js/speak_sound_library-public.js', array( 'jquery' ), $this->version, true );

	}

}
