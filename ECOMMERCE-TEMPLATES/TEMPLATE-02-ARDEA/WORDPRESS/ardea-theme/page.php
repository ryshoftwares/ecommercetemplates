<?php
/**
 * Generic WYSIWYG page template (About, Contact, and any other editor
 * page). Content is wrapped in .entry-content so it inherits the brand's
 * type scale/colors (see style.css) instead of default browser styles,
 * while the page-hero's H1 stays the one H1 on the page for SEO.
 *
 * @package Ardea
 */

get_header();
?>
<main id="main">
	<nav class="breadcrumbs container" aria-label="<?php esc_attr_e( 'Breadcrumb', 'ardea' ); ?>">
		<ol>
			<li><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'ardea' ); ?></a></li>
			<li aria-current="page"><?php the_title(); ?></li>
		</ol>
	</nav>

	<section class="page-hero container">
		<h1 class="page-hero__title"><?php the_title(); ?></h1>
		<?php if ( has_excerpt() ) : ?><p class="page-hero__lead lead"><?php echo esc_html( get_the_excerpt() ); ?></p><?php endif; ?>
	</section>

	<div class="container section--tight page-content-wrap">
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
</main>
<?php
get_footer();
