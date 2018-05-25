import mongoose from 'mongoose';
import config from '../config/config.js';
import '../models/Tender';
import '../models/NextURI';
import errorHandler from '../errorHandler';
import compareTenders from './tendersComparator';

const Tender = mongoose.model('Tender');
const NextURI = mongoose.model('NextURI');


export function connect() {
    const db = config.db;
    mongoose.Promise = global.Promise;
    //mongoose.connect(`mongodb://${db.host}:${db.port}/${db.name}`, { useMongoClient: true });
    mongoose.connect(`${db.user}:${db.password}@${db.host}:${db.port}/${db.name}`);
    //mongoose.set('debug', true);
}

export function createTender(tender) {
    Tender.find({_id: tender._id}).then(data => {
        if (data.length === 0) {
            const newTender = new Tender;
            newTender._id = tender._id;
            newTender.name = tender.name;
            newTender.datePublished = tender.datePublished;
            newTender.startDate = tender.startDate;
            newTender.awardCriteria = tender.awardCriteria;
            newTender.tenderers = tender.tenderers;
            newTender.items = tender.items;
            newTender.classification_ids = tender.classification_ids;
            newTender.tenderID = tender.tenderID;
            newTender.title = tender.title;
            newTender.amount = tender.amount;
            newTender.currency = tender.currency;
            newTender.status = tender.status;
            newTender.suppliers = tender.suppliers;
            newTender.createdAt = new Date(Date.now()).toLocaleDateString().toString();
            const date = new Date(Date.now());
            const day = date.toLocaleDateString();
            const time = date.toLocaleTimeString();
            if (!tender.history) {
                newTender.history = {[`${day}:${time}`]: 'Тендер добавлен в базу'};
            } else newTender.history = tender.history;
            newTender.save(function (err, doc) {
                if (err) {
                    errorHandler(err);
                } else {
                    // console.log(doc);
                }
            });
        } else {
            Tender.findOne({_id: tender._id}, function (err, doc) {
                const newTender = updateTender(data[0], tender);
                doc._id = newTender._id;
                doc.name = newTender.name;
                doc.datePublished = newTender.datePublished;
                doc.startDate = newTender.startDate;
                doc.awardCriteria = newTender.awardCriteria;
                doc.tenderers = newTender.tenderers;
                doc.items = newTender.items;
                doc.classification_ids = newTender.classification_ids;
                doc.tenderID = newTender.tenderID;
                doc.title = newTender.title;
                doc.amount = newTender.amount;
                doc.currency = newTender.currency;
                doc.status = newTender.status;
                doc.suppliers = newTender.suppliers;
                doc.createdAt = newTender.createdAt;
                doc.history = newTender.history;
                doc.save(function (err, newDoc) {
                    if (err) {
                        errorHandler(err);
                    } else {
                         console.log(newDoc);
                    }
                });
            });


        }
    });
}

function updateTender(oldTender, newTender) {
    const compareResults = compareTenders(oldTender, newTender);
    if (Object.keys(compareResults).length !== 0) {
        const tNewTender = {};
        tNewTender._id = newTender._id;
        tNewTender.name = newTender.name;
        tNewTender.datePublished = newTender.datePublished;
        tNewTender.startDate = newTender.startDate;
        tNewTender.awardCriteria = newTender.awardCriteria;
        tNewTender.tenderers = newTender.tenderers;
        tNewTender.items = newTender.items;
        tNewTender.classification_ids = newTender.classification_ids;
        tNewTender.tenderID = newTender.tenderID;
        tNewTender.title = newTender.title;
        tNewTender.amount = newTender.amount;
        tNewTender.currency = newTender.currency;
        tNewTender.status = newTender.status;
        tNewTender.suppliers = newTender.suppliers;
        tNewTender.createdAt = oldTender.createdAt;
        const date = new Date(Date.now());
        const day = date.toLocaleDateString();
        const time = date.toLocaleTimeString();
        tNewTender.history = Object.assign(oldTender.history, {[`${day}:${time}`]: compareResults});
        return tNewTender;
    } else return oldTender;
}

export function getTenderByID(tender, callback) {
    Tender.find({_id: tender._id}).then(data => callback(data[0]));
}

export function listAllTenders(callback) {
    return Tender.find({}).then(data => callback(data));
}

export function listTenders(tenderFilter, callback) {
    Tender.find(tenderFilter).then(data => callback(data));
}

export function setNextURI(URI) {
    NextURI.findOne({_id: 'nextURI'}, (err, doc) => {
        if (doc) {
            doc.nextURI = URI;
            doc.save((err, doc) => {
                if (err) {
                    errorHandler(err);
                }
            });

        } else {
            const uri = new NextURI;
            uri._id = 'nextURI';
            uri.nextURI = URI;
            uri.save((err, doc) => {
                if (err) {
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