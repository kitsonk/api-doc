import * as marked from 'marked';
import {
	ClassDeclaration,
	Diagnostic,
	displayPartsToString,
	EnumDeclaration,
	ExportAssignment,
	forEachChild,
	FunctionDeclaration,
	Identifier,
	ImportDeclaration,
	InterfaceDeclaration,
	Node,
	NodeFlags,
	ObjectLiteralElement,
	ObjectLiteralExpression,
	Program,
	Signature,
	Symbol,
	SyntaxKind,
	Type,
	TypeAliasDeclaration,
	TypeElement,
	TypeParameter,
	VariableDeclaration,
	VariableStatement
} from 'typescript';

const assign = Object.assign;

interface CallSignatureDoc extends SignatureDoc {
	nodeType: 'call';
}

interface ConstructSignatureDoc extends SignatureDoc {
	nodeType: 'new';
}

interface ClassDoc extends SymbolDoc {
	nodeType: 'class';
	constructors: SignatureDoc[];
}

interface EnumDoc extends SymbolDoc {
	nodeType: 'enum';
	properties: PropertyDoc[];
}

interface FunctionDoc extends SymbolDoc {
	nodeType: 'function';
	signatures: SignatureDoc[];
	properties?: SymbolDoc[];
}

interface ImportDoc {
	nodeType: 'import';
	moduleId: string;
	default?: string;
	named?: string[];
}

interface IndexSignatureDoc extends SignatureDoc {
	nodeType: 'index';
}

interface InterfaceDoc extends SymbolDoc {
	nodeType: 'interface';
	members: InterfaceMemberDoc[];
	typeParameters?: SymbolDoc[];
}

type InterfaceMemberDoc = MemberDoc | CallSignatureDoc | IndexSignatureDoc | ConstructSignatureDoc;

interface MemberDoc extends SymbolDoc {
	nodeType: 'member';
}

interface ObjectLiteralDoc {
	nodeType: 'object';
	properties: SymbolDoc[];
}

interface PropertyDoc {
	name: string;
	documentation: string;
}

interface SignatureDoc {
	parameters: SymbolDoc[];
	returnType: string;
	documentation: string;
	typeParameters?: SymbolDoc[];
}

interface SymbolDoc extends PropertyDoc {
	type?: string;
}

interface TypeAliasDoc extends SymbolDoc {
	type: string;
	types?: TypeDoc[];
	nodeType: 'type';
}

interface TypeDoc {
	type: string;
	members?: InterfaceMemberDoc[];
	types?: TypeDoc[];
}

interface VariableDoc extends SymbolDoc {
	nodeType: 'variable';
}

type SyntaxNodeDoc = ClassDoc | EnumDoc | FunctionDoc | ImportDoc | InterfaceDoc | ObjectLiteralDoc | TypeAliasDoc | VariableDoc;

interface ModuleDoc {
	[sourceFileName: string]: SyntaxNodeDoc[];
}

/**
 * Convert a list of files and a TypeScript program into a set of ModuleDoc, including any diagnostics returned
 * when compiling the program
 *
 * @param files An array of strings which represent the files to be documented out of the program
 * @param A TypeScript program instance
 */
