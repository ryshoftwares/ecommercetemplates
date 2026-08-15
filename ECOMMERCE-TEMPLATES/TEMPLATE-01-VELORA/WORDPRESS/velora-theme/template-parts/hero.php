<?php
/**
 * Homepage hero — fully customizer-editable (Customize → Homepage Hero),
 * with defaults matching the demo's real copy.
 *
 * @package Velora
 */

$eyebrow    = get_theme_mod( 'velora_hero_eyebrow', 'Autumn / Winter Collection' );
$heading    = get_theme_mod( 'velora_hero_heading', 'THE NEW SEASON' );
$subheading = get_theme_mod( 'velora_hero_subheading', 'Tailored silhouettes, natural fibres, and considered colour — a collection built for women who dress with intention, not for trends that fade by spring.' );
$cta_text   = get_theme_mod( 'velora_hero_cta_text', 'Shop New Arrivals' );
$cta_link   = get_theme_mod( 'velora_hero_cta_link', '' );
$cta2_text  = get_theme_mod( 'velora_hero_cta2_text', 'Explore Lookbook' );
$cta2_link  = get_theme_mod( 'velora_hero_cta2_link', '' );
$image      = get_theme_mod( 'velora_hero_image', VELORA_URI . '/assets/images/velora-hero-new-season.svg' );

if ( ! $cta_link ) {
	$cta_link = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
}
if ( ! $cta2_link ) {
	$about = get_page_by_path( 'about' );
	$cta2_link = $about ? get_permalink( $about ) : home_url( '/about/' );
}
?>
<section class="hero">
	<div class="hero-content">
		<?php if ( $eyebrow ) : ?><p class="eyebrow"><?php echo esc_html( $eyebrow ); ?></p><?php endif; ?>
		<h1><?php echo esc_html( $heading ); ?></h1>
		<?php if ( $subheading ) : ?><p class="lede"><?php echo esc_html( $subheading ); ?></p><?php endif; ?>
		<div class="hero-cta-group">
			<?php if ( $cta_text ) : ?><a href="<?php echo esc_url( $cta_link ); ?>" class="btn btn-primary"><?php echo esc_html( $cta_text ); ?></a><?php endif; ?>
			<?php if ( $cta2_text ) : ?><a href="<?php echo esc_url( $cta2_link ); ?>" class="btn btn-outline"><?php echo esc_html( $cta2_text ); ?></a><?php endif; ?>
		</div>
	</div>
	<div class="hero-media">
		<img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) . ' — ' . $heading ); ?>" width="1200" height="1500" fetchpriority="high">
	</div>
</section>
