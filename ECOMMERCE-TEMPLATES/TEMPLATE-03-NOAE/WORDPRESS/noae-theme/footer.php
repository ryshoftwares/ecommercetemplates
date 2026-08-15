<?php
/**
 * Footer: brand column + social, three link columns (widget-area
 * overridable, falling back to the demo's real Shop/Company/Help links),
 * bottom bar with copyright + payment icons.
 *
 * @package Noae
 */
?>
<footer class="noae-footer">
	<div class="noae-container">
		<div class="noae-footer__grid">
			<div>
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="noae-footer__logo">
					<?php if ( has_custom_logo() ) : ?>
						<?php the_custom_logo(); ?>
					<?php else : ?>
						NO<span style="color:var(--color-rose)">AÉ</span>
					<?php endif; ?>
				</a>
				<p class="noae-footer__desc"><?php echo esc_html( get_theme_mod( 'noae_footer_about', 'Modern rituals for skin, hair, and mind — formulated with ingredient-forward honesty and a whole lot of softness.' ) ); ?></p>
				<div class="noae-footer__social">
					<?php
					$noae_socials = array(
						'instagram' => array( get_theme_mod( 'noae_social_instagram', 'https://instagram.com/noae' ), 'IG' ),
						'pinterest' => array( get_theme_mod( 'noae_social_pinterest', 'https://pinterest.com/noae' ), 'PN' ),
						'facebook'  => array( get_theme_mod( 'noae_social_facebook', '' ), 'FB' ),
					);
					foreach ( $noae_socials as $noae_network => $noae_data ) {
						if ( empty( $noae_data[0] ) ) {
							continue;
						}
						printf(
							'<a href="%1$s" aria-label="%2$s" target="_blank" rel="noopener noreferrer">%3$s</a>',
							esc_url( $noae_data[0] ),
							/* translators: %s: social network name. */
							esc_attr( sprintf( __( 'NOAÉ on %s', 'noae' ), ucfirst( $noae_network ) ) ),
							esc_html( $noae_data[1] )
						);
					}
					?>
				</div>
			</div>

			<?php if ( is_active_sidebar( 'footer-shop' ) ) : ?>
				<?php dynamic_sidebar( 'footer-shop' ); ?>
			<?php else : ?>
				<div>
					<p class="noae-footer__heading"><?php esc_html_e( 'Shop', 'noae' ); ?></p>
					<ul class="noae-footer__list">
						<?php
						$noae_shop_links = function_exists( 'noae_footer_shop_links' ) ? noae_footer_shop_links() : array( __( 'All Products', 'noae' ) => home_url( '/' ) );
						foreach ( $noae_shop_links as $noae_label => $noae_url ) :
							?>
							<li><a href="<?php echo esc_url( $noae_url ); ?>"><?php echo esc_html( $noae_label ); ?></a></li>
						<?php endforeach; ?>
					</ul>
				</div>
			<?php endif; ?>

			<?php if ( has_nav_menu( 'footer' ) ) : ?>
				<nav>
					<p class="noae-footer__heading"><?php esc_html_e( 'Company', 'noae' ); ?></p>
					<?php
					wp_nav_menu(
						array(
							'theme_location' => 'footer',
							'container'      => false,
							'items_wrap'     => '<ul class="noae-footer__list">%3$s</ul>',
							'depth'          => 1,
						)
					);
					?>
				</nav>
			<?php elseif ( is_active_sidebar( 'footer-company' ) ) : ?>
				<?php dynamic_sidebar( 'footer-company' ); ?>
			<?php else : ?>
				<?php
				$noae_about_f   = get_page_by_path( 'about' );
				$noae_contact_f = get_page_by_path( 'contact' );
				?>
				<div>
					<p class="noae-footer__heading"><?php esc_html_e( 'Company', 'noae' ); ?></p>
					<ul class="noae-footer__list">
						<li><a href="<?php echo esc_url( $noae_about_f ? get_permalink( $noae_about_f ) : home_url( '/about/' ) ); ?>"><?php esc_html_e( 'Our Story', 'noae' ); ?></a></li>
						<li><a href="<?php echo esc_url( $noae_contact_f ? get_permalink( $noae_contact_f ) : home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Contact', 'noae' ); ?></a></li>
						<li><a href="<?php echo esc_url( function_exists( 'noae_get_wishlist_page_url' ) ? noae_get_wishlist_page_url() : home_url( '/' ) ); ?>"><?php esc_html_e( 'Wishlist', 'noae' ); ?></a></li>
						<li><a href="<?php echo esc_url( function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/cart/' ) ); ?>"><?php esc_html_e( 'Bag', 'noae' ); ?></a></li>
					</ul>
				</div>
			<?php endif; ?>

			<?php if ( is_active_sidebar( 'footer-help' ) ) : ?>
				<?php dynamic_sidebar( 'footer-help' ); ?>
			<?php else : ?>
				<?php $noae_contact_f2 = get_page_by_path( 'contact' ); ?>
				<div>
					<p class="noae-footer__heading"><?php esc_html_e( 'Help', 'noae' ); ?></p>
					<ul class="noae-footer__list">
						<li><a href="<?php echo esc_url( $noae_contact_f2 ? get_permalink( $noae_contact_f2 ) : home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Shipping & Returns', 'noae' ); ?></a></li>
						<li><a href="<?php echo esc_url( $noae_contact_f2 ? get_permalink( $noae_contact_f2 ) : home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'FAQs', 'noae' ); ?></a></li>
						<li><a href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/' ) ); ?>"><?php esc_html_e( 'Track Order', 'noae' ); ?></a></li>
						<?php $noae_privacy_url = function_exists( 'get_privacy_policy_url' ) ? get_privacy_policy_url() : ''; ?>
						<li><a href="<?php echo esc_url( $noae_privacy_url ? $noae_privacy_url : '#' ); ?>"><?php esc_html_e( 'Privacy Policy', 'noae' ); ?></a></li>
					</ul>
				</div>
			<?php endif; ?>
		</div>

		<div class="noae-footer__bottom">
			<p><?php echo wp_kses_post( str_replace( (string) gmdate( 'Y' ), '<span class="js-current-year">' . gmdate( 'Y' ) . '</span>', get_theme_mod( 'noae_footer_copyright', '© ' . gmdate( 'Y' ) . ' NOAÉ. All rights reserved.' ) ) ); ?></p>
			<p class="noae-footer__payments"><?php echo esc_html( get_theme_mod( 'noae_footer_payments', 'Visa · Mastercard · UPI · Cash on Delivery' ) ); ?></p>
		</div>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
