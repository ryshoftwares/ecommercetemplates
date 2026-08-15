<?php
/**
 * Newsletter section — customizer-editable heading/subtext (Customize →
 * Newsletter Section). Submits via AJAX to `modix_newsletter_subscribe`
 * (see inc/woocommerce.php); no email service is wired up out of the box,
 * so a merchant hooks `modix_newsletter_subscribed` to their own provider.
 *
 * @package Modix
 */
?>
<section class="section section--alt newsletter" data-reveal>
	<div class="container">
		<span class="eyebrow" style="justify-content:center;"><?php esc_html_e( 'Stay Updated', 'modix' ); ?></span>
		<h2><?php echo esc_html( get_theme_mod( 'modix_newsletter_heading', 'Get early access to new Modix drops' ) ); ?></h2>
		<p><?php echo esc_html( get_theme_mod( 'modix_newsletter_subtext', 'Product launches, firmware updates and members-only pricing — no spam, unsubscribe any time.' ) ); ?></p>
		<form class="newsletter__form" data-newsletter-form>
			<label class="visually-hidden" for="newsletter-email"><?php esc_html_e( 'Email address', 'modix' ); ?></label>
			<input type="email" id="newsletter-email" placeholder="you@example.com" required>
			<button type="submit" class="btn btn-primary"><?php esc_html_e( 'Subscribe', 'modix' ); ?></button>
		</form>
	</div>
</section>
