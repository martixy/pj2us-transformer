import path from 'path';

import Bro from 'brototype';
import fileURL from 'file-url';

export default function(content, target = null) {
    let json = JSON.parse(content);

    let meta = new userscriptMetadata();
    // Required fields
    meta.extend('name', Bro(json).iCanHaz('userscript.name'), json.name);
    if (!meta.name) this.callback(new Error('"name" property must be defined in package.json!'));
    meta.extend('version', Bro(json).iCanHaz('userscript.version'), json.version);
    if (!meta.version) this.callback(new Error('"version" property must be defined in package.json!'));
    // Optional fields
    meta.extend('description', Bro(json).iCanHaz('userscript.description'), json.description, '');
    meta.extend(
        'homepage',
        Bro(json).iCanHaz('userscript.homepage'),
        Bro(json).iCanHaz('userscript.homepageURL'),
        Bro(json).iCanHaz('userscript.website'),
        Bro(json).iCanHaz('userscript.source'),
        json.homepage
    );

    let author = Bro(json).iCanHaz('userscript.author');
    if (!author && json.author) {
        if (typeof json.author === 'string') author = json.author;
        if (typeof json.author === 'object') { //P.S. null is an object too, but we already checked for that.
            author = json.author.name;
            if (json.author.email) author += ` <${json.author.email}>`
            if (json.author.url) author += ` <${json.author.url}>`
        }
    }
    meta.extend('author', author);

    let supportURL = Bro(json).iCanHaz('userscript.supportURL');
    if (!supportURL && json.bugs) {
        if (typeof json.bugs === 'string') supportURL = json.bugs;
        if (typeof json.bugs === 'object' && json.bugs.url) {
            supportURL = json.bugs.url;
        }
    }
    meta.extend('supportURL', supportURL);

    // Catch-all (this includes most of the functional parts, such as match and require)
    if (json.userscript) for (let [key, value] of Object.entries(json.userscript)) {
        meta.extend(key, value)
    }

    if (target) {
        if (!path.isAbsolute(target)) 
            throw new Error("pj2us: Target path must be absolute!");
        let entry = fileURL(target);
        if (meta.require) {
            if (Array.isArray(meta.require)) {
                meta.require.push(entry);
            } else {
                meta.require = [meta.require, entry];
            }
        } else {
            meta.require = entry;
        }
    }

    return meta.toString();
};

function userscriptMetadata() {}
userscriptMetadata.prototype.extend = function (prop, ...values) {
    for (let value of values) {
        if (typeof value !== 'undefined') {
            this[prop] = value;
            return;
        }
    }
};
userscriptMetadata.prototype.toString = function () {
    let result = `// ==UserScript==\n`;
    for (let [key, value] of Object.entries(this)) {
        key = key.padEnd(12, ' ');
        if (Array.isArray(value)) {
            for (let bit of value) {
                result += `// @${key} ${bit}\n`
            }
        } else {
            result += `// @${key} ${value}\n`
        }
    }
    result += `// ==/UserScript==`;
    return result;
};
userscriptMetadata.prototype.toArray = function () {
    let result = [`// ==UserScript==\n`];
    for (let [key, value] of Object.entries(this)) {
        key = key.padEnd(12, ' ');
        if (Array.isArray(value)) {
            for (let bit of value) {
                result.push(`// @${key} ${bit}\n`);
            }
        } else {
            result.push(`// @${key} ${value}\n`);
        }
    }
    result.push(`// ==/UserScript==`);
    return result;
}
