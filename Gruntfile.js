module.exports = function (grunt) {

	const tsconfig = grunt.file.readJSON('tsconfig.json');

	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-tslint');

	grunt.initConfig({
		tsconfig,
		packageJson: grunt.file.readJSON('package.json'),
		devDirectory: '<%= tsconfig.compilerOptions.outDir %>',

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
		'ts'
	]);

	grunt.registerTask('default', [ 'dev' ]);
}
