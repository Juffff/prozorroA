import mongoose from 'mongoose';
import config from '../config/config.js';
import '../models/Tender';
import errorhandler from '../errorHandler';

const Tender = mongoose.model('Tender');


export function connect() {
    const db = config.db;
    mongoose.connect(`mongodb://${db.host}:${db.port}/${db.name}`);
}

export function createTender(tender) {
    Tender.find({_id: tender._id}).then(data => {
        if(data.length === 0){
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
             newTender.save(function (err, doc) {
                 if(err){
                      errorhandler(err);
                 } else {
                     console.log(doc);
                 }
             });
        }
    });
}