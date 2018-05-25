'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (err) {
    _logger2.default.log('error', err);
};

var _logger = require('./utils/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }