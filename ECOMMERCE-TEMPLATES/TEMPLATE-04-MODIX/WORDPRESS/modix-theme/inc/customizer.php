<?php
/**
 * WP Customizer: copy/link/image controls only.
 *
 * Design-integrity note: MODIX's palette (White #FFFFFF / Off-white #F5F6F8
 * / Charcoal #17181C / Slate #4B5563 / Electric Blue accent #2F5DFF), the
 * three brand fonts (Space Grotesk + Inter + JetBrains Mono) and the
 * spacing/type scale are the whole identity of this "pixel-faithful
 * reproduction" brief — they live as CSS custom properties in style.css. We
 * deliberately do NOT expose color pickers here: a merchant swapping the
 * electric-blue accent would silently break the contrast/hover states tuned
 * throughout style.css (badges, spec chips, focus rings, sale flashes,
 * wishlist heart fill) and no longer be "the Modix design". Everything
 * that is safe to change per-store — copy, links, hero/announcement/
 * newsletter content, the logo (via core custom-logo) and social URLs — is
 * exposed below.
 *
 * @package Modix
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function modix_customize_register( $wp_customize ) {

	/* ---------------------------------------------------------------
	 * Announcement bar
	 * ------------------------------------------------------------- */
	$wp_customize->add_section(
		'modix_announcement',
		array(
			'title'    => __( 'Announcement Bar', 'modix' ),
			'priority' => 20,
		)
	);

	$wp_customize->add_setting(
		'modix_announce_1',
		array(
			'default'           => 'Free shipping on orders over ₹2,999',
			'sanitize_callback' => 'wp_kses_post',
		)
	);
	$wp_customize->add_control(
		'modix_announce_1',
		array(
			'label'   => __( 'Message 1 (allows basic HTML)', 'modix' ),
			'section' => 'modix_announcement',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'modix_announce_2',
		array(
			'default'           => 'New: the latest Modix flagship phone is now shipping',
			'sanitize_callback' => 'wp_kses_post',
		)
	);
	$wp_customize->add_control(
		'modix_announce_2',
		array(
			'label'   => __( 'Message 2 (leave blank to hide)', 'modix' ),
			'section' => 'modix_announcement',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'modix_announce_3',
		array(
			'default'           => 'Use code MODIX10 for 10% off your first order',
			'sanitize_callback' => 'wp_kses_post',
		)
	);
	$wp_customize->add_control(
		'modix_announce_3',
		array(
			'label'   => __( 'Message 3 (leave blank to hide)', 'modix' ),
			'section' => 'modix_announcement',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'modix_announce_link',
		array(
			'default'           => '',
			'sanitize_callback' => 'esc_url_raw',
		)
	);
	$wp_customize->add_control(
		'modix_announce_link',
		array(
			'label'   => __( 'Announcement bar link (optional — wraps the whole bar)', 'modix' ),
			'section' => 'modix_announcement',
			'type'    => 'url',
		)
	);

	/* ---------------------------------------------------------------
	 * Utility strip (dark charcoal bar above the header)
	 * ------------------------------------------------------------- */
	$wp_customize->add_section(
		'modix_utility',
		array(
			'title'    => __( 'Utility Strip', 'modix' ),
			'priority' => 21,
		)
	);

	$utility_fields = array(
		'modix_utility_support_text'      => array( 'Support', __( 'Support link text', 'modix' ), 'text' ),
		'modix_utility_support_link'      => array( '', __( 'Support link URL', 'modix' ), 'url' ),
		'modix_utility_track_order_text'  => array( 'Track Order', __( 'Track Order link text', 'modix' ), 'text' ),
		'modix_utility_track_order_link'  => array( '', __( 'Track Order link URL', 'modix' ), 'url' ),
		'modix_utility_meta_text'         => array( 'Free shipping over ₹2,999', __( 'Right-side meta text', 'modix' ), 'text' ),
		'modix_utility_story_text'        => array( 'Our Story', __( 'Right-side "Our Story" link text', 'modix' ), 'text' ),
		'modix_utility_story_link'        => array( '', __( '"Our Story" link URL', 'modix' ), 'url' ),
	);
	foreach ( $utility_fields as $id => $field ) {
		list( $default, $label, $type ) = $field;
		$wp_customize->add_setting(
			$id,
			array(
				'default'           => $default,
				'sanitize_callback' => ( 'url' === $type ) ? 'esc_url_raw' : 'sanitize_text_field',
			)
		);
		$wp_customize->add_control(
			$id,
			array(
				'label'   => $label,
				'section' => 'modix_utility',
				'type'    => $type,
			)
		);
	}

	/* ---------------------------------------------------------------
	 * Hero section
	 * ------------------------------------------------------------- */
	$wp_customize->add_section(
		'modix_hero',
		array(
			'title'    => __( 'Homepage Hero', 'modix' ),
			'priority' => 22,
		)
	);

	$hero_fields = array(
		'modix_hero_eyebrow'       => array( 'Modix Lineup 2026', __( 'Eyebrow', 'modix' ), 'text' ),
		'modix_hero_heading_line1' => array( 'TECHNOLOGY,', __( 'Heading — line 1', 'modix' ), 'text' ),
		'modix_hero_heading_line2' => array( 'REFINED.', __( 'Heading — line 2', 'modix' ), 'text' ),
		'modix_hero_subheading'    => array( 'Precision-engineered smartphones, laptops, audio and smart home devices — built around real specs, not marketing gloss. Every product ships with a published warranty and a full spec sheet.', __( 'Subheading', 'modix' ), 'textarea' ),
		'modix_hero_badge_title'   => array( '5,000mAh', __( 'Media badge — title', 'modix' ), 'text' ),
		'modix_hero_badge_text'    => array( 'Flagship phone battery', __( 'Media badge — caption', 'modix' ), 'text' ),
		'modix_hero_cta_text'      => array( 'Shop Latest', __( 'Primary CTA text', 'modix' ), 'text' ),
		'modix_hero_cta_link'      => array( '', __( 'Primary CTA link', 'modix' ), 'url' ),
		'modix_hero_cta2_text'     => array( 'Compare Models', __( 'Secondary CTA text', 'modix' ), 'text' ),
		'modix_hero_cta2_link'     => array( '', __( 'Secondary CTA link', 'modix' ), 'url' ),
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
				'section' => 'modix_hero',
				'type'    => $type,
			)
		);
	}

	$wp_customize->add_setting(
		'modix_hero_image',
		array(
			'default'           => MODIX_URI . '/assets/images/modix-hero-technology-refined.svg',
			'sanitize_callback' => 'esc_url_raw',
		)
	);
	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'modix_hero_image',
			array(
				'label'   => __( 'Hero image', 'modix' ),
				'section' => 'modix_hero',
			)
		)
	);

	/* ---------------------------------------------------------------
	 * Footer
	 * ------------------------------------------------------------- */
	$wp_customize->add_section(
		'modix_footer',
		array(
			'title'    => __( 'Footer', 'modix' ),
			'priority' => 23,
		)
	);

	$wp_customize->add_setting(
		'modix_footer_about',
		array(
			'default'           => 'Premium electronics engineered for clarity, speed and everyday reliability — designed in-house, tested obsessively.',
			'sanitize_callback' => 'sanitize_textarea_field',
		)
	);
	$wp_customize->add_control(
		'modix_footer_about',
		array(
			'label'   => __( 'Footer brand blurb', 'modix' ),
			'section' => 'modix_footer',
			'type'    => 'textarea',
		)
	);

	$wp_customize->add_setting(
		'modix_footer_copyright',
		array(
			'default'           => '© ' . gmdate( 'Y' ) . ' Modix Technologies. All rights reserved.',
			'sanitize_callback' => 'sanitize_text_field',
		)
	);
	$wp_customize->add_control(
		'modix_footer_copyright',
		array(
			'label'   => __( 'Copyright line', 'modix' ),
			'section' => 'modix_footer',
			'type'    => 'text',
		)
	);

	$socials = array(
		'modix_social_instagram' => 'https://www.instagram.com/',
		'modix_social_x'         => 'https://twitter.com/',
		'modix_social_youtube'   => 'https://www.youtube.com/',
	);
	foreach ( $socials as $id => $default ) {
		$label = str_replace( array( 'modix_social_', '_' ), array( '', ' ' ), $id );
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
				'label'   => sprintf( __( '%s URL (leave blank to hide the icon)', 'modix' ), ucfirst( trim( $label ) ) ),
				'section' => 'modix_footer',
				'type'    => 'url',
			)
		);
	}

	/* ---------------------------------------------------------------
	 * Newsletter section (homepage + footer forms)
	 * ------------------------------------------------------------- */
	$wp_customize->add_section(
		'modix_newsletter',
		array(
			'title'    => __( 'Newsletter Section', 'modix' ),
			'priority' => 24,
		)
	);

	$wp_customize->add_setting(
		'modix_newsletter_heading',
		array(
			'default'           => 'Get early access to new Modix drops',
			'sanitize_callback' => 'sanitize_text_field',
		)
	);
	$wp_customize->add_control(
		'modix_newsletter_heading',
		array(
			'label'   => __( 'Heading', 'modix' ),
			'section' => 'modix_newsletter',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'modix_newsletter_subtext',
		array(
			'default'           => 'Product launches, firmware updates and members-only pricing — no spam, unsubscribe any time.',
			'sanitize_callback' => 'sanitize_textarea_field',
		)
	);
	$wp_customize->add_control(
		'modix_newsletter_subtext',
		array(
			'label'   => __( 'Subtext', 'modix' ),
			'section' => 'modix_newsletter',
			'type'    => 'textarea',
		)
	);
}
add_action( 'customize_register', 'modix_customize_register' );
