<?php
/**
 * Header: announcement bar, site-header (logo/nav/icons), mobile drawer,
 * search overlay, cart drawer, quick view modal shell.
 *
 * Markup/classes are ported 1:1 from the ARDEA demo's header (index.html)
 * so style.css/assets/css/responsive.css/assets/js/theme.js need zero
 * selector changes.
 *
 * @package Ardea
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<?php if ( ! has_site_icon() ) : ?>
<link rel="icon" href="<?php echo esc_url( ARDEA_URI . '/assets/icons/favicon.svg' ); ?>" type="image/svg+xml">
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
 *   ardea_social_meta_tags() and ardea_product_jsonld() in inc/woocommerce.php.
 */
if ( ! ardea_seo_plugin_active() ) :
	$ardea_noindex = is_search() || ( function_exists( 'is_cart' ) && ( is_cart() || is_checkout() || is_account_page() ) );
	?>
	<meta name="robots" content="<?php echo $ardea_noindex ? 'noindex, follow' : 'index, follow'; ?>">
<?php endif; ?>
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link screen-reader-text" href="#main"><?php esc_html_e( 'Skip to content', 'ardea' ); ?></a>

<?php
$ardea_announce_msgs = array_filter(
	array(
		get_theme_mod( 'ardea_announce_1', 'Complimentary white-glove delivery on orders over ' . wp_strip_all_tags( ardea_format_price( function_exists( 'ardea_free_white_glove_threshold' ) ? ardea_free_white_glove_threshold() : 75000 ) ) ),
		get_theme_mod( 'ardea_announce_2', 'New arrivals landing every season — solid oak, walnut and natural stone' ),
		get_theme_mod( 'ardea_announce_3', 'Handcrafted to order — most pieces ship within 2–4 weeks' ),
	)
);
$ardea_announce_link = get_theme_mod( 'ardea_announce_link', '' );
$ardea_contact_page  = get_page_by_path( 'contact' );
$ardea_about_page    = get_page_by_path( 'about' );
?>

<div class="topbar">
	<div class="container topbar__inner">
		<?php if ( $ardea_announce_link ) : ?><a href="<?php echo esc_url( $ardea_announce_link ); ?>" style="position:absolute;inset:0;z-index:1;" aria-hidden="true"></a><?php endif; ?>
		<div class="topbar__messages" aria-live="polite">
			<?php foreach ( $ardea_announce_msgs as $ardea_i => $ardea_msg ) : ?>
				<span class="topbar__msg<?php echo 0 === $ardea_i ? ' is-active' : ''; ?>"><?php echo wp_kses_post( $ardea_msg ); ?></span>
			<?php endforeach; ?>
		</div>
		<div class="topbar__utility">
			<a href="<?php echo esc_url( $ardea_contact_page ? get_permalink( $ardea_contact_page ) : home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Help & Contact', 'ardea' ); ?></a>
			<a href="<?php echo esc_url( $ardea_about_page ? get_permalink( $ardea_about_page ) : home_url( '/about/' ) ); ?>"><?php esc_html_e( 'Our Story', 'ardea' ); ?></a>
		</div>
	</div>
</div>

