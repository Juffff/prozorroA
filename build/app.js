'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _got = require('got');

var _got2 = _interopRequireDefault(_got);

var _nodeCron = require('node-cron');

var _nodeCron2 = _interopRequireDefault(_nodeCron);

/*
var _dbUtils2 = require('./build/utils/dbUtils.js');

var _dbUtils = require('./utils/dbUtils.js');
*/

var db = _interopRequireWildcard(_dbUtils);

var _item_id = require('./enums/item_id.js');

var _item_id2 = _interopRequireDefault(_item_id);

var _tender_status = require('./enums/tender_status.js');

var _tender_status2 = _interopRequireDefault(_tender_status);

var _logger = require('./utils/logger.js');

var _logger2 = _interopRequireDefault(_logger);

var _errorHandler = require('./errorHandler.js');

var _errorHandler2 = _interopRequireDefault(_errorHandler);

var _config = require('./config/config.js');

var _config2 = _interopRequireDefault(_config);

var _expressStatic = require('express-static');

var _expressStatic2 = _interopRequireDefault(_expressStatic);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*console.log(JSON.parse(document.getElementsByTagName('pre')[0].innerHTML))*/
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

var startUri = _config2.default.startUri;
var apiPrefix = _config2.default.prefix;

process.on('uncaughtException', function (err) {
    _logger2.default.log('error', err.stack);
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

app.get('/start', function (req, res) {
    db.getNextURI(function (uri) {
        if (uri) {
            goThrowTenders(uri);
        } else {
            goThrowTenders(startUri);
        }
        res.send(200);
    });
    setTimeout(function () {
        console.log('Wake and move!');
        db.getNextURI(function (uri) {
            if (uri) {
                goThrowTenders(uri);
            } else {
                goThrowTenders(startUri);
            }
        });
    }, 60000);
}).get('/start2018', function (req, res) {
    goThrowTenders('https://public.api.openprocurement.org/api/2.4/tenders?offset=2018');
    res.send(200);
}).get('/update', function (req, res) {
    db.listAllTenders(function (data) {
        updateExistedTenders(data);
    });
    res.send(200);
}).get('/tenders', function (req, res) {
    db.listTenders({}, function (data) {
        res.send(data);
    });
}).get('/ping', function (req, res) {
    res.sendStatus(200);
});

app.use('/', (0, _expressStatic2.default)(_path2.default.join(__dirname, '..', 'client')));

function goThrowTenders(uri) {
    task1Hour.stop();
    task5Min.stop();
    console.log('uri - ', uri);
    var milliseconds = null;

    var https = require('https');
    https.get(uri, function (res) {
        milliseconds = new Date().getTime();
        var str = '';
        res.on('data', function (chunk) {
            str += chunk;
        });
        res.on('end', function () {
            var resJson = JSON.parse(str);
            var nextUri = resJson.next_page.uri;
            var data = resJson.data;
            //  console.log(data.length);
            if (data.length === 0) {
                _logger2.default.log('info', 'goThrowTenders finished');
                console.log('Go throw tenders finished.');
                db.setNextURI(startUri);
                task1Hour.start();
                task5Min.start();
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

function updateExistedTenders(data) {
    data.forEach(function (tender) {
        db.getTenderByID(tender, function (tender) {
            analiseToTender(apiPrefix, tender._id);
        });
    });
}

function analiseToTender(prefix, id, uri) {
    try {
        (0, _got2.default)('' + prefix + id).then(function (data) {
            if (data.body) {
                try {
                    var allInfo = JSON.parse(data.body).data;
                    if (allInfo) {
                        delete allInfo.questions;
                        delete allInfo.complaints;
                        var tender = {};
                        try {
                            if (allInfo.value) {
                                tender.amount = allInfo.value.amount;
                                if (Number.parseInt(tender.amount, 10) > _config2.default.minAmount && Number.parseInt(tender.amount, 10) < _config2.default.maxAmount) {
                                    tender._id = allInfo.id;
                                    tender.name = allInfo.procuringEntity.name;
                                    if (allInfo.auctionPeriod) {
                                        tender.startDate = allInfo.auctionPeriod.startDate;
                                        if (tender.startDate === undefined) {
                                            if (allInfo.documents) {
                                                if (Array.isArray(allInfo.documents)) {
                                                    if (allInfo.documents[0]) {
                                                        tender.startDate = allInfo.documents[0].datePublished;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (allInfo.enquiryPeriod) {
                                        tender.datePublished = allInfo.enquiryPeriod.invalidationDate;
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

                                    if (allInfo.items) {
                                        var itemIDs = [];
                                        var classificationIDs = [];

                                        allInfo.items.forEach(function (item) {
                                            if (itemIDs.indexOf(item.classification.description) === -1) {
                                                itemIDs.push(item.classification.description);
                                            }
                                        });
                                        allInfo.items.forEach(function (item) {
                                            if (classificationIDs.indexOf(item.classification.id) === -1) {
                                                classificationIDs.push(item.classification.id);
                                            }
                                        });
                                        tender.items = itemIDs;
                                        tender.classification_ids = classificationIDs;
                                    }
                                    tender.tenderID = allInfo.tenderID;
                                    tender.title = allInfo.title;
                                    tender.currency = allInfo.value.currency;
                                    tender.status = _tender_status2.default[allInfo.status];
                                    if (tender.status === _tender_status2.default['complete'] || tender.status === _tender_status2.default['active.awarded']) {
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
                                    if (!tender.tenderers && tender.suppliers) {
                                        tender.tenderers = tender.suppliers;
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
                                        //logger.log('info', `a tender was found - ${JSON.stringify(tender)}`);
                                        /*   console.log(uri);
                                        /!*       console.log(tender);*!/*/
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
                } catch (err) {
                    (0, _errorHandler2.default)(err);
                }
            }
        });
    } catch (err) {
        console.log(err);
    }
}

/*app.listen(8080, () => {
    console.log(`Server is running on 8080`);
});*/

app.listen(process.env.PORT || 8080, function () {
    if (process.env.PORT) {
        console.log('Server is running on ' + process.env.PORT);
    } else {
        console.log('Server is running on 8080');
    }
});

/*cron.schedule('1-59 * * * * * ', function(){
    console.log('sec 2');
}, true);*/

/*const task1Min =  cron.schedule('*!/1 * * * *', function(){
    console.log('minute 1');
}, false);*/

var task5Min = _nodeCron2.default.schedule('*/5 * * * *', function () {
    _logger2.default.log('info', '5MinTask started');
    db.listAllTenders(function (data) {
        updateExistedTenders(data);
    });
}, false);

var task1Hour = _nodeCron2.default.schedule('* */1 * * *', function () {
    _logger2.default.log('info', '1HourTask started');
    db.getNextURI(function (uri) {
        if (uri) {
            goThrowTenders(uri);
        } else {
            goThrowTenders(startUri);
        }
    });
    setTimeout(function () {
        console.log('Wake and move!');
        db.getNextURI(function (uri) {
            if (uri) {
                goThrowTenders(uri);
            } else {
                goThrowTenders(startUri);
            }
        });
    }, 60000);
}, false);

task5Min.start();
task1Hour.start();