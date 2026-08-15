<?php
/**
 * Blog single post — minimal, on-brand. Product single is handled
 * entirely by WooCommerce's own single-product.php (hook-restyled, see
 * inc/woocommerce.php), so this template only ever renders standard
 * WordPress `post` content.
 *
 * @package Noae
 */

get_header();
?>
<main id="main">
	<nav class="noae-container noae-breadcrumb" aria-label="<?php esc_attr_e( 'Breadcrumb', 'noae' ); ?>">
		<ol>
			<li><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'noae' ); ?></a></li>
			<li aria-current="page"><?php the_title(); ?></li>
		</ol>
	</nav>

	<div class="noae-container" style="padding-bottom: var(--space-9);">
		<?php
		while ( have_posts() ) :
			the_post();
			?>
			<article <?php post_class(); ?> style="max-width:760px;margin:0 auto;">
				<header style="margin-bottom:var(--space-5);">
					<h1><?php the_title(); ?></h1>
					<p style="font-size:0.85rem;color:var(--color-plum-soft);">
						<?php
						echo esc_html( get_the_date() );
						$noae_author = get_the_author();
						if ( $noae_author ) {
							echo ' &middot; ' . esc_html( $noae_author ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						}
						?>
					</p>
				</header>

				<?php if ( has_post_thumbnail() ) : ?>
					<figure style="margin-bottom:var(--space-5);">
						<?php the_post_thumbnail( 'large', array( 'style' => 'border-radius:var(--radius-lg);width:100%;height:auto;' ) ); ?>
					</figure>
				<?php endif; ?>

				<div class="entry-content"><?php the_content(); ?></div>
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
