<?php
/**
 * Generic page template (About, Contact, and any other WYSIWYG page).
 * WordPress editor content is wrapped in .entry-content so it inherits
 * the brand's type scale/colors (see style.css §26) instead of default
 * browser styles, while the page's own H1 (page-band) stays the one H1
 * on the page for SEO.
 *
 * @package Velora
 */

get_header();
?>
<main id="main">
	<div class="page-band">
		<div class="container">
			<div class="breadcrumb">
				<ol>
					<li><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'velora' ); ?></a></li>
					<li aria-current="page"><?php the_title(); ?></li>
				</ol>
			</div>
			<h1><?php the_title(); ?></h1>
			<?php if ( has_excerpt() ) : ?><p><?php echo esc_html( get_the_excerpt() ); ?></p><?php endif; ?>
		</div>
	</div>

	<div class="page-content-wrap">
		<div class="container">
			<?php
			while ( have_posts() ) :
				the_post();
				?>
				<div class="entry-content">
					<?php the_content(); ?>
				</div>
				<?php
				if ( comments_open() || get_comments_number() ) :
					comments_template();
				endif;
			endwhile;
			?>
		</div>
	</div>
</main>
<?php
get_footer();
