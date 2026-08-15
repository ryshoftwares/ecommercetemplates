<?php
/**
 * Homepage hero — fully customizer-editable (Customize → Homepage Hero),
 * with defaults matching the NOAÉ demo's real copy: eyebrow, single-line
 * "YOUR DAILY RITUAL" heading, subheading, primary/secondary CTAs, and the
 * two soft organic blobs behind the product-imagery media column.
 *
 * @package Noae
 */

$eyebrow    = get_theme_mod( 'noae_hero_eyebrow', 'Ingredient-Forward Beauty' );
$heading    = get_theme_mod( 'noae_hero_heading', 'YOUR DAILY RITUAL' );
$subheading = get_theme_mod( 'noae_hero_subheading', "Skin-first formulas with visible-ingredient honesty, built into a five-minute morning and night ritual you'll actually look forward to." );
$cta_text   = get_theme_mod( 'noae_hero_cta_text', 'Shop Bestsellers' );
$cta_link   = get_theme_mod( 'noae_hero_cta_link', '' );
$cta2_text  = get_theme_mod( 'noae_hero_cta2_text', 'Take the Skin Quiz' );
$cta2_link  = get_theme_mod( 'noae_hero_cta2_link', '#skin-quiz' );
$image      = get_theme_mod( 'noae_hero_image', NOAE_URI . '/assets/images/noae-hero-daily-ritual.svg' );

if ( ! $cta_link ) {
	$cta_link = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
}
?>
<section class="noae-hero">
	<div class="noae-blob noae-blob--rose noae-hero__blob-1"></div>
	<div class="noae-blob noae-blob--sage noae-hero__blob-2"></div>
	<div class="noae-container noae-hero__inner">
		<div>
			<?php if ( $eyebrow ) : ?><p class="noae-hero__eyebrow"><?php echo esc_html( $eyebrow ); ?></p><?php endif; ?>
			<h1 class="noae-hero__title"><?php echo esc_html( $heading ); ?></h1>
			<?php if ( $subheading ) : ?><p class="noae-hero__desc"><?php echo esc_html( $subheading ); ?></p><?php endif; ?>
			<div class="noae-hero__ctas">
				<?php if ( $cta_text ) : ?><a href="<?php echo esc_url( $cta_link ); ?>" class="noae-btn noae-btn--primary"><?php echo esc_html( $cta_text ); ?></a><?php endif; ?>
				<?php if ( $cta2_text ) : ?><a href="<?php echo esc_url( $cta2_link ); ?>" class="noae-btn noae-btn--outline"><?php echo esc_html( $cta2_text ); ?></a><?php endif; ?>
			</div>
		</div>
		<div class="noae-hero__media">
			<img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) . ' — ' . $heading ); ?>" width="800" height="550" fetchpriority="high">
		</div>
	</div>
</section>
