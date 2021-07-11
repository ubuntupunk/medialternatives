<article <?php post_class( $item_classes ); ?>>
	<div class="qodef-e-inner">
		<?php
		// Include post format part
		qi_template_part( 'blog', 'templates/parts/post-format/link', '', array( 'title_tag' => is_singular( 'post' ) ? 'h4' : 'h3' ) );
		?>
	</div>
</article>
