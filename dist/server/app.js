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

var _tender_status = require('./enums/tender_status');

var _tender_status2 = _interopRequireDefault(_tender_status);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var JSDOM = _jsdom2.default.JSDOM; /*console.log(JSON.parse(document.getElementsByTagName('pre')[0].innerHTML))*/

db.connect();
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

function pause(seconds) {
    var waitTill = new Date(new Date().getTime() + seconds * 1000);
    while (waitTill > new Date()) {}
}

var app = (0, _express2.default)();
app.use(_bodyParser2.default.json());
app.use((0, _cors2.default)(corsOptions));

var startUri = 'https://public.api.openprocurement.org/api/2.4/tenders?offset=2018-02-27T10%3A18%3A35.705532%2B02%3A00';
var apiPrefix = 'https://public.api.openprocurement.org/api/2.4/tenders/';

process.on('uncaughtException', function (err) {
    console.error(err.stack);
    console.log("Node NOT Exiting...");
    db.getNextURI(function (uri) {
        if (uri) {
            goThrowTenders(uri);
        } else {
            goThrowTenders(startUri);
        }
    });
});

app.get('/', function (req, res) {
    db.listTenders({}, function (data) {
        res.send(data);
    });
}).get('start', function (req, res) {
    console.log('Start');
    db.getNextURI(function (uri) {
        if (uri) {
            goThrowTenders(uri);
        } else {
            goThrowTenders(startUri);
        }
    });

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
                    analiseToTender(apiPrefix, id, uri);
                });
                db.setNextURI(nextUri);
                goThrowTenders(nextUri);
            }
        });
    });
}

function analiseToTender(prefix, id, uri) {
    try {
        (0, _got2.default)('' + prefix + id).then(function (data) {
            if (data.body) {
                var allInfo = JSON.parse(data.body).data;
                if (allInfo) {
                    delete allInfo.questions;
                    delete allInfo.complaints;
                    var tender = {};
                    try {
                        if (allInfo.value) {
                            tender.amount = allInfo.value.amount;
                            if (Number.parseInt(tender.amount, 10) > 5000000) {
                                tender._id = allInfo.id;
                                tender.name = allInfo.procuringEntity.name;
                                if (allInfo.auctionPeriod) {
                                    tender.startDate = allInfo.auctionPeriod.startDate;
                                }
                                tender.awardCriteria = allInfo.awardCriteria;
                                if (allInfo.bids) {
                                    tender.tenderers = allInfo.bids.filter(function (bid) {
                                        if (bid.tenderers) {
                                            var tenderer = bid.tenderers[0].name;
                                            return tenderer !== null;
                                        }
                                        return false;
                                    }).map(function (tenderer) {
                                        return tenderer.tenderers[0].name.replace('ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ', 'ТОВ').replace('«', '\"').replace('»', '\"');
                                    });
                                }
                                tender.items = allInfo.items.map(function (item) {
                                    return item.classification.description;
                                });
                                tender.classification_ids = allInfo.items.map(function (item) {
                                    return item.classification.id;
                                });
                                tender.tenderID = allInfo.tenderID;
                                tender.title = allInfo.title;
                                tender.currency = allInfo.value.currency;
                                tender.valueAddedTaxIncluded = allInfo.value.valueAddedTaxIncluded;
                                tender.status = _tender_status2.default[allInfo.status];
                                if (tender.status === _tender_status2.default['complete']) {
                                    var suppliers = [];
                                    if (allInfo.awards) {
                                        if (Array.isArray(allInfo.awards)) {
                                            allInfo.awards.forEach(function (award) {
                                                if (award.suppliers) {
                                                    if (Array.isArray(award.suppliers)) {
                                                        award.suppliers.forEach(function (supplier) {
                                                            if (suppliers.indexOf(supplier.name) === -1) {
                                                                suppliers.push(supplier.name);
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    }
                                    tender.suppliers = suppliers;
                                }
                                var a = false;
                                if (tender.classification_ids) {
                                    if (Array.isArray(tender.classification_ids)) {
                                        tender.classification_ids.forEach(function (id) {
                                            if (_item_id2.default.indexOf(id) > -1) {
                                                a = true;
                                            }
                                        });
                                    }
                                }
                                if (a === true) {
                                    console.log(uri);
                                    console.log(tender);
                                    db.createTender(tender);
                                    a = false;
                                }
                            }
                        }
                        //pause(0.05);
                    } catch (err) {
                        console.log(allInfo.id);
                        console.log(allInfo.tenderID);
                        console.log(_tender_status2.default[allInfo.status]);
                        console.log(tender.amount);
                        console.log(err);
                        //pause(0.05);
                    }
                }
            }
        });
    } catch (err) {
        console.log(err);
    }
}

app.listen(8080, function () {
    console.log('Server is running on 8080');
});
//# sourceMappingURL=app.js.map