<header class="site-header">
	<div class="container header-row">
		<div class="header-row__start">
			<button type="button" class="hamburger" data-mobile-nav-open aria-label="<?php esc_attr_e( 'Open menu', 'ardea' ); ?>" aria-expanded="false" aria-controls="mobile-drawer">
				<span class="hamburger__box"><span class="hamburger__line"></span><span class="hamburger__line"></span><span class="hamburger__line"></span></span>
			</button>
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="logo">
				<?php if ( has_custom_logo() ) : ?>
					<?php the_custom_logo(); ?>
				<?php else : ?>
					<?php bloginfo( 'name' ); ?><span>.</span>
				<?php endif; ?>
			</a>
		</div>

		<nav class="main-nav" aria-label="<?php esc_attr_e( 'Primary', 'ardea' ); ?>">
			<?php
			if ( has_nav_menu( 'primary' ) ) {
				wp_nav_menu(
					array(
						'theme_location' => 'primary',
						'container'      => false,
						'items_wrap'     => '<ul class="main-nav__list">%3$s</ul>',
						'walker'         => new Ardea_Walker_Primary_Nav(),
						'depth'          => 1,
					)
				);
			} else {
				$ardea_shop_url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
				?>
				<ul class="main-nav__list">
					<li class="main-nav__item" data-has-mega>
						<a href="<?php echo esc_url( $ardea_shop_url ); ?>" class="main-nav__link" aria-haspopup="true"><?php esc_html_e( 'Shop', 'ardea' ); ?> <svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" fill="none" stroke-width="2"/></svg></a>
						<?php if ( function_exists( 'ardea_render_mega_menu' ) ) { ardea_render_mega_menu(); } ?>
					</li>
					<li class="main-nav__item"><a href="<?php echo esc_url( add_query_arg( 'orderby', 'date', $ardea_shop_url ) ); ?>" class="main-nav__link"><?php esc_html_e( 'New Arrivals', 'ardea' ); ?></a></li>
					<li class="main-nav__item"><a href="<?php echo esc_url( add_query_arg( 'orderby', 'popularity', $ardea_shop_url ) ); ?>" class="main-nav__link"><?php esc_html_e( 'Best Sellers', 'ardea' ); ?></a></li>
					<li class="main-nav__item"><a href="<?php echo esc_url( $ardea_about_page ? get_permalink( $ardea_about_page ) : home_url( '/about/' ) ); ?>" class="main-nav__link"><?php esc_html_e( 'Our Story', 'ardea' ); ?></a></li>
					<li class="main-nav__item"><a href="<?php echo esc_url( $ardea_contact_page ? get_permalink( $ardea_contact_page ) : home_url( '/contact/' ) ); ?>" class="main-nav__link"><?php esc_html_e( 'Contact', 'ardea' ); ?></a></li>
				</ul>
				<?php
			}
			?>
		</nav>

		<div class="header-row__end">
			<button type="button" class="icon-btn header-search" data-search-open aria-label="<?php esc_attr_e( 'Search', 'ardea' ); ?>">
				<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
			</button>
			<a href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/' ) ); ?>" class="icon-btn header-account" aria-label="<?php esc_attr_e( 'Account', 'ardea' ); ?>">
				<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>
			</a>
			<a href="<?php echo esc_url( ardea_get_wishlist_page_url() ); ?>" class="icon-btn" aria-label="<?php esc_attr_e( 'Wishlist', 'ardea' ); ?>">
				<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-10-9.6C.4 7.6 2 4 5.6 4c2 0 3.6 1.2 4.4 2.6C10.8 5.2 12.4 4 14.4 4 18 4 19.6 7.6 18 10.9c-2.5 5-10 9.6-10 9.6z"/></svg>
				<?php $ardea_wl_count = function_exists( 'ardea_wishlist_count' ) ? ardea_wishlist_count() : 0; ?>
				<span class="count-badge" data-wishlist-count style="<?php echo $ardea_wl_count ? '' : 'display:none'; ?>"><?php echo (int) $ardea_wl_count; ?></span>
			</a>
			<button type="button" class="icon-btn" data-cart-open aria-label="<?php esc_attr_e( 'Cart', 'ardea' ); ?>">
				<svg viewBox="0 0 24 24"><path d="M4 4h2l1.6 10.6a2 2 0 002 1.4h7.6a2 2 0 002-1.7L20 8H6"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>
				<?php $ardea_cart_count = ( class_exists( 'WooCommerce' ) && WC()->cart ) ? WC()->cart->get_cart_contents_count() : 0; ?>
				<span class="count-badge" data-cart-count style="<?php echo $ardea_cart_count ? '' : 'display:none'; ?>"><?php echo (int) $ardea_cart_count; ?></span>
			</button>
		</div>
	</div>
</header>

