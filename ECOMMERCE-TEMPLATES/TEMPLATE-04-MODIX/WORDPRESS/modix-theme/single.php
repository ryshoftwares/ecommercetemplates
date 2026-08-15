<?php
/**
 * Blog single post — minimal, on-brand. Product single is handled
 * entirely by WooCommerce's own single-product.php (hook-restyled, see
 * inc/woocommerce.php), so this template only ever renders standard
 * WordPress `post` content.
 *
 * @package Modix
 */

get_header();
?>
<main id="main">
	<div class="container">
		<nav class="breadcrumb" aria-label="<?php esc_attr_e( 'Breadcrumb', 'modix' ); ?>">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'modix' ); ?></a><span class="breadcrumb__sep">/</span>
			<span class="breadcrumb__current"><?php the_title(); ?></span>
		</nav>
	</div>

	<div class="container section">
		<?php
		while ( have_posts() ) :
			the_post();
			?>
			<article <?php post_class( 'entry-content' ); ?> style="max-width:760px;">
				<header style="margin-bottom:24px;">
					<h1><?php the_title(); ?></h1>
					<p class="form-hint" style="margin-top:8px;">
						<?php
						echo esc_html( get_the_date() );
						$modix_author = get_the_author();
						if ( $modix_author ) {
							echo ' · ' . esc_html( $modix_author ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						}
						?>
					</p>
				</header>

				<?php if ( has_post_thumbnail() ) : ?>
					<figure style="margin-bottom:32px;"><?php the_post_thumbnail( 'large', array( 'style' => 'border-radius:var(--radius-lg);width:100%;' ) ); ?></figure>
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
