'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

window.onload = function () {

    var searchButton = document.getElementById('searchButton');
    var searchInput = document.getElementById('searchInput');
    var clearSearchInput = document.getElementById('clearSearchButton');
    var amountTh = document.getElementById('amountTh');
    var pDate = document.getElementById('pDate');

    $("#btnExport").click(function (e) {
        $(this).attr({
            'download': 'ProzorroAnalytics_' + new Date().toLocaleDateString() + '_' + new Date().toLocaleTimeString() + '.xls',
            'href': 'data:application/csv;charset=utf-8,' + encodeURIComponent($('#dvData').html())
        });
    });

    searchInput.addEventListener("keyup", function (event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            searchButton.click();
        }
    });

    searchButton.onclick = function () {
        document.getElementById('tBody').innerHTML = '';
        listReq(searchInput.value, sortByAmount);
    };

    amountTh.addEventListener('click', function () {
        document.getElementById('tBody').innerHTML = '';
        listReq(searchInput.value, sortByAmount);
    });

    pDate.addEventListener('click', function () {
        document.getElementById('tBody').innerHTML = '';
        listReq(searchInput.value, sortByDatePublished);
    });

    clearSearchInput.onclick = function () {
        searchInput.value = '';
        document.getElementById('tBody').innerHTML = '';
        listReq('', sortByAmount);
    };

    function listReq(search, sort) {
        //const server = 'http://localhost:8080/tenders';
        var server = 'https://prozorroanalytics.herokuapp.com/tenders';
        fetch(server).then(function (response) {
            return response.json();
        }).then(function (json) {
            if (typeof sort === 'function') {
                return sort(json);
            } else return sortByAmount(json);
        }).then(function (json) {
            var tBody = document.getElementById('tBody');
            json.forEach(function (el) {
                if (Object.values(el).join('').toLowerCase().indexOf(search.toLowerCase()) !== -1) {
                    createTr(el, tBody);
                }
            });
        }).catch(console.log);
    }

    function sortByDatePublished(data) {
        var dataToBeSorted = data.map(function (el) {
            if (el.datePublished === undefined) {
                el.datePublished = null;
                return el;
            } else return el;
        });
        return dataToBeSorted.sort(function (a, b) {
            var data1 = new Date(a.datePublished);
            var data2 = new Date(b.datePublished);
            if (data1 < data2) {
                return 1;
            }
            if (data1 > data2) {
                return -1;
            }
            return 0;
        });
    }

    function sortByAmount(data) {
        var dataToBeSorted = data;
        return dataToBeSorted.sort(function (a, b) {
            var data1 = Number.parseInt(a.amount);
            var data2 = Number.parseInt(b.amount);
            if (data1 < data2) {
                return 1;
            }
            if (data1 > data2) {
                return -1;
            }
            return 0;
        });
    }

    var createTd = function createTd(data, className, link, cssText) {
        var el = document.createElement('td');
        if (className) {
            el.classList.add(className);
        }
        if (link) {
            el.addEventListener('click', function () {
                return openInNewTab(link);
            });
        }
        if (cssText) {
            el.style.cssText = cssText;
        }
        if (!data) el.innerHTML = '';else el.innerHTML = data;
        el.ondblclick = function () {
            searchInput.value = el.innerHTML;
            document.getElementById('tBody').innerHTML = '';
            listReq(searchInput.value);
        };
        return el;
    };

    var createUlTD = function createUlTD(data, cssText) {
        if (Array.isArray(data)) {
            var td = document.createElement('td');
            td.style.cssText = cssText;
            var ul = document.createElement('ul');
            data.forEach(function (el) {
                var li = document.createElement('li');
                li.innerHTML = el;
                li.ondblclick = function () {
                    searchInput.value = li.innerHTML;
                    document.getElementById('tBody').innerHTML = '';
                    listReq(searchInput.value);
                };
                ul.appendChild(li);
            });
            td.appendChild(ul);
            return td;
        } else return createTd(data, false, false, 'background-color: ' + setColorOfTr(data.status));
    };

    var createTr = function createTr(data, tBody) {
        var tr = document.createElement('tr');
        var className = 'default';
        tr.classList.add(className);
        tr.appendChild(createTd(data.tenderID, 'href', 'https://prozorro.gov.ua/tender/' + data.tenderID, 'background-color: ' + setColorOfTr(data.status)));
        tr.appendChild(createTd(data.name, false, false, 'background-color: ' + setColorOfTr(data.status)));
        tr.appendChild(createTd(Number.parseInt(data.amount, 0).toString().replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 ").replace('.', ',').replace(' ,', ',').replace(', ', ','), false, false, 'text-align: end; background-color: ' + setColorOfTr(data.status)));
        tr.appendChild(createTd(data.title, false, false, 'background-color: ' + setColorOfTr(data.status)));
        tr.appendChild(createTd(data.status, false, false, 'background-color: ' + setColorOfTr(data.status)));
        if (data.datePublished) {
            tr.appendChild(createTd(new Date(data.datePublished).toLocaleDateString(), false, false, 'text-align: center; background-color: ' + setColorOfTr(data.status)));
        } else {
            tr.appendChild(createTd('', false, false, 'background-color: ' + setColorOfTr(data.status)));
        }
        if (data.startDate) {
            tr.appendChild(createTd(new Date(data.startDate).toLocaleDateString(), false, false, 'background-color: ' + setColorOfTr(data.status)));
        } else {
            tr.appendChild(createTd('', false, false, 'background-color: ' + setColorOfTr(data.status)));
        }
        tr.appendChild(createUlTD(data.tenderers, 'background-color: ' + setColorOfTr(data.status)));
        tr.appendChild(createUlTD(data.suppliers, 'background-color: ' + setColorOfTr(data.status)));
        tr.appendChild(createTd(data.currency, false, false, 'text-align: center; background-color: ' + setColorOfTr(data.status)));
        tr.appendChild(createUlTD(data.items, 'background-color: ' + setColorOfTr(data.status)));
        tr.appendChild(createUlTD(data.classification_ids, 'background-color: ' + setColorOfTr(data.status)));
        var historyList = Object.keys(data.history).map(function (el) {
            if (_typeof(data.history[el]) === 'object') {
                return el + ' : ' + Object.values(data.history[el]);
            } else return el + ' : ' + data.history[el];
        });
        tr.appendChild(createUlTD(historyList, 'background-color: ' + setColorOfTr(data.status)));
        tBody.appendChild(tr);
    };
};

function setColorOfTr(status) {
    var statueEnum = {
        'Переговоры': 'lightgreen',
        'Период уточнений': 'lightgreen',
        'Ожидание предложений': 'lightgreen',
        'Период аукциона': 'lightcyan',
        'Квалификация победителя': 'lightcyan',
        'Квалификация/Переквалификация': 'lightcyan',
        'Преквалификация/Период оспариваний': 'lightcyan',
        'Предложения рассмотрены': 'greenyellow',
        'Закупка не состоялась': 'lightpink',
        'Закупка закончена': 'lightgrey',
        'Закупка отменена': 'lightpink'
    };
    return statueEnum[status];
}

function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}
//# sourceMappingURL=script.js.map