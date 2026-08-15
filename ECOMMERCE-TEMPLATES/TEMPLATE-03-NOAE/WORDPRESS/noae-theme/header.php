<?php
/**
 * Header: announcement bar, site header (logo/nav/icons), mobile drawer,
 * cart drawer, search overlay, quick view modal shell.
 *
 * Markup/classes are ported 1:1 from the NOAÉ demo's header (index.html)
 * so style.css/assets/css/responsive.css/assets/js/theme.js need zero
 * selector changes.
 *
 * @package Noae
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<?php if ( ! has_site_icon() ) : ?>
<link rel="icon" href="<?php echo esc_url( NOAE_URI . '/assets/icons/favicon.svg' ); ?>" type="image/svg+xml">
<?php endif; ?>
<?php
/**
 * SEO notes:
 * - Canonical tags are left to WordPress core's default rel="canonical"
 *   output (wp_head → rel_canonical()); we never print our own.
 * - Robots meta is only printed when no SEO plugin is active — Yoast/
 *   Rank Math already handle this (including WooCommerce's own
 *   cart/checkout noindex), and printing both would create duplicate
 *   <meta name="robots"> tags on the same page.
 * - Open Graph / Twitter / Product schema: same stand-down logic, see
 *   noae_social_meta_tags() and noae_product_jsonld() in inc/woocommerce.php.
 */
if ( ! noae_seo_plugin_active() ) :
	$noae_noindex = is_search() || ( function_exists( 'is_cart' ) && ( is_cart() || is_checkout() || is_account_page() ) );
	?>
	<meta name="robots" content="<?php echo $noae_noindex ? 'noindex, follow' : 'index, follow'; ?>">
<?php endif; ?>
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="noae-skip-link" href="#main"><?php esc_html_e( 'Skip to content', 'noae' ); ?></a>

<?php
$noae_announce_msgs = array_filter(
	array(
		get_theme_mod( 'noae_announce_1', 'Free shipping on orders over ₹1,999' ),
		get_theme_mod( 'noae_announce_2', 'New arrivals restocked every season' ),
		get_theme_mod( 'noae_announce_3', 'Use code NOAE10 for 10% off your first ritual' ),
	)
);
$noae_announce_link = get_theme_mod( 'noae_announce_link', '' );
?>

<div class="noae-announcement">
	<div class="noae-container">
		<?php if ( $noae_announce_link ) : ?><a href="<?php echo esc_url( $noae_announce_link ); ?>" style="position:absolute;inset:0;z-index:1;" aria-hidden="true"></a><?php endif; ?>
		<div class="noae-announcement__track">
			<?php foreach ( $noae_announce_msgs as $noae_i => $noae_msg ) : ?>
				<p class="noae-announcement__item<?php echo 0 === $noae_i ? ' is-active' : ''; ?>"><?php echo wp_kses_post( $noae_msg ); ?></p>
			<?php endforeach; ?>
		</div>
	</div>
</div>

