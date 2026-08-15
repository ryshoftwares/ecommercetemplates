<?php
/**
 * Newsletter signup — heading/subtext are customizer-editable. Submits
 * via AJAX to ardea_ajax_newsletter_subscribe() (inc/woocommerce.php);
 * see that function's docblock for the "wire up a mail provider" note.
 *
 * @package Ardea
 */

$heading = get_theme_mod( 'ardea_newsletter_heading', 'Slow design notes, straight to your inbox' );
$subtext = get_theme_mod( 'ardea_newsletter_subtext', 'New arrivals, workshop stories and the occasional discount — no more than twice a month.' );
?>
<section class="section newsletter container">
	<div class="newsletter__inner">
		<p class="eyebrow" style="justify-content:center;"><?php esc_html_e( 'Stay in Touch', 'ardea' ); ?></p>
		<h2><?php echo esc_html( $heading ); ?></h2>
		<?php if ( $subtext ) : ?><p class="lead"><?php echo esc_html( $subtext ); ?></p><?php endif; ?>
		<form class="newsletter-form" data-newsletter-form>
			<input type="email" required placeholder="<?php esc_attr_e( 'Email address', 'ardea' ); ?>" aria-label="<?php esc_attr_e( 'Email address', 'ardea' ); ?>">
			<button type="submit" class="btn btn--primary"><?php esc_html_e( 'Subscribe', 'ardea' ); ?></button>
		</form>
		<p class="newsletter__note"><?php esc_html_e( 'By subscribing you agree to our Privacy Policy. Unsubscribe anytime.', 'ardea' ); ?></p>
	</div>
</section>
