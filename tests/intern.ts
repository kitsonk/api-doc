import 'intern';

export const proxyPort = 9000;

export const capabilities = {
	project: 'Dojo 2',
	name: 'dojo-api-doc'
};

export const loaders = {
	'host-node': 'dojo-loader'
};

export const loaderOptions = {
	// Packages that should be registered with the loader in each testing environment
	packages: [
		{ name: 'src', location: '_build/src' },
		{ name: 'tests', location: '_build/tests' },
		{ name: 'node_modules', location: '_build/node_modules' },
		{ name: 'dojo', location: 'node_modules/intern/browser_modules/dojo' }
	]
};

export const suites = [ 'tests/unit/all' ];

export const excludeInstrumentation = /(?:node_modules|tests)[\/\\]/;
