<?php
/**
 * Generic WYSIWYG page template (About, Contact, and any other editor
 * page). Content is rendered inside the demo's `.noae-page-header` +
 * container structure so it inherits the brand's type scale/colors
 * instead of default browser styles, while the page-header's H1 stays the
 * one H1 on the page for SEO.
 *
 * @package Noae
 */

get_header();
?>
<main id="main">
	<nav class="noae-container noae-breadcrumb" aria-label="<?php esc_attr_e( 'Breadcrumb', 'noae' ); ?>">
		<ol>
			<li><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'noae' ); ?></a></li>
			<li aria-current="page"><?php the_title(); ?></li>
		</ol>
	</nav>

	<section class="noae-page-header">
		<div class="noae-container">
			<h1><?php the_title(); ?></h1>
			<?php if ( has_excerpt() ) : ?><p class="noae-page-header__intro"><?php echo esc_html( get_the_excerpt() ); ?></p><?php endif; ?>
		</div>
	</section>

	<div class="noae-container" style="padding-bottom: var(--space-9);">
		<?php
		while ( have_posts() ) :
			the_post();
			?>
			<div class="entry-content" style="max-width:820px;margin:0 auto;">
				<?php the_content(); ?>
			</div>
			<?php
			if ( comments_open() || get_comments_number() ) :
				comments_template();
			endif;
		endwhile;
		?>
	</div>
</main>
<?php
get_footer();
