'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.connect = connect;
exports.createTender = createTender;
exports.updateTender = updateTender;
exports.listTenders = listTenders;
exports.setNextURI = setNextURI;
exports.getNextURI = getNextURI;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _config = require('../config/config.js');

var _config2 = _interopRequireDefault(_config);

require('../models/Tender');

require('../models/NextURI');

var _errorHandler = require('../errorHandler');

var _errorHandler2 = _interopRequireDefault(_errorHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Tender = _mongoose2.default.model('Tender');
var NextURI = _mongoose2.default.model('NextURI');

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
            newTender.history = _defineProperty({}, new Date(Date.now()).toLocaleDateString().toString(), 'Added to DB');
            newTender.save(function (err, doc) {
                if (err) {
                    (0, _errorHandler2.default)(err);
                } else {
                    console.log(doc);
                }
            });
        } else {
            updateTender(data, tender);
        }
    });
}

function updateTender(tender, data) {}

function listTenders(tenderFilter, callback) {
    Tender.find(tenderFilter).then(function (data) {
        return callback(data);
    });
}

function setNextURI(URI) {
    NextURI.findOne({ _id: 'nextURI' }, function (err, doc) {
        if (doc) {
            doc.nextURI = URI;
            doc.save(function (err, doc) {
                if (err) {
                    (0, _errorHandler2.default)(err);
                }
            });
        } else {
            var uri = new NextURI();
            uri._id = 'nextURI';
            uri.nextURI = URI;
            uri.save(function (err, doc) {
                if (err) {
                    (0, _errorHandler2.default)(err);
                }
            });
        }
    });
}

function getNextURI(callback) {
    NextURI.findOne({ _id: 'nextURI' }, function (err, doc) {
        if (doc) {
            callback(doc.nextURI);
        } else {
            callback(false);
        }
    });
}
//# sourceMappingURL=dbUtils.js.map