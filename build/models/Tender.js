import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const TenderSchema = new Schema({
    _id: String,
    name: String,
    startDate: String,
    datePublished: String,
    awardCriteria: String,
    tenderers: [],
    items:[],
    classification_ids: [],
    tenderID: String,
    title: String,
    amount: String,
    currency: String,
    status: String,
    suppliers: [],
    created: String,
    history: Schema.Types.Mixed
});

const Tender = mongoose.model('Tender', TenderSchema);