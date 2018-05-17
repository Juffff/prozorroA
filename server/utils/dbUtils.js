import mongoose from 'mongoose';
import config from '../config/config.js';
import '../models/Tender';
import '../models/NextURI';
import errorHandler from '../errorHandler';

const Tender = mongoose.model('Tender');
const NextURI = mongoose.model('NextURI');


export function connect() {
    const db = config.db;
    mongoose.connect(`mongodb://${db.host}:${db.port}/${db.name}`);
}

export function createTender(tender) {
    Tender.find({_id: tender._id}).then(data => {
        if (data.length === 0) {
            const newTender = new Tender;
            newTender._id = tender._id;
            newTender.name = tender.name;
            newTender.startDate = tender.startDate;
            newTender.awardCriteria = tender.awardCriteria;
            newTender.tenderers = tender.tenderers;
            newTender.items = tender.items;
            newTender.classification_ids = tender.classification_ids;
            newTender.tenderID = tender.tenderID;
            newTender.title = tender.title;
            newTender.amount = tender.amount;
            newTender.currency = tender.currency;
            newTender.valueAddedTaxIncluded = tender.valueAddedTaxIncluded;
            newTender.status = tender.status;
            newTender.suppliers = tender.suppliers;
            newTender.save(function (err, doc) {
                if (err) {
                    errorHandler(err);
                } else {
                    console.log(doc);
                }
            });
        }
    });
}

export function listTenders(tenderFilter, callback) {
    Tender.find(tenderFilter).then(data => callback(data));
}

export function setNextURI(URI) {
    NextURI.findOne({_id: 'nextURI'}, (err, doc) => {
        if (doc) {
            doc.nextURI = URI;
            doc.save((err, doc) => {
                if(err){
                    errorHandler(err);
                } else console.log(doc);
            });

        } else {
            const uri = new NextURI;
            uri._id = 'nextURI';
            uri.nextURI = URI;
            uri.save((err, doc) => {
                if(err){
                    errorHandler(err);
                }
            });
        }
    })
}

export function getNextURI(callback) {
    NextURI.findOne({_id: 'nextURI'}, (err, doc) => {
        if (doc) {
           callback(doc.nextURI);

        } else {
            callback(false);
        }
    });
}