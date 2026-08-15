<?php
/**
 * WP Customizer: copy/link/image controls only.
 *
 * Design-integrity note: NOAÉ's palette (Cream #FBF7F4 / Dusty Rose #D9A9A0
 * / Sage #A9B6A1 / Charcoal Plum #3A2E30 / Warm Gold #C9A66B), the two
 * brand fonts (Cormorant Garamond + Nunito Sans) and the spacing/type scale
 * are the whole identity of this "pixel-faithful reproduction" brief — they
 * live as CSS custom properties in style.css. We deliberately do NOT expose
 * color pickers here: a merchant swapping the rose accent would silently
 * break the contrast/hover states tuned throughout style.css (badges, focus
 * rings, sale flashes, wishlist heart fill) and no longer be "the NOAÉ
 * design". Everything that is safe to change per-store — copy, links,
 * hero/announcement/newsletter content, the logo (via core custom-logo)
 * and social URLs — is exposed below.
 *
 * Copy defaults below are real, on-brand NOAÉ copy (no lorem ipsum) but
 * deliberately never name a specific demo product (e.g. never "New
 * arrival: [Product Name]") — announcement/hero/footer copy must stay true
 * for any real catalogue a merchant loads into this theme.
 *
 * @package Noae
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function noae_customize_register( $wp_customize ) {

	/* ---------------------------------------------------------------
	 * Announcement bar
	 * ------------------------------------------------------------- */
	$wp_customize->add_section(
		'noae_announcement',
		array(
			'title'    => __( 'Announcement Bar', 'noae' ),
			'priority' => 20,
		)
	);

	$wp_customize->add_setting(
		'noae_announce_1',
		array(
			'default'           => 'Free shipping on orders over ₹1,999',
			'sanitize_callback' => 'wp_kses_post',
		)
	);
	$wp_customize->add_control(
		'noae_announce_1',
		array(
			'label'   => __( 'Message 1 (allows basic HTML)', 'noae' ),
			'section' => 'noae_announcement',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'noae_announce_2',
		array(
			'default'           => 'New arrivals restocked every season',
			'sanitize_callback' => 'wp_kses_post',
		)
	);
	$wp_customize->add_control(
		'noae_announce_2',
		array(
			'label'   => __( 'Message 2 (leave blank to hide)', 'noae' ),
			'section' => 'noae_announcement',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'noae_announce_3',
		array(
			'default'           => 'Use code NOAE10 for 10% off your first ritual',
			'sanitize_callback' => 'wp_kses_post',
		)
	);
	$wp_customize->add_control(
		'noae_announce_3',
		array(
			'label'   => __( 'Message 3 (leave blank to hide)', 'noae' ),
			'section' => 'noae_announcement',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'noae_announce_link',
		array(
			'default'           => '',
			'sanitize_callback' => 'esc_url_raw',
		)
	);
	$wp_customize->add_control(
		'noae_announce_link',
		array(
			'label'   => __( 'Announcement bar link (optional — wraps the whole bar)', 'noae' ),
			'section' => 'noae_announcement',
			'type'    => 'url',
		)
	);

	/* ---------------------------------------------------------------
	 * Hero section
	 * ------------------------------------------------------------- */
	$wp_customize->add_section(
		'noae_hero',
		array(
			'title'    => __( 'Homepage Hero', 'noae' ),
			'priority' => 21,
		)
	);

	$hero_fields = array(
		'noae_hero_eyebrow'    => array( 'Ingredient-Forward Beauty', __( 'Eyebrow', 'noae' ), 'text' ),
		'noae_hero_heading'    => array( 'YOUR DAILY RITUAL', __( 'Heading', 'noae' ), 'text' ),
		'noae_hero_subheading' => array( "Skin-first formulas with visible-ingredient honesty, built into a five-minute morning and night ritual you'll actually look forward to.", __( 'Subheading', 'noae' ), 'textarea' ),
		'noae_hero_cta_text'   => array( 'Shop Bestsellers', __( 'Primary CTA text', 'noae' ), 'text' ),
		'noae_hero_cta_link'   => array( '', __( 'Primary CTA link', 'noae' ), 'url' ),
		'noae_hero_cta2_text'  => array( 'Take the Skin Quiz', __( 'Secondary CTA text', 'noae' ), 'text' ),
		'noae_hero_cta2_link'  => array( '#skin-quiz', __( 'Secondary CTA link', 'noae' ), 'url' ),
	);
	foreach ( $hero_fields as $id => $field ) {
		list( $default, $label, $type ) = $field;
		$wp_customize->add_setting(
			$id,
			array(
				'default'           => $default,
				'sanitize_callback' => ( 'url' === $type ) ? 'esc_url_raw' : ( ( 'textarea' === $type ) ? 'sanitize_textarea_field' : 'sanitize_text_field' ),
			)
		);
		$wp_customize->add_control(
			$id,
			array(
				'label'   => $label,
				'section' => 'noae_hero',
				'type'    => $type,
			)
		);
	}

	$wp_customize->add_setting(
		'noae_hero_image',
		array(
			'default'           => NOAE_URI . '/assets/images/noae-hero-daily-ritual.svg',
			'sanitize_callback' => 'esc_url_raw',
		)
	);
	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'noae_hero_image',
			array(
				'label'   => __( 'Hero image', 'noae' ),
				'section' => 'noae_hero',
			)
		)
	);

	/* ---------------------------------------------------------------
	 * Footer
	 * ------------------------------------------------------------- */
	$wp_customize->add_section(
		'noae_footer',
		array(
			'title'    => __( 'Footer', 'noae' ),
			'priority' => 22,
		)
	);

	$wp_customize->add_setting(
		'noae_footer_about',
		array(
			'default'           => 'Modern rituals for skin, hair, and mind — formulated with ingredient-forward honesty and a whole lot of softness.',
			'sanitize_callback' => 'sanitize_textarea_field',
		)
	);
	$wp_customize->add_control(
		'noae_footer_about',
		array(
			'label'   => __( 'Footer brand blurb', 'noae' ),
			'section' => 'noae_footer',
			'type'    => 'textarea',
		)
	);

	$wp_customize->add_setting(
		'noae_footer_copyright',
		array(
			'default'           => '© ' . gmdate( 'Y' ) . ' NOAÉ. All rights reserved.',
			'sanitize_callback' => 'sanitize_text_field',
		)
	);
	$wp_customize->add_control(
		'noae_footer_copyright',
		array(
			'label'   => __( 'Copyright line', 'noae' ),
			'section' => 'noae_footer',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'noae_footer_payments',
		array(
			'default'           => 'Visa · Mastercard · UPI · Cash on Delivery',
			'sanitize_callback' => 'sanitize_text_field',
		)
	);
	$wp_customize->add_control(
		'noae_footer_payments',
		array(
			'label'   => __( 'Payment methods line', 'noae' ),
			'section' => 'noae_footer',
			'type'    => 'text',
		)
	);

	$socials = array(
		'noae_social_instagram' => 'https://instagram.com/noae',
		'noae_social_pinterest' => 'https://pinterest.com/noae',
		'noae_social_facebook'  => '',
	);
	foreach ( $socials as $id => $default ) {
		$label = str_replace( array( 'noae_social_', '_' ), array( '', ' ' ), $id );
		$wp_customize->add_setting(
			$id,
			array(
				'default'           => $default,
				'sanitize_callback' => 'esc_url_raw',
			)
		);
		$wp_customize->add_control(
			$id,
			array(
				/* translators: %s: social network name. */
				'label'   => sprintf( __( '%s URL (leave blank to hide the icon)', 'noae' ), ucfirst( trim( $label ) ) ),
				'section' => 'noae_footer',
				'type'    => 'url',
			)
		);
	}

	/* ---------------------------------------------------------------
	 * Newsletter / Skin Quiz section (homepage)
	 * ------------------------------------------------------------- */
	$wp_customize->add_section(
		'noae_newsletter',
		array(
			'title'    => __( 'Newsletter / Skin Quiz Section', 'noae' ),
			'priority' => 23,
		)
	);

	$wp_customize->add_setting(
		'noae_newsletter_eyebrow',
		array(
			'default'           => 'Find Your Ritual',
			'sanitize_callback' => 'sanitize_text_field',
		)
	);
	$wp_customize->add_control(
		'noae_newsletter_eyebrow',
		array(
			'label'   => __( 'Eyebrow', 'noae' ),
			'section' => 'noae_newsletter',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'noae_newsletter_heading',
		array(
			'default'           => 'What Does Your Skin Need?',
			'sanitize_callback' => 'sanitize_text_field',
		)
	);
	$wp_customize->add_control(
		'noae_newsletter_heading',
		array(
			'label'   => __( 'Heading', 'noae' ),
			'section' => 'noae_newsletter',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'noae_newsletter_subtext',
		array(
			'default'           => 'Join the list for a personalised routine match, early access to launches, and 10% off your first order.',
			'sanitize_callback' => 'sanitize_textarea_field',
		)
	);
	$wp_customize->add_control(
		'noae_newsletter_subtext',
		array(
			'label'   => __( 'Subtext', 'noae' ),
			'section' => 'noae_newsletter',
			'type'    => 'textarea',
		)
	);

	$wp_customize->add_setting(
		'noae_newsletter_button',
		array(
			'default'           => 'Get My Match',
			'sanitize_callback' => 'sanitize_text_field',
		)
	);
	$wp_customize->add_control(
		'noae_newsletter_button',
		array(
			'label'   => __( 'Button text', 'noae' ),
			'section' => 'noae_newsletter',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'noae_newsletter_note',
		array(
			'default'           => 'Use code NOAE10 at checkout. No spam, unsubscribe anytime.',
			'sanitize_callback' => 'sanitize_text_field',
		)
	);
	$wp_customize->add_control(
		'noae_newsletter_note',
		array(
			'label'   => __( 'Fine-print note', 'noae' ),
			'section' => 'noae_newsletter',
			'type'    => 'text',
		)
	);
}
add_action( 'customize_register', 'noae_customize_register' );
