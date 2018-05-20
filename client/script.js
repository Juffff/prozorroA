window.onload = () => {

    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const clearSearchInput = document.getElementById('clearSearchButton');
    const exportToExcelButton = document.getElementById('exportToExcelButton');

    exportToExcelButton.onclick = function () {
        $("table").tableExport();
    };

    searchInput.addEventListener("keyup", function (event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            searchButton.click();
        }
    });

    searchButton.onclick = function () {
        document.getElementById('tBody').innerHTML = '';
        listReq(searchInput.value, sortByDatePublished);
    };

    clearSearchInput.onclick = function () {
        searchInput.value = '';
        document.getElementById('tBody').innerHTML = '';
        listReq('');
    };

    function listReq(search, sort) {
        const server = 'http://localhost:8080/';
        fetch(server)
            .then(response => response.json())
            .then(json => {
                if(typeof sort === 'function'){
                    return sort(json);
                } else  return sortByDatePublished(json);
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

    const createTd = (data, className, link, cssText) => {
        const el = document.createElement('td');
        if (className) {
            el.classList.add(className);
        }
        if (link) {
            el.addEventListener('click', () => openInNewTab(link));
        }
        if(cssText){
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

    const createUlTD = (data) => {
        if (Array.isArray(data)) {
            const td = document.createElement('td');
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
        } else return createTd(data);

    };

    const createTr = (data, tBody) => {
        const tr = document.createElement('tr');
        tr.style.cssText = `background-color: ${setColorOfTr(data.status)}`;
        let className = 'default';
        tr.classList.add(className);
        tr.appendChild(createTd(data.tenderID, 'href', `https://prozorro.gov.ua/tender/${data.tenderID}`));
        tr.appendChild(createTd(data.name));
        tr.appendChild(createTd(Number.parseInt(data.amount, 0).toString().replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 ").replace('.', ',').replace(' ,', ',').replace(', ', ','),false,false,'text-align: end;'));
        tr.appendChild(createTd(data.title));
        tr.appendChild(createTd(data.status));
        if (data.datePublished) {
            tr.appendChild(createTd(new Date(data.datePublished).toLocaleDateString(),false,false,'text-align: center'));
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
        tr.appendChild(createTd(data.currency,false,false,'text-align: center;'));
        tr.appendChild(createUlTD(data.items));
        tr.appendChild(createUlTD(data.classification_ids));
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
        'Закупка не произошла': 'lightpink',
        'Закупка закончена': 'lightgrey',
        'Закупка отменена': 'lightpink'
    };
    return statueEnum[status];
}

function openInNewTab(url) {
    const win = window.open(url, '_blank');
    win.focus();
}