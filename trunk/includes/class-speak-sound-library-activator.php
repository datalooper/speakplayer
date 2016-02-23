<?php

/**
 * Fired during plugin activation
 *
 * @link       http://example.com
 * @since      1.0.0
 *
 * @package    Speak_Sound_Library
 * @subpackage Speak_Sound_Library/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    Speak_Sound_Library
 * @subpackage Speak_Sound_Library/includes
 * @author     Your Name <email@example.com>
 */
class Speak_Sound_Library_Activator
{

    /**
     * Short Description. (use period)
     *
     * Long Description.
     *
     * @since    1.0.0
     */
    public static function activate()
    {
        global $wpdb;
        global $jal_db_version;
        $jal_db_version = '1.0';
        $table_name = $wpdb->prefix . 'sound_library';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
		id mediumint(9) NOT NULL AUTO_INCREMENT,
		name tinytext NOT NULL,
		numplays INT(10) DEFAULT 0,
		downloadable bit DEFAULT 0,
		price FLOAT(4, 2) DEFAULT 0,
		UNIQUE KEY id (id)
	) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);

        add_option('jal_db_version', $jal_db_version);




    }

}
