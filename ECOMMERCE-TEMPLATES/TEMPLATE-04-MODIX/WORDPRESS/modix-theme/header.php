<?php
/**
 * Header: announcement bar, dark charcoal utility strip, site-header
 * (bold logo/mega-dropdown nav/icons), mobile drawer, search overlay, cart
 * drawer.
 *
 * Markup/classes are ported 1:1 from the MODIX demo's header (index.html)
 * so style.css / assets/css/responsive.css / assets/js/theme.js need zero
 * selector changes.
 *
 * @package Modix
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<?php if ( ! has_site_icon() ) : ?>
<link rel="icon" href="<?php echo esc_url( MODIX_URI . '/assets/images/favicon.svg' ); ?>" type="image/svg+xml">
<?php endif; ?>
<?php
/**
 * SEO notes:
 * - Canonical tags are left to WordPress core's default rel="canonical"
 *   output (wp_head → rel_canonical()); we never print our own.
 * - Robots meta is only printed when no SEO plugin is active — Yoast/Rank
 *   Math already handle this (including WooCommerce's own cart/checkout
 *   noindex), and printing both would create duplicate
 *   <meta name="robots"> tags on the same page.
 * - Open Graph / Twitter / Product schema: same stand-down logic, see
 *   modix_social_meta_tags() and modix_product_jsonld() in inc/woocommerce.php.
 */
if ( ! modix_seo_plugin_active() ) :
	$modix_noindex = is_search() || ( function_exists( 'is_cart' ) && ( is_cart() || is_checkout() || is_account_page() ) );
	?>
	<meta name="robots" content="<?php echo $modix_noindex ? 'noindex, follow' : 'index, follow'; ?>">
<?php endif; ?>
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link screen-reader-text" href="#main"><?php esc_html_e( 'Skip to content', 'modix' ); ?></a>

<?php
$modix_announce_msgs = array_filter(
	array(
		get_theme_mod( 'modix_announce_1', 'Free shipping on orders over ' . wp_strip_all_tags( modix_format_price( function_exists( 'modix_freeship_threshold' ) ? modix_freeship_threshold() : 2999 ) ) ),
		get_theme_mod( 'modix_announce_2', 'New: the latest Modix flagship phone is now shipping' ),
		get_theme_mod( 'modix_announce_3', 'Use code MODIX10 for 10% off your first order' ),
	)
);
$modix_announce_link = get_theme_mod( 'modix_announce_link', '' );
$modix_contact_page   = get_page_by_path( 'contact' );
$modix_about_page     = get_page_by_path( 'about' );
?>

<?php if ( ! empty( $modix_announce_msgs ) ) : ?>
<div class="announcement-bar">
	<?php if ( $modix_announce_link ) : ?><a href="<?php echo esc_url( $modix_announce_link ); ?>" style="position:absolute;inset:0;z-index:1;" aria-hidden="true"></a><?php endif; ?>
	<div class="announcement-bar__track">
		<?php foreach ( $modix_announce_msgs as $modix_i => $modix_msg ) : ?>
			<div class="announcement-bar__item<?php echo 0 === $modix_i ? ' is-active' : ''; ?>"><span><?php echo wp_kses_post( $modix_msg ); ?></span></div>
		<?php endforeach; ?>
	</div>
</div>
<?php endif; ?>

<div class="utility-strip">
	<div class="container">
		<div class="utility-strip__links">
			<a href="<?php echo esc_url( get_theme_mod( 'modix_utility_support_link', '' ) ?: ( $modix_contact_page ? get_permalink( $modix_contact_page ) : home_url( '/contact/' ) ) ); ?>"><?php echo esc_html( get_theme_mod( 'modix_utility_support_text', 'Support' ) ); ?></a>
			<span class="utility-strip__divider">|</span>
			<a href="<?php echo esc_url( get_theme_mod( 'modix_utility_track_order_link', '' ) ?: ( $modix_contact_page ? get_permalink( $modix_contact_page ) : home_url( '/contact/' ) ) ); ?>"><?php echo esc_html( get_theme_mod( 'modix_utility_track_order_text', 'Track Order' ) ); ?></a>
		</div>
		<div class="utility-strip__meta">
			<span><?php echo esc_html( get_theme_mod( 'modix_utility_meta_text', 'Free shipping over ₹2,999' ) ); ?></span>
			<span class="utility-strip__divider">|</span>
			<a href="<?php echo esc_url( get_theme_mod( 'modix_utility_story_link', '' ) ?: ( $modix_about_page ? get_permalink( $modix_about_page ) : home_url( '/about/' ) ) ); ?>"><?php echo esc_html( get_theme_mod( 'modix_utility_story_text', 'Our Story' ) ); ?></a>
		</div>
	</div>
</div>

