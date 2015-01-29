<?php

/**
 *
 * @link              http://www.speakstudioscoop.com
 * @since             1.0.0
 * @package           Speak Player
 *
 * @wordpress-plugin
 * Plugin Name:       Speak Player
 * Plugin URI:        http://www.speakstudioscoop.com
 * Description:       This plugin allows you to manage sounds and display them with a frontend HTML5 player.
 * Version:           1.0.0
 * Author:            Michael Crivello and Vince Cimo
 * Author URI:        http://www.vincentcimo.com/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       speak-player
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

 /**
  * The code that runs during plugin activation.
  * This action is documented in includes/class-plugin-name-activator.php
  */
 function activate_speak_player() {
 	require_once plugin_dir_path( __FILE__ ) . 'includes/class-speak-player-activator.php';
 	Speak_Player_Activator::activate();
 }

// *
//  * The code that runs during plugin deactivation.
//  * This action is documented in includes/class-plugin-name-deactivator.php
 
// function deactivate_plugin_name() {
// 	require_once plugin_dir_path( __FILE__ ) . 'includes/class-plugin-name-deactivator.php';
// 	Speak_Player_Deactivator::deactivate();
// }

 register_activation_hook( __FILE__, 'activate_speak_player' );
// register_deactivation_hook( __FILE__, 'deactivate_plugin_name' );

/**
 * The core plugin class that is used to define internationalization,
 * dashboard-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-speak-player.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_plugin_name() {

	$plugin = new Speak_Player();
	$plugin->run();

}
run_plugin_name();
