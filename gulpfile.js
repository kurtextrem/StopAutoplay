'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var uglify = require('gulp-uglifyjs');
var rimraf = require('rimraf');
var runSequence = require('run-sequence');

gulp.task('json', function () {
	return gulp.src('src/*.json')
		.pipe($.replace('inject.js', 'inject.min.js'))
		.pipe($.jsonminify())
		.pipe(gulp.dest('dist'))
		.pipe($.size({
			title: 'json'
		}));
})

gulp.task('zip', function () {
	return gulp.src('dist/*').pipe($.zip('dist.zip')).pipe(gulp.dest('dist'))
})

gulp.task('copy', function () {
	return gulp.src('src/*.png').pipe(gulp.dest('dist'))
})

gulp.task('js', function () {
	return gulp.src(['*.js'], {
		cwd: 'src'
	})
	.pipe(uglify('inject.min.js', {
		mangle: {
			toplevel: true,
			screw_ie8: true
		},
		compress: {
			screw_ie8: true,
			sequences: true,
			properties: true,
			dead_code: true,
			drop_debugger: true,
			comparisons: true,
			conditionals: true,
			evaluate: true,
			booleans: true,
			loops: true,
			unused: false,
			hoist_funs: true,
			if_return: true,
			join_vars: true,
			cascade: true,
			negate_iife: true,
			drop_console: true
		}
	}))
	.pipe($.replace('"use strict";', ''))
	.pipe(gulp.dest('dist'))
	.pipe($.size({
		title: 'js'
	}));
})

// Clean Output Directory
gulp.task('clean', function (cb) {
	rimraf('dist', rimraf.bind({}, '.tmp', cb));
});

// Build Production Files
gulp.task('build', function (cb) {
	runSequence(['js', 'json', 'copy'], 'zip', cb);
});

// Default Task
gulp.task('default', ['clean'], function (cb) {
	gulp.start('build', cb);
});
