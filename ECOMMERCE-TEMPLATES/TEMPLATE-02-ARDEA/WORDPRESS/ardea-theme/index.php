<?php
/**
 * Fallback template — required by WordPress. Rarely hit directly since
 * front-page.php, archive.php, single.php, page.php and search.php cover
 * the theme's real templates, but kept on-brand for any query WordPress
 * can't otherwise resolve.
 *
 * @package Ardea
 */

get_header();
?>
<main id="main">
	<section class="page-hero container">
		<h1 class="page-hero__title"><?php esc_html_e( 'Latest', 'ardea' ); ?></h1>
	</section>

	<div class="container section--tight page-content-wrap">
		<?php if ( have_posts() ) : ?>
			<div class="archive-grid">
				<?php
				while ( have_posts() ) :
					the_post();
					?>
					<article <?php post_class( 'archive-card' ); ?>>
						<h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
						<p class="single-post-meta"><?php echo esc_html( get_the_date() ); ?></p>
						<div class="entry-content"><?php echo wp_kses_post( ardea_excerpt() ); ?></div>
					</article>
				<?php endwhile; ?>
			</div>
			<?php the_posts_pagination( array( 'mid_size' => 2 ) ); ?>
		<?php else : ?>
			<div class="no-results">
				<h2><?php esc_html_e( 'Nothing found', 'ardea' ); ?></h2>
			</div>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