<div class="mobile-drawer" data-mobile-drawer id="mobile-drawer">
	<div class="drawer__header">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="logo">
			<?php if ( has_custom_logo() ) : ?><?php the_custom_logo(); ?><?php else : ?><?php bloginfo( 'name' ); ?><span>.</span><?php endif; ?>
		</a>
		<button type="button" class="icon-btn" data-panel-close aria-label="<?php esc_attr_e( 'Close menu', 'ardea' ); ?>"><svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg></button>
	</div>
	<div class="drawer__body">
		<nav class="mobile-nav" aria-label="<?php esc_attr_e( 'Mobile primary', 'ardea' ); ?>">
			<?php
			if ( has_nav_menu( 'primary' ) ) {
				wp_nav_menu(
					array(
						'theme_location' => 'primary',
						'container'      => false,
						'items_wrap'     => '%3$s',
						'walker'         => new Ardea_Walker_Mobile_Nav(),
						'depth'          => 1,
					)
				);
			} else {
				$ardea_shop_url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
				?>
				<div class="mobile-nav__item">
					<button type="button" class="mobile-nav__toggle"><?php esc_html_e( 'Shop', 'ardea' ); ?> <svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" fill="none" stroke-width="2"/></svg></button>
					<div class="mobile-nav__panel"><div class="mobile-nav__panel-inner">
						<?php if ( function_exists( 'ardea_mega_menu_columns' ) ) : ?>
							<?php foreach ( ardea_mega_menu_columns( 5 ) as $ardea_room ) : ?>
								<a href="<?php echo esc_url( get_term_link( $ardea_room ) ); ?>"><?php echo esc_html( $ardea_room->name ); ?></a>
							<?php endforeach; ?>
						<?php endif; ?>
						<a href="<?php echo esc_url( $ardea_shop_url ); ?>"><?php esc_html_e( 'Shop All', 'ardea' ); ?></a>
					</div></div>
				</div>
				<a href="<?php echo esc_url( add_query_arg( 'orderby', 'date', $ardea_shop_url ) ); ?>" class="mobile-nav__link"><?php esc_html_e( 'New Arrivals', 'ardea' ); ?></a>
				<a href="<?php echo esc_url( add_query_arg( 'orderby', 'popularity', $ardea_shop_url ) ); ?>" class="mobile-nav__link"><?php esc_html_e( 'Best Sellers', 'ardea' ); ?></a>
				<a href="<?php echo esc_url( $ardea_about_page ? get_permalink( $ardea_about_page ) : home_url( '/about/' ) ); ?>" class="mobile-nav__link"><?php esc_html_e( 'Our Story', 'ardea' ); ?></a>
				<a href="<?php echo esc_url( $ardea_contact_page ? get_permalink( $ardea_contact_page ) : home_url( '/contact/' ) ); ?>" class="mobile-nav__link"><?php esc_html_e( 'Contact', 'ardea' ); ?></a>
				<?php
			}
			?>
		</nav>
	</div>
	<div class="drawer__footer">
		<a href="<?php echo esc_url( ardea_get_wishlist_page_url() ); ?>"><?php esc_html_e( 'Wishlist', 'ardea' ); ?></a>
		<a href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/' ) ); ?>"><?php esc_html_e( 'Account', 'ardea' ); ?></a>
	</div>
</div>

<aside class="side-drawer" data-cart-drawer aria-label="<?php esc_attr_e( 'Shopping cart', 'ardea' ); ?>">
	<div class="side-drawer__header">
		<h2 class="side-drawer__title"><?php esc_html_e( 'Your Cart', 'ardea' ); ?></h2>
		<button type="button" class="icon-btn" data-panel-close aria-label="<?php esc_attr_e( 'Close cart', 'ardea' ); ?>"><svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg></button>
	</div>
	<div class="side-drawer__body">
		<div data-cart-drawer-progress><?php if ( class_exists( 'WooCommerce' ) ) { ardea_render_freeship_bar(); } ?></div>
		<div data-cart-drawer-items><?php if ( class_exists( 'WooCommerce' ) ) { ardea_render_cart_drawer_items(); } ?></div>
	</div>
	<div class="side-drawer__footer" data-cart-drawer-footer><?php if ( class_exists( 'WooCommerce' ) ) { ardea_render_cart_drawer_foot(); } ?></div>
</aside>

<div class="modal" data-quick-view-modal></div>

<div class="search-overlay" data-search-overlay>
	<div class="container">
		<div class="search-overlay__top">
			<form class="search-overlay__form" data-search-form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
				<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" fill="none" stroke-width="1.6"/><path d="M21 21l-4.35-4.35" stroke="currentColor" fill="none" stroke-width="1.6"/></svg>
				<input type="search" name="s" data-search-input placeholder="<?php esc_attr_e( 'Search products, rooms, materials…', 'ardea' ); ?>" aria-label="<?php esc_attr_e( 'Search', 'ardea' ); ?>" value="<?php echo esc_attr( get_search_query() ); ?>">
				<?php if ( class_exists( 'WooCommerce' ) ) : ?><input type="hidden" name="post_type" value="product"><?php endif; ?>
				<button type="button" class="icon-btn" data-search-close aria-label="<?php esc_attr_e( 'Close search', 'ardea' ); ?>"><svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg></button>
			</form>
		</div>
		<div class="search-overlay__body">
			<div class="search-quicklinks">
				<?php if ( function_exists( 'ardea_mega_menu_columns' ) ) : ?>
					<?php foreach ( ardea_mega_menu_columns( 4 ) as $ardea_quick_room ) : ?>
						<a href="<?php echo esc_url( get_term_link( $ardea_quick_room ) ); ?>"><?php echo esc_html( $ardea_quick_room->name ); ?></a>
					<?php endforeach; ?>
				<?php endif; ?>
			</div>
			<div data-search-suggestions></div>
		</div>
	</div>
</div>

<div class="scrim" data-scrim></div>
