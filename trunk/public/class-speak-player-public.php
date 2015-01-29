<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       http://www.speakstudioscoop.com
 * @since      1.0.0
 *
 * @package    Speak_Player
 * @subpackage Speak_Player/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the dashboard-specific stylesheet and JavaScript.
 *
 * @package    Speak_Player
 * @subpackage Speak_Player/public
 * @author     Vince Cimo <vince.cimo@gmail.com>
 */
class Speak_Player_Public {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $speak_player    The ID of this plugin.
	 */
	private $speak_player;

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
	 * @var      string    $speak_player       The name of the plugin.
	 * @var      string    $version    The version of this plugin.
	 */
	public function __construct( $speak_player, $version ) {

		$this->speak_player = $speak_player;
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
		 * defined in Speak_Player_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Speak_Player_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style( $this->speak_player, plugin_dir_url( __FILE__ ) . 'css/speakplayer-public.css', array(), $this->version, 'all' );

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
		 * defined in Speak_Player_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Speak_Player_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_script( $this->speak_player, plugin_dir_url( __FILE__ ) . 'js/speakplayer-public.js', array( 'jquery' ), $this->version, false );

	}

}
