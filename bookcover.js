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

    function place(el, mx, my) {
        var W = 110;
        var left = mx + 16;
        if (left + W > window.innerWidth - 8) left = mx - W - 16;
        el.style.left = Math.max(4, left) + 'px';
        var top = my + 16;
        if (top + 180 > window.innerHeight - 8) top = my - 196;
        el.style.top = Math.max(4, top) + 'px';
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
        show: function (anchor, title, author, evt) {
            current = anchor;
            if (debounce) clearTimeout(debounce);
            var tt = getTooltip();
            tt.classList.remove('visible');

            var mx = evt ? evt.clientX : 0;
            var my = evt ? evt.clientY : 0;

            debounce = setTimeout(function () {
                if (current !== anchor) return;

                tt.innerHTML = '<div class="book-cover-loading"></div>';
                place(tt, mx, my);
                tt.classList.add('visible');

                loadCover(title, author, function (url) {
                    if (current !== anchor) return;
                    if (!url) { tt.classList.remove('visible'); return; }
                    var img = new Image();
                    img.onload = function () {
                        if (current !== anchor) return;
                        tt.innerHTML = '';
                        tt.appendChild(img);
                        place(tt, mx, my);
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
