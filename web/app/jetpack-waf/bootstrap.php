<?php
define( 'DISABLE_JETPACK_WAF', false );
if ( defined( 'DISABLE_JETPACK_WAF' ) && DISABLE_JETPACK_WAF ) return;
define( 'JETPACK_WAF_MODE', 'silent' );
define( 'JETPACK_WAF_SHARE_DATA', false );
define( 'JETPACK_WAF_SHARE_DEBUG_DATA', false );
define( 'JETPACK_WAF_DIR', '/home/sexthera/public_html/medialternatives.com/bedrock/web/app/jetpack-waf' );
define( 'JETPACK_WAF_WPCONFIG', '/home/sexthera/public_html/medialternatives.com/bedrock/web/app/../wp-config.php' );
require_once '/home/sexthera/public_html/medialternatives.com/bedrock/web/app/plugins/jetpack/vendor/autoload.php';
Automattic\Jetpack\Waf\Waf_Runner::initialize();
