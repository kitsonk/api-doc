import WeakMap from 'dojo-shim/WeakMap';

export interface Foo {
	kind: WeakMap<string, any>;
}

export class Foo implements Foo {
	kind = new WeakMap<string, any>();
}

export function foo(param: Foo): any {
	//
}

export const bar: { foo: string; } = { foo: 'bar' };

export enum Baz {
	Qat,
	Qux,
	Quux
}

export type Bar = Foo | Baz;

export default {
	bar
};
