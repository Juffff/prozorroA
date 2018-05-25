window.onload = () => {

    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const clearSearchInput = document.getElementById('clearSearchButton');
    const amountTh = document.getElementById('amountTh');
    const pDate = document.getElementById('pDate');

    $("#btnExport").click(function (e) {
        $(this).attr({
            'download': `ProzorroAnalytics_${new Date().toLocaleDateString()}_${new Date().toLocaleTimeString()}.xls`,
            'href': 'data:application/csv;charset=utf-8,' + encodeURIComponent($('#dvData').html())
        })
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

    amountTh.addEventListener('click', function(){
        document.getElementById('tBody').innerHTML = '';
        listReq(searchInput.value, sortByAmount);
    });

    pDate.addEventListener('click', function(){
        document.getElementById('tBody').innerHTML = '';
        listReq(searchInput.value, sortByDatePublished);
    });

    clearSearchInput.onclick = function () {
        searchInput.value = '';
        document.getElementById('tBody').innerHTML = '';
        listReq('', sortByAmount);
    };

    function listReq(search, sort) {
        const server = 'http://localhost:8080/tenders';
        fetch(server)
            .then(response => response.json())
            .then(json => {
                if (typeof sort === 'function') {
                    return sort(json);
                } else return sortByAmount(json);
            })
            .then(json => {
                    const tBody = document.getElementById('tBody');
                    json.forEach(el => {
                        if (Object.values(el).join('').toLowerCase().indexOf(search.toLowerCase()) !== -1) {
                            createTr(el, tBody);
                        }
                    });
                }
            )
            .catch(console.log);
    }

    function sortByDatePublished(data) {
        const dataToBeSorted = data.map(el => {
            if (el.datePublished === undefined) {
                el.datePublished = null;
                return el;
            } else return el;
        });
        return dataToBeSorted.sort((a, b) => {
            let data1 = new Date(a.datePublished);
            let data2 = new Date(b.datePublished);
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
        const dataToBeSorted = data;
        return dataToBeSorted.sort((a, b) => {
            const data1 = Number.parseInt(a.amount);
            const data2 = Number.parseInt(b.amount);
            if (data1 < data2) {
                return 1;
            }
            if (data1 > data2) {
                return -1;
            }
            return 0;
        });
    }




    const createTd = (data, className, link, cssText) => {
        const el = document.createElement('td');
        if (className) {
            el.classList.add(className);
        }
        if (link) {
            el.addEventListener('click', () => openInNewTab(link));
        }
        if (cssText) {
            el.style.cssText = cssText;
        }
        if (!data) el.innerHTML = ''; else el.innerHTML = data;
        el.ondblclick = function () {
            searchInput.value = el.innerHTML;
            document.getElementById('tBody').innerHTML = '';
            listReq(searchInput.value);
        };
        return el;
    };

    const createUlTD = (data, cssText) => {
        if (Array.isArray(data)) {
            const td = document.createElement('td');
            td.style.cssText = cssText;
            const ul = document.createElement('ul');
            data.forEach(el => {
                const li = document.createElement('li');
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
        } else return createTd(data, false, false, `background-color: ${setColorOfTr(data.status)}`);

    };

    const createTr = (data, tBody) => {
        const tr = document.createElement('tr');
        let className = 'default';
        tr.classList.add(className);
        tr.appendChild(createTd(data.tenderID, 'href', `https://prozorro.gov.ua/tender/${data.tenderID}`, `background-color: ${setColorOfTr(data.status)}`));
        tr.appendChild(createTd(data.name, false, false, `background-color: ${setColorOfTr(data.status)}`));
        tr.appendChild(createTd(Number.parseInt(data.amount, 0).toString().replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 ").replace('.', ',').replace(' ,', ',').replace(', ', ','), false, false, `text-align: end; background-color: ${setColorOfTr(data.status)}`));
        tr.appendChild(createTd(data.title, false, false, `background-color: ${setColorOfTr(data.status)}`));
        tr.appendChild(createTd(data.status, false, false, `background-color: ${setColorOfTr(data.status)}`));
        if (data.datePublished) {
            tr.appendChild(createTd(new Date(data.datePublished).toLocaleDateString(), false, false, `text-align: center; background-color: ${setColorOfTr(data.status)}`));
        } else {
            tr.appendChild(createTd('', false, false, `background-color: ${setColorOfTr(data.status)}`));
        }
        if (data.startDate) {
            tr.appendChild(createTd(new Date(data.startDate).toLocaleDateString(), false, false, `background-color: ${setColorOfTr(data.status)}`));
        } else {
            tr.appendChild(createTd('', false, false, `background-color: ${setColorOfTr(data.status)}`));
        }
        tr.appendChild(createUlTD(data.tenderers, `background-color: ${setColorOfTr(data.status)}`));
        tr.appendChild(createUlTD(data.suppliers, `background-color: ${setColorOfTr(data.status)}`));
        tr.appendChild(createTd(data.currency, false, false, `text-align: center; background-color: ${setColorOfTr(data.status)}`));
        tr.appendChild(createUlTD(data.items, `background-color: ${setColorOfTr(data.status)}`));
        tr.appendChild(createUlTD(data.classification_ids, `background-color: ${setColorOfTr(data.status)}`));
        const historyList = Object.keys(data.history).map(el => {
            if(typeof data.history[el] === 'object'){
                return`${el} : ${Object.values(data.history[el])}`
            } else return `${el} : ${data.history[el]}`;
        });
        tr.appendChild(createUlTD(historyList, `background-color: ${setColorOfTr(data.status)}`));
        tBody.appendChild(tr);
    };

};

function setColorOfTr(status) {
    let statueEnum = {
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
    const win = window.open(url, '_blank');
    win.focus();
}
