<?php
/**
 * "Shop by Category" section — pulls REAL WooCommerce top-level product
 * categories (ordered by menu_order, capped at 5 to match the demo's
 * icon-forward 5-tile .category-grid). Nothing here is a hardcoded
 * category name; a store with fewer categories simply renders fewer
 * tiles. Icon choice: the term's own thumbnail if a merchant has set one,
 * else a slug-matched icon from assets/images/ (icon-audio/icon-phone/
 * icon-laptop/icon-home/icon-watch.svg — copied verbatim from the demo),
 * else a generic package icon so a new category never renders blank.
 *
 * @package Modix
 */

if ( ! class_exists( 'WooCommerce' ) ) {
	return;
}

$modix_cats = get_terms(
	array(
		'taxonomy'   => 'product_cat',
		'hide_empty' => true,
		'parent'     => 0,
		'orderby'    => 'menu_order',
		'order'      => 'ASC',
		'number'     => 5,
	)
);

if ( is_wp_error( $modix_cats ) || empty( $modix_cats ) ) {
	return;
}

function modix_category_icon_url( $term ) {
	$thumbnail_id = get_term_meta( $term->term_id, 'thumbnail_id', true );
	if ( $thumbnail_id ) {
		$src = wp_get_attachment_image_url( $thumbnail_id, 'thumbnail' );
		if ( $src ) {
			return $src;
		}
	}
	$slug_icon_map = array(
		'audio'        => 'icon-audio.svg',
		'smartphones'  => 'icon-phone.svg',
		'laptops'      => 'icon-laptop.svg',
		'smart-home'   => 'icon-home.svg',
		'wearables'    => 'icon-watch.svg',
	);
	if ( isset( $slug_icon_map[ $term->slug ] ) ) {
		return MODIX_URI . '/assets/images/' . $slug_icon_map[ $term->slug ];
	}
	return MODIX_URI . '/assets/images/icon-phone.svg';
}
?>
<section class="section" data-reveal>
	<div class="container">
		<div class="section-header">
			<div class="section-header__text">
				<span class="eyebrow"><?php esc_html_e( 'Shop by Category', 'modix' ); ?></span>
				<h2><?php esc_html_e( 'Everything you need, engineered together', 'modix' ); ?></h2>
				<p><?php esc_html_e( 'Product families designed to work as one connected system, from your pocket to your living room.', 'modix' ); ?></p>
			</div>
		</div>
		<div class="category-grid">
			<?php foreach ( $modix_cats as $modix_cat ) : ?>
				<a class="category-card" href="<?php echo esc_url( get_term_link( $modix_cat ) ); ?>">
					<div class="category-card__icon"><img src="<?php echo esc_url( modix_category_icon_url( $modix_cat ) ); ?>" alt="" width="30" height="30"></div>
					<h3><?php echo esc_html( $modix_cat->name ); ?></h3>
					<span><?php echo esc_html( sprintf( _n( '%d Product', '%d Products', $modix_cat->count, 'modix' ), $modix_cat->count ) ); ?></span>
				</a>
			<?php endforeach; ?>
		</div>
	</div>
</section>
