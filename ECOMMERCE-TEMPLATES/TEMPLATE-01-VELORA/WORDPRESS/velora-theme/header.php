<?php
/**
 * Header: announcement bar, site-header (logo/nav/icons), mobile drawer,
 * search overlay, cart drawer, quick view modal shell.
 *
 * Markup/classes are ported 1:1 from the VELORA demo's header so
 * assets/css/*.css and assets/js/theme.js need zero selector changes.
 *
 * @package Velora
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
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
 *   velora_social_meta_tags() and velora_product_jsonld() in
 *   inc/woocommerce.php.
 */
if ( ! velora_seo_plugin_active() ) :
	$velora_noindex = is_search() || ( function_exists( 'is_cart' ) && ( is_cart() || is_checkout() || is_account_page() ) );
	?>
	<meta name="robots" content="<?php echo $velora_noindex ? 'noindex, follow' : 'index, follow'; ?>">
<?php endif; ?>
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link screen-reader-text" href="#main"><?php esc_html_e( 'Skip to content', 'velora' ); ?></a>

<?php
$velora_announce_msgs = array_filter(
	array(
		get_theme_mod( 'velora_announce_1', 'Free shipping on orders over ₹4,000' ),
		get_theme_mod( 'velora_announce_2', 'The New Season collection is now live' ),
		get_theme_mod( 'velora_announce_3', 'Use code <strong>VELORA10</strong> for 10% off your first order' ),
	)
);
$velora_announce_link = get_theme_mod( 'velora_announce_link', '' );
if ( ! empty( $velora_announce_msgs ) ) :
	?>
<div class="announce-bar">
	<?php if ( $velora_announce_link ) : ?><a href="<?php echo esc_url( $velora_announce_link ); ?>" style="display:contents"><?php endif; ?>
	<div class="announce-track">
		<?php foreach ( $velora_announce_msgs as $velora_msg ) : ?>
			<p class="announce-item"><?php echo wp_kses_post( $velora_msg ); ?></p>
		<?php endforeach; ?>
	</div>
	<?php if ( $velora_announce_link ) : ?></a><?php endif; ?>
</div>
<?php endif; ?>

<header class="site-header">
	<div class="header-row">
		<div class="header-utility left">
			<button class="hamburger icon-btn" data-drawer-open aria-label="<?php esc_attr_e( 'Open menu', 'velora' ); ?>" aria-expanded="false">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="22" height="22"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
			</button>
			<button class="icon-btn" data-search-open aria-label="<?php esc_attr_e( 'Open search', 'velora' ); ?>">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/></svg>
			</button>
			<div class="header-search-inline"></div>
		</div>

		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="logo">
			<?php if ( has_custom_logo() ) : ?>
				<?php the_custom_logo(); ?>
			<?php else : ?>
				<?php bloginfo( 'name' ); ?><span>.</span>
			<?php endif; ?>
		</a>

		<div class="header-utility right">
			<a class="icon-btn" href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/' ) ); ?>" aria-label="<?php esc_attr_e( 'Account', 'velora' ); ?>">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>
			</a>
			<a class="icon-btn" href="<?php echo esc_url( velora_get_wishlist_page_url() ); ?>" aria-label="<?php esc_attr_e( 'Wishlist', 'velora' ); ?>">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-7.5-4.6-10-9.2C0.3 8.3 2 4.5 5.7 4c2-.3 3.7.7 4.9 2.3C11.8 4.7 13.5 3.7 15.5 4c3.7.5 5.4 4.3 3.7 7.8C20 16.4 12 21 12 21z"/></svg>
				<?php $velora_wl_count = function_exists( 'velora_wishlist_count' ) ? velora_wishlist_count() : 0; ?>
				<span class="icon-count" data-wishlist-count style="<?php echo $velora_wl_count ? '' : 'display:none'; ?>"><?php echo (int) $velora_wl_count; ?></span>
			</a>
			<button class="icon-btn" data-cart-open aria-label="<?php esc_attr_e( 'Open cart', 'velora' ); ?>">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>
				<?php $velora_cart_count = ( class_exists( 'WooCommerce' ) && WC()->cart ) ? WC()->cart->get_cart_contents_count() : 0; ?>
				<span class="icon-count" data-cart-count style="<?php echo $velora_cart_count ? '' : 'display:none'; ?>"><?php echo (int) $velora_cart_count; ?></span>
			</button>
		</div>
	</div>

	<nav class="primary-nav" aria-label="<?php esc_attr_e( 'Primary', 'velora' ); ?>">
		<div class="container">
			<?php
			if ( has_nav_menu( 'primary' ) ) {
				wp_nav_menu(
					array(
						'theme_location' => 'primary',
						'container'      => false,
						'menu_class'     => '',
						'items_wrap'     => '<ul>%3$s</ul>',
						'depth'          => 2,
					)
				);
			} else {
				?>
				<ul>
					<li><a href="<?php echo esc_url( velora_menu_fallback_url( 'dresses' ) ); ?>"><?php esc_html_e( 'Women', 'velora' ); ?></a></li>
					<li><a href="<?php echo esc_url( velora_menu_fallback_url( 'outerwear' ) ); ?>"><?php esc_html_e( 'Men', 'velora' ); ?></a></li>
					<li><a href="<?php echo esc_url( velora_menu_fallback_url( 'accessories' ) ); ?>"><?php esc_html_e( 'Accessories', 'velora' ); ?></a></li>
					<li><a href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ) ); ?>"><?php esc_html_e( 'New Arrivals', 'velora' ); ?></a></li>
					<li><a class="nav-sale" href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ) ); ?>"><?php esc_html_e( 'Sale', 'velora' ); ?></a></li>
				</ul>
				<?php
				echo '<!-- No menu assigned to the "primary" location yet. Create one in Appearance → Menus and assign it, or edit velora_menu_fallback_url() defaults in inc/setup.php-adjacent helpers. -->';
			}
			?>
		</div>
	</nav>
