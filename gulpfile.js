'use strict';

// LOAD PLUGINS
var	gulp			= require('gulp'),
	path			= require('path'), // Directories here
	critical		= require('critical'),
	data			= require('gulp-data'),
	pug				= require('gulp-pug'),
	sass			= require('gulp-sass'),
	prefix			= require('gulp-autoprefixer'),
	imagemin		= require('gulp-imagemin'),
	sourcemaps		= require('gulp-sourcemaps'),
	gulpif			= require('gulp-if'),
	uncss			= require('gulp-uncss'),
	uglify			= require('gulp-uglify'),
	useref			= require('gulp-useref'),
	babel			= require('gulp-babel'),
	image			= require('gulp-image'),
	browserSync		= require('browser-sync');
	//browserSync		= require('browser-sync').create();

// Directories here
var paths = {
	src:		'./src/',
	data:		'./src/_data/',
	img:		'./src/images/',
	sass:		'./src/sass/',
	js:			'./src/js/',
	
	public:		'./app/',
	pIMG:		'./app/images/',
	pCSS:		'./app/css/',
	pJS:		'./app/js/',
};

// Compile .pug files and pass in data from json file
// matching file name. index.pug - index.pug.json
gulp.task('pug', function () {
	return gulp.src('./src/*.pug')
	.pipe(data(function (file) {
		//return require(paths.data + path.basename(file.path) + '.json');
		return require(paths.data + 'data.json');
	}))
	.pipe(pug({pretty: true}))
	.on('error', function (err) {
		process.stderr.write(err.message + '\n');
		this.emit('end');
	})
	.pipe(gulp.dest(paths.public));
});

// Compile .scss files into public css directory With autoprefixer no
// need for vendor prefixes then live reload the browser.
gulp.task('sass', function () {
	return gulp.src(paths.sass + '**/*.scss')
		.pipe(sourcemaps.init())						// source map
		.pipe(sass({
			includePaths: [paths.sass],
			outputStyle: 'compressed'
		})).on('error', sass.logError)
		
		//.pipe(sourcemaps.write(paths.pCSS))				// source map ?
		
		.pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
			cascade: true
		}))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(paths.pCSS));
		//.pipe(browserSync.reload({
		//	stream: true
		//}));
});

gulp.task('uncss' ,['build'] , function () {
	return gulp.src(paths.sass + '**/*.scss')
		.pipe(sass({outputStyle: 'compressed'})).on('error', sass.logError)
		.pipe(uncss({
			//html: ['app/index_amp.html']
			html: ['app/index_amp.html', 'app/blog_amp.html', 'app/list_amp.html', 'app/post_amp.html', 'app/reviews_amp.html']
		}))
		.pipe(prefix(['last 2 versions'], {
			cascade: true
		}))
		.pipe(gulp.dest(paths.pCSS))
		.pipe(browserSync.reload({
			stream: true
	}));
});


// Recompile .pug files and live reload the browser
gulp.task('rebuild', ['pug'], function () {
	browserSync.reload();
});


// Wait for pug and sass tasks, then launch the browser-sync Server
gulp.task('browser-sync', ['sass', 'pug'], function () {
	browserSync({
		server: {
		baseDir: paths.public
		},
		notify: false
	});
});



// Watch scss files for changes & recompile
// Watch .pug files run pug-rebuild then reload BrowserSync
gulp.task('watch', function () {
	gulp.watch(paths.sass + '**/*.sass', ['sass']);
	gulp.watch(paths.sass + '**/*.scss', ['sass']);
	gulp.watch(paths.js + '**/*.js', ['copy']);
	gulp.watch('./src/**/*.pug', ['rebuild']);
	gulp.watch('./app/**/*.+(html|js))', ['bundle']);
});


// Generate & Inline Critical-path CSS
gulp.task('critical',['build'], function (cb) {
	critical.generate({
		inline: false,
		base: 'app/',
		src: 'index.html',
		dest: 'app/css/index-critical.css',
		width: 320,
		height: 450,
		minify: true
	});
});

// TASK

// Build task compile sass and pug.
gulp.task('build', ['sass', 'pug', 'img', 'copy']);


// copy to
gulp.task('copy', function(){
	return gulp.src(paths.img + '**/*')
		//.pipe(gulpif('*.js', uglify()))
		.pipe(gulp.dest(paths.pJS))
		.pipe(browserSync.stream())
});


// bundle
gulp.task('bundle',['copy'], function(){
	return gulp.src(paths.public + '**/*.+(html|js)')
		.pipe(useref())
		.pipe(gulpif('*.js', sourcemaps.init()))
		.pipe(gulpif('*.js', babel({presets: ["env"]})))
		//.pipe(gulpif('*.js', uglify()))
		.pipe(gulpif('*.js', sourcemaps.write('.')))
		.pipe(gulp.dest(paths.public))
});


gulp.task('img', function(){
	return gulp.src(paths.img + '**/*')
		.pipe(image())
		.pipe(gulp.dest(paths.pIMG))
});

// Default task, running just `gulp` will compile the sass,
// compile the jekyll site, launch BrowserSync then watch
// files for changes
gulp.task('default', ['browser-sync', 'watch']);

gulp.task('amp', ['pug']);