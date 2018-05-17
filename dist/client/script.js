'use strict';

window.onload = function () {

    var searchButton = document.getElementById('searchButton');
    var searchInput = document.getElementById('searchInput');

    searchButton.onclick = function () {
        document.getElementById('tBody').innerHTML = '';
        var server = 'http://localhost:8080/';
        fetch(server).then(function (response) {
            return response.json();
        }).then(function (json) {
            var tBody = document.getElementById('tBody');
            json.forEach(function (el) {
                if (Object.values(el).join('').toLowerCase().indexOf(searchInput.value.toLowerCase()) !== -1) {
                    createTr(el, tBody);
                }
            });
        }).catch(console.log);
    };

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
        return el;
    };

    var createTr = function createTr(data, tBody) {
        var tr = document.createElement('tr');

        var className = 'default';

        /* if(data.status === 'Завершена закупівля (завершена)'){
             className = 'info';
         }
         if(data.status === 'Закупівля не відбулась (не відбулась)'){
             className = 'warning';
         }
         if(data.status === 'Відмінена закупівля (відмінена)'){
             className = 'danger';
         }
         if(data.status === 'Пропозиції розглянуто (розглянуто)'){
             className = 'primary';
         }*/

        tr.classList.add(className);
        /*       const tdA = createTd();
               const a = document.createElement('a');
               a.setAttribute('href', `https://prozorro.gov.ua/tender/${data.tenderID}`);
               a.innerHTML = data.tenderID;
               tdA.appendChild(a);
               tr.appendChild(tdA);*/
        tr.appendChild(createTd(data.tenderID, 'href', 'https://prozorro.gov.ua/tender/' + data.tenderID));
        tr.appendChild(createTd(data.name));
        tr.appendChild(createTd(data.amount));
        tr.appendChild(createTd(data.title));
        tr.appendChild(createTd(data.status));
        if (data.startDate) {
            tr.appendChild(createTd(new Date(data.startDate).toLocaleDateString()));
        } else {
            tr.appendChild(createTd(''));
        }
        tr.appendChild(createTd(data.tenderers.join('; ').toString()));
        tr.appendChild(createTd(data.suppliers.join('; ').toString()));
        tr.appendChild(createTd(data.currency));
        tr.appendChild(createTd(data.valueAddedTaxIncluded ? 'С НДС' : 'Без НДС'));
        tr.appendChild(createTd(data.items.join('; ').toString()));
        tr.appendChild(createTd(data.classification_ids.join('; ').toString()));

        tBody.appendChild(tr);
    };
};

function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}
//# sourceMappingURL=script.js.map