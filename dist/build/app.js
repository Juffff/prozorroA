'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

console.log(_path2.default.resolve());
console.log(__dirname);
console.log(_path2.default.join(__dirname, 'utils', 'dbutils', 'js'));
console.log(_path2.default.join(__dirname, 'utils', 'dbutils.js'));
console.log(_path2.default.resolve(__dirname, 'utils', 'dbutils.js'));
console.log(_path2.default.resolve('utils', 'dbutils.js'));
/*
import path from 'path';
/!*console.log(JSON.parse(document.getElementsByTagName('pre')[0].innerHTML))*!/
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import got from 'got';
import cron from 'node-cron';
import * as db from './utils/dbUtils.js';
import itemIdEnum from './enums/item_id.js';
import tenderStatusEnum from './enums/tender_status.js';
import logger from './utils/logger.js';
import errorHandler from "./errorHandler.js";
import config from "./config/config.js";
import serve from 'express-static';


db.connect();
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

function pause(seconds) {
    const waitTill = new Date(new Date().getTime() + seconds * 1000);
    while (waitTill > new Date()) {
    }
}

const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions));


let startUri = config.startUri;
const apiPrefix = config.prefix;

process.on('uncaughtException', function (err) {
    logger.log('error', err.stack);
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

app
    .get('/start', (req, res) => {
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
    })
    .get('/start2018', (req, res) => {
        goThrowTenders('https://public.api.openprocurement.org/api/2.4/tenders?offset=2018');
        res.send(200);
    })
    .get('/update', (req, res) => {
        db.listAllTenders(function (data) {
            updateExistedTenders(data);
        });
        res.send(200);
    })




    .get('/tenders', (req, res) => {
        db.listTenders({}, function (data) {
            res.send(data);
        })
    })

    .get('/ping', (req, res) => {
        res.sendStatus(200);
    });

app.use('/', serve(path.join(__dirname, '..', 'client')));

function goThrowTenders(uri) {
    task1Hour.stop();
    task5Min.stop();
    console.log('uri - ', uri);
    let milliseconds = null;

    const https = require('https');
    https.get(uri, function (res) {
        milliseconds = new Date().getTime();
        let str = '';
        res.on('data', function (chunk) {
            str += chunk;
        });
        res.on('end', function () {
            const resJson = JSON.parse(str);
            const nextUri = resJson.next_page.uri;
            const data = resJson.data;
            //  console.log(data.length);
            if (data.length === 0) {
                logger.log('info', 'goThrowTenders finished');
                console.log('Go throw tenders finished.');
                db.setNextURI(startUri);
                task1Hour.start();
                task5Min.start();
            } else {
                resJson.data.map(data => data.id).forEach(id => {
                    analiseToTender(apiPrefix, id, uri);
                });
                db.setNextURI(nextUri);
                goThrowTenders(nextUri);
            }
        });
    });
}

function updateExistedTenders(data) {
    data.forEach(tender => {
        db.getTenderByID(tender, function (tender) {
            analiseToTender(apiPrefix, tender._id);
        })
    });
}

function analiseToTender(prefix, id, uri) {
    try {
        got(`${prefix}${id}`).then(data => {
            if (data.body) {
                try {
                    const allInfo = JSON.parse(data.body).data;
                    if (allInfo) {
                        delete allInfo.questions;
                        delete allInfo.complaints;
                        const tender = {};
                        try {
                            if (allInfo.value) {
                                tender.amount = allInfo.value.amount;
                                if (Number.parseInt(tender.amount, 10) > config.minAmount && Number.parseInt(tender.amount, 10) < config.maxAmount) {
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
                                        tender.tenderers = allInfo.bids.filter(bid => {
                                            if (bid.tenderers) {
                                                const tenderer = bid.tenderers[0].name;
                                                return tenderer !== null;
                                            }
                                            return false;
                                        }).map(tenderer => {
                                            return tenderer.tenderers[0].name.replace('ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ', 'ТОВ').replace('«', '\"').replace('»', '\"');
                                        });
                                    }

                                    if (allInfo.items) {
                                        let itemIDs = [];
                                        let classificationIDs = [];

                                        allInfo.items.forEach(item => {
                                            if (itemIDs.indexOf(item.classification.description) === -1) {
                                                itemIDs.push(item.classification.description);
                                            }
                                        });
                                        allInfo.items.forEach(item => {
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
                                    tender.status = tenderStatusEnum[allInfo.status];
                                    if (tender.status === tenderStatusEnum['complete'] || tender.status === tenderStatusEnum['active.awarded']) {
                                        let suppliers = [];
                                        if (allInfo.awards) {
                                            if (Array.isArray(allInfo.awards)) {
                                                allInfo.awards.forEach(award => {
                                                    if (award.suppliers) {
                                                        if (Array.isArray(award.suppliers)) {
                                                            award.suppliers.forEach(supplier => {
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
                                    let a = false;
                                    if (tender.classification_ids) {
                                        if (Array.isArray(tender.classification_ids)) {
                                            tender.classification_ids.forEach(id => {
                                                if (itemIdEnum.indexOf(id) > -1) {
                                                    a = true;
                                                }
                                            });
                                        }
                                    }
                                    if (a === true) {
                                        //logger.log('info', `a tender was found - ${JSON.stringify(tender)}`);
                                        /!*   console.log(uri);
                                    /!*       console.log(tender);*!/!*!/
                                        db.createTender(tender);
                                        a = false;
                                    }

                                }
                            }
                            //pause(0.05);
                        } catch (err) {
                            console.log(allInfo.id);
                            console.log(allInfo.tenderID);
                            console.log(tenderStatusEnum[allInfo.status]);
                            console.log(tender.amount);
                            console.log(err);
                            //pause(0.05);
                        }

                    }
                } catch (err) {
                    errorHandler(err);

                }
            }
        });
    } catch (err) {
        console.log(err);
    }

}

/!*app.listen(8080, () => {
    console.log(`Server is running on 8080`);
});*!/

app.listen(process.env.PORT || 8080, () => {
    if (process.env.PORT) {
        console.log(`Server is running on ${process.env.PORT}`);
    } else {
        console.log(`Server is running on 8080`);

    }
});

/!*cron.schedule('1-59 * * * * * ', function(){
    console.log('sec 2');
}, true);*!/

/!*const task1Min =  cron.schedule('*!/1 * * * *', function(){
    console.log('minute 1');
}, false);*!/

const task5Min = cron.schedule('*!/5 * * * *', function () {
    logger.log('info', '5MinTask started');
    db.listAllTenders(function (data) {
        updateExistedTenders(data);
    });
}, false);

const task1Hour = cron.schedule('* *!/1 * * *', function () {
    logger.log('info', '1HourTask started');
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
task1Hour.start();*/
//# sourceMappingURL=app.js.map