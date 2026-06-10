/*
 * Zoomable squarified treemap (Bruls, Huizing & van Wijk) rendered to SVG.
 * Renders two levels below the current zoom root; clicking a group with
 * children zooms in, clicking a leaf selects it.
 */
(function (global) {
    'use strict';

    function squarify(items, x, y, w, h) {
        // items: [{ value, ... }] sorted descending. Returns [{ item, x, y, w, h }].
        var placed = [];
        var total = 0;
        items.forEach(function (it) { total += it.value; });
        if (total <= 0 || w <= 0 || h <= 0) return placed;
        var scale = (w * h) / total;

        var i = 0;
        while (i < items.length) {
            var side = Math.min(w, h);
            var row = [];
            var rowSum = 0;
            var rowMin = Infinity;
            var rowMax = 0;
            var worst = Infinity;

            while (i < items.length) {
                var area = items[i].value * scale;
                if (area <= 0) { i++; continue; }
                var nSum = rowSum + area;
                var nMin = Math.min(rowMin, area);
                var nMax = Math.max(rowMax, area);
                var nWorst = Math.max((side * side * nMax) / (nSum * nSum), (nSum * nSum) / (side * side * nMin));
                if (row.length && nWorst > worst) break;
                row.push({ item: items[i], area: area });
                rowSum = nSum; rowMin = nMin; rowMax = nMax; worst = nWorst;
                i++;
            }
            if (!row.length) break;

            var thickness = rowSum / side;
            var offset = 0;
            if (w >= h) {
                // vertical strip on the left
                row.forEach(function (r) {
                    var rh = r.area / thickness;
                    placed.push({ item: r.item, x: x, y: y + offset, w: thickness, h: rh });
                    offset += rh;
                });
                x += thickness; w -= thickness;
            } else {
                // horizontal strip on top
                row.forEach(function (r) {
                    var rw = r.area / thickness;
                    placed.push({ item: r.item, x: x + offset, y: y, w: rw, h: thickness });
                    offset += rw;
                });
                y += thickness; h -= thickness;
            }
        }
        return placed;
    }

    var SVG_NS = 'http://www.w3.org/2000/svg';

    function el(tag, attrs) {
        var node = document.createElementNS(SVG_NS, tag);
        for (var k in attrs) node.setAttribute(k, attrs[k]);
        return node;
    }

    function hashHue(str) {
        var h = 0;
        for (var i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
        return ((h % 360) + 360) % 360;
    }

    function Treemap(svg, callbacks) {
        this.svg = svg;
        this.cb = callbacks || {};
        this.highlightFn = null;
        this.root = null;
    }

    Treemap.prototype.setHighlight = function (fn) {
        this.highlightFn = fn;
        if (this.root) this.render(this.root);
    };

    Treemap.prototype.render = function (root) {
        this.root = root;
        var svg = this.svg;
        var self = this;
        while (svg.firstChild) svg.removeChild(svg.firstChild);

        var width = svg.clientWidth || svg.parentNode.clientWidth || 800;
        var height = parseInt(svg.getAttribute('data-height'), 10) || 520;
        svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);

        var children = root.children
            .filter(function (c) { return c.value > 0; })
            .slice()
            .sort(function (a, b) { return b.value - a.value; });
        if (!children.length) return;

        var GAP = 3;
        var rects = squarify(children, GAP, GAP, width - GAP * 2, height - GAP * 2);

        rects.forEach(function (r) {
            self.drawGroup(r.item, r.x, r.y, r.w, r.h, root);
        });
    };

    Treemap.prototype.colorFor = function (node) {
        var anchor = node;
        while (anchor.parent && anchor.parent !== this.root && anchor.parent.kind !== 'root') anchor = anchor.parent;
        var hue = hashHue(anchor.name);
        var dark = document.documentElement.classList.contains('dark');
        var dimmed = this.highlightFn && !this.highlightFn(node);
        var sat = node.dev ? 14 : 38;
        var lig = dark ? 36 : 66;
        if (dimmed) { sat = Math.min(sat, 8); lig = dark ? 24 : 84; }
        return 'hsl(' + hue + ', ' + sat + '%, ' + lig + '%)';
    };

    Treemap.prototype.drawGroup = function (node, x, y, w, h, parent) {
        var self = this;
        var svg = this.svg;
        var hasKids = node.children.some(function (c) { return c.value > 0; });
        var highlighted = this.highlightFn ? this.highlightFn(node) : false;
        var dimmed = this.highlightFn && !this.highlightFn(node) && !node.children.length;

        var g = el('g', { class: 'tm-group' + (hasKids ? ' tm-zoomable' : '') });

        var rect = el('rect', {
            x: x, y: y, width: Math.max(0.5, w - 1.5), height: Math.max(0.5, h - 1.5),
            rx: 4,
            class: 'tm-rect' + (highlighted ? ' tm-hl' : '') + (dimmed ? ' tm-dim' : ''),
            fill: this.colorFor(node),
        });
        g.appendChild(rect);

        var HEADER = 18;
        var showHeader = h > 36 && w > 52;
        if (showHeader) {
            var label = node.name + (node.version ? ' ' + node.version : '');
            var t = el('text', { x: x + 6, y: y + 13, class: 'tm-label' });
            t.appendChild(document.createTextNode(this.truncate(label, w - 12)));
            g.appendChild(t);
        }

        // second level
        if (hasKids && w > 64 && h > HEADER + 30) {
            var innerX = x + 4;
            var innerY = y + (showHeader ? HEADER + 2 : 4);
            var innerW = w - 9;
            var innerH = h - (showHeader ? HEADER + 7 : 9);
            var kids = node.children
                .filter(function (c) { return c.value > 0; })
                .slice()
                .sort(function (a, b) { return b.value - a.value; });
            var sub = squarify(kids, innerX, innerY, innerW, innerH);
            sub.forEach(function (s) {
                if (s.w < 2 || s.h < 2) return;
                var hl = self.highlightFn ? self.highlightFn(s.item) : false;
                var dim = self.highlightFn && !hl;
                var sr = el('rect', {
                    x: s.x, y: s.y, width: Math.max(0.5, s.w - 1.2), height: Math.max(0.5, s.h - 1.2),
                    rx: 2.5,
                    class: 'tm-rect tm-sub' + (hl ? ' tm-hl' : '') + (dim ? ' tm-dim' : ''),
                    fill: self.colorFor(s.item),
                });
                sr.__node = s.item;
                g.appendChild(sr);
                if (s.w > 46 && s.h > 16) {
                    var st = el('text', { x: s.x + 4, y: s.y + 11.5, class: 'tm-label tm-sublabel' });
                    st.appendChild(document.createTextNode(self.truncate(s.item.name, s.w - 8)));
                    st.setAttribute('pointer-events', 'none');
                    g.appendChild(st);
                }
            });
        }

        g.addEventListener('click', function (ev) {
            ev.stopPropagation();
            // Clicking anywhere in a group with children zooms into that group,
            // so the user descends one level at a time; leaves get selected.
            if (hasKids && self.cb.onZoom) self.cb.onZoom(node);
            else if (self.cb.onSelect) self.cb.onSelect(ev.target.__node || node);
        });
        g.addEventListener('mousemove', function (ev) {
            var target = ev.target.__node || node;
            if (self.cb.onHover) self.cb.onHover(target, ev);
        });
        g.addEventListener('mouseleave', function () {
            if (self.cb.onHover) self.cb.onHover(null);
        });

        svg.appendChild(g);
    };

    Treemap.prototype.truncate = function (text, maxPx) {
        var maxChars = Math.floor(maxPx / 6.2);
        if (text.length <= maxChars) return text;
        if (maxChars < 4) return '';
        return text.slice(0, maxChars - 1) + '…';
    };

    var api = { Treemap: Treemap, squarify: squarify };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else global.BloatTreemap = api;
})(typeof window !== 'undefined' ? window : globalThis);
