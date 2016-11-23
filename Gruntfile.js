module.exports = function (grunt) {

	const tsconfig = grunt.file.readJSON('tsconfig.json');

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-stylus');
	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-tslint');

	grunt.initConfig({
		tsconfig,
		packageJson: grunt.file.readJSON('package.json'),
		devDirectory: '<%= tsconfig.compilerOptions.outDir %>',

		copy: {
			dev: {
				cwd: '.',
				dest: '<%= devDirectory %>',
				expand: true,
				src: 'src/doc/**/*.html'
			}
		},

		stylus: {
			dev: {
				options: {
					'include css': true
				},
				files: [ {
					dest: '<%= devDirectory %>',
					expand: true,
					ext: '.css',
					src: 'src/doc/**/*.styl'
				} ]
			}
		},

		ts: {
			dev: {
				tsconfig: {
					passThrough: true,
					tsconfig: 'tsconfig.json'
				}
			}
		},

		tslint: {
			options: {
				configuration: grunt.file.readJSON('tslint.json')
			},
			src: [ '<%= tsconfig.include %>' ]
		}
	});

	grunt.registerTask('dev', [
		'tslint',
		'ts',
		'stylus',
		'copy'
	]);

	grunt.registerTask('default', [ 'dev' ]);
}
