module.exports = function (grunt) {

	const tsconfig = grunt.file.readJSON('tsconfig.json');

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-tslint');
	grunt.loadNpmTasks('intern');
	grunt.loadNpmTasks('remap-istanbul');

	grunt.initConfig({
		tsconfig,
		packageJson: grunt.file.readJSON('package.json'),
		devDirectory: '<%= tsconfig.compilerOptions.outDir %>',

		clean: {
			dev: {
				src: [ '<%= devDirectory %>' ]
			},

			test: {
				src: [ 'coverage-unmapped.json', 'html-report' ]
			}
		},

		intern: {
			test: {
				options: {
					runType: 'client',
					config: '<%= devDirectory %>/tests/intern',
					reporters: {
						id: 'tests/support/Reporter',
						file: 'coverage-unmapped.json'
					}
				}
			}
		},

		remapIstanbul: {
			test: {
				options: {
					reports: {
						'html': 'html-report',
						'text': null
					}
				},
				src: [ 'coverage-unmapped.json' ]
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
		'clean',
		'tslint',
		'ts'
	]);

	grunt.registerTask('test', [
		'dev',
		'clean:test',
		'intern',
		'remapIstanbul'
	]);

	grunt.registerTask('default', [ 'dev' ]);
}
