function formatDate(date) {
    return new Date(date).toLocaleTimeString();
}

function compareNames(oldTender, newTender) {
    if (oldTender.name === newTender.name) {
        return 0;
    } else {
        return `Изменено имя: ${oldTender.name} -> ${newTender.name}`
    }
}


function compareStartDates(oldTender, newTender) {
    if (oldTender.startDate === newTender.startDate) {
        return 0;
    } else return `Изменена дата аукциона: ${formatDate(oldTender.startDate)} -> ${formatDate(newTender.startDate)}`;
}

function comparePublishedDates(oldTender, newTender) {
    if (oldTender.datePublished === newTender.datePublished) {
        return 0;
    } else return `Изменена дата публикации: ${formatDate(oldTender.datePublished)} -> ${formatDate(newTender.datePublished)}`;
}

function compareIds(oldTender, newTender) {
    if (oldTender.tenderID === newTender.tenderID) {
        return 0;
    } else return `Изменен идентификатор: ${oldTender.tenderID} -> ${newTender.tenderID}`
}

function compareTitles(oldTender, newTender) {
    if (oldTender.title === newTender.title) {
        return 0;
    } else return `Изменено описание: ${oldTender.title} -> ${newTender.title}`
}

function compareAmounts(oldTender, newTender) {
    if (Number.parseInt(oldTender.amount) === Number.parseInt(newTender.amount)) {
        return 0;
    } else return `Изменен бюджет: ${oldTender.amount} -> ${newTender.amount}`
}

function compareCurrencies(oldTender, newTender) {
    if (oldTender.currency === newTender.currency) {
        return 0;
    } else return `Изменена валюта: ${oldTender.currency} -> ${newTender.currency}`
}

function compareStatuses(oldTender, newTender) {
    if (oldTender.status === newTender.status) {
        return 0;
    } else return `Изменен статус: ${oldTender.status} -> ${newTender.status}`
}

function compareArrays(oldArray, newArray) {
    let added = [];
    let deleted = [];
    newArray.forEach(el => {
        if (oldArray.indexOf(el) === -1) {
            added.push(el);
        }
    });

    oldArray.forEach(el => {
        if (newArray.indexOf(el) === -1) {
            deleted.push(el);
        }
    });

    if (added.length === 0 && deleted.length === 0) {
        return 0;
    } else {
        if (added.length === 0 && deleted.length !== 0) {
            return {deleted: deleted}
        }
        if (added.length !== 0 && deleted.length === 0) {
            return {added: added}
        }
        if (added.length !== 0 && deleted.length !== 0) {
            return {added: added, deleted: deleted}
        }
    }
}

function compareArraysDesc(oldTender, newTender, fName, description) {
    const compareResult = compareArrays(oldTender[fName], newTender[fName]);
    console.log(compareResult);
    if (compareResult === 0) {
        return 0;
    } else {
        let added = '';
        let deleted = '';
        if (compareResult.added) {
            added = `Добавлены ${description}:  + ${compareResult.added.join(', ')}`;
        }
        if (compareResult.added) {
            deleted = `Удалены ${description}:  + ${compareResult.deleted.join(', ')}`;
        }
        return added + ';' + deleted;
    }
}

function compareTenderers(oldTender, newTender) {
    //console.log(compareArraysDesc(oldTender, newTender, 'tenderers', 'участники'));
    return compareArraysDesc(oldTender, newTender, 'tenderers', 'участники');
}

function compareSuppliers(oldTender, newTender) {
    return compareArraysDesc(oldTender, newTender, 'suppliers', 'победители');
}

function compareItems(oldTender, newTender) {
    return compareArraysDesc(oldTender, newTender, 'items', 'товары');
}

function compareClassification_ids(oldTender, newTender) {
    return compareArraysDesc(oldTender, newTender, 'classification_ids', 'классификаторы');
}

