<?php

if ( ! class_exists( 'Qi_Theme_Upgrade' ) ) {
	class Qi_Theme_Upgrade {
		/**
		 * @var $instance Qi_Theme_Upgrade current class
		 */
		private static $instance;

		private $api_uri = 'https://api.qodeinteractive.com/theme-auto-update.php';
		private $theme;

		/**
		 * @return Qi_Theme_Upgrade
		 */
		public static function get_instance() {
			if ( is_null( self::$instance ) ) {
				self::$instance = new self();
			}

			return self::$instance;
		}

		function __construct() {
			$this->theme = 'qi';

			add_filter( 'pre_set_site_transient_update_themes', array( $this, 'check_for_update' ) );

		}

		public function check_for_update( $transient ) {

			if ( empty( $transient ) ) {
				return $transient;
			}

			$theme_response = $this->api_request();

			if ( false !== $theme_response ) {

				if ( version_compare( $theme_response['new_version'], $this->get_current_theme_verison(), '>' ) ) {
					$transient->response[ $this->theme ] = $theme_response;
				}
			}

			return $transient;

		}

		function get_current_theme_verison() {
			if ( function_exists( 'wp_get_theme' ) ) {
				$theme = wp_get_theme( $this->theme );

				return $theme->get( 'Version' );
			}
		}

		function api_request() {

			$url = add_query_arg(
				array(
					'theme'    => $this->theme,
					'demo_url' => esc_url( get_site_url() ),
				),
				$this->api_uri
			);

			$response = wp_remote_get(
				$url,
				array(
					'user-agent' => 'WordPress/' . get_bloginfo( 'version' ) . '; ' . esc_url( home_url( '/' ) ),
					'timeout'    => 300,
				)
			);

			if ( is_wp_error( $response ) ) {
				return $response;
			}

			$code = wp_remote_retrieve_response_code( $response );

			if ( 200 === $code ) {
				$body         = wp_remote_retrieve_body( $response );
				$body_decoded = json_decode( $body, true );

				if ( ! empty( $body_decoded ) || is_array( $body_decoded ) ) {
					return $body_decoded;
				}
			}

			return false;

		}
	}

	Qi_Theme_Upgrade::get_instance();
}
