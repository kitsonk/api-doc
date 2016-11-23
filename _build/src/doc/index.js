(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'dojo-widgets/projector'], factory);
    }
})(function (require, exports) {
    "use strict";
    var projector_1 = require('dojo-widgets/projector');
    console.log(projector_1.default);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZG9jL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQUFBLDBCQUFzQix3QkFBd0IsQ0FBQyxDQUFBO0lBRS9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQVMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHByb2plY3RvciBmcm9tICdkb2pvLXdpZGdldHMvcHJvamVjdG9yJztcblxuY29uc29sZS5sb2cocHJvamVjdG9yKTtcbiJdfQ==