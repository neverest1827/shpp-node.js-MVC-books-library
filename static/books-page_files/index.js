var drawItemsOnClick;
// var drawItemsOnScroll,
//     isScrollRunning = false;
// console.log(isScrollRunning);

$(document).ready(function () {

    const [prev, next] = document.querySelectorAll('.pagination__link');

    (function () {
        data = {
            filter: getParameterByName('filter') || "new",
            offset: getParameterByName('offset'),
            limit: getParameterByName('count') || global.items_limit_on_page_load
        };

        setSidebarActiveButton(null, data.filter);
        doAjaxQuery('GET', '/api/v1/books', data, function (res) {
            console.log('qindex');
            view.addBooksItems(res.data.books, true);
            // drawItemsOnScroll = initDrawItemsOnScroll(res.data.total.amount);
            drawItemsOnClick = initDrawItemsOnClick(res.data.total.amount);
            showButton(next, prev, res.data.offset, res.data.total.amount)
            if (localStorage.getItem('h')) {
                $(window).scrollTop(localStorage.getItem('h'));
                localStorage.removeItem('h');
            }
        });
    }());

    $('#content').on('click', '.book', function () {
        localStorage.setItem('h', $(window).scrollTop());
    });

    // $(document).scroll(function () {  // Пагінація по скролу
    //     if ((( $(document).height() - $(window).scrollTop() ) < ( 2 * $(window).height() )) && !isScrollRunning) {
    //         isScrollRunning = true;
    //         drawItemsOnScroll();
    //     }
    // });

    const handleNextClick = (e) => {
        e.preventDefault();
        drawItemsOnClick(true);
    };

    const handlePrevClick = (e) => {
        e.preventDefault();
        drawItemsOnClick(false);
    };

    prev.addEventListener('click', handlePrevClick);
    next.addEventListener('click', handleNextClick);
});

function getParameterByName(name, url) {
    if (!url) url = $(location).attr('href');
    // console.log(url);
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// var initDrawItemsOnScroll = function (maxItems) {
//     var maxNumOfItems = maxItems,
//         limit = global.number_of_items_onscroll,
//         offset = parseInt(getParameterByName('count')) || global.items_limit_on_page_load;
//
//     return function () {
//         if (offset < maxNumOfItems) {
//             var data = {
//                 'filter': getParameterByName('filter') || "new",
//                 'limit': limit,
//                 'offset': offset
//             };
//             $("#loading").slideDown();
//             doAjaxQuery('GET', '/api/v1/books', data, function (res) {
//                     $("#loading").slideUp();
//                     isScrollRunning = false;
//                     view.addBooksItems(res.data.books, false);
//                     changeHistoryStateWithParams("replace", res.data.filter, res.data.offset);
//                 });
//             offset += limit;
//         }
//     }
// };

var initDrawItemsOnClick = function (maxItems) {
    var maxNumOfItems = maxItems,
        limit = global.number_of_items_onscroll,
        offset = parseInt(getParameterByName('count')) || global.items_limit_on_page_load;
    const [prev, next] = document.querySelectorAll('.pagination__link');

    return function (boolean) {

        if (!boolean) {
            offset -= limit;
        }

        var data = {
            'filter': getParameterByName('filter') || "new",
            'limit': limit,
            'offset': offset
        };
        $("#loading").slideDown();
        doAjaxQuery('GET', '/api/v1/books', data, function (res) {
            $("#loading").slideUp();
            isScrollRunning = false;
            if (boolean) {
                view.addBooksItems(res.data.books, false);
            } else {
                view.removeBooksItems(res.data.books);
            }
            changeHistoryStateWithParams("replace", res.data.filter, res.data.offset, boolean);
        });

        if (boolean) {
            offset += limit;
        }

        showButton(next, prev, offset, maxItems)
    }
};

function loadIndexPage(reqData) {
    doAjaxQuery('GET', '/api/v1/books', reqData, function (res) {
        view.addBooksItems(res.data.books, true);
        changeHistoryStateWithParams('push', res.data.filter, res.data.offset, true);
        // drawItemsOnScroll = initDrawItemsOnScroll(res.data.total.amount);
        drawItemsOnClick = initDrawItemsOnClick(res.data.total.amount);
        const [prev, next] = document.querySelectorAll('.pagination__link');
        showButton(next, prev, res.data.offset, res.data.total.amount)
    });
}

function setSidebarActiveButton(activeElem, filterStringValue) {
    $('.sidebar_item').removeClass('active');
    if (activeElem) {
        activeElem.closest('a').addClass('active');
        return;
    } else {
        $('a[data-filter=' + filterStringValue + ']').addClass('active');
    }
}

function showButton(next, prev, offset, maxItems) {
    if (offset < maxItems) {
        next.classList.add('pagination__link--visible');
    } else {
        next.classList.remove('pagination__link--visible');
    }

    if (offset > global.items_limit_on_page_load) {
        prev.classList.add('pagination__link--visible');
    } else {
        prev.classList.remove('pagination__link--visible');
    }
}