<header class="noae-header">
	<div class="noae-container noae-header__inner">
		<button class="noae-hamburger" type="button" data-mobile-nav-open aria-label="<?php esc_attr_e( 'Open menu', 'noae' ); ?>" aria-controls="mobileNavDrawer" aria-expanded="false">
			<span></span><span></span><span></span>
		</button>
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="noae-logo">
			<?php if ( has_custom_logo() ) : ?>
				<?php the_custom_logo(); ?>
			<?php else : ?>
				NO<span>AÉ</span>
			<?php endif; ?>
		</a>
		<nav class="noae-nav" aria-label="<?php esc_attr_e( 'Primary', 'noae' ); ?>">
			<?php
			if ( has_nav_menu( 'primary' ) ) {
				wp_nav_menu(
					array(
						'theme_location' => 'primary',
						'container'      => false,
						'items_wrap'     => '<ul class="noae-nav__list">%3$s</ul>',
						'walker'         => new Noae_Walker_Primary_Nav(),
						'depth'          => 1,
					)
				);
			} else {
				$noae_shop_url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
				$noae_about    = get_page_by_path( 'about' );
				$noae_contact  = get_page_by_path( 'contact' );
				?>
				<ul class="noae-nav__list">
					<li><a href="<?php echo esc_url( $noae_shop_url ); ?>" class="noae-nav__link<?php echo is_shop() ? ' is-active' : ''; ?>"><?php esc_html_e( 'Shop', 'noae' ); ?></a></li>
					<li><a href="<?php echo esc_url( noae_category_url( 'skincare' ) ); ?>" class="noae-nav__link"><?php esc_html_e( 'Skincare', 'noae' ); ?></a></li>
					<li><a href="<?php echo esc_url( noae_category_url( 'haircare' ) ); ?>" class="noae-nav__link"><?php esc_html_e( 'Haircare', 'noae' ); ?></a></li>
					<li><a href="<?php echo esc_url( noae_category_url( 'wellness' ) ); ?>" class="noae-nav__link"><?php esc_html_e( 'Wellness', 'noae' ); ?></a></li>
					<li><a href="<?php echo esc_url( $noae_about ? get_permalink( $noae_about ) : home_url( '/about/' ) ); ?>" class="noae-nav__link"><?php esc_html_e( 'Our Story', 'noae' ); ?></a></li>
					<li><a href="<?php echo esc_url( $noae_contact ? get_permalink( $noae_contact ) : home_url( '/contact/' ) ); ?>" class="noae-nav__link"><?php esc_html_e( 'Contact', 'noae' ); ?></a></li>
				</ul>
				<?php
			}
			?>
		</nav>
		<div class="noae-header__actions">
			<button type="button" class="noae-search-trigger" data-search-open aria-haspopup="dialog" aria-label="<?php esc_attr_e( 'Search', 'noae' ); ?>">
				<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" fill="none"/><line x1="16.6" y1="16.6" x2="21" y2="21" stroke="currentColor" stroke-width="2"/></svg>
				<span><?php esc_html_e( 'Search', 'noae' ); ?></span>
			</button>
			<div class="noae-header__icon-group">
				<a href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/' ) ); ?>" class="noae-icon-btn" aria-label="<?php esc_attr_e( 'Account', 'noae' ); ?>">
					<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" fill="currentColor"/></svg>
				</a>
				<a href="<?php echo esc_url( noae_get_wishlist_page_url() ); ?>" class="noae-icon-btn noae-icon-wrap" aria-label="<?php esc_attr_e( 'Wishlist', 'noae' ); ?>">
					<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.7-10-9.3C.5 8.1 2 4.5 5.6 3.7 8 3.2 10.2 4.3 12 6.7 13.8 4.3 16 3.2 18.4 3.7 22 4.5 23.5 8.1 22 11.7 19.5 16.3 12 21 12 21z" fill="currentColor"/></svg>
					<?php $noae_wl_count = function_exists( 'noae_wishlist_count' ) ? noae_wishlist_count() : 0; ?>
					<span class="noae-badge--count js-wishlist-count" data-wishlist-count style="<?php echo $noae_wl_count ? '' : 'display:none'; ?>"><?php echo (int) $noae_wl_count; ?></span>
				</a>
				<button type="button" class="noae-icon-btn noae-icon-wrap" data-cart-open aria-label="<?php esc_attr_e( 'Open cart', 'noae' ); ?>">
					<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1.2 11.2a2 2 0 01-2 1.8H9.2a2 2 0 01-2-1.8L6 8z" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>
					<?php $noae_cart_count = ( class_exists( 'WooCommerce' ) && WC()->cart ) ? WC()->cart->get_cart_contents_count() : 0; ?>
					<span class="noae-badge--count js-cart-count" data-cart-count style="<?php echo $noae_cart_count ? '' : 'display:none'; ?>"><?php echo (int) $noae_cart_count; ?></span>
				</button>
			</div>
		</div>
	</div>
</header>

