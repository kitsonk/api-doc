import {
	createCompilerHost,
	createProgram,
	CompilerOptions,
	ModuleKind,
	ModuleResolutionKind,
	ScriptTarget
} from 'typescript';
import convert from './converter/convert';
import * as glob from 'glob';

glob('../compose/src/**/*.ts', { realpath: true } , (err, files) => {
	if (err) {
		throw err;
	}

	const compilerOptions: CompilerOptions = {
		lib: [
			'lib.dom.d.ts',
			'lib.es5.d.ts',
			'lib.es2015.iterable.d.ts',
			'lib.es2015.symbol.d.ts',
			'lib.es2015.symbol.wellknown.d.ts',
			'lib.es2015.promise.d.ts'
		],
		module: ModuleKind.UMD,
		moduleResolution: ModuleResolutionKind.NodeJs,
		project: '../compose',
		target: ScriptTarget.ES5
	};
	const host = createCompilerHost(compilerOptions);
	const program = createProgram(files, compilerOptions, host);

	const results = convert(files, program);

	console.log(JSON.stringify(results.results, undefined, '  '));
	console.log(results.diagnostics);
});
