/*-----------------------------------------------------------------------------------*/
/* devDependencies
/*-----------------------------------------------------------------------------------*/

var gulp         = require('gulp');

var gutil        = require('gulp-util');

var cache        = require('gulp-cache');
var del          = require('del');

var sass         = require('gulp-ruby-sass');
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var rename       = require('gulp-rename');
var uncss        = require('gulp-uncss');
var minifyCss    = require('gulp-minify-css');
var filter       = require('gulp-filter');

var uglify       = require('gulp-uglify');

var imagemin     = require('gulp-imagemin');

var browserSync  = require('browser-sync');
var reload       = browserSync.reload;

/*-----------------------------------------------------------------------------------*/
/* Paths
/*-----------------------------------------------------------------------------------*/

var paths = {
	src: {
		sass:    './_assets/sass/',
		styles:  './_assets/sass/**/*.scss',
		scripts: './_assets/js/**/*.js',
		images:  './_assets/img/**/*(*.gif|*.jpg|*.png|*.svg)'
	},
	dst: {
		root:    './',
		styles:  './css/',
		scripts: './js/',
		images:  './img/',
		html:    './**/*(*.txt|*.md|*.html|*.php)'
	}
};

/*-----------------------------------------------------------------------------------*/
/* Cleanup
/*-----------------------------------------------------------------------------------*/

/**
 * Clear cache.
 */
gulp.task('clear', function(cb) {
	return cache.clearAll(cb);
});

/**
 * Delete generated files.
 */
gulp.task('clean', function(cb) {
	del([
		'.sass-cache',
		paths.dst.styles,
		paths.dst.scripts,
		paths.dst.images
	], cb);
});

gulp.task('cleanup', ['clear', 'clean']);

/*-----------------------------------------------------------------------------------*/
/* Styles
/*-----------------------------------------------------------------------------------*/

/*
 * Process Sass files.
 */
gulp.task('styles', function() {
	return sass(paths.src.sass, {
			sourcemap: true,
			style: 'compact'
		})
		.on('error', gutil.log)
		.pipe(sourcemaps.init({
			loadMaps: true
		}))
		.pipe(autoprefixer('> 1%', 'last 2 versions'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(paths.dst.styles))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(uncss({
			html: ['index.html']
		}))
		.pipe(minifyCss({
			keepSpecialComments: 1
		}))
		.pipe(gulp.dest(paths.dst.styles))
		.pipe(filter('**/*.min.css'))
		.pipe(reload({
			stream: true
		}));
});

/*-----------------------------------------------------------------------------------*/
/* Minify scripts.
/*-----------------------------------------------------------------------------------*/

gulp.task('scripts', function() {
	return gulp.src(paths.src.scripts)
		.pipe(uglify())
		.on('error', gutil.log)
		.pipe(gulp.dest(paths.dst.scripts));
});

/*-----------------------------------------------------------------------------------*/
/* Optimize images.
/*-----------------------------------------------------------------------------------*/

gulp.task('images', function() {
	return gulp.src(paths.src.images)
		.pipe(cache(imagemin({
			optimizationLevel: 7,
			progressive: true,
			interlaced: true
		})))
		.on('error', gutil.log)
		.pipe(gulp.dest(paths.dst.images));
});

/*-----------------------------------------------------------------------------------*/
/* Generate files.
/*-----------------------------------------------------------------------------------*/

gulp.task('build', ['styles', 'scripts', 'images']);

/*-----------------------------------------------------------------------------------*/
/* Sync browsers and watch files for changes.
/*-----------------------------------------------------------------------------------*/

gulp.task('serve', ['build'], function() {

	// Sync Browsers.
	browserSync({
		server: {
			baseDir: "./"
		}
	});

	// Watch styles.
	gulp.watch([paths.src.styles], ['styles']);

	// Watch scripts.
	gulp.watch([paths.src.scripts], ['scripts']).on('change', reload);

	// Watch images.
	gulp.watch([paths.src.images], ['images']);

	// Watch html.
	gulp.watch([paths.dst.html]).on('change', reload);

});

/*-----------------------------------------------------------------------------------*/
/* Stream tasks.
/*-----------------------------------------------------------------------------------*/

gulp.task('default', ['serve']);
