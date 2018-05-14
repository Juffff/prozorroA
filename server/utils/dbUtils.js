import mongoose from 'mongoose';
import config from '../config/config.js';


//const Stock = mongoose.model('Stock');


export function connect() {
    const db = config.db;
    mongoose.connect(`mongodb://${db.host}:${db.port}/${db.name}`);
}