function convert(files: string[], program: Program): { results: ModuleDoc, diagnostics: Diagnostic[] } {

	const checker = program.getTypeChecker();

	const results: ModuleDoc = {};
	function isExportedNode(node: Node): boolean {
		return Boolean(
			(node.flags & NodeFlags.Export) !== 0 ||
			node.kind === SyntaxKind.ImportDeclaration ||
			node.kind === SyntaxKind.ExportAssignment
		);
	}

	function serializeSymbol(symbol: Symbol): SymbolDoc {
		const details: SymbolDoc = {
			name: symbol.getName(),
			documentation: marked(displayPartsToString(symbol.getDocumentationComment()))
		};
		if (symbol.valueDeclaration) {
			details.type = checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!));
		}
		return details;
	}

	function serializeTypeParameter(typeParameter: TypeParameter): SymbolDoc {
		return serializeSymbol(typeParameter.symbol!);
	}

	function serializeSignature(signature: Signature): SignatureDoc {
		const details: SignatureDoc = {
			parameters: signature.parameters.map(serializeSymbol),
			returnType: checker.typeToString(signature.getReturnType()),
			documentation: marked(displayPartsToString(signature.getDocumentationComment()))
		};
		if (signature.typeParameters) {
			details.typeParameters = signature.typeParameters.map(serializeTypeParameter);
		}
		return details;
	}

	function serializeProperty(symbol: Symbol): PropertyDoc {
		return {
			name: symbol.getName(),
			documentation: displayPartsToString(symbol.getDocumentationComment())
		};
	}

	function serializeClass(symbol: Symbol): ClassDoc {
		const constructorType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);
		const details = assign(serializeSymbol(symbol), {
			constructors: constructorType.getConstructSignatures().map(serializeSignature),
			nodeType: <'class'> 'class'
		});
		return details;
	}

	function serializeInterfaceMember(member: TypeElement): InterfaceMemberDoc {
		if (member.name) {
			const symbol: any = serializeSymbol(checker.getSymbolAtLocation(member.name));
			symbol.nodeType = 'member';
			return symbol;
		}
		if (member.kind === SyntaxKind.CallSignature) {
			const signature = assign(serializeSignature(checker.getSignatureFromDeclaration(<any> member)), {
				nodeType: <'call'> 'call'
			});
			return signature;
		}
		if (member.kind === SyntaxKind.IndexSignature) {
			const signature = assign(serializeSignature(checker.getSignatureFromDeclaration(<any> member)), {
				nodeType: <'index'> 'index'
			});
			return signature;
		}
		if (member.kind === SyntaxKind.ConstructSignature) {
			const signature = assign(serializeSignature(checker.getSignatureFromDeclaration(<any> member)), {
				nodeType: <'new'> 'new'
			});
			return signature;
		}
		throw new Error(`Unexpected member kind: ${member.kind}`);
	}

	function serializeInterface(node: InterfaceDeclaration): InterfaceDoc {
		const symbol = checker.getSymbolAtLocation(node.name!);
		const details: InterfaceDoc = assign(serializeSymbol(symbol), {
			members: node.members.map(serializeInterfaceMember),
			nodeType: <'interface'> 'interface'
		});
		if (node.typeParameters) {
			details.typeParameters = node.typeParameters.map((typeParameter) => serializeSymbol(checker.getSymbolAtLocation(typeParameter.name)));
		}
		return details;
	}

	function serializeImport(node: ImportDeclaration): ImportDoc {
		const details: ImportDoc = {
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

	function serializeEnum(symbol: Symbol): EnumDoc {
		const enumType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);
		const details = assign(serializeSymbol(symbol), {
			properties: enumType.getProperties().map(serializeProperty),
			nodeType: <'enum'> 'enum'
		});
		return details;
	}

	function serializeFunction(symbol: Symbol): FunctionDoc {
		const functionType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);
		const details: FunctionDoc = assign(serializeSymbol(symbol), {
			signatures: functionType.getCallSignatures().map(serializeSignature),
			nodeType: <'function'> 'function'
		});
		const properties = functionType.getProperties();
		if (properties.length) {
			details.properties = properties.map(serializeProperty);
		}
		return details;
	}

	function serializeType(type: Type): TypeDoc {
		const details: TypeDoc = {
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

	function serializeTypeAlias(node: Identifier): TypeAliasDoc {
		const symbol = checker.getSymbolAtLocation(node);
		const typeAtLocation = checker.getTypeAtLocation(node);
		const details: TypeAliasDoc = assign(serializeSymbol(symbol), {
			type: checker.typeToString(typeAtLocation),
			nodeType: <'type'> 'type'
		});
		const types: Type[] | undefined = (<any> typeAtLocation).types;
		if (types) {
			details.types = types.map(serializeType);
		}
		return details;
	}

	function serializeVariableDeclaration(node: VariableDeclaration): VariableDoc {
		return assign(serializeSymbol(checker.getSymbolAtLocation(node.name)), {
			nodeType: <'variable'> 'variable'
		});
	}

	function serializeVariableStatement(node: VariableStatement): VariableDoc[] {
		return node.declarationList.declarations.map(serializeVariableDeclaration);
	}

	function serializeExportAssignment(node: ExportAssignment): any {
		return {
			name: 'default',
			value: serializeNode(node.expression, true),
			nodeType: 'default'
		};
	}

	function serializeObjectProperty(element: ObjectLiteralElement): SymbolDoc {
		return serializeSymbol((<any> element).symbol);
	}

	function serializeObjectLiteralExpression(node: ObjectLiteralExpression): ObjectLiteralDoc {
		return {
			properties: node.properties.map((property) => serializeObjectProperty(property)),
			nodeType: <'object'> 'object'
		};
	}

	/**
	 * Visit a node and if applicable add it to the current module documentation
	 */
	function serializeNode(node: Node, exported: boolean = false): SyntaxNodeDoc | SyntaxNodeDoc[] | undefined {
		if (!isExportedNode(node) && !exported) {
			return;
		}

		let symbol: Symbol;
		switch (node.kind) {
		case SyntaxKind.ClassDeclaration:
			symbol = checker.getSymbolAtLocation((<ClassDeclaration> node).name!);
			return serializeClass(symbol);
		case SyntaxKind.EnumDeclaration:
			symbol = checker.getSymbolAtLocation((<EnumDeclaration> node).name!);
			return serializeEnum(symbol);
		case SyntaxKind.ExportAssignment:
			return serializeExportAssignment(<ExportAssignment> node);
		case SyntaxKind.FunctionDeclaration:
			symbol = checker.getSymbolAtLocation((<FunctionDeclaration> node).name!);
			return serializeFunction(symbol);
		case SyntaxKind.ImportDeclaration:
			return serializeImport(<ImportDeclaration> node);
		case SyntaxKind.InterfaceDeclaration:
			return serializeInterface(<InterfaceDeclaration> node);
		case SyntaxKind.ObjectLiteralExpression:
			return serializeObjectLiteralExpression(<ObjectLiteralExpression> node);
		case SyntaxKind.TypeAliasDeclaration:
			return serializeTypeAlias((<TypeAliasDeclaration> node).name);
		case SyntaxKind.VariableStatement:
			return serializeVariableStatement(<VariableStatement> node);
		default:
			throw new Error(`Unpected exported node kind: ${node.kind}`);
		}
	}

	const prefixLength = '/Users/kitsonk/github/api-doc/tests/fixtures/src/'.length;

	program.getSourceFiles().forEach((sourceFile) => {
		if (files.indexOf(sourceFile.fileName) > -1) {
			const output: SyntaxNodeDoc[] = results[sourceFile.fileName.slice(prefixLength)] = [];
			forEachChild(sourceFile, (node) => {
				const doc = serializeNode(node);
				if (doc) {
					Array.isArray(doc) ? doc.forEach((item) => output.push(item)) : output.push(doc);
				}
			});
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
