(function () {
    var cache = {};
    var current = null;
    var debounce = null;

    function getTooltip() {
        var el = document.getElementById('book-cover-tooltip');
        if (!el) {
            el = document.createElement('div');
            el.id = 'book-cover-tooltip';
            document.body.appendChild(el);
        }
        return el;
    }

    function place(el, anchor) {
        var r = anchor.getBoundingClientRect();
        var W = 110;
        var left = r.right + 12;
        if (left + W > window.innerWidth - 8) left = r.left - W - 12;
        el.style.left = Math.max(4, left) + 'px';
        var top = r.top + r.height / 2 - 80;
        el.style.top = Math.max(4, Math.min(top, window.innerHeight - 180)) + 'px';
    }

    function loadCover(title, author, callback) {
        var key = title + '|' + author;
        if (key in cache) { callback(cache[key]); return; }
        var q = encodeURIComponent(title + ' ' + author);
        fetch('https://openlibrary.org/search.json?q=' + q + '&limit=1&fields=cover_i')
            .then(function (r) { return r.json(); })
            .then(function (data) {
                var id = data.docs && data.docs[0] && data.docs[0].cover_i;
                var url = id ? 'https://covers.openlibrary.org/b/id/' + id + '-M.jpg' : null;
                cache[key] = url;
                callback(url);
            })
            .catch(function () { cache[key] = null; callback(null); });
    }

    window.BookCover = {
        show: function (anchor, title, author) {
            current = anchor;
            if (debounce) clearTimeout(debounce);
            var tt = getTooltip();
            tt.classList.remove('visible');

            debounce = setTimeout(function () {
                if (current !== anchor) return;

                tt.innerHTML = '<div class="book-cover-loading"></div>';
                place(tt, anchor);
                tt.classList.add('visible');

                loadCover(title, author, function (url) {
                    if (current !== anchor) return;
                    if (!url) { tt.classList.remove('visible'); return; }
                    var img = new Image();
                    img.onload = function () {
                        if (current !== anchor) return;
                        tt.innerHTML = '';
                        tt.appendChild(img);
                        place(tt, anchor);
                    };
                    img.onerror = function () {
                        if (current !== anchor) return;
                        tt.classList.remove('visible');
                    };
                    img.src = url;
                });
            }, 150);
        },

        hide: function () {
            current = null;
            if (debounce) clearTimeout(debounce);
            var tt = document.getElementById('book-cover-tooltip');
            if (tt) tt.classList.remove('visible');
        }
    };
})();
