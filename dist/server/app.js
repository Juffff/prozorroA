'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _got = require('got');

var _got2 = _interopRequireDefault(_got);

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _replaceall = require('replaceall');

var _replaceall2 = _interopRequireDefault(_replaceall);

var _dbutils = require('./utils/dbutils');

var db = _interopRequireWildcard(_dbutils);

var _utf = require('utf8');

var _utf2 = _interopRequireDefault(_utf);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var JSDOM = _jsdom2.default.JSDOM;


db.connect();
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

var app = (0, _express2.default)();
app.use(_bodyParser2.default.json());
app.use((0, _cors2.default)(corsOptions));
app.get('/', function (req, res) {
    (0, _got2.default)('https://public.api.openprocurement.org/api/2.4/tenders/5d3499e3076b46f6893900d874c9e825').then(function (data) {
        if (data.body) {
            var allInfo = JSON.parse(data.body).data;
            delete allInfo.questions;
            console.log(allInfo.bids[0].tenderers);
        }
    });
    res.sendStatus(200);
});
app.listen(8080, function () {
    console.log('Server is running on 8070');
});
//# sourceMappingURL=app.js.map