</header>

<div class="mobile-drawer-backdrop"></div>
<div class="mobile-drawer" id="mobileDrawer">
	<div class="drawer-head">
		<span class="logo" style="font-size:1.4rem"><?php bloginfo( 'name' ); ?><span>.</span></span>
		<button class="drawer-close" data-drawer-close aria-label="<?php esc_attr_e( 'Close menu', 'velora' ); ?>">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="22" height="22"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>
		</button>
	</div>
	<nav aria-label="<?php esc_attr_e( 'Mobile primary', 'velora' ); ?>">
		<?php
		if ( has_nav_menu( 'primary' ) ) {
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'container'      => false,
					'items_wrap'     => '<ul>%3$s</ul>',
					'depth'          => 1,
				)
			);
		} else {
			?>
			<ul>
				<li><a href="<?php echo esc_url( velora_menu_fallback_url( 'dresses' ) ); ?>"><?php esc_html_e( 'Women', 'velora' ); ?></a></li>
				<li><a href="<?php echo esc_url( velora_menu_fallback_url( 'outerwear' ) ); ?>"><?php esc_html_e( 'Men', 'velora' ); ?></a></li>
				<li><a href="<?php echo esc_url( velora_menu_fallback_url( 'accessories' ) ); ?>"><?php esc_html_e( 'Accessories', 'velora' ); ?></a></li>
				<li><a href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ) ); ?>"><?php esc_html_e( 'New Arrivals', 'velora' ); ?></a></li>
				<li><a href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ) ); ?>"><?php esc_html_e( 'Sale', 'velora' ); ?></a></li>
			</ul>
			<?php
		}
		?>
		<ul>
			<li><a href="<?php echo esc_url( velora_get_wishlist_page_url() ); ?>"><?php esc_html_e( 'Wishlist', 'velora' ); ?></a></li>
		</ul>
	</nav>
	<div class="drawer-foot"><?php echo wp_kses_post( get_theme_mod( 'velora_announce_1', 'Free shipping on orders over ₹4,000' ) ); ?></div>
</div>

<div class="search-overlay">
	<div class="search-overlay-panel">
		<div class="container">
			<form class="search-input-row" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" data-search-form>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="24" height="24"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/></svg>
				<input type="text" name="s" placeholder="<?php esc_attr_e( 'Search for dresses, coats, accessories…', 'velora' ); ?>" data-search-input aria-label="<?php esc_attr_e( 'Search products', 'velora' ); ?>" value="<?php echo esc_attr( get_search_query() ); ?>">
				<?php if ( class_exists( 'WooCommerce' ) ) : ?><input type="hidden" name="post_type" value="product"><?php endif; ?>
				<button type="button" class="search-close" data-search-close aria-label="<?php esc_attr_e( 'Close search', 'velora' ); ?>">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="20" height="20"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>
				</button>
			</form>
			<div class="search-suggestions" data-search-results></div>
			<div style="margin-top:24px">
				<p class="search-empty-hint"><?php esc_html_e( 'Popular searches', 'velora' ); ?></p>
				<div class="popular-searches">
					<button type="button" data-popular-search><?php esc_html_e( 'Dresses', 'velora' ); ?></button>
					<button type="button" data-popular-search><?php esc_html_e( 'Wool Coat', 'velora' ); ?></button>
					<button type="button" data-popular-search><?php esc_html_e( 'Cashmere', 'velora' ); ?></button>
					<button type="button" data-popular-search><?php esc_html_e( 'Accessories', 'velora' ); ?></button>
					<button type="button" data-popular-search><?php esc_html_e( 'Sale', 'velora' ); ?></button>
				</div>
			</div>
		</div>
	</div>
</div>

<?php if ( class_exists( 'WooCommerce' ) ) : ?>
<div class="cart-drawer-backdrop"></div>
<div class="cart-drawer">
	<div class="drawer-head">
		<h3 style="font-size:1.1rem"><?php esc_html_e( 'Your Cart', 'velora' ); ?></h3>
		<button class="drawer-close" data-cart-close aria-label="<?php esc_attr_e( 'Close cart', 'velora' ); ?>">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="22" height="22"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>
		</button>
	</div>
	<div class="freeship-bar" data-freeship-bar><?php velora_render_freeship_bar(); ?></div>
	<div class="cart-drawer-items" data-cart-drawer-items><?php velora_render_cart_drawer_items(); ?></div>
	<div class="cart-drawer-foot" data-cart-drawer-foot><?php velora_render_cart_drawer_foot(); ?></div>
</div>
<?php endif; ?>

<div class="modal-backdrop" data-quickview-modal>
	<div class="quick-view-modal" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Quick view', 'velora' ); ?>">
		<button class="modal-close" data-qv-close aria-label="<?php esc_attr_e( 'Close quick view', 'velora' ); ?>">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="18" height="18"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>
		</button>
		<div class="qv-grid" data-qv-body></div>
	</div>
</div>

<div class="filter-drawer-backdrop mobile-drawer-backdrop" data-filter-drawer-backdrop></div>
