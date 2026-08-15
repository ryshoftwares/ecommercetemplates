<?php
/**
 * Newsletter / skin-quiz opt-in — heading/subtext/button/note are all
 * customizer-editable (Customize → Newsletter / Skin Quiz Section).
 * Submits via AJAX to noae_ajax_newsletter_subscribe() (inc/woocommerce.php);
 * see that function's docblock for the "wire up a mail provider" note.
 *
 * @package Noae
 */

$eyebrow = get_theme_mod( 'noae_newsletter_eyebrow', 'Find Your Ritual' );
$heading = get_theme_mod( 'noae_newsletter_heading', 'What Does Your Skin Need?' );
$subtext = get_theme_mod( 'noae_newsletter_subtext', 'Join the list for a personalised routine match, early access to launches, and 10% off your first order.' );
$button  = get_theme_mod( 'noae_newsletter_button', 'Get My Match' );
$note    = get_theme_mod( 'noae_newsletter_note', 'Use code NOAE10 at checkout. No spam, unsubscribe anytime.' );
?>
<section class="noae-section noae-reveal" id="skin-quiz">
	<div class="noae-container">
		<div class="noae-newsletter">
			<?php if ( $eyebrow ) : ?><span class="noae-section__eyebrow"><?php echo esc_html( $eyebrow ); ?></span><?php endif; ?>
			<h2><?php echo esc_html( $heading ); ?></h2>
			<?php if ( $subtext ) : ?><p><?php echo esc_html( $subtext ); ?></p><?php endif; ?>
			<form class="noae-newsletter__form" data-newsletter-form>
				<label for="newsletterEmail" class="noae-visually-hidden"><?php esc_html_e( 'Email address', 'noae' ); ?></label>
				<input type="email" id="newsletterEmail" placeholder="you@email.com" required>
				<button type="submit" class="noae-btn noae-btn--dark"><?php echo esc_html( $button ); ?></button>
			</form>
			<?php if ( $note ) : ?><p class="noae-newsletter__note"><?php echo esc_html( $note ); ?></p><?php endif; ?>
		</div>
	</div>
</section>
