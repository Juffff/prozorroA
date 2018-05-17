import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const TenderSchema = new Schema({
    _id: String,
    name: String,
    startDate: String,
    awardCriteria: String,
    tenderers: [],
    items:[],
    classification_ids: [],
    tenderID: String,
    title: String,
    amount: String,
    currency: String,
    valueAddedTaxIncluded: String,
    status: String,
    suppliers: []
});

const Tender = mongoose.model('Tender', TenderSchema);