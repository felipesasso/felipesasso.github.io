(function () {
    var cache = new Map();
    var tooltip = null;
    var timer = null;
    var activeAnchor = null;

    function getTooltip() {
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'book-cover-tooltip';
            document.body.appendChild(tooltip);
        }
        return tooltip;
    }

    function positionTooltip(anchor) {
        var tt = getTooltip();
        var rect = anchor.getBoundingClientRect();
        var W = 110;
        var left = rect.right + 12;
        if (left + W > window.innerWidth - 8) {
            left = rect.left - W - 12;
        }
        left = Math.max(8, left);
        var top = rect.top + rect.height / 2 - 80;
        top = Math.max(8, Math.min(top, window.innerHeight - 175));
        tt.style.left = left + 'px';
        tt.style.top = top + 'px';
    }

    function fetchCoverUrl(title, author) {
        var key = title + '||' + author;
        if (cache.has(key)) return Promise.resolve(cache.get(key));
        var q = encodeURIComponent(title + ' ' + author);
        return fetch('https://openlibrary.org/search.json?q=' + q + '&limit=1&fields=cover_i')
            .then(function (res) { return res.json(); })
            .then(function (data) {
                var id = data.docs && data.docs[0] && data.docs[0].cover_i;
                var url = id ? 'https://covers.openlibrary.org/b/id/' + id + '-M.jpg' : null;
                cache.set(key, url);
                return url;
            })
            .catch(function () {
                cache.set(key, null);
                return null;
            });
    }

    window.BookCover = {
        show: function (anchor, title, author) {
            activeAnchor = anchor;
            if (timer) clearTimeout(timer);
            var tt = getTooltip();
            tt.classList.remove('visible');

            timer = setTimeout(function () {
                if (activeAnchor !== anchor) return;
                fetchCoverUrl(title, author).then(function (url) {
                    if (activeAnchor !== anchor || !url) return;
                    var img = new Image();
                    img.onload = function () {
                        if (activeAnchor !== anchor) return;
                        tt.innerHTML = '';
                        tt.appendChild(img);
                        positionTooltip(anchor);
                        tt.classList.add('visible');
                    };
                    img.src = url;
                });
            }, 300);
        },

        hide: function () {
            activeAnchor = null;
            if (timer) clearTimeout(timer);
            var tt = getTooltip();
            tt.classList.remove('visible');
        }
    };
})();
