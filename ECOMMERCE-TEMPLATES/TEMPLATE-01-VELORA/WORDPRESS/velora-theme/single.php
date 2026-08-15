<?php
/**
 * Blog single post — minimal, on-brand. Product single is handled
 * entirely by WooCommerce's own single-product.php (hook-restyled, see
 * inc/woocommerce.php), so this template only ever renders standard
 * WordPress `post` content.
 *
 * @package Velora
 */

get_header();
?>
<main id="main">
	<div class="page-band">
		<div class="container">
			<div class="breadcrumb">
				<ol>
					<li><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'velora' ); ?></a></li>
					<li aria-current="page"><?php the_title(); ?></li>
				</ol>
			</div>
		</div>
	</div>

	<div class="page-content-wrap">
		<div class="container">
			<?php
			while ( have_posts() ) :
				the_post();
				?>
				<article <?php post_class(); ?>>
					<header class="single-post-header">
						<h1><?php the_title(); ?></h1>
						<p class="single-post-meta">
							<?php
							echo esc_html( get_the_date() );
							$author = get_the_author();
							if ( $author ) {
								echo ' &middot; ' . esc_html( $author ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							}
							?>
						</p>
					</header>

					<?php if ( has_post_thumbnail() ) : ?>
						<figure class="single-post-thumb">
							<?php the_post_thumbnail( 'large' ); ?>
						</figure>
					<?php endif; ?>

					<div class="entry-content">
						<?php the_content(); ?>
					</div>
				</article>

				<?php
				if ( comments_open() || get_comments_number() ) :
					comments_template();
				endif;
			endwhile;
			?>
		</div>
	</div>
</main>
<?php
get_footer();
