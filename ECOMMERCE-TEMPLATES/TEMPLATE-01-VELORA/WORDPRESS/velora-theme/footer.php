<?php
/**
 * Footer: brand column + social, three link columns (widget-area
 * overridable, falling back to the demo's real Shop/Help/Company links),
 * newsletter form, bottom bar with copyright + payment icons.
 *
 * @package Velora
 */
?>
	<footer class="site-footer">
		<div class="container footer-grid">
			<div class="footer-brand">
				<span class="logo"><?php bloginfo( 'name' ); ?><span>.</span></span>
				<p><?php echo esc_html( get_theme_mod( 'velora_footer_about', 'Premium fashion for the woman who dresses with intention. Tailored dresses, outerwear, knitwear and accessories, made to last.' ) ); ?></p>
				<div class="social-row">
					<?php
					$velora_socials = array(
						'instagram' => array( get_theme_mod( 'velora_social_instagram', 'https://instagram.com/velora' ), '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>' ),
						'pinterest' => array( get_theme_mod( 'velora_social_pinterest', 'https://pinterest.com/velora' ), '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M9 17c1-4 1.5-6 1.5-8a2.5 2.5 0 0 1 5 0c0 2-1 4-1 5.5a2 2 0 0 0 4 0"/></svg>' ),
						'facebook'  => array( get_theme_mod( 'velora_social_facebook', 'https://facebook.com/velora' ), '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 2h-3a4 4 0 0 0-4 4v3H8v4h3v9h4v-9h3l1-4h-4V6a1 1 0 0 1 1-1h3z"/></svg>' ),
						'x'         => array( get_theme_mod( 'velora_social_x', '' ), '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4l16 16M20 4L4 20"/></svg>' ),
					);
					foreach ( $velora_socials as $velora_network => $velora_data ) {
						if ( empty( $velora_data[0] ) ) {
							continue;
						}
						printf(
							'<a href="%1$s" aria-label="%2$s" target="_blank" rel="noopener noreferrer">%3$s</a>',
							esc_url( $velora_data[0] ),
							esc_attr( ucfirst( $velora_network ) ),
							$velora_data[1] // phpcs:ignore -- static inline SVG, no user input.
						);
					}
					?>
				</div>
			</div>

			<?php if ( is_active_sidebar( 'footer-shop' ) ) : ?>
				<?php dynamic_sidebar( 'footer-shop' ); ?>
			<?php else : ?>
				<div class="footer-col">
					<h4><?php esc_html_e( 'Shop', 'velora' ); ?></h4>
					<ul>
						<?php foreach ( velora_footer_shop_links() as $velora_label => $velora_url ) : ?>
							<li><a href="<?php echo esc_url( $velora_url ); ?>"><?php echo esc_html( $velora_label ); ?></a></li>
						<?php endforeach; ?>
					</ul>
				</div>
			<?php endif; ?>

			<?php if ( is_active_sidebar( 'footer-help' ) ) : ?>
				<?php dynamic_sidebar( 'footer-help' ); ?>
			<?php else : ?>
				<div class="footer-col">
					<h4><?php esc_html_e( 'Help', 'velora' ); ?></h4>
					<ul>
						<li><a href="<?php echo esc_url( get_permalink( get_page_by_path( 'contact' ) ) ?: home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Contact Us', 'velora' ); ?></a></li>
						<li><a href="#tab-shipping" data-tab-link="shipping"><?php esc_html_e( 'Shipping', 'velora' ); ?></a></li>
						<li><a href="#tab-returns" data-tab-link="returns"><?php esc_html_e( 'Returns', 'velora' ); ?></a></li>
						<li><a href="<?php echo esc_url( home_url( '/?s=' ) ); ?>"><?php esc_html_e( 'Search', 'velora' ); ?></a></li>
					</ul>
				</div>
			<?php endif; ?>

			<?php if ( has_nav_menu( 'footer' ) ) : ?>
				<div class="footer-col">
					<h4><?php esc_html_e( 'Company', 'velora' ); ?></h4>
					<?php
					wp_nav_menu(
						array(
							'theme_location' => 'footer',
							'container'      => false,
							'items_wrap'     => '<ul>%3$s</ul>',
							'depth'          => 1,
						)
					);
					?>
				</div>
			<?php elseif ( is_active_sidebar( 'footer-company' ) ) : ?>
				<?php dynamic_sidebar( 'footer-company' ); ?>
			<?php else : ?>
				<div class="footer-col">
					<h4><?php esc_html_e( 'Company', 'velora' ); ?></h4>
					<ul>
						<li><a href="<?php echo esc_url( get_permalink( get_page_by_path( 'about' ) ) ?: home_url( '/about/' ) ); ?>"><?php esc_html_e( 'About Velora', 'velora' ); ?></a></li>
						<li><a href="<?php echo esc_url( trailingslashit( get_permalink( get_page_by_path( 'about' ) ?: 0 ) ?: home_url( '/about/' ) ) . '#values' ); ?>"><?php esc_html_e( 'Sustainability', 'velora' ); ?></a></li>
						<li><a href="<?php echo esc_url( get_permalink( get_page_by_path( 'contact' ) ) ?: home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Careers', 'velora' ); ?></a></li>
					</ul>
				</div>
			<?php endif; ?>
			<?php
			/**
			 * Note: the "Company" column above prefers a merchant-assigned
			 * 'footer' nav menu (Appearance → Menus) over the widget area/
			 * hardcoded fallback, so register_nav_menus( 'footer' => … ) in
			 * inc/setup.php has a real, visible effect once assigned.
			 */
			?>

			<div class="footer-col">
				<h4><?php esc_html_e( 'Newsletter', 'velora' ); ?></h4>
				<p style="color:rgba(247,243,236,0.65);font-size:0.9rem;margin-bottom:12px"><?php esc_html_e( 'Seasonal drops and styling notes, twice a month.', 'velora' ); ?></p>
				<form class="footer-newsletter-form" data-newsletter-form style="display:flex;gap:8px">
					<input type="email" required placeholder="<?php esc_attr_e( 'Email', 'velora' ); ?>" aria-label="<?php esc_attr_e( 'Email', 'velora' ); ?>" style="background:transparent;border:1px solid rgba(247,243,236,0.3);color:#F7F3EC;padding:10px;border-radius:4px;flex:1;min-height:44px">
					<button type="submit" class="btn-icon" style="border-color:rgba(247,243,236,0.3);color:#F7F3EC" aria-label="<?php esc_attr_e( 'Subscribe', 'velora' ); ?>">&rarr;</button>
				</form>
			</div>
		</div>
		<div class="container footer-bottom">
			<p><?php echo esc_html( get_theme_mod( 'velora_footer_copyright', '© ' . gmdate( 'Y' ) . ' Velora. All rights reserved.' ) ); ?></p>
			<div class="payment-icons"><span>VISA</span><span>MASTERCARD</span><span>UPI</span><span>COD</span></div>
		</div>
	</footer>

<?php wp_footer(); ?>
</body>
</html>