<header class="site-header">
	<div class="container header-bar">
		<button class="icon-btn mobile-toggle" type="button" data-mobile-toggle aria-expanded="false" aria-label="<?php esc_attr_e( 'Open menu', 'modix' ); ?>">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
		</button>
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="logo">
			<?php if ( has_custom_logo() ) : ?>
				<?php the_custom_logo(); ?>
			<?php else : ?>
				<?php bloginfo( 'name' ); ?><span class="logo__dot">.</span>
			<?php endif; ?>
		</a>
		<nav class="main-nav" aria-label="<?php esc_attr_e( 'Primary', 'modix' ); ?>">
			<?php
			if ( has_nav_menu( 'primary' ) ) {
				wp_nav_menu(
					array(
						'theme_location' => 'primary',
						'container'      => false,
						'items_wrap'     => '<ul class="nav-list">%3$s</ul>',
						'walker'         => new Modix_Walker_Primary_Nav(),
						'depth'          => 1,
					)
				);
			} else {
				$modix_shop_url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
				?>
				<ul class="nav-list">
					<?php if ( function_exists( 'modix_mega_menu_categories' ) ) : ?>
						<?php foreach ( modix_mega_menu_categories( 5 ) as $modix_nav_cat ) : ?>
							<li class="nav-item has-mega">
								<a href="<?php echo esc_url( get_term_link( $modix_nav_cat ) ); ?>" class="nav-link" aria-haspopup="true"><?php echo esc_html( $modix_nav_cat->name ); ?> <svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></a>
								<?php modix_render_mega_menu( $modix_nav_cat ); ?>
							</li>
						<?php endforeach; ?>
					<?php endif; ?>
					<li class="nav-item"><a href="<?php echo esc_url( $modix_shop_url ); ?>" class="nav-link"><?php esc_html_e( 'Shop All', 'modix' ); ?></a></li>
				</ul>
				<?php
			}
			?>
		</nav>
		<div class="header-actions">
			<button class="icon-btn" type="button" data-search-open aria-label="<?php esc_attr_e( 'Search products', 'modix' ); ?>"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></button>
			<a href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/' ) ); ?>" class="icon-btn" aria-label="<?php esc_attr_e( 'Account', 'modix' ); ?>"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg></a>
			<a class="icon-btn" href="<?php echo esc_url( function_exists( 'modix_get_wishlist_page_url' ) ? modix_get_wishlist_page_url() : home_url( '/' ) ); ?>" aria-label="<?php esc_attr_e( 'Wishlist', 'modix' ); ?>">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20.5s-7.5-4.6-10-9.4C.5 7.6 2.4 4 6 4c2.1 0 3.7 1.2 4.7 2.6 1-1.4 2.6-2.6 4.7-2.6 3.6 0 5.5 3.6 4 7.1-2.5 4.8-10 9.4-10 9.4z"/></svg>
				<?php $modix_wl_count = function_exists( 'modix_wishlist_count' ) ? modix_wishlist_count() : 0; ?>
				<span class="icon-btn__badge" data-wishlist-count style="<?php echo $modix_wl_count ? '' : 'display:none'; ?>"><?php echo (int) $modix_wl_count; ?></span>
			</a>
			<button class="icon-btn" type="button" data-cart-open aria-label="<?php esc_attr_e( 'Open cart', 'modix' ); ?>">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h2l2.6 12.6a2 2 0 002 1.4h8.8a2 2 0 002-1.6L21 8H6"/><circle cx="9" cy="21" r="1"/><circle cx="17" cy="21" r="1"/></svg>
				<?php $modix_cart_count = ( class_exists( 'WooCommerce' ) && WC()->cart ) ? WC()->cart->get_cart_contents_count() : 0; ?>
				<span class="icon-btn__badge" data-cart-count style="<?php echo $modix_cart_count ? '' : 'display:none'; ?>"><?php echo (int) $modix_cart_count; ?></span>
			</button>
		</div>
		<div class="mobile-header">
			<button class="icon-btn" type="button" data-cart-open aria-label="<?php esc_attr_e( 'Open cart', 'modix' ); ?>">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h2l2.6 12.6a2 2 0 002 1.4h8.8a2 2 0 002-1.6L21 8H6"/><circle cx="9" cy="21" r="1"/><circle cx="17" cy="21" r="1"/></svg>
				<span class="icon-btn__badge" data-cart-count style="<?php echo $modix_cart_count ? '' : 'display:none'; ?>"><?php echo (int) $modix_cart_count; ?></span>
			</button>
		</div>
	</div>
</header>

