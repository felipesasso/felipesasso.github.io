/*
 * Parsers for the Dependency Bloat Visualizer.
 *
 * Every parser normalises its input into the same tree shape:
 *   { name, version, self, children, dev, deduped, kind }
 * where `self` is the node's own weight (1 per package for lockfiles,
 * bytes for bundler stats) and `kind` is 'root' | 'pkg' | 'dir' | 'file'.
 *
 * Lockfiles produce a *logical* dependency tree with npm-style dedupe:
 * the first occurrence of a physical package expands its dependencies,
 * later occurrences become leaves flagged `deduped` so the tree stays
 * the same size as the installed node_modules.
 */
(function (global) {
    'use strict';

    function makeNode(name, opts) {
        opts = opts || {};
        return {
            name: name,
            version: opts.version || null,
            self: opts.self || 0,
            children: [],
            dev: !!opts.dev,
            deduped: !!opts.deduped,
            kind: opts.kind || 'pkg',
        };
    }

    /* ------------------------------------------------------------------ *
     * package-lock.json v2 / v3 (and v1 via conversion)
     * ------------------------------------------------------------------ */

    function resolveNpmPath(packages, fromPath, name) {
        var base = fromPath;
        for (;;) {
            var candidate = base ? base + '/node_modules/' + name : 'node_modules/' + name;
            if (packages[candidate]) return candidate;
            if (!base) return null;
            var idx = base.lastIndexOf('/node_modules/');
            base = idx === -1 ? '' : base.slice(0, idx);
        }
    }

    function parseNpmLockModern(lock) {
        var packages = lock.packages || {};
        var rootEntry = packages[''] || {};
        var seen = new Set(['']);

        function entryDeps(entry) {
            var deps = {};
            Object.assign(deps, entry.dependencies || {}, entry.optionalDependencies || {});
            return deps;
        }

        function build(path, displayName, devInherited) {
            var entry = packages[path];
            // Workspace links: node_modules/foo -> { link: true, resolved: 'packages/foo' }
            if (entry && entry.link && entry.resolved && packages[entry.resolved]) {
                path = entry.resolved;
                entry = packages[path];
            }
            var dev = !!(entry && entry.dev) || devInherited;
            if (seen.has(path)) {
                return makeNode(displayName, { version: entry.version, dev: dev, deduped: true });
            }
            seen.add(path);
            var node = makeNode(displayName, { version: entry.version, dev: dev, self: 1 });
            Object.keys(entryDeps(entry)).sort().forEach(function (depName) {
                var depPath = resolveNpmPath(packages, path, depName);
                if (depPath) node.children.push(build(depPath, depName, dev));
            });
            return node;
        }

        var rootName = rootEntry.name || lock.name || 'project';
        var root = makeNode(rootName, { version: rootEntry.version || lock.version, kind: 'root' });

        var prod = Object.keys(rootEntry.dependencies || {});
        var dev = Object.keys(rootEntry.devDependencies || {});
        var optional = Object.keys(rootEntry.optionalDependencies || {});

        prod.concat(optional).sort().forEach(function (name) {
            var p = resolveNpmPath(packages, '', name);
            if (p) root.children.push(build(p, name, false));
        });
        dev.sort().forEach(function (name) {
            var p = resolveNpmPath(packages, '', name);
            if (p) root.children.push(build(p, name, true));
        });

        // Workspaces not already reached via root deps.
        Object.keys(packages).forEach(function (key) {
            if (key && key.indexOf('node_modules') === -1 && !seen.has(key)) {
                root.children.push(build(key, packages[key].name || key, false));
            }
        });

        return { root: root, meta: { source: 'package-lock.json (v' + (lock.lockfileVersion || 2) + ')', sizeIsBytes: false, canFetchSizes: true } };
    }

    function v1ToModern(lock) {
        var packages = { '': { name: lock.name, version: lock.version, dependencies: {}, devDependencies: {} } };

        (function walk(deps, basePath) {
            Object.keys(deps || {}).forEach(function (name) {
                var info = deps[name];
                var p = basePath + 'node_modules/' + name;
                packages[p] = { version: info.version, dev: info.dev, dependencies: info.requires || {} };
                walk(info.dependencies, p + '/');
            });
        })(lock.dependencies, '');

        // v1 doesn't record the project's direct dependencies, so treat every
        // top-level package that nothing else requires as a direct dependency.
        var referenced = new Set();
        Object.keys(packages).forEach(function (path) {
            if (!path) return;
            Object.keys(packages[path].dependencies).forEach(function (depName) {
                var target = resolveNpmPath(packages, path, depName);
                if (target) referenced.add(target);
            });
        });
        Object.keys(lock.dependencies || {}).forEach(function (name) {
            if (referenced.has('node_modules/' + name)) return;
            if (packages['node_modules/' + name].dev) packages[''].devDependencies[name] = '*';
            else packages[''].dependencies[name] = '*';
        });

        return { name: lock.name, version: lock.version, lockfileVersion: 1, packages: packages };
    }

    /* ------------------------------------------------------------------ *
     * yarn.lock — classic (v1) and Berry (v2+)
     * ------------------------------------------------------------------ */

    function unquote(s) {
        s = s.trim();
        if (s.length > 1 && (s[0] === '"' || s[0] === "'") && s[s.length - 1] === s[0]) return s.slice(1, -1);
        return s;
    }

    function splitDescriptors(header) {
        var parts = [];
        var cur = '';
        var inQuote = false;
        for (var i = 0; i < header.length; i++) {
            var ch = header[i];
            if (ch === '"') inQuote = !inQuote;
            if (ch === ',' && !inQuote) {
                parts.push(cur);
                cur = '';
            } else cur += ch;
        }
        if (cur.trim()) parts.push(cur);
        return parts.map(unquote);
    }

    function descriptorName(descriptor) {
        var idx = descriptor.lastIndexOf('@');
        if (idx <= 0) return descriptor;
        return descriptor.slice(0, idx);
    }

    function parseYarnLock(text) {
        var entries = [];
        var cur = null;
        var inDeps = false;

        text.split(/\r?\n/).forEach(function (raw) {
            if (!raw.trim() || raw.trim().charAt(0) === '#') return;
            var indent = raw.match(/^ */)[0].length;
            var line = raw.trim();

            if (indent === 0 && line.slice(-1) === ':') {
                cur = { descriptors: splitDescriptors(line.slice(0, -1)), version: null, deps: {} };
                entries.push(cur);
                inDeps = false;
                return;
            }
            if (!cur) return;

            if (indent === 2) {
                if (line === 'dependencies:' || line === 'optionalDependencies:') {
                    inDeps = true;
                    return;
                }
                inDeps = false;
                var vm = line.match(/^version:?\s+"?([^"\s]+)"?\s*$/);
                if (vm) cur.version = vm[1];
                return;
            }
            if (indent >= 4 && inDeps) {
                // classic:  "@babel/types" "^7.0.0"   |  berry:  "@babel/types": "npm:^7.0.0"
                var dm = line.match(/^("(?:[^"]+)"|[^\s:]+):?\s+("(?:[^"]+)"|\S+)\s*$/);
                if (dm) cur.deps[unquote(dm[1])] = unquote(dm[2]);
            }
        });

        entries = entries.filter(function (e) {
            return e.version && e.descriptors[0] !== '__metadata';
        });

        // descriptor lookup: "name@range" -> entry, with the Berry "npm:" protocol
        // stripped so classic-style references resolve too.
        var byDescriptor = new Map();
        entries.forEach(function (e) {
            e.descriptors.forEach(function (d) {
                byDescriptor.set(d, e);
                byDescriptor.set(d.replace(/@npm:/, '@'), e);
            });
        });

        function resolveDep(name, range) {
            range = range.replace(/^npm:/, '');
            return byDescriptor.get(name + '@' + range) || byDescriptor.get(name + '@npm:' + range) || null;
        }

        // Find root(s): a Berry "workspace:." entry if present, otherwise every
        // entry that no other entry depends on (yarn.lock doesn't list direct deps).
        var workspaceRoot = null;
        entries.forEach(function (e) {
            if (e.descriptors.some(function (d) { return /@workspace:\.$/.test(d); })) workspaceRoot = e;
        });

        var referenced = new Set();
        entries.forEach(function (e) {
            Object.keys(e.deps).forEach(function (name) {
                var t = resolveDep(name, e.deps[name]);
                if (t) referenced.add(t);
            });
        });

        var seen = new Set();
        function build(entry, displayName) {
            if (seen.has(entry)) return makeNode(displayName, { version: entry.version, deduped: true });
            seen.add(entry);
            var node = makeNode(displayName, { version: entry.version, self: 1 });
            Object.keys(entry.deps).sort().forEach(function (name) {
                var target = resolveDep(name, entry.deps[name]);
                if (target) node.children.push(build(target, name));
            });
            return node;
        }

        var root;
        if (workspaceRoot) {
            seen.add(workspaceRoot);
            root = makeNode(descriptorName(workspaceRoot.descriptors[0]), { version: workspaceRoot.version, kind: 'root' });
            Object.keys(workspaceRoot.deps).sort().forEach(function (name) {
                var target = resolveDep(name, workspaceRoot.deps[name]);
                if (target) root.children.push(build(target, name));
            });
        } else {
            root = makeNode('project', { kind: 'root' });
            entries.forEach(function (e) {
                if (!referenced.has(e) && !seen.has(e)) {
                    root.children.push(build(e, descriptorName(e.descriptors[0])));
                }
            });
        }
        // Catch anything unreachable (dependency cycles among non-roots).
        entries.forEach(function (e) {
            if (!seen.has(e)) root.children.push(build(e, descriptorName(e.descriptors[0])));
        });

        return { root: root, meta: { source: 'yarn.lock', sizeIsBytes: false, canFetchSizes: true } };
    }

    /* ------------------------------------------------------------------ *
     * Bundler outputs: webpack stats, esbuild metafile, rollup/vite visualizer
     * ------------------------------------------------------------------ */

    function normalizeModulePath(name) {
        // strip loaders ("babel-loader!./src/x.js") and leading ./ ../
        var bang = name.lastIndexOf('!');
        if (bang !== -1) name = name.slice(bang + 1);
        return name.replace(/^(\.\/|\.\.\/)+/, '');
    }

    function addPath(root, path, size) {
        var parts = path.split('/').filter(Boolean);
        var node = root;
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            var kind = 'dir';
            // Fold "node_modules/<pkg>" (or scoped "<@scope>/<pkg>") into one package node.
            if (part === 'node_modules' && i + 1 < parts.length) {
                var dirNode = childNamed(node, 'node_modules', 'dir');
                var pkgName = parts[i + 1];
                i++;
                if (pkgName.charAt(0) === '@' && i + 1 < parts.length) {
                    pkgName += '/' + parts[i + 1];
                    i++;
                }
                node = childNamed(dirNode, pkgName, 'pkg');
                continue;
            }
            if (i === parts.length - 1) kind = 'file';
            node = childNamed(node, part, kind);
        }
        node.self += size;
        if (node.children.length) node.kind = 'dir';
    }

    function childNamed(node, name, kind) {
        for (var i = 0; i < node.children.length; i++) {
            if (node.children[i].name === name) return node.children[i];
        }
        var child = makeNode(name, { kind: kind });
        node.children.push(child);
        return child;
    }

    function collapseChains(node) {
        node.children.forEach(collapseChains);
        while (node.children.length === 1 && node.kind === 'dir' && node.children[0].kind === 'dir' && node.self === 0) {
            var only = node.children[0];
            node.name += '/' + only.name;
            node.self = only.self;
            node.children = only.children;
        }
    }

    function parseWebpackStats(json) {
        var modules = json.modules;
        if ((!modules || !modules.length) && Array.isArray(json.children)) {
            modules = [];
            json.children.forEach(function (c) {
                if (Array.isArray(c.modules)) modules = modules.concat(c.modules);
            });
        }
        if (!modules || !modules.length) throw new Error('No "modules" array found in this stats file. Re-run webpack with `--json` or `stats: { modules: true }`.');

        var root = makeNode('bundle', { kind: 'root' });
        function addModule(m) {
            // Concatenated modules carry their parts in a nested `modules` array.
            if (Array.isArray(m.modules) && m.modules.length) {
                m.modules.forEach(addModule);
                return;
            }
            var name = m.name || m.identifier;
            if (!name || typeof m.size !== 'number') return;
            addPath(root, normalizeModulePath(name), Math.max(0, m.size));
        }
        modules.forEach(addModule);
        collapseChains(root);
        return { root: root, meta: { source: 'webpack stats.json', sizeIsBytes: true, canFetchSizes: false } };
    }

    function parseEsbuildMeta(json) {
        var root = makeNode('bundle', { kind: 'root' });
        Object.keys(json.inputs).forEach(function (path) {
            addPath(root, normalizeModulePath(path), json.inputs[path].bytes || 0);
        });
        collapseChains(root);
        return { root: root, meta: { source: 'esbuild metafile', sizeIsBytes: true, canFetchSizes: false } };
    }

    function parseVisualizer(json) {
        var parts = json.nodeParts || {};
        function conv(n) {
            var hasChildren = Array.isArray(n.children) && n.children.length;
            var node = makeNode(n.name, { kind: hasChildren ? 'dir' : 'file' });
            if (hasChildren) {
                node.children = n.children.map(conv);
            } else if (n.uid && parts[n.uid]) {
                node.self = parts[n.uid].renderedLength || parts[n.uid].gzipLength || 0;
            }
            return node;
        }
        var root = conv(json.tree);
        root.kind = 'root';
        markPackages(root);
        collapseChains(root);
        return { root: root, meta: { source: 'rollup/vite visualizer stats', sizeIsBytes: true, canFetchSizes: false } };
    }

    // Rewrites children of any "node_modules" directory node into package nodes,
    // merging scoped "@scope" directories with the package below them.
    function markPackages(node) {
        if (node.name === 'node_modules') {
            var rewritten = [];
            node.children.forEach(function (child) {
                if (child.name.charAt(0) === '@' && child.children.length) {
                    child.children.forEach(function (g) {
                        g.name = child.name + '/' + g.name;
                        g.kind = 'pkg';
                        rewritten.push(g);
                    });
                } else {
                    child.kind = 'pkg';
                    rewritten.push(child);
                }
            });
            node.children = rewritten;
        }
        node.children.forEach(markPackages);
    }

    /* ------------------------------------------------------------------ *
     * Detection + entry point
     * ------------------------------------------------------------------ */

    function parse(filename, text) {
        var trimmed = text.trim();

        if (trimmed.charAt(0) === '{') {
            var json;
            try {
                json = JSON.parse(trimmed);
            } catch (e) {
                throw new Error('This looks like JSON but failed to parse: ' + e.message);
            }
            if (json.lockfileVersion >= 2 && json.packages) return parseNpmLockModern(json);
            if (json.lockfileVersion === 1 || (json.dependencies && json.requires !== undefined && !json.packages)) {
                return parseNpmLockModern(v1ToModern(json));
            }
            if (json.packages && (json.name || json.lockfileVersion)) return parseNpmLockModern(json);
            if (json.tree && json.nodeParts) return parseVisualizer(json);
            if (json.inputs && json.outputs) return parseEsbuildMeta(json);
            if (Array.isArray(json.modules) || (Array.isArray(json.children) && json.children.some(function (c) { return Array.isArray(c.modules); }))) {
                return parseWebpackStats(json);
            }
            if (json.dependencies && json.devDependencies !== undefined && !json.lockfileVersion) {
                throw new Error('This looks like a package.json — it only lists direct dependencies. Drop a package-lock.json or yarn.lock instead.');
            }
            throw new Error('Unrecognised JSON. Supported: package-lock.json, webpack stats.json, esbuild metafile, rollup/vite visualizer JSON.');
        }

        if (/yarn lockfile v1/.test(trimmed) || /__metadata:/.test(trimmed) || /\.ya?ml$/i.test(filename) === false && /^"?[^\s"]+@.+:\s*$/m.test(trimmed)) {
            if (/^lockfileVersion:/m.test(trimmed)) {
                throw new Error('pnpm-lock.yaml is not supported yet. Try package-lock.json, yarn.lock, or a bundler stats file.');
            }
            return parseYarnLock(trimmed);
        }
        if (/^lockfileVersion:/m.test(trimmed)) {
            throw new Error('pnpm-lock.yaml is not supported yet. Try package-lock.json, yarn.lock, or a bundler stats file.');
        }
        throw new Error('Unrecognised file format. Supported: package-lock.json, yarn.lock, webpack stats.json, esbuild metafile, rollup/vite visualizer JSON.');
    }

    var api = { parse: parse, makeNode: makeNode };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else global.BloatParsers = api;
})(typeof window !== 'undefined' ? window : globalThis);
