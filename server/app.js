import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import got from 'got';
import jsdom from 'jsdom';
const {JSDOM} = jsdom;
import replaceAll from 'replaceall';
import * as db from './utils/dbutils';
import utf8 from 'utf8';
import util from 'util';
import itemIdEnum from './enums/item_id';
import XMLHttpRequest from 'xmlhttprequest';


db.connect();
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};


const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions));
let startUri = 'https://public.api.openprocurement.org/api/2.4/tenders?offset=2018-05';
const apiPrefix = 'https://public.api.openprocurement.org/api/2.4/tenders/';

app.get('/', (req, res) => {

    goThrowTenders(startUri);

    res.sendStatus(200);
});

function goThrowTenders(uri) {
    const https = require('https');
    https.get(uri, function(res){
        let str = '';
        res.on('data', function (chunk) {
            str += chunk;
        });
        res.on('end', function () {
            const resJson = JSON.parse(str);
            const nextUri = resJson.next_page.uri;
            const data = resJson.data;
            if(data.length === 0){
                return;
            } else {
                resJson.data.map(data => data.id).forEach(id => {
                    analizeToTender(apiPrefix, id);
                });
                goThrowTenders(nextUri);
            }
        });
    });
}

function analizeToTender(prefix, id) {
    got(`${prefix}${id}`).then(data => {
        if(data.body){
            const allInfo = JSON.parse(data.body).data;
            if(allInfo){
                delete allInfo.questions;
                delete allInfo.complaints;
                const tender = {};
                tender._id = allInfo.id;
                if(allInfo.auctionPeriod){
                    tender.startDate = allInfo.auctionPeriod.startDate;
                }
                tender.awardCriteria = allInfo.awardCriteria;
                if(allInfo.bids){
                    if(Array.isArray(allInfo.bids)){
                        if(allInfo.bids[0]){
                            tender.tenderers = allInfo.bids.map(bid => bid.tenderers[0].name.replace('ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ', 'ТОВ').replace('«','\"').replace('»','\"'));
                        }
                    }
                }
                tender.items = allInfo.items.map(item => item.classification.description);
                tender.classification_ids = allInfo.items.map(item => item.classification.id);
                tender.tenderID = allInfo.tenderID;
                tender.title = allInfo.title;
                tender.amount = allInfo.value.amount;
                tender.currency = allInfo.value.currency;
                tender.valueAddedTaxIncluded = allInfo.value.valueAddedTaxIncluded;
                if(Number.parseInt(tender.amount, 10)>1000000){
                    let a = false;
                    if(tender.classification_ids){
                        if(Array.isArray(tender.classification_ids)){
                            tender.classification_ids.forEach(id => {
                                if(itemIdEnum.indexOf(id) > -1){
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


app.listen(8080, () => {
    console.log(`Server is running on 8070`);
});



