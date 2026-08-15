<?php
/**
 * Newsletter signup — heading/subtext are customizer-editable. Submits
 * via AJAX to velora_ajax_newsletter_subscribe() (inc/woocommerce.php);
 * see that function's docblock for the "wire up a mail provider" note.
 *
 * @package Velora
 */

$heading = get_theme_mod( 'velora_newsletter_heading', 'Join the Velora List' );
$subtext = get_theme_mod( 'velora_newsletter_subtext', 'Be first to hear about new collections, private sales and styling notes from our design team.' );
?>
<section class="newsletter reveal">
	<div class="container">
		<h2><?php echo esc_html( $heading ); ?></h2>
		<?php if ( $subtext ) : ?><p><?php echo esc_html( $subtext ); ?></p><?php endif; ?>
		<form class="newsletter-form" data-newsletter-form>
			<input type="email" required placeholder="<?php esc_attr_e( 'Your email address', 'velora' ); ?>" aria-label="<?php esc_attr_e( 'Email address', 'velora' ); ?>">
			<button type="submit" class="btn btn-ivory"><?php esc_html_e( 'Subscribe', 'velora' ); ?></button>
		</form>
		<p class="newsletter-note"><?php esc_html_e( 'By subscribing you agree to receive marketing emails from Velora. Unsubscribe anytime.', 'velora' ); ?></p>
	</div>
</section>
