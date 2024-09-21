import useHTMLPage from "../js/routing/page.js";

export default useHTMLPage('index', (page, isProduction) => {
    if (!isProduction) {
        return page.replace('<!-- poll-script -->', '<script src="/poll"></script>')
    }
    return page;
});