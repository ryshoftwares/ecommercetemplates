<?php
/**
 * Homepage hero — fully customizer-editable (Customize → Homepage Hero),
 * with defaults matching the ARDEA demo's real copy. The two-line stacked
 * heading and the small floating media caption both mirror index.html's
 * `.hero__title .line` / `.hero__media-tag` markup exactly.
 *
 * @package Ardea
 */

$eyebrow    = get_theme_mod( 'ardea_hero_eyebrow', 'Ardea — Autumn Collection' );
$line1      = get_theme_mod( 'ardea_hero_heading_line1', 'DESIGNED' );
$line2      = get_theme_mod( 'ardea_hero_heading_line2', 'FOR LIVING' );
$subheading = get_theme_mod( 'ardea_hero_subheading', 'Solid oak, walnut and stone furniture, hand-finished in small batches and built to be repaired, re-covered and passed on — not replaced every few years.' );
$tag_title  = get_theme_mod( 'ardea_hero_tag_title', 'Handcrafted in Small Batches' );
$tag_text   = get_theme_mod( 'ardea_hero_tag_text', 'Solid oak, walnut and natural stone, finished entirely by hand.' );
$cta_text   = get_theme_mod( 'ardea_hero_cta_text', 'Shop Collections' );
$cta_link   = get_theme_mod( 'ardea_hero_cta_link', '' );
$cta2_text  = get_theme_mod( 'ardea_hero_cta2_text', 'Explore Our Story' );
$cta2_link  = get_theme_mod( 'ardea_hero_cta2_link', '' );
$image      = get_theme_mod( 'ardea_hero_image', ARDEA_URI . '/assets/images/ardea-hero-designed-for-living.svg' );

if ( ! $cta_link ) {
	$cta_link = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
}
if ( ! $cta2_link ) {
	$about    = get_page_by_path( 'about' );
	$cta2_link = $about ? get_permalink( $about ) : home_url( '/about/' );
}
?>
<section class="hero container">
	<div class="hero__grid">
		<div class="hero__content">
			<?php if ( $eyebrow ) : ?><p class="eyebrow"><?php echo esc_html( $eyebrow ); ?></p><?php endif; ?>
			<h1 class="hero__title">
				<?php if ( $line1 ) : ?><span class="line"><?php echo esc_html( $line1 ); ?></span><?php endif; ?>
				<?php if ( $line2 ) : ?><span class="line"><?php echo esc_html( $line2 ); ?></span><?php endif; ?>
			</h1>
			<?php if ( $subheading ) : ?><p class="hero__lead lead"><?php echo esc_html( $subheading ); ?></p><?php endif; ?>
			<div class="hero__ctas">
				<?php if ( $cta_text ) : ?><a href="<?php echo esc_url( $cta_link ); ?>" class="btn btn--primary"><?php echo esc_html( $cta_text ); ?></a><?php endif; ?>
				<?php if ( $cta2_text ) : ?><a href="<?php echo esc_url( $cta2_link ); ?>" class="btn btn--ghost"><?php echo esc_html( $cta2_text ); ?></a><?php endif; ?>
			</div>
		</div>
		<div class="hero__media">
			<img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) . ' — ' . $line1 . ' ' . $line2 ); ?>" width="900" height="1125" fetchpriority="high">
			<?php if ( $tag_title || $tag_text ) : ?>
				<div class="hero__media-tag">
					<?php if ( $tag_title ) : ?><strong><?php echo esc_html( $tag_title ); ?></strong><?php endif; ?>
					<?php if ( $tag_text ) : ?><p><?php echo esc_html( $tag_text ); ?></p><?php endif; ?>
				</div>
			<?php endif; ?>
		</div>
	</div>
	<div class="hero__scroll-cue"><span class="line"></span> <?php esc_html_e( 'Scroll to explore', 'ardea' ); ?></div>
</section>
