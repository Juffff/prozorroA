window.onload = () => {

    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');

    searchButton.onclick = function () {
        document.getElementById('tBody').innerHTML = '';
        const server = 'http://localhost:8080/';
        fetch(server)
            .then(response => response.json())
            .then(json => {
                    const tBody = document.getElementById('tBody');
                    json.forEach(el => {
                        if (Object.values(el).join('').toLowerCase().indexOf(searchInput.value.toLowerCase()) !== -1) {
                            createTr(el, tBody);
                        }
                    });
                }
            )
            .catch(console.log);
    };

    const createTd = (data, className, link) => {
        const el = document.createElement('td');
        if (className) {
            el.classList.add(className);
        }
        if (link) {
            el.addEventListener('click', () => openInNewTab(link));
        }
        if (!data) el.innerHTML = ''; else el.innerHTML = data;
        return el;
    };

    const createUlTD = (data) => {
        if(Array.isArray(data)){
            const td = document.createElement('td');
            const ul = document.createElement('ul');
            data.forEach(el => {
                const li = document.createElement('li');
                li.innerHTML = el;
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