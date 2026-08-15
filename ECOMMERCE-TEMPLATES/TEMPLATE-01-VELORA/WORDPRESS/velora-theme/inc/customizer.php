<?php
/**
 * WP Customizer: copy/link/image controls only.
 *
 * Design-integrity note: Velora's palette (Black #0A0A0A / Ivory #F7F3EC /
 * Warm Beige #C9B79C / Charcoal #2B2B2B / Burgundy #6E2A33), the two brand
 * fonts (Playfair Display + Jost) and the spacing/type scale are the whole
 * identity of this "pixel-faithful reproduction" brief — they live as CSS
 * custom properties in style.css. We deliberately do NOT expose color
 * pickers here: a merchant swapping the burgundy accent for, say, teal
 * would silently break the contrast/hover states tuned throughout
 * style.css (badges, focus rings, sale flashes, wishlist heart fill) and
 * no longer be "the Velora design". Everything that is safe to change
 * per-store — copy, links, the hero/announcement/newsletter content, the
 * logo (via core custom-logo) and social URLs — is exposed below.
 *
 * @package Velora
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function velora_customize_register( $wp_customize ) {

	/* ---------------------------------------------------------------
	 * Announcement bar
	 * ------------------------------------------------------------- */
	$wp_customize->add_section(
		'velora_announcement',
		array(
			'title'    => __( 'Announcement Bar', 'velora' ),
			'priority' => 20,
		)
	);

	$wp_customize->add_setting(
		'velora_announce_1',
		array(
			'default'           => 'Free shipping on orders over ₹4,000',
			'sanitize_callback' => 'wp_kses_post',
		)
	);
	$wp_customize->add_control(
		'velora_announce_1',
		array(
			'label'   => __( 'Message 1 (allows <strong> tags)', 'velora' ),
			'section' => 'velora_announcement',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'velora_announce_2',
		array(
			'default'           => 'The New Season collection is now live',
			'sanitize_callback' => 'wp_kses_post',
		)
	);
	$wp_customize->add_control(
		'velora_announce_2',
		array(
			'label'   => __( 'Message 2', 'velora' ),
			'section' => 'velora_announcement',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'velora_announce_3',
		array(
			'default'           => 'Use code <strong>VELORA10</strong> for 10% off your first order',
			'sanitize_callback' => 'wp_kses_post',
		)
	);
	$wp_customize->add_control(
		'velora_announce_3',
		array(
			'label'   => __( 'Message 3 (leave blank to hide)', 'velora' ),
			'section' => 'velora_announcement',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'velora_announce_link',
		array(
			'default'           => '',
			'sanitize_callback' => 'esc_url_raw',
		)
	);
	$wp_customize->add_control(
		'velora_announce_link',
		array(
			'label'       => __( 'Announcement bar link (optional — wraps the whole bar)', 'velora' ),
			'section'     => 'velora_announcement',
			'type'        => 'url',
		)
	);

	/* ---------------------------------------------------------------
	 * Hero section
	 * ------------------------------------------------------------- */
	$wp_customize->add_section(
		'velora_hero',
		array(
			'title'    => __( 'Homepage Hero', 'velora' ),
			'priority' => 21,
		)
	);

	$hero_fields = array(
		'velora_hero_eyebrow'     => array( 'Autumn / Winter Collection', __( 'Eyebrow', 'velora' ), 'text' ),
		'velora_hero_heading'     => array( 'THE NEW SEASON', __( 'Heading (H1)', 'velora' ), 'text' ),
		'velora_hero_subheading'  => array( 'Tailored silhouettes, natural fibres, and considered colour — a collection built for women who dress with intention, not for trends that fade by spring.', __( 'Subheading', 'velora' ), 'textarea' ),
		'velora_hero_cta_text'    => array( 'Shop New Arrivals', __( 'Primary CTA text', 'velora' ), 'text' ),
		'velora_hero_cta_link'    => array( '', __( 'Primary CTA link', 'velora' ), 'url' ),
		'velora_hero_cta2_text'   => array( 'Explore Lookbook', __( 'Secondary CTA text', 'velora' ), 'text' ),
		'velora_hero_cta2_link'   => array( '', __( 'Secondary CTA link', 'velora' ), 'url' ),
	);
	foreach ( $hero_fields as $id => $field ) {
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
				'section' => 'velora_hero',
				'type'    => $type,
			)
		);
	}

	$wp_customize->add_setting(
		'velora_hero_image',
		array(
			'default'           => VELORA_URI . '/assets/images/velora-hero-new-season.svg',
			'sanitize_callback' => 'esc_url_raw',
		)
	);
	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'velora_hero_image',
			array(
				'label'   => __( 'Hero image', 'velora' ),
				'section' => 'velora_hero',
			)
		)
	);

	/* ---------------------------------------------------------------
	 * Footer
	 * ------------------------------------------------------------- */
	$wp_customize->add_section(
		'velora_footer',
		array(
			'title'    => __( 'Footer', 'velora' ),
			'priority' => 22,
		)
	);

	$wp_customize->add_setting(
		'velora_footer_about',
		array(
			'default'           => 'Premium fashion for the woman who dresses with intention. Tailored dresses, outerwear, knitwear and accessories, made to last.',
			'sanitize_callback' => 'sanitize_textarea_field',
		)
	);
	$wp_customize->add_control(
		'velora_footer_about',
		array(
			'label'   => __( 'Footer brand blurb', 'velora' ),
			'section' => 'velora_footer',
			'type'    => 'textarea',
		)
	);

	$wp_customize->add_setting(
		'velora_footer_copyright',
		array(
			'default'           => '© ' . gmdate( 'Y' ) . ' Velora. All rights reserved.',
			'sanitize_callback' => 'sanitize_text_field',
		)
	);
	$wp_customize->add_control(
		'velora_footer_copyright',
		array(
			'label'   => __( 'Copyright line', 'velora' ),
			'section' => 'velora_footer',
			'type'    => 'text',
		)
	);

	$socials = array(
		'velora_social_instagram' => 'https://instagram.com/velora',
		'velora_social_facebook'  => 'https://facebook.com/velora',
		'velora_social_pinterest' => 'https://pinterest.com/velora',
		'velora_social_x'         => '',
	);
	foreach ( $socials as $id => $default ) {
		$label = str_replace( array( 'velora_social_', '_' ), array( '', ' ' ), $id );
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
				'label'   => sprintf( __( '%s URL (leave blank to hide the icon)', 'velora' ), ucfirst( trim( $label ) ) ),
				'section' => 'velora_footer',
				'type'    => 'url',
			)
		);
	}

	/* ---------------------------------------------------------------
	 * Newsletter section
	 * ------------------------------------------------------------- */
	$wp_customize->add_section(
		'velora_newsletter',
		array(
			'title'    => __( 'Newsletter Section', 'velora' ),
			'priority' => 23,
		)
	);

	$wp_customize->add_setting(
		'velora_newsletter_heading',
		array(
			'default'           => 'Join the Velora List',
			'sanitize_callback' => 'sanitize_text_field',
		)
	);
	$wp_customize->add_control(
		'velora_newsletter_heading',
		array(
			'label'   => __( 'Heading', 'velora' ),
			'section' => 'velora_newsletter',
			'type'    => 'text',
		)
	);

	$wp_customize->add_setting(
		'velora_newsletter_subtext',
		array(
			'default'           => 'Be first to hear about new collections, private sales and styling notes from our design team.',
			'sanitize_callback' => 'sanitize_textarea_field',
		)
	);
	$wp_customize->add_control(
		'velora_newsletter_subtext',
		array(
			'label'   => __( 'Subtext', 'velora' ),
			'section' => 'velora_newsletter',
			'type'    => 'textarea',
		)
	);
}
add_action( 'customize_register', 'velora_customize_register' );
