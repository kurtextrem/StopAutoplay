module.exports = function (grunt) {
	'use strict';

        // Force use of Unix newlines
        grunt.util.linefeed = '\n';

        RegExp.quote = function (string) {
        	return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
        }
        // Project configuration.
        grunt.initConfig({

                // Task configuration.
                clean: {
                	dist: ['dist/']
                },

                jscs: {
                	options: {
                		config: '.jscs.json'
                	},
                	src: {
                		src: ['inject.js']
                	}
                },

                uglify: {
                	options: {
                		mangle: {
                			toplevel: true,
                			screw_ie8: true

                		},
                		compress: {
                			screw_ie8: true
                		}
                	},
                	main: {
                		src: ['src/inject.js'],
                		dest: 'dist/inject.min.js'
                	}
                },

                zip: {
                	main: {
                		cwd: 'dist/',
                		src: ['dist/**'],
                		dest: 'dist/ext.zip'
                	}
                },

                crx: {
                	build: {
                		src: 'dist/',
                		dest: 'dist/ext.crx',
                		exclude: ['.git', '.svn', 'ext.zip'],
                		privateKey: 'ext.pem'
                	}
                },

                copy: {
                	build: {
                		files: [{
                			expand: true,
                			flatten: true,
                			src: ['src/*.png', 'src/*.json'],
                			dest: 'dist/',
                			filter: 'isFile'
                		}]
                	}
                },

                sed: {
                	min: {
                		path: 'dist/manifest.json',
                		pattern: 'inject.js',
                		replacement: 'inject.min.js'
                	},
                	strict: {
                		path: 'dist/inject.min.js',
                		pattern: '"use strict";',
                		replacement: ''
                	}
                }
        });


        // These plugins provide necessary tasks.
        require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });

        // JS check task
        grunt.registerTask('check-js', ['jscs']);

        // JS distribution task.
        grunt.registerTask('dist-js', ['uglify']);

        // Copy distribution task.
        grunt.registerTask('dist-copy', ['copy', 'sed']);

        // Zip distribution task.
        grunt.registerTask('dist-zip', ['zip']);

        // CRX distribution task. NOT WORKING!!
        //grunt.registerTask('dist-crx', ['crx']);

        // Full distribution task.
        grunt.registerTask('dist', ['check-js', 'clean', 'dist-js', 'dist-copy', 'dist-zip']);

        // Default task.
        grunt.registerTask('default', ['dist']);
};
