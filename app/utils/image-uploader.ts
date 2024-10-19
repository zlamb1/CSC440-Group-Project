import {
    NodeOnDiskFile,
    unstable_composeUploadHandlers,
    unstable_createFileUploadHandler,
    unstable_createMemoryUploadHandler
} from "@remix-run/node";
import crypto from "crypto";
import {FileUploadHandlerFilterArgs} from "@remix-run/node/dist/upload/fileUploadHandler";
import fs from "node:fs";

export const imageCdn = 'https://cdn.zlamb1.com/images/';
export const image_v1 = '/www/data/images/';

const isProduction = process.env.NODE_ENV === "production";
const allowedExtensions = ["jpg", "jpeg", "png"];

export function getContentType(filename: string) {
    const ext = filename.substring(filename.lastIndexOf(".") + 1);
    switch (ext) {
        case "jpg":
        case "jpeg":
            return "image/jpeg";
        case "png":
            return "image/png";
    }
    throw new Error("unsupported extension");
}

export function createBase64Src(filename: string, filepath: string) {
    if (!filename || !filepath) {
        return null;
    }
    return `data:${getContentType(filename)};charset=utf-8;base64,` + fs.readFileSync(filepath, 'base64');
}

export function removeAvatar(oldAvatar: string) {
    try {
        const split = oldAvatar?.split("/");
        const filename = split[split.length - 1];
        fs.unlinkSync(`${image_v1}${filename}`);
    } catch (err) {
        console.error('failed to remove avatar: ', err);
    }
}

export function createImageUploader(opts: any) {
    return unstable_composeUploadHandlers(
        unstable_createFileUploadHandler({
            directory: opts?.directory,
            file: ({ filename }) => crypto.randomUUID().replace(/-/g, "") + filename.substring(filename.lastIndexOf(".")),
            filter(args: FileUploadHandlerFilterArgs): boolean | Promise<boolean> {
                const ext = args.filename.substring(args.filename.lastIndexOf(".") + 1);
                return allowedExtensions.includes(ext) && args.contentType.includes("image");
            }
        }),
        // parse everything else into memory
        unstable_createMemoryUploadHandler()
    );
}