import {
	Node,
	Diagnostic,
	Program,
	NodeFlags,
	SyntaxKind,
	ClassDeclaration,
	Symbol,
	displayPartsToString,
	Signature,
	forEachChild,
	InterfaceDeclaration,
	EnumDeclaration,
	TypeParameter
} from 'typescript';
import * as marked from 'marked';

function convert(files: string[], program: Program): { results: any, diagnostics: Diagnostic[] } {

	const checker = program.getTypeChecker();

	const results: { [filename: string]: any[] } = {};
	let output: any[] = [];

	function isExportedNode(node: Node): boolean {
		return Boolean((node.flags & NodeFlags.Export) !== 0 || (node.parent && node.parent.kind === SyntaxKind.SourceFile));
	}

	function serializeSymbol(symbol: Symbol) {
		const details: any = {
			name: symbol.getName(),
			documentation: marked(displayPartsToString(symbol.getDocumentationComment()))
		};
		if (symbol.valueDeclaration) {
			details.type = checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!));
		}
		return details;
	}

	function serializeTypeParameter(typeParameter: TypeParameter) {
		return serializeSymbol(typeParameter.symbol!);
	}

	function serializeSignature(signature: Signature) {
		const details: any = {
			parameters: signature.parameters.map(serializeSymbol),
			returnType: checker.typeToString(signature.getReturnType()),
			documentation: marked(displayPartsToString(signature.getDocumentationComment()))
		};
		if (signature.typeParameters) {
			details.typeParameters = signature.typeParameters.map(serializeTypeParameter);
		}
		return details;
	}

	function serializeProperty(symbol: Symbol) {
		return {
			name: symbol.getName(),
			documentation: displayPartsToString(symbol.getDocumentationComment())
		};
	}

	function serializeClass(symbol: Symbol) {
		const details: any = serializeSymbol(symbol);
		const constructorType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);
		details.constructors = constructorType.getConstructSignatures().map(serializeSignature);
		return details;
	}

	function serializeInterface(node: InterfaceDeclaration) {
		const symbol = checker.getSymbolAtLocation(node.name!);
		const details: any = serializeSymbol(symbol);
		if (node.typeParameters) {
			details.typeParameters = node.typeParameters.map((typeParameter) => {
				return serializeSymbol(checker.getSymbolAtLocation(typeParameter.name));
			});
		}
		details.members = node.members.map((member) => {
			if (member.name) {
				const symbol: any = serializeSymbol(checker.getSymbolAtLocation(member.name));
				symbol.nodeType = 'member';
				return symbol;
			}
			if (member.kind === SyntaxKind.CallSignature) {
				const signature: any = serializeSignature(checker.getSignatureFromDeclaration(<any> member));
				signature.nodeType = 'call';
				return signature;
			}
			if (member.kind === SyntaxKind.IndexSignature) {
				const signature: any = serializeSignature(checker.getSignatureFromDeclaration(<any> member));
				signature.nodeType = 'index';
				return signature;
			}
			if (member.kind === SyntaxKind.ConstructSignature) {
				const signature: any = serializeSignature(checker.getSignatureFromDeclaration(<any> member));
				signature.nodeType = 'new';
				return signature;
			}
			throw new Error(`Unexpected member kind: ${member.kind}`);
		});
		details.nodeType = 'interface';
		return details;
	}

	function serializeEnum(symbol: Symbol) {
		const details: any = serializeSymbol(symbol);
		const enumType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);
		details.properties = enumType.getProperties().map(serializeProperty);
		return details;
	}

	function visit(node: Node) {
		if (!isExportedNode(node)) {
			return;
		}

		let symbol: Symbol;
		switch (node.kind) {
		case SyntaxKind.ClassDeclaration:
			symbol = checker.getSymbolAtLocation((<ClassDeclaration> node).name!);
			output.push(serializeClass(symbol));
			break;
		case SyntaxKind.InterfaceDeclaration:
			output.push(serializeInterface(<InterfaceDeclaration> node));
			break;
		case SyntaxKind.EnumDeclaration:
			symbol = checker.getSymbolAtLocation((<EnumDeclaration> node).name!);
			output.push(serializeEnum(symbol));
			break;
		default:
			console.log('Export Node Kind: ', node.kind);
		}
	}

	const prefixLength = '/Users/kitsonk/github/compose/src/'.length;

	program.getSourceFiles().forEach((sourceFile) => {
		if (files.indexOf(sourceFile.fileName) > -1) {
			results[sourceFile.fileName.slice(prefixLength)] = output = [];
			forEachChild(sourceFile, visit);
		}
	});

	let diagnostics = program.getOptionsDiagnostics();
	if (diagnostics.length) {
		return { results, diagnostics };
	}

	diagnostics = program.getSyntacticDiagnostics();
	if (diagnostics.length) {
		return { results, diagnostics };
	}

	diagnostics = program.getGlobalDiagnostics();
	if (diagnostics.length) {
		return { results, diagnostics };
	}

	diagnostics = program.getSemanticDiagnostics();
	return { results, diagnostics };
}

export default convert;
