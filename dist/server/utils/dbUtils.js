'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.connect = connect;
exports.createTender = createTender;
exports.getTenderByID = getTenderByID;
exports.listAllTenders = listAllTenders;
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

var _tendersComparator = require('./tendersComparator');

var _tendersComparator2 = _interopRequireDefault(_tendersComparator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Tender = _mongoose2.default.model('Tender');
var NextURI = _mongoose2.default.model('NextURI');

function connect() {
    var db = _config2.default.db;
    _mongoose2.default.connect('mongodb://' + db.host + ':' + db.port + '/' + db.name);
    _mongoose2.default.set('debug', true);
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
            if (!tender.history) {
                newTender.history = _defineProperty({}, new Date(Date.now()).toLocaleDateString().toString(), 'Added to DB');
            } else newTender.history = tender.history;
            newTender.save(function (err, doc) {
                if (err) {
                    (0, _errorHandler2.default)(err);
                } else {
                    // console.log(doc);
                }
            });
        } else {
            Tender.findOne({ _id: tender._id }, function (err, doc) {
                var newTender = updateTender(data[0], tender);
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
                        (0, _errorHandler2.default)(err);
                    } else {
                        console.log(newDoc);
                    }
                });
            });
        }
    });
}

function updateTender(oldTender, newTender) {
    var compareResults = (0, _tendersComparator2.default)(oldTender, newTender);
    if (Object.keys(compareResults).length !== 0) {
        var tNewTender = {};
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
        tNewTender.history = Object.assign(oldTender.history, _defineProperty({}, new Date(Date.now()).toLocaleDateString().toString(), compareResults));
        return tNewTender;
    } else return oldTender;
}

function getTenderByID(tender, callback) {
    Tender.find({ _id: tender._id }).then(function (data) {
        return callback(data[0]);
    });
}

function listAllTenders(callback) {
    return Tender.find({}).then(function (data) {
        return callback(data);
    });
}

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