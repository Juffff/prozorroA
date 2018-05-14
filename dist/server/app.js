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

var _item_id = require('./enums/item_id');

var _item_id2 = _interopRequireDefault(_item_id);

var _xmlhttprequest = require('xmlhttprequest');

var _xmlhttprequest2 = _interopRequireDefault(_xmlhttprequest);

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
var startUri = 'https://public.api.openprocurement.org/api/2.4/tenders?offset=2018-05';
var apiPrefix = 'https://public.api.openprocurement.org/api/2.4/tenders/';

app.get('/', function (req, res) {

    goThrowTenders(startUri);

    res.sendStatus(200);
});

function goThrowTenders(uri) {
    var https = require('https');
    https.get(uri, function (res) {
        var str = '';
        res.on('data', function (chunk) {
            str += chunk;
        });
        res.on('end', function () {
            var resJson = JSON.parse(str);
            var nextUri = resJson.next_page.uri;
            var data = resJson.data;
            if (data.length === 0) {
                return;
            } else {
                resJson.data.map(function (data) {
                    return data.id;
                }).forEach(function (id) {
                    analizeToTender(apiPrefix, id);
                });
                goThrowTenders(nextUri);
            }
        });
    });
}

function analizeToTender(prefix, id) {
    (0, _got2.default)('' + prefix + id).then(function (data) {
        if (data.body) {
            var allInfo = JSON.parse(data.body).data;
            if (allInfo) {
                delete allInfo.questions;
                delete allInfo.complaints;
                var tender = {};
                tender._id = allInfo.id;
                if (allInfo.auctionPeriod) {
                    tender.startDate = allInfo.auctionPeriod.startDate;
                }
                tender.awardCriteria = allInfo.awardCriteria;
                if (allInfo.bids) {
                    if (Array.isArray(allInfo.bids)) {
                        if (allInfo.bids[0]) {
                            tender.tenderers = allInfo.bids.map(function (bid) {
                                return bid.tenderers[0].name.replace('ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ', 'ТОВ').replace('«', '\"').replace('»', '\"');
                            });
                        }
                    }
                }
                tender.items = allInfo.items.map(function (item) {
                    return item.classification.description;
                });
                tender.classification_ids = allInfo.items.map(function (item) {
                    return item.classification.id;
                });
                tender.tenderID = allInfo.tenderID;
                tender.title = allInfo.title;
                tender.amount = allInfo.value.amount;
                tender.currency = allInfo.value.currency;
                tender.valueAddedTaxIncluded = allInfo.value.valueAddedTaxIncluded;
                if (Number.parseInt(tender.amount, 10) > 1000000) {
                    var a = false;
                    if (tender.classification_ids) {
                        if (Array.isArray(tender.classification_ids)) {
                            tender.classification_ids.forEach(function (id) {
                                if (_item_id2.default.indexOf(id) > -1) {
                                    console.log(tender);
                                };
                            });
                        }
                    }
                }
                //db.createTender(tender);
            }
        }
    });
}

app.listen(8080, function () {
    console.log('Server is running on 8070');
});
//# sourceMappingURL=app.js.map