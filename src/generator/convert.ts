import * as marked from 'marked';
import {
	ClassDeclaration,
	Diagnostic,
	displayPartsToString,
	EnumDeclaration,
	forEachChild,
	FunctionDeclaration,
	Identifier,
	ImportDeclaration,
	InterfaceDeclaration,
	Node,
	NodeFlags,
	Program,
	Signature,
	Symbol,
	SyntaxKind,
	Type,
	TypeAliasDeclaration,
	TypeElement,
	TypeParameter
} from 'typescript';

function convert(files: string[], program: Program): { results: any, diagnostics: Diagnostic[] } {

	const checker = program.getTypeChecker();

	const results: { [filename: string]: any[] } = {};
	let output: any[] = [];

	function isExportedNode(node: Node): boolean {
		return Boolean((node.flags & NodeFlags.Export) !== 0 || (node.flags & NodeFlags.Default) !== 0 || (node.kind === SyntaxKind.ImportDeclaration));
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
		details.nodeType = 'class';
		return details;
	}

	function serializeInterfaceMember(member: TypeElement) {
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
	}

	function serializeInterface(node: InterfaceDeclaration) {
		const symbol = checker.getSymbolAtLocation(node.name!);
		const details: any = serializeSymbol(symbol);
		if (node.typeParameters) {
			details.typeParameters = node.typeParameters.map((typeParameter) => {
				return serializeSymbol(checker.getSymbolAtLocation(typeParameter.name));
			});
		}
		details.members = node.members.map(serializeInterfaceMember);
		details.nodeType = 'interface';
		return details;
	}

	function serializeImport(node: ImportDeclaration) {
		const details: any = {
			nodeType: 'import',
			moduleId: node.moduleSpecifier.getText()
		};
		const defaultImportName = node.importClause && node.importClause.name && node.importClause.name.text;
		if (defaultImportName) {
			details.default = defaultImportName;
		}
		const elements: Node[] | undefined = node.importClause && node.importClause.namedBindings && (<any> node.importClause.namedBindings).elements;

		if (elements) {
			details.named = elements.map((element: any) => {
				return element.name.text;
			});
		}
		return details;
	}

	function serializeEnum(symbol: Symbol) {
		const details: any = serializeSymbol(symbol);
		const enumType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);
		details.properties = enumType.getProperties().map(serializeProperty);
		details.nodeType = 'enum';
		return details;
	}

	function serializeFunction(symbol: Symbol) {
		const details: any = serializeSymbol(symbol);
		const functionType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);
		details.signatures = functionType.getCallSignatures().map(serializeSignature);
		const properties = functionType.getProperties();
		if (properties.length) {
			details.properties = properties.map(serializeSymbol);
		}
		details.nodeType = 'function';
		return details;
	}

	function serializeType(type: Type) {
		const details: any = {
			type: checker.typeToString(type)
		};
		const members: { [key: string]: any } | undefined = (<any> type).members;
		if (members) {
			details.members = [];
			for (const key in members) {
				details.members.push(serializeInterfaceMember(members[key].valueDeclaration));
			}
		}
		const types: Type[] | undefined = (<any> type).types;
		if (types) {
			details.types = types.map(serializeType);
		}
		return details;
	}

	function serializeTypeAlias(node: Identifier) {
		const symbol = checker.getSymbolAtLocation(node);
		const details: any = serializeSymbol(symbol);
		const typeAtLocation = checker.getTypeAtLocation(node);
		details.type = checker.typeToString(typeAtLocation);
		const types: Type[] | undefined = (<any> typeAtLocation).types;
		if (types) {
			details.types = types.map(serializeType);
		}
		details.nodeType = 'type';
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
		case SyntaxKind.EnumDeclaration:
			symbol = checker.getSymbolAtLocation((<EnumDeclaration> node).name!);
			output.push(serializeEnum(symbol));
			break;
		case SyntaxKind.FunctionDeclaration:
			symbol = checker.getSymbolAtLocation((<FunctionDeclaration> node).name!);
			output.push(serializeFunction(symbol));
			break;
		case SyntaxKind.ImportDeclaration:
			output.push(serializeImport(<ImportDeclaration> node));
			break;
		case SyntaxKind.InterfaceDeclaration:
			output.push(serializeInterface(<InterfaceDeclaration> node));
			break;
		case SyntaxKind.TypeAliasDeclaration:
			output.push(serializeTypeAlias((<TypeAliasDeclaration> node).name));
			break;
		default:
			throw new Error(`Unpected exported node kind: ${node.kind}`);
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
