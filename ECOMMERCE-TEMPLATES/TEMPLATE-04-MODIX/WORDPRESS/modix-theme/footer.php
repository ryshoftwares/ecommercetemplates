<?php
/**
 * Footer: brand column + social, four link/trust columns (Shop/Company/
 * Support widget-area overridable, falling back to the demo's real
 * copy), bottom bar with copyright + payment icons.
 *
 * @package Modix
 */
?>
	<footer class="site-footer">
		<div class="container footer-top">
			<div class="footer-brand">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="logo">
					<?php if ( has_custom_logo() ) : ?><?php the_custom_logo(); ?><?php else : ?><?php bloginfo( 'name' ); ?><span class="logo__dot">.</span><?php endif; ?>
				</a>
				<p><?php echo esc_html( get_theme_mod( 'modix_footer_about', 'Premium electronics engineered for clarity, speed and everyday reliability — designed in-house, tested obsessively.' ) ); ?></p>
				<div class="footer-social">
					<?php
					$modix_socials = array(
						'instagram' => array( get_theme_mod( 'modix_social_instagram', 'https://www.instagram.com/' ), '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>' ),
						'x'         => array( get_theme_mod( 'modix_social_x', 'https://twitter.com/' ), '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4l16 16M20 4L4 20"/></svg>' ),
						'youtube'   => array( get_theme_mod( 'modix_social_youtube', 'https://www.youtube.com/' ), '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="18" height="12" rx="4"/><path d="M11 10l4 2-4 2z" fill="currentColor" stroke="none"/></svg>' ),
					);
					foreach ( $modix_socials as $modix_network => $modix_data ) {
						if ( empty( $modix_data[0] ) ) {
							continue;
						}
						printf(
							'<a href="%1$s" target="_blank" rel="noopener" aria-label="%2$s">%3$s</a>',
							esc_url( $modix_data[0] ),
							/* translators: %s: social network name. */
							esc_attr( sprintf( __( '%1$s on %2$s', 'modix' ), get_bloginfo( 'name' ), ucfirst( $modix_network ) ) ),
							$modix_data[1] // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static inline SVG, no user input.
						);
					}
					?>
				</div>
			</div>

			<?php if ( is_active_sidebar( 'footer-shop' ) ) : ?>
				<?php dynamic_sidebar( 'footer-shop' ); ?>
			<?php else : ?>
				<div class="footer-col">
					<h4><?php esc_html_e( 'Shop', 'modix' ); ?></h4>
					<ul>
						<?php
						$modix_shop_links = function_exists( 'modix_footer_shop_links' ) ? modix_footer_shop_links() : array( __( 'Shop All', 'modix' ) => home_url( '/' ) );
						foreach ( $modix_shop_links as $modix_label => $modix_url ) :
							?>
							<li><a href="<?php echo esc_url( $modix_url ); ?>"><?php echo esc_html( $modix_label ); ?></a></li>
						<?php endforeach; ?>
					</ul>
				</div>
			<?php endif; ?>

			<?php
			$modix_about_page_f   = get_page_by_path( 'about' );
			$modix_contact_page_f = get_page_by_path( 'contact' );
			$modix_wishlist_url_f = function_exists( 'modix_get_wishlist_page_url' ) ? modix_get_wishlist_page_url() : home_url( '/' );
			?>
			<?php if ( has_nav_menu( 'footer' ) ) : ?>
				<nav class="footer-col">
					<h4><?php esc_html_e( 'Company', 'modix' ); ?></h4>
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
				<div class="footer-col">
					<h4><?php esc_html_e( 'Company', 'modix' ); ?></h4>
					<ul>
						<li><a href="<?php echo esc_url( $modix_about_page_f ? get_permalink( $modix_about_page_f ) : home_url( '/about/' ) ); ?>"><?php esc_html_e( 'About Modix', 'modix' ); ?></a></li>
						<li><a href="<?php echo esc_url( $modix_contact_page_f ? get_permalink( $modix_contact_page_f ) : home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Contact', 'modix' ); ?></a></li>
						<li><a href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ) ); ?>"><?php esc_html_e( 'Shop All', 'modix' ); ?></a></li>
						<li><a href="<?php echo esc_url( $modix_wishlist_url_f ); ?>"><?php esc_html_e( 'Wishlist', 'modix' ); ?></a></li>
					</ul>
				</div>
			<?php endif; ?>

			<?php if ( is_active_sidebar( 'footer-support' ) ) : ?>
				<?php dynamic_sidebar( 'footer-support' ); ?>
			<?php else : ?>
				<div class="footer-col">
					<h4><?php esc_html_e( 'Support', 'modix' ); ?></h4>
					<ul>
						<li><a href="<?php echo esc_url( $modix_contact_page_f ? get_permalink( $modix_contact_page_f ) : home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Help Center', 'modix' ); ?></a></li>
						<li><a href="<?php echo esc_url( $modix_contact_page_f ? get_permalink( $modix_contact_page_f ) : home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Shipping & Returns', 'modix' ); ?></a></li>
						<li><a href="<?php echo esc_url( $modix_contact_page_f ? get_permalink( $modix_contact_page_f ) : home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Warranty', 'modix' ); ?></a></li>
						<li><a href="<?php echo esc_url( $modix_contact_page_f ? get_permalink( $modix_contact_page_f ) : home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Track Order', 'modix' ); ?></a></li>
					</ul>
				</div>
			<?php endif; ?>

			<div class="footer-col">
				<h4><?php esc_html_e( 'Why Modix', 'modix' ); ?></h4>
				<ul class="footer-trust">
					<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/></svg> <?php esc_html_e( '1-2 year warranty on every product', 'modix' ); ?></li>
					<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h2l2.6 12.6a2 2 0 002 1.4h8.8a2 2 0 002-1.6L21 8H6"/></svg> <?php echo esc_html( sprintf( __( 'Free shipping over %s', 'modix' ), wp_strip_all_tags( function_exists( 'modix_format_price' ) ? modix_format_price( function_exists( 'modix_freeship_threshold' ) ? modix_freeship_threshold() : 2999 ) : '₹2,999' ) ) ); ?></li>
					<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v6h6M20 20v-6h-6"/><path d="M5 14a8 8 0 0014 3M19 10A8 8 0 005 7"/></svg> <?php esc_html_e( '7-day easy returns', 'modix' ); ?></li>
					<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg> <?php esc_html_e( 'Secure checkout', 'modix' ); ?></li>
				</ul>
			</div>
		</div>
		<div class="container footer-bottom">
			<span><?php echo esc_html( get_theme_mod( 'modix_footer_copyright', '© ' . gmdate( 'Y' ) . ' Modix Technologies. All rights reserved.' ) ); ?></span>
			<div class="footer-payments"><span>VISA</span><span>MC</span><span>UPI</span><span>PayPal</span></div>
		</div>
	</footer>

<?php wp_footer(); ?>
</body>
</html>
