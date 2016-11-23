(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'typescript', './generator/convert', 'glob'], factory);
    }
})(function (require, exports) {
    "use strict";
    var typescript_1 = require('typescript');
    var convert_1 = require('./generator/convert');
    var glob = require('glob');
    glob('../compose/src/**/*.ts', { realpath: true }, function (err, files) {
        if (err) {
            throw err;
        }
        console.log(files);
        var compilerOptions = {
            lib: [
                'lib.dom.d.ts',
                'lib.es5.d.ts',
                'lib.es2015.iterable.d.ts',
                'lib.es2015.symbol.d.ts',
                'lib.es2015.symbol.wellknown.d.ts',
                'lib.es2015.promise.d.ts'
            ],
            module: typescript_1.ModuleKind.UMD,
            moduleResolution: typescript_1.ModuleResolutionKind.NodeJs,
            project: '../compose',
            target: typescript_1.ScriptTarget.ES5
        };
        var host = typescript_1.createCompilerHost(compilerOptions);
        var program = typescript_1.createProgram(files, compilerOptions, host);
        var results = convert_1.default(files, program);
        console.log(JSON.stringify(results.results, undefined, '  '));
        // console.log(results.diagnostics);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBQUEsMkJBT08sWUFBWSxDQUFDLENBQUE7SUFDcEIsd0JBQW9CLHFCQUFxQixDQUFDLENBQUE7SUFDMUMsSUFBWSxJQUFJLFdBQU0sTUFBTSxDQUFDLENBQUE7SUFFN0IsSUFBSSxDQUFDLHdCQUF3QixFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFHLFVBQUMsR0FBRyxFQUFFLEtBQUs7UUFDOUQsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNULE1BQU0sR0FBRyxDQUFDO1FBQ1gsQ0FBQztRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFbkIsSUFBTSxlQUFlLEdBQW9CO1lBQ3hDLEdBQUcsRUFBRTtnQkFDSixjQUFjO2dCQUNkLGNBQWM7Z0JBQ2QsMEJBQTBCO2dCQUMxQix3QkFBd0I7Z0JBQ3hCLGtDQUFrQztnQkFDbEMseUJBQXlCO2FBQ3pCO1lBQ0QsTUFBTSxFQUFFLHVCQUFVLENBQUMsR0FBRztZQUN0QixnQkFBZ0IsRUFBRSxpQ0FBb0IsQ0FBQyxNQUFNO1lBQzdDLE9BQU8sRUFBRSxZQUFZO1lBQ3JCLE1BQU0sRUFBRSx5QkFBWSxDQUFDLEdBQUc7U0FDeEIsQ0FBQztRQUNGLElBQU0sSUFBSSxHQUFHLCtCQUFrQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ2pELElBQU0sT0FBTyxHQUFHLDBCQUFhLENBQUMsS0FBSyxFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUU1RCxJQUFNLE9BQU8sR0FBRyxpQkFBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUV4QyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5RCxvQ0FBb0M7SUFDckMsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuXHRjcmVhdGVDb21waWxlckhvc3QsXG5cdGNyZWF0ZVByb2dyYW0sXG5cdENvbXBpbGVyT3B0aW9ucyxcblx0TW9kdWxlS2luZCxcblx0TW9kdWxlUmVzb2x1dGlvbktpbmQsXG5cdFNjcmlwdFRhcmdldFxufSBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCBjb252ZXJ0IGZyb20gJy4vZ2VuZXJhdG9yL2NvbnZlcnQnO1xuaW1wb3J0ICogYXMgZ2xvYiBmcm9tICdnbG9iJztcblxuZ2xvYignLi4vY29tcG9zZS9zcmMvKiovKi50cycsIHsgcmVhbHBhdGg6IHRydWUgfSAsIChlcnIsIGZpbGVzKSA9PiB7XG5cdGlmIChlcnIpIHtcblx0XHR0aHJvdyBlcnI7XG5cdH1cblxuXHRjb25zb2xlLmxvZyhmaWxlcyk7XG5cblx0Y29uc3QgY29tcGlsZXJPcHRpb25zOiBDb21waWxlck9wdGlvbnMgPSB7XG5cdFx0bGliOiBbXG5cdFx0XHQnbGliLmRvbS5kLnRzJyxcblx0XHRcdCdsaWIuZXM1LmQudHMnLFxuXHRcdFx0J2xpYi5lczIwMTUuaXRlcmFibGUuZC50cycsXG5cdFx0XHQnbGliLmVzMjAxNS5zeW1ib2wuZC50cycsXG5cdFx0XHQnbGliLmVzMjAxNS5zeW1ib2wud2VsbGtub3duLmQudHMnLFxuXHRcdFx0J2xpYi5lczIwMTUucHJvbWlzZS5kLnRzJ1xuXHRcdF0sXG5cdFx0bW9kdWxlOiBNb2R1bGVLaW5kLlVNRCxcblx0XHRtb2R1bGVSZXNvbHV0aW9uOiBNb2R1bGVSZXNvbHV0aW9uS2luZC5Ob2RlSnMsXG5cdFx0cHJvamVjdDogJy4uL2NvbXBvc2UnLFxuXHRcdHRhcmdldDogU2NyaXB0VGFyZ2V0LkVTNVxuXHR9O1xuXHRjb25zdCBob3N0ID0gY3JlYXRlQ29tcGlsZXJIb3N0KGNvbXBpbGVyT3B0aW9ucyk7XG5cdGNvbnN0IHByb2dyYW0gPSBjcmVhdGVQcm9ncmFtKGZpbGVzLCBjb21waWxlck9wdGlvbnMsIGhvc3QpO1xuXG5cdGNvbnN0IHJlc3VsdHMgPSBjb252ZXJ0KGZpbGVzLCBwcm9ncmFtKTtcblxuXHRjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShyZXN1bHRzLnJlc3VsdHMsIHVuZGVmaW5lZCwgJyAgJykpO1xuXHQvLyBjb25zb2xlLmxvZyhyZXN1bHRzLmRpYWdub3N0aWNzKTtcbn0pO1xuIl19