<div class="noae-drawer noae-drawer--left" data-mobile-drawer id="mobileNavDrawer" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Site menu', 'noae' ); ?>">
	<div class="noae-drawer__header">
		<p class="noae-drawer__title"><?php esc_html_e( 'Menu', 'noae' ); ?></p>
		<button type="button" class="noae-drawer__close" data-panel-close aria-label="<?php esc_attr_e( 'Close menu', 'noae' ); ?>">✕</button>
	</div>
	<div class="noae-drawer__body">
		<nav aria-label="<?php esc_attr_e( 'Mobile', 'noae' ); ?>">
			<?php
			if ( has_nav_menu( 'primary' ) ) {
				wp_nav_menu(
					array(
						'theme_location' => 'primary',
						'container'      => false,
						'items_wrap'     => '<ul class="noae-mobile-nav__list">%3$s</ul>',
						'walker'         => new Noae_Walker_Mobile_Nav(),
						'depth'          => 1,
					)
				);
			} else {
				$noae_shop_url_m = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
				$noae_about_m    = get_page_by_path( 'about' );
				$noae_contact_m  = get_page_by_path( 'contact' );
				?>
				<ul class="noae-mobile-nav__list">
					<li><a href="<?php echo esc_url( $noae_shop_url_m ); ?>" class="noae-mobile-nav__link"><?php esc_html_e( 'Shop', 'noae' ); ?></a></li>
					<li><a href="<?php echo esc_url( noae_category_url( 'skincare' ) ); ?>" class="noae-mobile-nav__link"><?php esc_html_e( 'Skincare', 'noae' ); ?></a></li>
					<li><a href="<?php echo esc_url( noae_category_url( 'haircare' ) ); ?>" class="noae-mobile-nav__link"><?php esc_html_e( 'Haircare', 'noae' ); ?></a></li>
					<li><a href="<?php echo esc_url( noae_category_url( 'wellness' ) ); ?>" class="noae-mobile-nav__link"><?php esc_html_e( 'Wellness', 'noae' ); ?></a></li>
					<li><a href="<?php echo esc_url( noae_category_url( 'body' ) ); ?>" class="noae-mobile-nav__link"><?php esc_html_e( 'Body', 'noae' ); ?></a></li>
					<li><a href="<?php echo esc_url( $noae_about_m ? get_permalink( $noae_about_m ) : home_url( '/about/' ) ); ?>" class="noae-mobile-nav__link"><?php esc_html_e( 'Our Story', 'noae' ); ?></a></li>
					<li><a href="<?php echo esc_url( $noae_contact_m ? get_permalink( $noae_contact_m ) : home_url( '/contact/' ) ); ?>" class="noae-mobile-nav__link"><?php esc_html_e( 'Contact', 'noae' ); ?></a></li>
					<li><a href="<?php echo esc_url( noae_get_wishlist_page_url() ); ?>" class="noae-mobile-nav__link"><?php esc_html_e( 'Wishlist', 'noae' ); ?></a></li>
				</ul>
				<?php
			}
			?>
		</nav>
	</div>
</div>

<div class="noae-drawer noae-drawer--right noae-cart-drawer" data-cart-drawer id="cartDrawer" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Shopping bag', 'noae' ); ?>">
	<div class="noae-drawer__header">
		<p class="noae-drawer__title"><?php esc_html_e( 'Your Bag', 'noae' ); ?></p>
		<button type="button" class="noae-drawer__close" data-panel-close aria-label="<?php esc_attr_e( 'Close bag', 'noae' ); ?>">✕</button>
	</div>
	<div class="noae-drawer__body">
		<div id="cartDrawerProgress" data-cart-drawer-progress><?php if ( class_exists( 'WooCommerce' ) ) { noae_render_freeship_bar(); } ?></div>
		<div id="cartDrawerItems" data-cart-drawer-items><?php if ( class_exists( 'WooCommerce' ) ) { noae_render_cart_drawer_items(); } ?></div>
	</div>
	<div id="cartDrawerFooter" class="noae-cart-drawer__footer" data-cart-drawer-footer><?php if ( class_exists( 'WooCommerce' ) ) { noae_render_cart_drawer_foot(); } ?></div>
</div>

<div class="noae-modal-overlay" data-quick-view-modal-overlay>
	<div class="noae-modal" data-quick-view-modal></div>
</div>

<div class="noae-search-overlay" data-search-overlay role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Search', 'noae' ); ?>">
	<div class="noae-search-panel">
		<form class="noae-search-input-row" data-search-form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
			<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" fill="none"/><line x1="16.6" y1="16.6" x2="21" y2="21" stroke="currentColor" stroke-width="2"/></svg>
			<label for="searchInput" class="noae-visually-hidden"><?php esc_html_e( 'Search products', 'noae' ); ?></label>
			<input type="search" id="searchInput" name="s" data-search-input placeholder="<?php esc_attr_e( 'Search serums, cleansers, rituals...', 'noae' ); ?>" value="<?php echo esc_attr( get_search_query() ); ?>">
			<?php if ( class_exists( 'WooCommerce' ) ) : ?><input type="hidden" name="post_type" value="product"><?php endif; ?>
			<button type="button" data-search-close aria-label="<?php esc_attr_e( 'Close search', 'noae' ); ?>" style="background:none;border:none;font-size:1.2rem;cursor:pointer;">✕</button>
		</form>
		<div id="searchSuggestions" class="noae-search-suggestions" data-search-suggestions>
			<p style="color:var(--color-plum-soft);font-size:0.9rem;"><?php esc_html_e( 'Start typing to discover serums, cleansers, and rituals.', 'noae' ); ?></p>
		</div>
	</div>
</div>

<div id="toastRegion" class="noae-toast-region" role="status" aria-live="polite"></div>
