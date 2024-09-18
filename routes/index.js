export default function(req, res, next, usePage) {
    res.sendFile(usePage('index'));
}