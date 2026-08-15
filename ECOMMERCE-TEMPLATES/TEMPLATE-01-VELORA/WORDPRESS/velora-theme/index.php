<?php
/**
 * Fallback template — required by WordPress. Rarely hit directly since
 * front-page.php, archive.php, single.php, page.php and search.php cover
 * the theme's real templates, but kept on-brand for any query WordPress
 * can't otherwise resolve.
 *
 * @package Velora
 */

get_header();
?>
<main id="main">
	<div class="page-band">
		<div class="container">
			<h1><?php esc_html_e( 'Latest', 'velora' ); ?></h1>
		</div>
	</div>
	<div class="page-content-wrap">
		<div class="container">
			<?php if ( have_posts() ) : ?>
				<div class="archive-grid">
					<?php
					while ( have_posts() ) :
						the_post();
						?>
						<article <?php post_class( 'archive-card' ); ?>>
							<h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
							<p class="single-post-meta"><?php echo esc_html( get_the_date() ); ?></p>
							<div class="entry-content"><?php echo wp_kses_post( velora_excerpt() ); ?></div>
						</article>
						<?php
					endwhile;
					the_posts_pagination();
				else :
					?>
					<div class="no-results">
						<h2><?php esc_html_e( 'Nothing found', 'velora' ); ?></h2>
					</div>
					<?php
				endif;
				?>
		</div>
	</div>
</main>
<?php
get_footer();
