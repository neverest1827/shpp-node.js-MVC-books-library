window.addEventListener('load', function (){
    const default_limit = 5;
    const default_offset = 0;
    let paginationOnClick;

    (async function (){
        const params = new URLSearchParams({
            offset: default_offset,
            limit: default_limit
        });

        const response = await fetch(`/admin/api/v1/?${params}`);
        const result = await response.json();
        fillTableRows(result)
        createPagination(result.data.total.amount, default_limit)

        const paginationItems = document.querySelectorAll('.page-link')
        const firstItem = paginationItems.item(0)
        paginationOnClick = initPagination(default_offset, default_limit, firstItem);
        paginationItems.forEach( item => item.addEventListener('click', paginationOnClick));
        setActivePagLink(firstItem);
    })();



    document.querySelector('.logout').addEventListener('click', logout)
    async function logout(e){
        e.preventDefault()
        window.location.href = '/';
        await fetch('/admin', {
            credentials: 'include',
            headers: {
                'Authorization': 'Basic ' + btoa('none:none'),
            }
        });
    }

    document.getElementById('customFile').addEventListener('change', handleImageUpload)
    function handleImageUpload() {
        const input = document.getElementById('customFile');
        const preview = document.getElementById('imagePreview');

        // Проверяем, выбран ли файл
        if (input.files && input.files[0]) {
            const reader = new FileReader();

            reader.onload = function(e) {
                // Создаем элемент img для превью
                const img = document.createElement('img');
                img.src = e.target.result;

                // Очищаем содержимое блока превью и добавляем новое изображение
                preview.innerHTML = '';
                preview.appendChild(img);
            };

            // Читаем файл как URL-адрес данных
            reader.readAsDataURL(input.files[0]);
        }
    }
    function fillTableRows(res){
        const books = res.data.books;
        const tbody = document.querySelector('.tbody');
        let content = '';

        for(let book of books){
            content += addTableRow(book)
        }

        tbody.innerHTML = content;
    }

    function addTableRow(book){
        return document.querySelector('.pattern').innerHTML
            .replace(/{id}/g, book.id)
            .replace(/{title}/g, book.title)
            .replace(/{author}/g, book.author)
            .replace(/{year}/g, book.year)
            .replace(/{date}/g, normalDateFormat(book.date))
            .replace(/{clicks}/g, nullToDash(book.clicks))
            .replace(/{views}/g, nullToDash(book.views))
    }

    function nullToDash(string) {
        return (((string == null) || (string == 0)) ? '-' : string);
    }
    function normalDateFormat(date) {
        date = new Date(date)
        return date.toISOString().substring(0, 10);
    }

    function addPaginationItem(page){
        const pageNumber = Number(page) + 1
        return document.querySelector('.pagination__pattern').innerHTML
            .replace(/{pageOffset}/g, page)
            .replace(/{pageNumber}/g, String(pageNumber))
    }

    function createPagination(total, limit){
        const paginationBox = document.querySelector('.pagination');
        const countPages = Math.ceil(total / limit);
        let content = '';

        for (let page = 0; page < countPages; page++){
            content += addPaginationItem(page);
        }

        paginationBox.innerHTML = content;
    }

    function setActivePagLink(item){
        item.parentNode.classList.add('active')
    }

    function initPagination(offsetValue, limitValue, element){
        let offset = offsetValue;
        const limit = limitValue;
        let activeItem = element;

        return function (e){
            e.preventDefault();
            activeItem.parentNode.classList.remove('active');
            setActivePagLink(e.target);
            activeItem = e.target;
            offset = activeItem.dataset.offset;

            const params = new URLSearchParams({
                offset: offset * limit,
                limit: limit
            });

            fetch(`/admin/api/v1/?${params}`)
                .then(res => res.json())
                .then(result => fillTableRows(result))
        }
    }
})