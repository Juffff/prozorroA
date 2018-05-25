'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var NextURISchema = new Schema({
    _id: String,
    nextURI: String
});

var NextURI = _mongoose2.default.model('NextURI', NextURISchema);
//# sourceMappingURL=NextURI.js.map