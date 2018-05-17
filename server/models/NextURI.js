import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const NextURISchema = new Schema({
    _id: String,
    nextURI: String
});

const NextURI = mongoose.model('NextURI', NextURISchema);