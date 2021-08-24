<?php
/**
 * Recommended way to include parent theme styles.
 * (Please see http://codex.wordpress.org/Child_Themes#How_to_Create_a_Child_Theme)
 *
 */  

add_action( 'wp_enqueue_scripts', 'blaskan_child_style' );
				function blaskan_child_style() {
					wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );
					wp_enqueue_style( 'child-style', get_stylesheet_directory_uri() . '/style.css', array('parent-style') );
				}

/**
 * Your code goes below.
 */

function ns_google_analytics() { ?>
	<script async src="https://www.googletagmanager.com/gtag/js?id=G-CZNQG5YM3Z"></script>
		<script>
		  window.dataLayer = window.dataLayer || [];
		  function gtag(){dataLayer.push(arguments);}
		  gtag('js', new Date());

		  gtag('config', 'G-CZNQG5YM3Z');
		</script>
	<?php
}

add_action( 'wp_head', 'ns_google_analytics', 10 );

/* This snippet will enable you to add shortcodes in widget areas */
add_filter('widget_text', 'do_shortcode');

/* add author excerpt function */
function author_excerpt (){	                     					
	$word_limit = 20; // Limit the number of words
	$more_txt = 'read more about:'; // The read more text
	$txt_end = '...'; // Display text end 
	$authorName = get_the_author();
	$authorUrl = get_author_posts_url( get_the_author_meta('ID'));
	$authorDescription = explode(" ", 
get_the_author_meta('description'));
	$displayAuthorPageLink = count($authorDescription) > $word_limit 
? $txt_end.' '.$more_txt.' <a href="'.$authorUrl.'">'.$authorName.'</a>' 
: '' ;
	$authorDescriptionShort = array_slice($authorDescription, 0, 
($word_limit));
	return (implode($authorDescriptionShort, ' 
')).$displayAuthorPageLink; 		
}

/* show a list of the most popular WordPress post by post read count */
function count_post_visits() {
	if( is_single() ) {
		global $post;
		$views = get_post_meta( $post->ID, 'my_post_viewed', 
true );
		if( $views == '' ) {
			update_post_meta( $post->ID, 'my_post_viewed', 
'1' );	
		} else {
			$views_no = intval( $views );
			update_post_meta( $post->ID, 'my_post_viewed', 
++$views_no );
		}
	}
}
add_action( 'wp_head', 'count_post_visits' );
