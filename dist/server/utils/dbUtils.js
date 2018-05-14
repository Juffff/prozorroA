'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.connect = connect;
exports.createTender = createTender;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _config = require('../config/config.js');

var _config2 = _interopRequireDefault(_config);

require('../models/Tender');

var _errorHandler = require('../errorHandler');

var _errorHandler2 = _interopRequireDefault(_errorHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Tender = _mongoose2.default.model('Tender');

function connect() {
    var db = _config2.default.db;
    _mongoose2.default.connect('mongodb://' + db.host + ':' + db.port + '/' + db.name);
}

function createTender(tender) {
    Tender.find({ _id: tender._id }).then(function (data) {
        if (data.length === 0) {
            var newTender = new Tender();
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
                if (err) {
                    (0, _errorHandler2.default)(err);
                } else {
                    console.log(doc);
                }
            });
        }
    });
}
//# sourceMappingURL=dbUtils.js.map