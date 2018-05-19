'use strict';

window.onload = function () {

    var searchButton = document.getElementById('searchButton');
    var searchInput = document.getElementById('searchInput');
    var clearSearchInput = document.getElementById('clearSearchButton');

    searchButton.onclick = function () {
        document.getElementById('tBody').innerHTML = '';
        listReq(searchInput.value);
    };

    clearSearchInput.onclick = function () {
        searchInput.value = '';
        document.getElementById('tBody').innerHTML = '';
        listReq('');
    };

    function listReq(search) {
        var server = 'http://localhost:8080/';
        fetch(server).then(function (response) {
            return response.json();
        }).then(function (json) {
            var tBody = document.getElementById('tBody');
            json.forEach(function (el) {
                if (Object.values(el).join('').toLowerCase().indexOf(search.toLowerCase()) !== -1) {
                    createTr(el, tBody);
                }
            });
        }).catch(console.log);
    }

    var createTd = function createTd(data, className, link) {
        var el = document.createElement('td');
        if (className) {
            el.classList.add(className);
        }
        if (link) {
            el.addEventListener('click', function () {
                return openInNewTab(link);
            });
        }
        if (!data) el.innerHTML = '';else el.innerHTML = data;
        el.ondblclick = function () {
            searchInput.value = el.innerHTML;
            document.getElementById('tBody').innerHTML = '';
            listReq(searchInput.value);
        };
        return el;
    };

    var createUlTD = function createUlTD(data) {
        if (Array.isArray(data)) {
            var td = document.createElement('td');
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
        } else return createTd(data);
    };

    var createTr = function createTr(data, tBody) {
        var tr = document.createElement('tr');
        tr.style.cssText = 'background-color: ' + setColorOfTr(data.status);
        var className = 'default';
        tr.classList.add(className);
        tr.appendChild(createTd(data.tenderID, 'href', 'https://prozorro.gov.ua/tender/' + data.tenderID));
        tr.appendChild(createTd(data.name));
        tr.appendChild(createTd(numeral(data.amount).format('0,0.00')));
        tr.appendChild(createTd(data.title));
        tr.appendChild(createTd(data.status));
        if (data.datePublished) {
            tr.appendChild(createTd(new Date(data.datePublished).toLocaleDateString()));
        } else {
            tr.appendChild(createTd(''));
        }
        if (data.startDate) {
            tr.appendChild(createTd(new Date(data.startDate).toLocaleDateString()));
        } else {
            tr.appendChild(createTd(''));
        }
        tr.appendChild(createUlTD(data.tenderers));
        tr.appendChild(createUlTD(data.suppliers));
        tr.appendChild(createTd(data.currency));
        tr.appendChild(createTd(data.valueAddedTaxIncluded ? 'С НДС' : 'Без НДС'));
        tr.appendChild(createUlTD(data.items));
        tr.appendChild(createUlTD(data.classification_ids));
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
        'Закупка не произошла': 'lightpink',
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