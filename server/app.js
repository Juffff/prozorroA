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

db.connect();
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};


const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.get('/', (req, res) => {
    got(`https://public.api.openprocurement.org/api/2.4/tenders/5d3499e3076b46f6893900d874c9e825`).then(data => {
        if(data.body){
                const allInfo = JSON.parse(data.body).data;
                delete allInfo.questions;
                console.log(allInfo.bids[0].tenderers);
        }

    });
    res.sendStatus(200);
});
app.listen(8080, () => {
    console.log(`Server is running on 8070`);
});