<div class="overlay-scrim" data-drawer-scrim></div>
<nav class="mobile-drawer" aria-label="<?php esc_attr_e( 'Mobile menu', 'modix' ); ?>">
	<div class="mobile-drawer__header">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="logo">
			<?php if ( has_custom_logo() ) : ?><?php the_custom_logo(); ?><?php else : ?><?php bloginfo( 'name' ); ?><span class="logo__dot">.</span><?php endif; ?>
		</a>
		<button class="icon-btn" type="button" data-mobile-drawer-close aria-label="<?php esc_attr_e( 'Close menu', 'modix' ); ?>"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
	</div>
	<div style="padding:16px 20px;">
		<button class="btn btn-ghost btn-block" type="button" data-search-open>
			<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg> <?php esc_html_e( 'Search Products', 'modix' ); ?>
		</button>
	</div>
	<ul class="mobile-drawer__list">
		<?php
		if ( has_nav_menu( 'primary' ) ) {
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'container'      => false,
					'items_wrap'     => '%3$s',
					'walker'         => new Modix_Walker_Mobile_Nav(),
					'depth'          => 1,
				)
			);
		} else {
			$modix_shop_url_m = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
			if ( function_exists( 'modix_mega_menu_categories' ) ) {
				foreach ( modix_mega_menu_categories( 5 ) as $modix_mobile_cat ) {
					$panel_id = 'submenu-' . sanitize_html_class( $modix_mobile_cat->slug );
					?>
					<li>
						<button class="mobile-drawer__link" type="button" data-submenu-toggle aria-expanded="false" aria-controls="<?php echo esc_attr( $panel_id ); ?>"><?php echo esc_html( $modix_mobile_cat->name ); ?> <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 9l6 6 6-6"/></svg></button>
						<div class="mobile-drawer__submenu" id="<?php echo esc_attr( $panel_id ); ?>">
							<a href="<?php echo esc_url( get_term_link( $modix_mobile_cat ) ); ?>"><?php echo esc_html( sprintf( __( 'Shop All %s', 'modix' ), $modix_mobile_cat->name ) ); ?></a>
							<?php foreach ( modix_mega_menu_products( $modix_mobile_cat, 3 ) as $modix_mobile_product ) : ?>
								<a href="<?php echo esc_url( get_permalink( $modix_mobile_product->get_id() ) ); ?>"><?php echo esc_html( $modix_mobile_product->get_name() ); ?></a>
							<?php endforeach; ?>
						</div>
					</li>
					<?php
				}
			}
			?>
			<li><a class="mobile-drawer__link" href="<?php echo esc_url( $modix_shop_url_m ); ?>"><?php esc_html_e( 'Shop All', 'modix' ); ?></a></li>
			<?php
		}
		?>
	</ul>
	<div class="mobile-drawer__footer">
		<a href="<?php echo esc_url( function_exists( 'modix_get_wishlist_page_url' ) ? modix_get_wishlist_page_url() : home_url( '/' ) ); ?>" class="btn btn-ghost btn-block"><?php esc_html_e( 'Wishlist', 'modix' ); ?></a>
		<a href="<?php echo esc_url( $modix_contact_page ? get_permalink( $modix_contact_page ) : home_url( '/contact/' ) ); ?>" class="btn btn-ghost btn-block"><?php esc_html_e( 'Support', 'modix' ); ?></a>
	</div>
</nav>

<div class="search-overlay">
	<div class="search-overlay__panel">
		<div class="container">
			<form data-search-form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
				<div class="search-overlay__input-row">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
					<input type="search" name="s" data-search-input placeholder="<?php esc_attr_e( 'Search phones, laptops, headphones…', 'modix' ); ?>" aria-label="<?php esc_attr_e( 'Search products', 'modix' ); ?>" value="<?php echo esc_attr( get_search_query() ); ?>">
					<?php if ( class_exists( 'WooCommerce' ) ) : ?><input type="hidden" name="post_type" value="product"><?php endif; ?>
					<button class="icon-btn" type="button" data-search-close aria-label="<?php esc_attr_e( 'Close search', 'modix' ); ?>"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
				</div>
			</form>
			<div class="search-suggestions" data-search-suggestions></div>
		</div>
	</div>
</div>

<aside class="cart-drawer" aria-label="<?php esc_attr_e( 'Shopping cart', 'modix' ); ?>">
	<div class="cart-drawer__header">
		<h3><?php esc_html_e( 'Your Cart', 'modix' ); ?></h3>
		<button class="icon-btn" type="button" data-cart-close aria-label="<?php esc_attr_e( 'Close cart', 'modix' ); ?>"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
	</div>
	<div data-cart-drawer-progress><?php if ( class_exists( 'WooCommerce' ) ) { modix_render_freeship_bar(); } ?></div>
	<div class="cart-drawer__items" data-cart-drawer-items><?php if ( class_exists( 'WooCommerce' ) ) { modix_render_cart_drawer_items(); } ?></div>
	<div class="cart-drawer__footer" data-cart-drawer-footer><?php if ( class_exists( 'WooCommerce' ) ) { modix_render_cart_drawer_footer(); } ?></div>
</aside>
<div class="overlay-scrim" data-cart-scrim></div>

<div class="modal-scrim" data-quick-view-modal>
	<div class="modal" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Quick view', 'modix' ); ?>">
		<div class="modal__body" data-quick-view-body></div>
	</div>
</div>
