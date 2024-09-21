import isProduction from './prod.js';
import path from "path";
import fs from "fs";

let __dirname;
export function setDirname(newDirname) {
    __dirname = newDirname;
}

export default function useHTMLPage(name, templateCb, reqCb) {
    templateCb = templateCb ?? function(page) { return page; }
    reqCb = reqCb ?? function() {};
    function getPage() {
        let page = fs.readFileSync(path.join(__dirname, `/dist/src/pages/${name}.html`), 'utf8');
        page = templateCb(page, isProduction);
        return page;
    }
    let cached = getPage();
    return (req, res, next) => {
        if (!reqCb(req, res, next)) {
            res.status(200).setHeader('Content-Type', 'text/html').end(isProduction ? cached : getPage());
        }
    }
}