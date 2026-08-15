<?php
/**
 * "Shop by Room" section — pulls REAL WooCommerce top-level product
 * categories (ordered by menu_order, capped at 5 to match the demo's
 * asymmetric 5-tile .room-grid bento layout). Nothing here is a
 * hardcoded room/category name; a store with fewer categories simply
 * renders fewer tiles (the CSS grid degrades gracefully at each
 * breakpoint already defined in assets/css/responsive.css).
 *
 * @package Ardea
 */

if ( ! class_exists( 'WooCommerce' ) ) {
	return;
}

$ardea_rooms = get_terms(
	array(
		'taxonomy'   => 'product_cat',
		'hide_empty' => true,
		'parent'     => 0,
		'orderby'    => 'menu_order',
		'order'      => 'ASC',
		'number'     => 5,
	)
);

if ( is_wp_error( $ardea_rooms ) || empty( $ardea_rooms ) ) {
	return;
}
?>
<section class="section container">
	<div class="section-head">
		<div class="section-head__text">
			<p class="eyebrow"><?php esc_html_e( 'Shop by Room', 'ardea' ); ?></p>
			<h2><?php esc_html_e( 'Furniture that fits how you actually live', 'ardea' ); ?></h2>
		</div>
		<a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn--outline"><?php esc_html_e( 'View All Collections', 'ardea' ); ?></a>
	</div>
	<div class="room-grid" data-reveal>
		<?php foreach ( $ardea_rooms as $ardea_room ) : ?>
			<a class="room-card" href="<?php echo esc_url( get_term_link( $ardea_room ) ); ?>">
				<img class="room-card__img" src="<?php echo esc_url( ardea_category_image_url( $ardea_room ) ); ?>" alt="<?php echo esc_attr( sprintf( __( 'Editorial imagery representing the %s collection', 'ardea' ), $ardea_room->name ) ); ?>" loading="lazy" width="800" height="600">
				<div class="room-card__overlay">
					<h3><?php echo esc_html( $ardea_room->name ); ?></h3>
					<?php if ( $ardea_room->description ) : ?><p><?php echo esc_html( wp_trim_words( $ardea_room->description, 14 ) ); ?></p><?php endif; ?>
					<span class="room-card__cta"><?php echo esc_html( sprintf( __( 'Shop %s', 'ardea' ), $ardea_room->name ) ); ?></span>
				</div>
			</a>
		<?php endforeach; ?>
	</div>
</section>
