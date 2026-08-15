<?php
/**
 * Footer: brand column + social, three link columns (widget-area
 * overridable, falling back to the demo's real Shop/Help/Company links),
 * newsletter form, bottom bar with copyright + payment icons.
 *
 * @package Ardea
 */
?>
	<footer class="site-footer">
		<div class="container footer-grid">
			<div class="footer-brand">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="logo">
					<?php if ( has_custom_logo() ) : ?><?php the_custom_logo(); ?><?php else : ?><?php bloginfo( 'name' ); ?><span>.</span><?php endif; ?>
				</a>
				<p><?php echo esc_html( get_theme_mod( 'ardea_footer_about', 'Modern furniture and home decor, designed in small batches from solid wood, natural fibre and stone — built to be lived in, repaired, and passed on.' ) ); ?></p>
				<div class="footer-social">
					<?php
					$ardea_socials = array(
						'instagram' => array( get_theme_mod( 'ardea_social_instagram', 'https://instagram.com/ardealiving' ), '<svg viewBox="0 0 24 24"><path d="M12 2c2.7 0 3 .01 4.1.06 1.06.05 1.79.22 2.43.47.66.26 1.14.6 1.64 1.1.5.5.84.98 1.1 1.64.25.64.42 1.37.47 2.43.05 1.1.06 1.4.06 4.1s-.01 3-.06 4.1c-.05 1.06-.22 1.79-.47 2.43a4.4 4.4 0 01-1.1 1.64c-.5.5-.98.84-1.64 1.1-.64.25-1.37.42-2.43.47-1.1.05-1.4.06-4.1.06s-3-.01-4.1-.06c-1.06-.05-1.79-.22-2.43-.47a4.4 4.4 0 01-1.64-1.1 4.4 4.4 0 01-1.1-1.64c-.25-.64-.42-1.37-.47-2.43C2.01 15 2 14.7 2 12s.01-3 .06-4.1c.05-1.06.22-1.79.47-2.43.26-.66.6-1.14 1.1-1.64.5-.5.98-.84 1.64-1.1.64-.25 1.37-.42 2.43-.47C9 2.01 9.3 2 12 2zm0 5.8a4.2 4.2 0 100 8.4 4.2 4.2 0 000-8.4zm0 1.8a2.4 2.4 0 110 4.8 2.4 2.4 0 010-4.8zm5.15-2.9a1 1 0 110 2 1 1 0 010-2z"/></svg>' ),
						'facebook'  => array( get_theme_mod( 'ardea_social_facebook', '' ), '<svg viewBox="0 0 24 24"><path d="M18 2h-3a4 4 0 00-4 4v3H8v4h3v9h4v-9h3l1-4h-4V6a1 1 0 011-1h3z"/></svg>' ),
						'pinterest' => array( get_theme_mod( 'ardea_social_pinterest', 'https://pinterest.com/ardealiving' ), '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.66 7.86 6.4 9.27-.09-.79-.17-2 .04-2.86.19-.78 1.23-4.97 1.23-4.97s-.31-.63-.31-1.55c0-1.45.84-2.53 1.89-2.53.89 0 1.32.67 1.32 1.47 0 .9-.57 2.24-.86 3.48-.25 1.04.52 1.89 1.54 1.89 1.85 0 3.1-2.38 3.1-5.19 0-2.14-1.44-3.74-4.06-3.74-2.96 0-4.8 2.21-4.8 4.68 0 .86.25 1.46.65 1.93.1.11.11.21.08.33-.09.36-.28 1.15-.32 1.31-.05.21-.17.26-.39.15-1.44-.67-2.34-2.77-2.34-4.46 0-3.63 2.64-6.97 7.61-6.97 4 0 7.11 2.85 7.11 6.66 0 3.97-2.5 7.16-5.98 7.16-1.17 0-2.27-.61-2.64-1.33 0 0-.64 2.44-.78 2.93-.24.87-.7 1.75-1.12 2.44A10 10 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>' ),
						'x'         => array( get_theme_mod( 'ardea_social_x', '' ), '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4l16 16M20 4L4 20"/></svg>' ),
					);
					foreach ( $ardea_socials as $ardea_network => $ardea_data ) {
						if ( empty( $ardea_data[0] ) ) {
							continue;
						}
						printf(
							'<a href="%1$s" aria-label="%2$s" target="_blank" rel="noopener noreferrer">%3$s</a>',
							esc_url( $ardea_data[0] ),
							/* translators: %s: social network name. */
							esc_attr( sprintf( __( 'Ardea on %s', 'ardea' ), ucfirst( $ardea_network ) ) ),
							$ardea_data[1] // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static inline SVG, no user input.
						);
					}
					?>
				</div>
			</div>

			<?php if ( is_active_sidebar( 'footer-shop' ) ) : ?>
				<?php dynamic_sidebar( 'footer-shop' ); ?>
			<?php else : ?>
				<nav class="footer-col">
					<h4><?php esc_html_e( 'Shop', 'ardea' ); ?></h4>
					<ul>
						<?php
						$ardea_shop_links = function_exists( 'ardea_footer_shop_links' ) ? ardea_footer_shop_links() : array( __( 'Shop All', 'ardea' ) => home_url( '/' ) );
						foreach ( $ardea_shop_links as $ardea_label => $ardea_url ) :
							?>
							<li><a href="<?php echo esc_url( $ardea_url ); ?>"><?php echo esc_html( $ardea_label ); ?></a></li>
						<?php endforeach; ?>
					</ul>
				</nav>
			<?php endif; ?>

			<?php if ( is_active_sidebar( 'footer-help' ) ) : ?>
				<?php dynamic_sidebar( 'footer-help' ); ?>
			<?php else : ?>
				<?php
				$ardea_contact_page_f = get_page_by_path( 'contact' );
				$ardea_wishlist_url_f = function_exists( 'ardea_get_wishlist_page_url' ) ? ardea_get_wishlist_page_url() : home_url( '/' );
				?>
				<nav class="footer-col">
					<h4><?php esc_html_e( 'Help', 'ardea' ); ?></h4>
					<ul>
						<li><a href="<?php echo esc_url( $ardea_contact_page_f ? get_permalink( $ardea_contact_page_f ) : home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Contact Us', 'ardea' ); ?></a></li>
						<li><a href="<?php echo esc_url( function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/cart/' ) ); ?>"><?php esc_html_e( 'Your Cart', 'ardea' ); ?></a></li>
						<li><a href="<?php echo esc_url( $ardea_wishlist_url_f ); ?>"><?php esc_html_e( 'Wishlist', 'ardea' ); ?></a></li>
						<li><a href="<?php echo esc_url( home_url( '/?s=' ) ); ?>"><?php esc_html_e( 'Search', 'ardea' ); ?></a></li>
					</ul>
				</nav>
			<?php endif; ?>

			<?php if ( has_nav_menu( 'footer' ) ) : ?>
				<nav class="footer-col">
					<h4><?php esc_html_e( 'Company', 'ardea' ); ?></h4>
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
				</nav>
			<?php elseif ( is_active_sidebar( 'footer-company' ) ) : ?>
				<?php dynamic_sidebar( 'footer-company' ); ?>
			<?php else : ?>
				<?php
				$ardea_about_page_f   = get_page_by_path( 'about' );
				$ardea_contact_page_f2 = get_page_by_path( 'contact' );
				?>
				<nav class="footer-col">
					<h4><?php esc_html_e( 'Company', 'ardea' ); ?></h4>
					<ul>
						<li><a href="<?php echo esc_url( $ardea_about_page_f ? get_permalink( $ardea_about_page_f ) : home_url( '/about/' ) ); ?>"><?php esc_html_e( 'Our Story', 'ardea' ); ?></a></li>
						<li><a href="<?php echo esc_url( ( $ardea_about_page_f ? get_permalink( $ardea_about_page_f ) : home_url( '/about/' ) ) . '#craftsmanship' ); ?>"><?php esc_html_e( 'Craftsmanship', 'ardea' ); ?></a></li>
						<li><a href="<?php echo esc_url( $ardea_contact_page_f2 ? get_permalink( $ardea_contact_page_f2 ) : home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Visit Our Studio', 'ardea' ); ?></a></li>
					</ul>
				</nav>
			<?php endif; ?>

			<div class="footer-col">
				<h4><?php esc_html_e( 'Stay in Touch', 'ardea' ); ?></h4>
				<p style="font-size:0.85rem;color:rgba(250,247,242,0.65);margin-bottom:1rem;"><?php echo esc_html( get_theme_mod( 'ardea_newsletter_footer_text', 'Slow design notes, new arrivals and studio news — no spam.' ) ); ?></p>
				<form class="newsletter-form" data-newsletter-form style="margin-top:0;">
					<input type="email" required placeholder="<?php esc_attr_e( 'Email address', 'ardea' ); ?>" aria-label="<?php esc_attr_e( 'Email address', 'ardea' ); ?>">
					<button type="submit" class="btn btn--primary"><?php esc_html_e( 'Join', 'ardea' ); ?></button>
				</form>
			</div>
		</div>
		<div class="container footer-bottom">
			<p><?php echo esc_html( get_theme_mod( 'ardea_footer_copyright', '© ' . gmdate( 'Y' ) . ' ARDEA Living. All rights reserved.' ) ); ?></p>
			<?php
			$ardea_privacy_url = function_exists( 'get_privacy_policy_url' ) ? get_privacy_policy_url() : '';
			$ardea_terms_page  = get_page_by_path( 'terms' ) ?: get_page_by_path( 'terms-of-service' );
			?>
			<div class="footer-bottom__legal">
				<a href="<?php echo esc_url( $ardea_privacy_url ? $ardea_privacy_url : '#' ); ?>"><?php esc_html_e( 'Privacy Policy', 'ardea' ); ?></a>
				<a href="<?php echo esc_url( $ardea_terms_page ? get_permalink( $ardea_terms_page ) : '#' ); ?>"><?php esc_html_e( 'Terms of Service', 'ardea' ); ?></a>
			</div>
			<div class="payment-icons"><span>VISA</span><span>MASTERCARD</span><span>UPI</span></div>
		</div>
	</footer>

<?php wp_footer(); ?>
</body>
</html>
