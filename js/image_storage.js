import concat from 'concat-stream';
import crypto from 'crypto';
import fs from 'fs';
import { mkdirp } from 'mkdirp';
import os from 'os';
import path from 'path';

function arrayStartsWith(arr, elements) {
    if (!arr || !arr.length || arr.length < elements.length) {
        return false;
    }
    for (let i = 0; i < elements.length; i++) {
        if (arr[i] !== elements[i]) {
            return false;
        }
    }
    return true;
}

export const ImageFormat = Object.freeze({
    JPG:  Symbol('JPG'),
    PNG:  Symbol('PNG'),
    GIF:  Symbol('GIF'),
    WEBP: Symbol('WEBP'),
});

const ImageFormatMeta = Object.freeze({
    [ImageFormat.JPG]: {
        mimeTypes: ['image/jpg', 'image/jpeg'],
        extensions: ['jpg', 'jpeg'],
        signature: [255, 216, 255, 224],
    },
    [ImageFormat.PNG]: {
        mimeTypes: ['image/png'],
        extensions: ['png'],
        signature: [137, 80, 78, 71],
    },
    [ImageFormat.GIF]: {
        mimeTypes: ['image/gif'],
        extensions: ['gif'],
        signature: [71, 73, 70, 56],
    },
    [ImageFormat.WEBP]: {
        mimeTypes: ['image/webp'],
        extensions: ['webp'],
        signature: [82, 73, 70, 70],
    },
});

export class UnsupportedFileFormat extends Error {
    constructor(msg) {
        super(msg);
        this.msg = msg;
    }
}

function getFilename(req, file, cb) {
    crypto.randomBytes(16, function (err, raw) {
        cb(err, err ? undefined : raw.toString('hex'))
    });
}

function getDestination(req, file, cb) {
    cb(null, os.tmpdir())
}

function ImageStorage(opts) {
    this.getFilename = (opts?.filename || getFilename);
    this.supportedImageFormats = opts?.supportedImageFormats || [ ImageFormat.JPG, ImageFormat.PNG, ImageFormat.GIF, ImageFormat.WEBP ];
    if (typeof opts?.destination === 'string') {
        mkdirp.sync(opts?.destination);
        this.destination = function ($0, $1, cb) {
            cb(null, opts?.destination);
        }
    } else {
        this.destination = (opts?.destination || getDestination);
    }
}

ImageStorage.prototype._handleFile = function _handleFile(req, file, cb) {
    let imageFormat, formatMeta;
    for (let i = 0; i < this.supportedImageFormats.length; i++) {
        const format = this.supportedImageFormats[i];
        formatMeta = ImageFormatMeta[format];
        if (!formatMeta) return cb(new UnsupportedFileFormat(`unsupported meta: mimetype='${file.mimetype}'`));
        if (formatMeta.mimeTypes.includes(file.mimetype)) {
            const ext = file.originalname.substring(file.originalname.lastIndexOf('.') + 1);
            if (!formatMeta.extensions.includes(ext)) {
                return cb(new UnsupportedFileFormat('unexpected extension: ' + ext));
            }
            imageFormat = format;
            break;
        }
        if (i === this.supportedImageFormats.length - 1) {
            return cb(new UnsupportedFileFormat('unexpected mimetype: ' + file.mimetype));
        }
    }
    const that = this;
    that.destination(req, file, function(err, destination) {
        if (err) return cb(err);
        that.getFilename(req, file, function(err, filename) {
            if (err) return cb(err);
            file.stream.pipe(concat({ encoding: 'buffer' }, function(buffer) {
                if (formatMeta.signature) {
                    let validSignature;
                    if (formatMeta.signature instanceof Array) {
                        validSignature = arrayStartsWith(buffer, formatMeta.signature);
                    } else {
                        validSignature = formatMeta.signature(buffer);
                    }
                    if (!validSignature) {
                        return cb(new UnsupportedFileFormat(`unexpected signature: mimetype='${file.mimetype}'`));
                    }
                    filename += '.' + formatMeta.extensions[0];
                    const finalPath = path.join(destination, filename);
                    fs.writeFile(finalPath, buffer, () => {
                        cb(null, {
                           destination: destination,
                           filename: filename,
                           path: finalPath,
                           size: Buffer.byteLength(buffer),
                        });
                    });
                } else {
                    return cb(new UnsupportedFileFormat(`unsupported file format: mimetype='${file.mimetype}'`));
                }
            }));
        });
    });
}

ImageStorage.prototype._removeFile = function _removeFile(req, file, cb) {
    const path = file.path
    delete file.destination
    delete file.filename
    delete file.path
    fs.unlink(path, cb)
}

export default ImageStorage;