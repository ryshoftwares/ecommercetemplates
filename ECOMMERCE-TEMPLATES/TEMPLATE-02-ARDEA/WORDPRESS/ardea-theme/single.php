<?php
/**
 * Blog single post — minimal, on-brand. Product single is handled
 * entirely by WooCommerce's own single-product.php (hook-restyled, see
 * inc/woocommerce.php), so this template only ever renders standard
 * WordPress `post` content.
 *
 * @package Ardea
 */

get_header();
?>
<main id="main">
	<nav class="breadcrumbs container" aria-label="<?php esc_attr_e( 'Breadcrumb', 'ardea' ); ?>">
		<ol>
			<li><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'ardea' ); ?></a></li>
			<li aria-current="page"><?php the_title(); ?></li>
		</ol>
	</nav>

	<div class="container section--tight page-content-wrap">
		<?php
		while ( have_posts() ) :
			the_post();
			?>
			<article <?php post_class( 'entry-content' ); ?> style="max-width:760px;">
				<header>
					<h1><?php the_title(); ?></h1>
					<p class="single-post-meta">
						<?php
						echo esc_html( get_the_date() );
						$ardea_author = get_the_author();
						if ( $ardea_author ) {
							echo ' &middot; ' . esc_html( $ardea_author ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						}
						?>
					</p>
				</header>

				<?php if ( has_post_thumbnail() ) : ?>
					<figure>
						<?php the_post_thumbnail( 'large', array( 'style' => 'border-radius:var(--radius-lg);width:100%;' ) ); ?>
					</figure>
				<?php endif; ?>

				<?php the_content(); ?>
			</article>

			<?php
			if ( comments_open() || get_comments_number() ) :
				comments_template();
			endif;
		endwhile;
		?>
	</div>
</main>
<?php
get_footer();
