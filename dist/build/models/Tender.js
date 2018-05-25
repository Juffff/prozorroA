'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var Schema = _mongoose2.default.Schema;

var TenderSchema = new Schema({
    _id: String,
    name: String,
    startDate: String,
    datePublished: String,
    awardCriteria: String,
    tenderers: [],
    items: [],
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

var Tender = _mongoose2.default.model('Tender', TenderSchema);
//# sourceMappingURL=Tender.js.map