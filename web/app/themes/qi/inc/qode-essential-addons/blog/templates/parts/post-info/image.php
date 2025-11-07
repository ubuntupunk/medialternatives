<?php if ( has_post_thumbnail() ) { ?>
	<div class="qodef-e-media-image">
		<a itemprop="url" href="<?php the_permalink(); ?>">
			<?php the_post_thumbnail( 'full' ); ?>
		</a>
		<?php
		// Hook to include additional content after blog post featured image
		do_action( 'qi_action_after_post_thumbnail_image' );
		?>
	</div>
<?php } ?>
