/**
 * Tiny UML-ish class diagram renderer.
 *
 * Takes a plain description of classes and their relationships and draws an
 * SVG diagram with boxes (name + members) and arrows (inheritance,
 * realization, composition, aggregation, dependency/association).
 *
 * Diagram shape:
 *   {
 *     classes: [{ id, name, type?: 'interface'|'abstract', members?: string[] }],
 *     relations: [{ from, to, type, label? }],
 *     layout: [[id, ...], [id, ...], ...]   // rows, top to bottom
 *   }
 */
(function (global) {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const FONT = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';
    const PADDING = 14;
    const LINE_H = 18;
    const STEREOTYPE_H = 16;
    const COL_GAP = 40;
    const ROW_GAP = 56;

    function el(tag, attrs) {
        const e = document.createElementNS(SVG_NS, tag);
        Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v));
        return e;
    }

    function textWidth(svg, text, opts) {
        opts = opts || {};
        const size = opts.size || 12;
        const t = el('text', {
            'font-size': size,
            'font-family': FONT,
            'font-weight': opts.weight || '400',
            'font-style': opts.style || 'normal',
            opacity: '0',
        });
        t.textContent = text;
        svg.appendChild(t);
        // getComputedTextLength requires real layout, which isn't available in
        // every environment (e.g. headless DOMs) — fall back to a monospace estimate.
        let w;
        try {
            w = t.getComputedTextLength();
        } catch (e) {
            w = 0;
        }
        svg.removeChild(t);
        if (!w) w = text.length * size * 0.6;
        return w;
    }

    function buildBox(svg, cls) {
        const lines = [];
        if (cls.type === 'interface') lines.push({ text: '«interface»', size: 10, style: 'italic', italic: true });
        if (cls.type === 'abstract') lines.push({ text: '«abstract»', size: 10, style: 'italic', italic: true });
        lines.push({ text: cls.name, size: 13, weight: '700', style: cls.type === 'abstract' ? 'italic' : 'normal' });

        const members = cls.members || [];

        let maxW = 0;
        lines.forEach((l) => {
            maxW = Math.max(maxW, textWidth(svg, l.text, l));
        });
        members.forEach((m) => {
            maxW = Math.max(maxW, textWidth(svg, m, { size: 11.5 }));
        });

        const width = Math.max(150, Math.ceil(maxW) + PADDING * 2);
        const headerH = Math.max(34, lines.length * STEREOTYPE_H + 12);
        const bodyH = members.length ? members.length * LINE_H + 10 : 0;

        return Object.assign({}, cls, { lines, members, width, headerH, height: headerH + bodyH });
    }

    function selfLoopGeometry(svg, box, rel) {
        const x = box.x + box.width;
        let loopX = x + 48;
        if (rel.label) {
            const labelW = textWidth(svg, rel.label, { size: 10.5 }) + 10;
            loopX = Math.max(loopX, x + labelW / 2 + 8);
        }
        return { x, loopX, labelX: loopX + 4 };
    }

    function layoutDiagram(svg, diagram) {
        const boxes = {};
        diagram.classes.forEach((c) => { boxes[c.id] = buildBox(svg, c); });

        const relations = diagram.relations || [];
        function adjacentLabelGap(idA, idB) {
            let gap = COL_GAP;
            relations.forEach((rel) => {
                if (rel.from === rel.to || !rel.label) return;
                const connects = (rel.from === idA && rel.to === idB) || (rel.from === idB && rel.to === idA);
                if (!connects) return;
                const labelW = textWidth(svg, rel.label, { size: 10.5 }) + 10;
                gap = Math.max(gap, labelW + 28);
            });
            return gap;
        }

        const rows = diagram.layout || [diagram.classes.map((c) => c.id)];
        const rowGaps = rows.map((row) => row.slice(1).map((id, i) => adjacentLabelGap(row[i], id)));
        const rowWidths = rows.map((row, ri) => {
            let w = 0;
            row.forEach((id, i) => {
                w += boxes[id].width;
                if (i > 0) w += rowGaps[ri][i - 1];
            });
            return w;
        });
        const maxRowWidth = Math.max(...rowWidths, 0);

        let y = PADDING;
        rows.forEach((row, rowIdx) => {
            const rowMaxH = Math.max(...row.map((id) => boxes[id].height));
            let x = PADDING + (maxRowWidth - rowWidths[rowIdx]) / 2;
            row.forEach((id, i) => {
                const b = boxes[id];
                b.x = x;
                b.y = y + (rowMaxH - b.height) / 2;
                x += b.width + (rowGaps[rowIdx][i] || 0);
            });
            y += rowMaxH + ROW_GAP;
        });

        let width = maxRowWidth + PADDING * 2;
        (diagram.relations || []).forEach((rel) => {
            if (rel.from !== rel.to) return;
            const box = boxes[rel.from];
            const { labelX } = selfLoopGeometry(svg, box, rel);
            let extent = labelX;
            if (rel.label) {
                extent += (textWidth(svg, rel.label, { size: 10.5 }) + 10) / 2;
            }
            width = Math.max(width, extent + PADDING);
        });

        return { boxes, width, height: y - ROW_GAP + PADDING };
    }

    function addDefs(svg) {
        const defs = el('defs');

        const arrowOpen = el('marker', {
            id: 'cd-arrow-open', viewBox: '0 0 10 10', refX: '8', refY: '5',
            markerWidth: '8', markerHeight: '8', orient: 'auto-start-reverse',
        });
        arrowOpen.appendChild(el('path', { d: 'M 0 0 L 9 5 L 0 10', fill: 'none', stroke: 'var(--text-secondary)', 'stroke-width': '1.5' }));
        defs.appendChild(arrowOpen);

        const arrowHollow = el('marker', {
            id: 'cd-arrow-hollow', viewBox: '0 0 14 12', refX: '12', refY: '6',
            markerWidth: '14', markerHeight: '12', orient: 'auto-start-reverse',
        });
        arrowHollow.appendChild(el('path', { d: 'M 0 0 L 13 6 L 0 12 Z', fill: 'var(--secondary-bg)', stroke: 'var(--text-secondary)', 'stroke-width': '1.2' }));
        defs.appendChild(arrowHollow);

        const diamondFilled = el('marker', {
            id: 'cd-diamond-filled', viewBox: '0 0 16 10', refX: '0', refY: '5',
            markerWidth: '15', markerHeight: '10', orient: 'auto-start-reverse',
        });
        diamondFilled.appendChild(el('path', { d: 'M 0 5 L 8 0 L 16 5 L 8 10 Z', fill: 'var(--text-secondary)', stroke: 'var(--text-secondary)' }));
        defs.appendChild(diamondFilled);

        const diamondHollow = el('marker', {
            id: 'cd-diamond-hollow', viewBox: '0 0 16 10', refX: '0', refY: '5',
            markerWidth: '15', markerHeight: '10', orient: 'auto-start-reverse',
        });
        diamondHollow.appendChild(el('path', { d: 'M 0 5 L 8 0 L 16 5 L 8 10 Z', fill: 'var(--secondary-bg)', stroke: 'var(--text-secondary)', 'stroke-width': '1.2' }));
        defs.appendChild(diamondHollow);

        svg.appendChild(defs);
    }

    function rectEdgePoint(box, towardX, towardY) {
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        const dx = towardX - cx;
        const dy = towardY - cy;
        if (dx === 0 && dy === 0) return { x: cx, y: cy };
        const halfW = box.width / 2;
        const halfH = box.height / 2;
        const scaleX = dx !== 0 ? halfW / Math.abs(dx) : Infinity;
        const scaleY = dy !== 0 ? halfH / Math.abs(dy) : Infinity;
        const scale = Math.min(scaleX, scaleY);
        return { x: cx + dx * scale, y: cy + dy * scale };
    }

    const MARKER_END = {
        inheritance: 'cd-arrow-hollow',
        realization: 'cd-arrow-hollow',
        dependency: 'cd-arrow-open',
        association: 'cd-arrow-open',
    };

    const MARKER_START = {
        composition: 'cd-diamond-filled',
        aggregation: 'cd-diamond-hollow',
    };

    function drawRelation(svg, layout, rel) {
        const fromBox = layout.boxes[rel.from];
        const toBox = layout.boxes[rel.to];
        let d, labelX, labelY;

        if (rel.from === rel.to) {
            const { x, loopX, labelX: lx } = selfLoopGeometry(svg, fromBox, rel);
            const y1 = fromBox.y + fromBox.height * 0.32;
            const y2 = fromBox.y + fromBox.height * 0.68;
            d = `M ${x} ${y1} C ${loopX} ${y1}, ${loopX} ${y2}, ${x} ${y2}`;
            labelX = lx;
            labelY = (y1 + y2) / 2;
        } else {
            const fromCenter = { x: fromBox.x + fromBox.width / 2, y: fromBox.y + fromBox.height / 2 };
            const toCenter = { x: toBox.x + toBox.width / 2, y: toBox.y + toBox.height / 2 };
            const p1 = rectEdgePoint(fromBox, toCenter.x, toCenter.y);
            const p2 = rectEdgePoint(toBox, fromCenter.x, fromCenter.y);
            d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
            labelX = (p1.x + p2.x) / 2;
            labelY = (p1.y + p2.y) / 2;
        }

        const path = el('path', {
            d,
            fill: 'none',
            stroke: 'var(--text-secondary)',
            'stroke-width': '1.4',
        });
        if (rel.type === 'realization' || rel.type === 'dependency') {
            path.setAttribute('stroke-dasharray', '5 4');
        }
        if (MARKER_END[rel.type]) path.setAttribute('marker-end', `url(#${MARKER_END[rel.type]})`);
        if (MARKER_START[rel.type]) path.setAttribute('marker-start', `url(#${MARKER_START[rel.type]})`);
        svg.appendChild(path);

        if (rel.label) {
            const labelW = textWidth(svg, rel.label, { size: 10.5 }) + 10;
            svg.appendChild(el('rect', {
                x: labelX - labelW / 2, y: labelY - 9, width: labelW, height: 16,
                fill: 'var(--secondary-bg)',
            }));
            const text = el('text', {
                x: labelX, y: labelY + 3,
                'text-anchor': 'middle',
                'font-size': 10.5,
                'font-family': FONT,
                fill: 'var(--text-secondary)',
            });
            text.textContent = rel.label;
            svg.appendChild(text);
        }
    }

    function drawBox(svg, box) {
        svg.appendChild(el('rect', {
            x: box.x, y: box.y, width: box.width, height: box.height,
            rx: 7,
            fill: 'var(--secondary-bg)',
            stroke: 'var(--border)',
            'stroke-width': '1.2',
        }));

        let ty = box.y + 16;
        box.lines.forEach((l) => {
            const t = el('text', {
                x: box.x + box.width / 2, y: ty,
                'text-anchor': 'middle',
                'font-size': l.size,
                'font-weight': l.weight || '400',
                'font-style': l.style || 'normal',
                fill: l.italic ? 'var(--text-secondary)' : 'var(--text-primary)',
                'font-family': FONT,
            });
            t.textContent = l.text;
            svg.appendChild(t);
            ty += STEREOTYPE_H;
        });

        if (box.members.length) {
            svg.appendChild(el('line', {
                x1: box.x, x2: box.x + box.width,
                y1: box.y + box.headerH, y2: box.y + box.headerH,
                stroke: 'var(--border)', 'stroke-width': '1',
            }));

            let my = box.y + box.headerH + 14;
            box.members.forEach((m) => {
                const t = el('text', {
                    x: box.x + 10, y: my,
                    'font-size': 11.5,
                    fill: 'var(--text-secondary)',
                    'font-family': FONT,
                });
                t.textContent = m;
                svg.appendChild(t);
                my += LINE_H;
            });
        }
    }

    function renderClassDiagram(container, diagram) {
        container.innerHTML = '';
        const svg = el('svg', { xmlns: SVG_NS });
        addDefs(svg);
        container.appendChild(svg);

        const layout = layoutDiagram(svg, diagram);

        (diagram.relations || []).forEach((rel) => drawRelation(svg, layout, rel));
        diagram.classes.forEach((c) => drawBox(svg, layout.boxes[c.id]));

        svg.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', String(Math.min(layout.height, 440)));
        svg.style.display = 'block';
        svg.style.maxWidth = '100%';
    }

    global.renderClassDiagram = renderClassDiagram;
})(window);
