import * as assert from 'intern/chai!assert';
import * as registerSuite from 'intern!object';
import convert from '../../../src/converter/convert';

registerSuite({
	name: 'converter/convert',
	basic() {
		assert(convert);
	}
});