export default function (oldTender, newTender2) {

    const newTender = {
        "_id": "a188a975c4984bd68c67e61ef187c54e",
        "history": {
            "2018-5-21": "Added to DB"
        },
        "status": "Закупка не состоялась",
        "currency": "UAH",
        "amount": "7500000",
        "title": "“Послуги з технічної підтримки програмного забезпечення Oracle Database”.",
        "tenderID": "UA-2017-10-13-001799-a",
        "awardCriteria": "lowestCost",
        "startDate": "2017-11-23T12:38:39+02:00",
        "datePublished": "2017-10-13T14:06:56.116592+03:00",
        "name": "Національний Банк України",
        "classification_ids": [
            "72260000-5"
        ],
        "items": [
            "Послуги, пов’язані з програмним забезпеченням"
        ],
        "tenderers": [
            "ТОВ \"ОС КОНСАЛТІНГ\"",
            "ТОВ \"РДТЕХ\"",
            "Приватне Акціонерне Товариство \"Пріоком\"",
            "ТОВ \"ЦЕНТР СИСТЕМНОЇ ІНТЕГРАЦІЇ\"",
            "ТОВ \"DILDO\""
        ],
        "__v": 0
    };

    let tenderDifferences = {};
    if (compareNames(oldTender, newTender) !== 0) {
        tenderDifferences.names = compareNames(oldTender, newTender);
    }
    //console.log(compareNames(oldTender, newTender), compareNames(oldTender, newTender) !== 0);

    if (compareStartDates(oldTender, newTender) !== 0) {
        tenderDifferences.startDates = compareStartDates(oldTender, newTender).toString();
    }
   // console.log(compareStartDates(oldTender, newTender), compareStartDates(oldTender, newTender) !== 0);

    if (comparePublishedDates(oldTender, newTender) !== 0) {
        tenderDifferences.PublishedDates = comparePublishedDates(oldTender, newTender)
    }
   // console.log(comparePublishedDates(oldTender, newTender), comparePublishedDates(oldTender, newTender) !== 0);

    if (compareIds(oldTender, newTender) !== 0) {
        tenderDifferences.iDs = compareIds(oldTender, newTender)
    }
   // console.log(compareIds(oldTender, newTender), compareIds(oldTender, newTender) !== 0);

    if (compareTitles(oldTender, newTender) !== 0) {
        tenderDifferences.titles = compareTitles(oldTender, newTender);
    }
    //console.log(compareTitles(oldTender, newTender), compareTitles(oldTender, newTender) !== 0);

    if (compareAmounts(oldTender, newTender) !== 0) {
        tenderDifferences.amounts = compareAmounts(oldTender, newTender);
    }
   // console.log(compareAmounts(oldTender, newTender), compareAmounts(oldTender, newTender) !== 0);

    if (compareCurrencies(oldTender, newTender) !== 0) {
        tenderDifferences.currencies = compareCurrencies(oldTender, newTender);
    }

    //console.log(compareCurrencies(oldTender, newTender), compareCurrencies(oldTender, newTender) !== 0);

    if (compareStatuses(oldTender, newTender) !== 0) {
        tenderDifferences.statuses = compareStatuses(oldTender, newTender)
    }
   // console.log(compareStatuses(oldTender, newTender), compareStatuses(oldTender, newTender) !== 0);

    if ((oldTender, newTender) !== 0) {
        tenderDifferences = Object.assign({}, tenderDifferences, {tenderers: compareTenderers(oldTender, newTender)})
    }
  //  console.log(compareTenderers(oldTender, newTender), compareTenderers(oldTender, newTender) !== 0);

    /*if (compareSuppliers(oldTender, newTender) !== 0) {
        tenderDifferences.suppliers = compareSuppliers(oldTender, newTender)
    }
    console.log(compareSuppliers(oldTender, newTender), compareSuppliers(oldTender, newTender) !== 0);


    if (compareItems(oldTender, newTender) !== 0) {
        tenderDifferences.items = compareItems(oldTender, newTender)
    }
    console.log(compareItems(oldTender, newTender), compareItems(oldTender, newTender) !== 0);

    if (compareClassification_ids(oldTender, newTender) !== 0) {
        tenderDifferences.classification_ids = compareClassification_ids(oldTender, newTender)
    }
    console.log(compareClassification_ids(oldTender, newTender), compareClassification_ids(oldTender, newTender) !== 0);*/

    console.log(tenderDifferences);
    return tenderDifferences;
}
