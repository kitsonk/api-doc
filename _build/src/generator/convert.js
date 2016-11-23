(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'typescript', 'marked'], factory);
    }
})(function (require, exports) {
    "use strict";
    var typescript_1 = require('typescript');
    var marked = require('marked');
    function convert(files, program) {
        var checker = program.getTypeChecker();
        var results = {};
        var output = [];
        function isExportedNode(node) {
            return Boolean((node.flags & typescript_1.NodeFlags.Export) !== 0 || (node.parent && node.parent.kind === typescript_1.SyntaxKind.SourceFile));
        }
        function serializeSymbol(symbol) {
            var details = {
                name: symbol.getName(),
                documentation: marked(typescript_1.displayPartsToString(symbol.getDocumentationComment()))
            };
            if (symbol.valueDeclaration) {
                details.type = checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration));
            }
            return details;
        }
        function serializeTypeParameter(typeParameter) {
            return serializeSymbol(typeParameter.symbol);
        }
        function serializeSignature(signature) {
            var details = {
                parameters: signature.parameters.map(serializeSymbol),
                returnType: checker.typeToString(signature.getReturnType()),
                documentation: marked(typescript_1.displayPartsToString(signature.getDocumentationComment()))
            };
            if (signature.typeParameters) {
                details.typeParameters = signature.typeParameters.map(serializeTypeParameter);
            }
            return details;
        }
        function serializeProperty(symbol) {
            return {
                name: symbol.getName(),
                documentation: typescript_1.displayPartsToString(symbol.getDocumentationComment())
            };
        }
        function serializeClass(symbol) {
            var details = serializeSymbol(symbol);
            var constructorType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
            details.constructors = constructorType.getConstructSignatures().map(serializeSignature);
            return details;
        }
        function serializeInterface(node) {
            var symbol = checker.getSymbolAtLocation(node.name);
            var details = serializeSymbol(symbol);
            if (node.typeParameters) {
                details.typeParameters = node.typeParameters.map(function (typeParameter) {
                    return serializeSymbol(checker.getSymbolAtLocation(typeParameter.name));
                });
            }
            details.members = node.members.map(function (member) {
                if (member.name) {
                    var symbol_1 = serializeSymbol(checker.getSymbolAtLocation(member.name));
                    symbol_1.nodeType = 'member';
                    return symbol_1;
                }
                if (member.kind === typescript_1.SyntaxKind.CallSignature) {
                    var signature = serializeSignature(checker.getSignatureFromDeclaration(member));
                    signature.nodeType = 'call';
                    return signature;
                }
                if (member.kind === typescript_1.SyntaxKind.IndexSignature) {
                    var signature = serializeSignature(checker.getSignatureFromDeclaration(member));
                    signature.nodeType = 'index';
                    return signature;
                }
                if (member.kind === typescript_1.SyntaxKind.ConstructSignature) {
                    var signature = serializeSignature(checker.getSignatureFromDeclaration(member));
                    signature.nodeType = 'new';
                    return signature;
                }
                throw new Error("Unexpected member kind: " + member.kind);
            });
            details.nodeType = 'interface';
            return details;
        }
        function serializeEnum(symbol) {
            var details = serializeSymbol(symbol);
            var enumType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
            details.properties = enumType.getProperties().map(serializeProperty);
            return details;
        }
        function visit(node) {
            if (!isExportedNode(node)) {
                return;
            }
            var symbol;
            switch (node.kind) {
                case typescript_1.SyntaxKind.ClassDeclaration:
                    symbol = checker.getSymbolAtLocation(node.name);
                    output.push(serializeClass(symbol));
                    break;
                case typescript_1.SyntaxKind.InterfaceDeclaration:
                    output.push(serializeInterface(node));
                    break;
                case typescript_1.SyntaxKind.EnumDeclaration:
                    symbol = checker.getSymbolAtLocation(node.name);
                    output.push(serializeEnum(symbol));
                    break;
                default:
                    console.log('Export Node Kind: ', node.kind);
            }
        }
        var prefixLength = '/Users/kitsonk/github/compose/src/'.length;
        program.getSourceFiles().forEach(function (sourceFile) {
            if (files.indexOf(sourceFile.fileName) > -1) {
                results[sourceFile.fileName.slice(prefixLength)] = output = [];
                typescript_1.forEachChild(sourceFile, visit);
            }
        });
        var diagnostics = program.getOptionsDiagnostics();
        if (diagnostics.length) {
            return { results: results, diagnostics: diagnostics };
        }
        diagnostics = program.getSyntacticDiagnostics();
        if (diagnostics.length) {
            return { results: results, diagnostics: diagnostics };
        }
        diagnostics = program.getGlobalDiagnostics();
        if (diagnostics.length) {
            return { results: results, diagnostics: diagnostics };
        }
        diagnostics = program.getSemanticDiagnostics();
        return { results: results, diagnostics: diagnostics };
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = convert;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9nZW5lcmF0b3IvY29udmVydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFBQSwyQkFjTyxZQUFZLENBQUMsQ0FBQTtJQUNwQixJQUFZLE1BQU0sV0FBTSxRQUFRLENBQUMsQ0FBQTtJQUVqQyxpQkFBaUIsS0FBZSxFQUFFLE9BQWdCO1FBRWpELElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUV6QyxJQUFNLE9BQU8sR0FBa0MsRUFBRSxDQUFDO1FBQ2xELElBQUksTUFBTSxHQUFVLEVBQUUsQ0FBQztRQUV2Qix3QkFBd0IsSUFBVTtZQUNqQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxzQkFBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssdUJBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3RILENBQUM7UUFFRCx5QkFBeUIsTUFBYztZQUN0QyxJQUFNLE9BQU8sR0FBUTtnQkFDcEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUU7Z0JBQ3RCLGFBQWEsRUFBRSxNQUFNLENBQUMsaUNBQW9CLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQzthQUM3RSxDQUFDO1lBQ0YsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztnQkFDN0IsT0FBTyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLGdCQUFpQixDQUFDLENBQUMsQ0FBQztZQUMxRyxDQUFDO1lBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNoQixDQUFDO1FB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QUFZLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLENBQUM7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQ2xELEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxFQUFFLGdCQUFPLEVBQUUsd0JBQVcsRUFBRSxDQUFDO1FBQ2pDLENBQUM7UUFFRCxXQUFXLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDaEQsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDeEIsTUFBTSxDQUFDLEVBQUUsZ0JBQU8sRUFBRSx3QkFBVyxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUVELFdBQVcsR0FBRyxPQUFPLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUM3QyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN4QixNQUFNLENBQUMsRUFBRSxnQkFBTyxFQUFFLHdCQUFXLEVBQUUsQ0FBQztRQUNqQyxDQUFDO1FBRUQsV0FBVyxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQy9DLE1BQU0sQ0FBQyxFQUFFLGdCQUFPLEVBQUUsd0JBQVcsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRDtzQkFBZSxPQUFPLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuXHROb2RlLFxuXHREaWFnbm9zdGljLFxuXHRQcm9ncmFtLFxuXHROb2RlRmxhZ3MsXG5cdFN5bnRheEtpbmQsXG5cdENsYXNzRGVjbGFyYXRpb24sXG5cdFN5bWJvbCxcblx0ZGlzcGxheVBhcnRzVG9TdHJpbmcsXG5cdFNpZ25hdHVyZSxcblx0Zm9yRWFjaENoaWxkLFxuXHRJbnRlcmZhY2VEZWNsYXJhdGlvbixcblx0RW51bURlY2xhcmF0aW9uLFxuXHRUeXBlUGFyYW1ldGVyXG59IGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0ICogYXMgbWFya2VkIGZyb20gJ21hcmtlZCc7XG5cbmZ1bmN0aW9uIGNvbnZlcnQoZmlsZXM6IHN0cmluZ1tdLCBwcm9ncmFtOiBQcm9ncmFtKTogeyByZXN1bHRzOiBhbnksIGRpYWdub3N0aWNzOiBEaWFnbm9zdGljW10gfSB7XG5cblx0Y29uc3QgY2hlY2tlciA9IHByb2dyYW0uZ2V0VHlwZUNoZWNrZXIoKTtcblxuXHRjb25zdCByZXN1bHRzOiB7IFtmaWxlbmFtZTogc3RyaW5nXTogYW55W10gfSA9IHt9O1xuXHRsZXQgb3V0cHV0OiBhbnlbXSA9IFtdO1xuXG5cdGZ1bmN0aW9uIGlzRXhwb3J0ZWROb2RlKG5vZGU6IE5vZGUpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gQm9vbGVhbigobm9kZS5mbGFncyAmIE5vZGVGbGFncy5FeHBvcnQpICE9PSAwIHx8IChub2RlLnBhcmVudCAmJiBub2RlLnBhcmVudC5raW5kID09PSBTeW50YXhLaW5kLlNvdXJjZUZpbGUpKTtcblx0fVxuXG5cdGZ1bmN0aW9uIHNlcmlhbGl6ZVN5bWJvbChzeW1ib2w6IFN5bWJvbCkge1xuXHRcdGNvbnN0IGRldGFpbHM6IGFueSA9IHtcblx0XHRcdG5hbWU6IHN5bWJvbC5nZXROYW1lKCksXG5cdFx0XHRkb2N1bWVudGF0aW9uOiBtYXJrZWQoZGlzcGxheVBhcnRzVG9TdHJpbmcoc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKVxuXHRcdH07XG5cdFx0aWYgKHN5bWJvbC52YWx1ZURlY2xhcmF0aW9uKSB7XG5cdFx0XHRkZXRhaWxzLnR5cGUgPSBjaGVja2VyLnR5cGVUb1N0cmluZyhjaGVja2VyLmdldFR5cGVPZlN5bWJvbEF0TG9jYXRpb24oc3ltYm9sLCBzeW1ib2wudmFsdWVEZWNsYXJhdGlvbiEpKTtcblx0XHR9XG5cdFx0cmV0dXJuIGRldGFpbHM7XG5cdH1cblxuXHRmdW5jdGlvbiBzZXJpYWxpemVUeXBlUGFyYW1ldGVyKHR5cGVQYXJhbWV0ZXI6IFR5cGVQYXJhbWV0ZXIpIHtcblx0XHRyZXR1cm4gc2VyaWFsaXplU3ltYm9sKHR5cGVQYXJhbWV0ZXIuc3ltYm9sISk7XG5cdH1cblxuXHRmdW5jdGlvbiBzZXJpYWxpemVTaWduYXR1cmUoc2lnbmF0dXJlOiBTaWduYXR1cmUpIHtcblx0XHRjb25zdCBkZXRhaWxzOiBhbnkgPSB7XG5cdFx0XHRwYXJhbWV0ZXJzOiBzaWduYXR1cmUucGFyYW1ldGVycy5tYXAoc2VyaWFsaXplU3ltYm9sKSxcblx0XHRcdHJldHVyblR5cGU6IGNoZWNrZXIudHlwZVRvU3RyaW5nKHNpZ25hdHVyZS5nZXRSZXR1cm5UeXBlKCkpLFxuXHRcdFx0ZG9jdW1lbnRhdGlvbjogbWFya2VkKGRpc3BsYXlQYXJ0c1RvU3RyaW5nKHNpZ25hdHVyZS5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSlcblx0XHR9O1xuXHRcdGlmIChzaWduYXR1cmUudHlwZVBhcmFtZXRlcnMpIHtcblx0XHRcdGRldGFpbHMudHlwZVBhcmFtZXRlcnMgPSBzaWduYXR1cmUudHlwZVBhcmFtZXRlcnMubWFwKHNlcmlhbGl6ZVR5cGVQYXJhbWV0ZXIpO1xuXHRcdH1cblx0XHRyZXR1cm4gZGV0YWlscztcblx0fVxuXG5cdGZ1bmN0aW9uIHNlcmlhbGl6ZVByb3BlcnR5KHN5bWJvbDogU3ltYm9sKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG5hbWU6IHN5bWJvbC5nZXROYW1lKCksXG5cdFx0XHRkb2N1bWVudGF0aW9uOiBkaXNwbGF5UGFydHNUb1N0cmluZyhzeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSlcblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gc2VyaWFsaXplQ2xhc3Moc3ltYm9sOiBTeW1ib2wpIHtcblx0XHRjb25zdCBkZXRhaWxzOiBhbnkgPSBzZXJpYWxpemVTeW1ib2woc3ltYm9sKTtcblx0XHRjb25zdCBjb25zdHJ1Y3RvclR5cGUgPSBjaGVja2VyLmdldFR5cGVPZlN5bWJvbEF0TG9jYXRpb24oc3ltYm9sLCBzeW1ib2wudmFsdWVEZWNsYXJhdGlvbiEpO1xuXHRcdGRldGFpbHMuY29uc3RydWN0b3JzID0gY29uc3RydWN0b3JUeXBlLmdldENvbnN0cnVjdFNpZ25hdHVyZXMoKS5tYXAoc2VyaWFsaXplU2lnbmF0dXJlKTtcblx0XHRyZXR1cm4gZGV0YWlscztcblx0fVxuXG5cdGZ1bmN0aW9uIHNlcmlhbGl6ZUludGVyZmFjZShub2RlOiBJbnRlcmZhY2VEZWNsYXJhdGlvbikge1xuXHRcdGNvbnN0IHN5bWJvbCA9IGNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihub2RlLm5hbWUhKTtcblx0XHRjb25zdCBkZXRhaWxzOiBhbnkgPSBzZXJpYWxpemVTeW1ib2woc3ltYm9sKTtcblx0XHRpZiAobm9kZS50eXBlUGFyYW1ldGVycykge1xuXHRcdFx0ZGV0YWlscy50eXBlUGFyYW1ldGVycyA9IG5vZGUudHlwZVBhcmFtZXRlcnMubWFwKCh0eXBlUGFyYW1ldGVyKSA9PiB7XG5cdFx0XHRcdHJldHVybiBzZXJpYWxpemVTeW1ib2woY2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKHR5cGVQYXJhbWV0ZXIubmFtZSkpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGRldGFpbHMubWVtYmVycyA9IG5vZGUubWVtYmVycy5tYXAoKG1lbWJlcikgPT4ge1xuXHRcdFx0aWYgKG1lbWJlci5uYW1lKSB7XG5cdFx0XHRcdGNvbnN0IHN5bWJvbDogYW55ID0gc2VyaWFsaXplU3ltYm9sKGNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihtZW1iZXIubmFtZSkpO1xuXHRcdFx0XHRzeW1ib2wubm9kZVR5cGUgPSAnbWVtYmVyJztcblx0XHRcdFx0cmV0dXJuIHN5bWJvbDtcblx0XHRcdH1cblx0XHRcdGlmIChtZW1iZXIua2luZCA9PT0gU3ludGF4S2luZC5DYWxsU2lnbmF0dXJlKSB7XG5cdFx0XHRcdGNvbnN0IHNpZ25hdHVyZTogYW55ID0gc2VyaWFsaXplU2lnbmF0dXJlKGNoZWNrZXIuZ2V0U2lnbmF0dXJlRnJvbURlY2xhcmF0aW9uKDxhbnk+IG1lbWJlcikpO1xuXHRcdFx0XHRzaWduYXR1cmUubm9kZVR5cGUgPSAnY2FsbCc7XG5cdFx0XHRcdHJldHVybiBzaWduYXR1cmU7XG5cdFx0XHR9XG5cdFx0XHRpZiAobWVtYmVyLmtpbmQgPT09IFN5bnRheEtpbmQuSW5kZXhTaWduYXR1cmUpIHtcblx0XHRcdFx0Y29uc3Qgc2lnbmF0dXJlOiBhbnkgPSBzZXJpYWxpemVTaWduYXR1cmUoY2hlY2tlci5nZXRTaWduYXR1cmVGcm9tRGVjbGFyYXRpb24oPGFueT4gbWVtYmVyKSk7XG5cdFx0XHRcdHNpZ25hdHVyZS5ub2RlVHlwZSA9ICdpbmRleCc7XG5cdFx0XHRcdHJldHVybiBzaWduYXR1cmU7XG5cdFx0XHR9XG5cdFx0XHRpZiAobWVtYmVyLmtpbmQgPT09IFN5bnRheEtpbmQuQ29uc3RydWN0U2lnbmF0dXJlKSB7XG5cdFx0XHRcdGNvbnN0IHNpZ25hdHVyZTogYW55ID0gc2VyaWFsaXplU2lnbmF0dXJlKGNoZWNrZXIuZ2V0U2lnbmF0dXJlRnJvbURlY2xhcmF0aW9uKDxhbnk+IG1lbWJlcikpO1xuXHRcdFx0XHRzaWduYXR1cmUubm9kZVR5cGUgPSAnbmV3Jztcblx0XHRcdFx0cmV0dXJuIHNpZ25hdHVyZTtcblx0XHRcdH1cblx0XHRcdHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBtZW1iZXIga2luZDogJHttZW1iZXIua2luZH1gKTtcblx0XHR9KTtcblx0XHRkZXRhaWxzLm5vZGVUeXBlID0gJ2ludGVyZmFjZSc7XG5cdFx0cmV0dXJuIGRldGFpbHM7XG5cdH1cblxuXHRmdW5jdGlvbiBzZXJpYWxpemVFbnVtKHN5bWJvbDogU3ltYm9sKSB7XG5cdFx0Y29uc3QgZGV0YWlsczogYW55ID0gc2VyaWFsaXplU3ltYm9sKHN5bWJvbCk7XG5cdFx0Y29uc3QgZW51bVR5cGUgPSBjaGVja2VyLmdldFR5cGVPZlN5bWJvbEF0TG9jYXRpb24oc3ltYm9sLCBzeW1ib2wudmFsdWVEZWNsYXJhdGlvbiEpO1xuXHRcdGRldGFpbHMucHJvcGVydGllcyA9IGVudW1UeXBlLmdldFByb3BlcnRpZXMoKS5tYXAoc2VyaWFsaXplUHJvcGVydHkpO1xuXHRcdHJldHVybiBkZXRhaWxzO1xuXHR9XG5cblx0ZnVuY3Rpb24gdmlzaXQobm9kZTogTm9kZSkge1xuXHRcdGlmICghaXNFeHBvcnRlZE5vZGUobm9kZSkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgc3ltYm9sOiBTeW1ib2w7XG5cdFx0c3dpdGNoIChub2RlLmtpbmQpIHtcblx0XHRjYXNlIFN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbjpcblx0XHRcdHN5bWJvbCA9IGNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbigoPENsYXNzRGVjbGFyYXRpb24+IG5vZGUpLm5hbWUhKTtcblx0XHRcdG91dHB1dC5wdXNoKHNlcmlhbGl6ZUNsYXNzKHN5bWJvbCkpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBTeW50YXhLaW5kLkludGVyZmFjZURlY2xhcmF0aW9uOlxuXHRcdFx0b3V0cHV0LnB1c2goc2VyaWFsaXplSW50ZXJmYWNlKDxJbnRlcmZhY2VEZWNsYXJhdGlvbj4gbm9kZSkpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBTeW50YXhLaW5kLkVudW1EZWNsYXJhdGlvbjpcblx0XHRcdHN5bWJvbCA9IGNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbigoPEVudW1EZWNsYXJhdGlvbj4gbm9kZSkubmFtZSEpO1xuXHRcdFx0b3V0cHV0LnB1c2goc2VyaWFsaXplRW51bShzeW1ib2wpKTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRjb25zb2xlLmxvZygnRXhwb3J0IE5vZGUgS2luZDogJywgbm9kZS5raW5kKTtcblx0XHR9XG5cdH1cblxuXHRjb25zdCBwcmVmaXhMZW5ndGggPSAnL1VzZXJzL2tpdHNvbmsvZ2l0aHViL2NvbXBvc2Uvc3JjLycubGVuZ3RoO1xuXG5cdHByb2dyYW0uZ2V0U291cmNlRmlsZXMoKS5mb3JFYWNoKChzb3VyY2VGaWxlKSA9PiB7XG5cdFx0aWYgKGZpbGVzLmluZGV4T2Yoc291cmNlRmlsZS5maWxlTmFtZSkgPiAtMSkge1xuXHRcdFx0cmVzdWx0c1tzb3VyY2VGaWxlLmZpbGVOYW1lLnNsaWNlKHByZWZpeExlbmd0aCldID0gb3V0cHV0ID0gW107XG5cdFx0XHRmb3JFYWNoQ2hpbGQoc291cmNlRmlsZSwgdmlzaXQpO1xuXHRcdH1cblx0fSk7XG5cblx0bGV0IGRpYWdub3N0aWNzID0gcHJvZ3JhbS5nZXRPcHRpb25zRGlhZ25vc3RpY3MoKTtcblx0aWYgKGRpYWdub3N0aWNzLmxlbmd0aCkge1xuXHRcdHJldHVybiB7IHJlc3VsdHMsIGRpYWdub3N0aWNzIH07XG5cdH1cblxuXHRkaWFnbm9zdGljcyA9IHByb2dyYW0uZ2V0U3ludGFjdGljRGlhZ25vc3RpY3MoKTtcblx0aWYgKGRpYWdub3N0aWNzLmxlbmd0aCkge1xuXHRcdHJldHVybiB7IHJlc3VsdHMsIGRpYWdub3N0aWNzIH07XG5cdH1cblxuXHRkaWFnbm9zdGljcyA9IHByb2dyYW0uZ2V0R2xvYmFsRGlhZ25vc3RpY3MoKTtcblx0aWYgKGRpYWdub3N0aWNzLmxlbmd0aCkge1xuXHRcdHJldHVybiB7IHJlc3VsdHMsIGRpYWdub3N0aWNzIH07XG5cdH1cblxuXHRkaWFnbm9zdGljcyA9IHByb2dyYW0uZ2V0U2VtYW50aWNEaWFnbm9zdGljcygpO1xuXHRyZXR1cm4geyByZXN1bHRzLCBkaWFnbm9zdGljcyB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjb252ZXJ0O1xuIl19