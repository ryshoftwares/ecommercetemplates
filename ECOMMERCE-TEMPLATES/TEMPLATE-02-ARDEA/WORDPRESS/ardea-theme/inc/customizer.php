<?php
/**
 * WP Customizer: copy/link/image controls only.
 *
 * Design-integrity note: ARDEA's palette (Sand #EDE6DA / Terracotta
 * #A9603E / Deep Olive #4B5A45 / Charcoal Brown #2E2A26 / Cream #FAF7F2),
 * the two brand fonts (Fraunces + Manrope) and the spacing/type scale are
 * the whole identity of this "pixel-faithful reproduction" brief — they
 * live as CSS custom properties in style.css. We deliberately do NOT
 * expose color pickers here: a merchant swapping the terracotta accent
 * would silently break the contrast/hover states tuned throughout
 * style.css (badges, focus rings, sale flashes, wishlist heart fill) and
 * no longer be "the Ardea design". Everything that is safe to change
 * per-store — copy, links, hero/announcement/newsletter content, the logo
 * (via core custom-logo) and social URLs — is exposed below.
 *
 * @package Ardea
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function ardea_customize_register( $wp_customize ) {

	/* ---------------------------------------------------------------
	 * Announcement bar
	 * ------------------------------------------------------------- */
	$wp_customize->add_section(
		'ardea_announcement',
		array(
			'title'    => __( 'Announcement Bar', 'ardea' ),
			'priority' => 20,
		)
	);

	$wp_customize->add_setting(
		'ardea_announce_1',
		array(
			'default'           => 'Complimentary white-glove delivery on orders over ₹75,000',
			'sanitize_callback' => 'wp_kses_post',
		)
	);
	$wp_customize->add_control(
		'ardea_announce_1',
		array(
			'label'   => __( 'Message 1 (allows basic HTML)', 'ardea' ),
			'section' => 'ardea_announcement',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'ardea_announce_2',
		array(
			'default'           => 'New arrivals landing every season — solid oak, walnut and natural stone',
			'sanitize_callback' => 'wp_kses_post',
		)
	);
	$wp_customize->add_control(
		'ardea_announce_2',
		array(
			'label'   => __( 'Message 2 (leave blank to hide)', 'ardea' ),
			'section' => 'ardea_announcement',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'ardea_announce_3',
		array(
			'default'           => 'Handcrafted to order — most pieces ship within 2–4 weeks',
			'sanitize_callback' => 'wp_kses_post',
		)
	);
	$wp_customize->add_control(
		'ardea_announce_3',
		array(
			'label'   => __( 'Message 3 (leave blank to hide)', 'ardea' ),
			'section' => 'ardea_announcement',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'ardea_announce_link',
		array(
			'default'           => '',
			'sanitize_callback' => 'esc_url_raw',
		)
	);
	$wp_customize->add_control(
		'ardea_announce_link',
		array(
			'label'   => __( 'Announcement bar link (optional — wraps the whole bar)', 'ardea' ),
			'section' => 'ardea_announcement',
			'type'    => 'url',
		)
	);

	/* ---------------------------------------------------------------
	 * Hero section
	 * ------------------------------------------------------------- */
	$wp_customize->add_section(
		'ardea_hero',
		array(
			'title'    => __( 'Homepage Hero', 'ardea' ),
			'priority' => 21,
		)
	);

	$hero_fields = array(
		'ardea_hero_eyebrow'       => array( 'Ardea — Autumn Collection', __( 'Eyebrow', 'ardea' ), 'text' ),
		'ardea_hero_heading_line1' => array( 'DESIGNED', __( 'Heading — line 1', 'ardea' ), 'text' ),
		'ardea_hero_heading_line2' => array( 'FOR LIVING', __( 'Heading — line 2', 'ardea' ), 'text' ),
		'ardea_hero_subheading'    => array( 'Solid oak, walnut and stone furniture, hand-finished in small batches and built to be repaired, re-covered and passed on — not replaced every few years.', __( 'Subheading', 'ardea' ), 'textarea' ),
		'ardea_hero_tag_title'     => array( 'Handcrafted in Small Batches', __( 'Media tag — title', 'ardea' ), 'text' ),
		'ardea_hero_tag_text'      => array( 'Solid oak, walnut and natural stone, finished entirely by hand.', __( 'Media tag — caption', 'ardea' ), 'text' ),
		'ardea_hero_cta_text'      => array( 'Shop Collections', __( 'Primary CTA text', 'ardea' ), 'text' ),
		'ardea_hero_cta_link'      => array( '', __( 'Primary CTA link', 'ardea' ), 'url' ),
		'ardea_hero_cta2_text'     => array( 'Explore Our Story', __( 'Secondary CTA text', 'ardea' ), 'text' ),
		'ardea_hero_cta2_link'     => array( '', __( 'Secondary CTA link', 'ardea' ), 'url' ),
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
				'section' => 'ardea_hero',
				'type'    => $type,
			)
		);
	}

	$wp_customize->add_setting(
		'ardea_hero_image',
		array(
			'default'           => ARDEA_URI . '/assets/images/ardea-hero-designed-for-living.svg',
			'sanitize_callback' => 'esc_url_raw',
		)
	);
	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'ardea_hero_image',
			array(
				'label'   => __( 'Hero image', 'ardea' ),
				'section' => 'ardea_hero',
			)
		)
	);

	/* ---------------------------------------------------------------
	 * Footer
	 * ------------------------------------------------------------- */
	$wp_customize->add_section(
		'ardea_footer',
		array(
			'title'    => __( 'Footer', 'ardea' ),
			'priority' => 22,
		)
	);

	$wp_customize->add_setting(
		'ardea_footer_about',
		array(
			'default'           => 'Modern furniture and home decor, designed in small batches from solid wood, natural fibre and stone — built to be lived in, repaired, and passed on.',
			'sanitize_callback' => 'sanitize_textarea_field',
		)
	);
	$wp_customize->add_control(
		'ardea_footer_about',
		array(
			'label'   => __( 'Footer brand blurb', 'ardea' ),
			'section' => 'ardea_footer',
			'type'    => 'textarea',
		)
	);

	$wp_customize->add_setting(
		'ardea_newsletter_footer_text',
		array(
			'default'           => 'Slow design notes, new arrivals and studio news — no spam.',
			'sanitize_callback' => 'sanitize_text_field',
		)
	);
	$wp_customize->add_control(
		'ardea_newsletter_footer_text',
		array(
			'label'   => __( 'Footer newsletter blurb', 'ardea' ),
			'section' => 'ardea_footer',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'ardea_footer_copyright',
		array(
			'default'           => '© ' . gmdate( 'Y' ) . ' ARDEA Living. All rights reserved.',
			'sanitize_callback' => 'sanitize_text_field',
		)
	);
	$wp_customize->add_control(
		'ardea_footer_copyright',
		array(
			'label'   => __( 'Copyright line', 'ardea' ),
			'section' => 'ardea_footer',
			'type'    => 'text',
		)
	);

	$socials = array(
		'ardea_social_instagram' => 'https://instagram.com/ardealiving',
		'ardea_social_facebook'  => '',
		'ardea_social_pinterest' => 'https://pinterest.com/ardealiving',
		'ardea_social_x'         => '',
	);
	foreach ( $socials as $id => $default ) {
		$label = str_replace( array( 'ardea_social_', '_' ), array( '', ' ' ), $id );
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
				'label'   => sprintf( __( '%s URL (leave blank to hide the icon)', 'ardea' ), ucfirst( trim( $label ) ) ),
				'section' => 'ardea_footer',
				'type'    => 'url',
			)
		);
	}

	/* ---------------------------------------------------------------
	 * Newsletter section (homepage)
	 * ------------------------------------------------------------- */
	$wp_customize->add_section(
		'ardea_newsletter',
		array(
			'title'    => __( 'Newsletter Section', 'ardea' ),
			'priority' => 23,
		)
	);

	$wp_customize->add_setting(
		'ardea_newsletter_heading',
		array(
			'default'           => 'Slow design notes, straight to your inbox',
			'sanitize_callback' => 'sanitize_text_field',
		)
	);
	$wp_customize->add_control(
		'ardea_newsletter_heading',
		array(
			'label'   => __( 'Heading', 'ardea' ),
			'section' => 'ardea_newsletter',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'ardea_newsletter_subtext',
		array(
			'default'           => 'New arrivals, workshop stories and the occasional discount — no more than twice a month.',
			'sanitize_callback' => 'sanitize_textarea_field',
		)
	);
	$wp_customize->add_control(
		'ardea_newsletter_subtext',
		array(
			'label'   => __( 'Subtext', 'ardea' ),
			'section' => 'ardea_newsletter',
			'type'    => 'textarea',
		)
	);
}
add_action( 'customize_register', 'ardea_customize_register' );
