<?php

if ( ! function_exists( 'qi_get_sidebar_name' ) ) {
	/**
	 * Function that return sidebar name
	 *
	 * @return string
	 */
	function qi_get_sidebar_name() {
		return apply_filters( 'qi_filter_sidebar_name', 'main-sidebar' );
	}
}

if ( ! function_exists( 'qi_get_sidebar_layout' ) ) {
	/**
	 * Function that return sidebar layout
	 *
	 * @return string
	 */
	function qi_get_sidebar_layout() {
		$sidebar_layout = apply_filters( 'qi_filter_sidebar_layout', 'no-sidebar' );

		if ( 'no-sidebar' !== $sidebar_layout && ! is_active_sidebar( qi_get_sidebar_name() ) ) {
			$sidebar_layout = 'no-sidebar';
		}

		return $sidebar_layout;
	}
}

if ( ! function_exists( 'qi_get_page_content_sidebar_classes' ) ) {
	/**
	 * Function that return classes for the page content when sidebar is enabled
	 *
	 * @return string
	 */
	function qi_get_page_content_sidebar_classes() {
		$layout  = qi_get_sidebar_layout();
		$classes = array( 'qodef-page-content-section' );

		switch ( $layout ) {
			case 'sidebar-33-right':
				$classes[] = 'qodef-col--8';
				break;
			case 'sidebar-25-right':
				$classes[] = 'qodef-col--9';
				break;
			case 'sidebar-33-left':
				$classes[] = 'qodef-col--8';
				$classes[] = 'qodef-col-push--4';
				break;
			case 'sidebar-25-left':
				$classes[] = 'qodef-col--9';
				$classes[] = 'qodef-col-push--3';
				break;
			default:
				$classes[] = 'qodef-col--12';
				break;
		}

		return implode( ' ', apply_filters( 'qi_filter_page_content_sidebar_classes', $classes, $layout ) );
	}
}

if ( ! function_exists( 'qi_get_page_sidebar_classes' ) ) {
	/**
	 * Function that return classes for the page sidebar when sidebar is enabled
	 *
	 * @return string
	 */
	function qi_get_page_sidebar_classes() {
		$layout  = qi_get_sidebar_layout();
		$classes = array( 'qodef-page-sidebar-section' );

		switch ( $layout ) {
			case 'sidebar-33-right':
				$classes[] = 'qodef-col--4';
				break;
			case 'sidebar-25-right':
				$classes[] = 'qodef-col--3';
				break;
			case 'sidebar-33-left':
				$classes[] = 'qodef-col--4';
				$classes[] = 'qodef-col-pull--8';
				break;
			case 'sidebar-25-left':
				$classes[] = 'qodef-col--3';
				$classes[] = 'qodef-col-pull--9';
				break;
		}

		return implode( ' ', apply_filters( 'qi_filter_page_sidebar_classes', $classes, $layout ) );
	}
}

if ( ! function_exists( 'qi_modify_sidebar_config' ) ) {
	/**
	 * Function that return classes for the page sidebar when sidebar is enabled
	 *
	 * @param array $config - default plugin sidebar config
	 *
	 * @return array
	 */
	function qi_modify_sidebar_config( $config ) {
		$config['title_tag'] = 'h5';

		return $config;
	}

	add_filter( 'qode_essential_addons_filter_main_sidebar_config', 'qi_modify_sidebar_config' );
}
