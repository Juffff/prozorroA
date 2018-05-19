/*console.log(JSON.parse(document.getElementsByTagName('pre')[0].innerHTML))*/
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import got from 'got';
/*import jsdom from 'jsdom';

const {JSDOM} = jsdom;*/
import * as db from './utils/dbutils';
import itemIdEnum from './enums/item_id';
import tenderStatusEnum from './enums/tender_status';
import logger from './utils/logger';
import errorHandler from "./errorHandler";

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

let startUri = 'https://public.api.openprocurement.org/api/2.4/tenders?offset=2018-05-01';
const apiPrefix = 'https://public.api.openprocurement.org/api/2.4/tenders/';

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

app.get('/', (req, res) => {
    db.listTenders({}, function (data) {
        res.send(data);
    })
})
    .get('/start', (req, res) => {
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
    console.log(uri);
    const https = require('https');
    https.get(uri, function (res) {
        let str = '';
        res.on('data', function (chunk) {
            str += chunk;
        });
        res.on('end', function () {
            const resJson = JSON.parse(str);
            const nextUri = resJson.next_page.uri;
            const data = resJson.data;
            if (data.length === 0) {
                logger.log('info', 'goThrowTenders finished');
                db.setNextURI(startUri);
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
                                if (Number.parseInt(tender.amount, 10) > 5000000) {
                                    tender._id = allInfo.id;
                                    tender.name = allInfo.procuringEntity.name;
                                    if (allInfo.auctionPeriod) {
                                        tender.startDate = allInfo.auctionPeriod.startDate;
                                    }
                                    if(allInfo.enquiryPeriod){
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
                                    //tender.items = allInfo.items.map(item => item.classification.description);
                                    //tender.classification_ids = allInfo.items.map(item => item.classification.id);
                                    tender.tenderID = allInfo.tenderID;
                                    tender.title = allInfo.title;
                                    tender.currency = allInfo.value.currency;
                                    tender.valueAddedTaxIncluded = allInfo.value.valueAddedTaxIncluded;
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
                                        logger.log('info', tender);
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

app.listen(8080, () => {
    console.log(`Server is running on 8080`);
});


/*TODO:
1. Reglament tasks
2. Sorting
3. Colors
4. history

* */