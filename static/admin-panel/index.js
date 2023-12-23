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

        const paginationItems = document.querySelectorAll('.page-link');
        const firstItem = paginationItems.item(0);
        paginationOnClick = initPagination(default_offset, default_limit, firstItem);
        paginationItems.forEach( item => item.addEventListener('click', paginationOnClick));
        setActivePagLink(firstItem);
        addListenerForDeleteBtn();
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
        const fileNameDisplay = document.getElementById('fileNameDisplay');

        if (input.files && input.files[0]) {
            const fileName = input.files[0].name;

            const validExtensions = '.jpg'
            const fileExtension = fileName.slice(fileName.lastIndexOf('.'));

            if(validExtensions.localeCompare(fileExtension.toLowerCase()) === 0){
                const reader = new FileReader();

                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;

                    preview.innerHTML = '';
                    preview.appendChild(img);

                    fileNameDisplay.textContent = input.files[0].name;
                };

                reader.readAsDataURL(input.files[0]);
            } else {
                view.showError('Можна використовувати лише зображеня з розниреням JPG')
            }
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
                .then(() => addListenerForDeleteBtn())

        }
    }

    async function deleteBook(e) {
        e.preventDefault();
        const btn = e.target;
        const closestTr = btn.closest("tr");
        const id = closestTr.querySelector('.book_id').textContent;

        view.showConfirm(id);
    }

    function addListenerForDeleteBtn(){
        const deleteButtons = document.querySelectorAll('.delete');
        deleteButtons.forEach( btn => btn.addEventListener('click', deleteBook))
    }

    document.querySelector('form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const textInputs = document.querySelectorAll('form input[type="text"]');
        let isValid = true;

        for (let textInput of textInputs){
            if (textInput.value.length > 255) {
                view.showError(`${textInput.placeholder} не може містити більше 255 символів`)
                isValid = false;
                break
            }
        }

        const book_name = document.getElementById('bookTitle').value;
        const form_data = new FormData(this);

        if (isValid) {
            const response = await fetch('/admin/api/v1', {
                method: 'POST',
                body: form_data
            });
            const result = await response.json();
            if (result.success){
                view.showSuccess(`Книга ${book_name} успішно створена!`);
                document.querySelector('.confirm').addEventListener('click', () =>{
                    window.location.href = '/admin';
                })
            } else {
                view.showError(`Виникла помилка: ${result.msg}`);
            }
        }

    });

    document.getElementById('bookYear').addEventListener('blur',  function () {
        const inputValue = this.value;
        const yearPattern = /^\d{4}$/;
        if (!yearPattern.test(inputValue)) {
            view.showError('Год должен быть в формате "yyyy"')
        }
    });
})