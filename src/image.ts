import * as sharp from 'sharp';

const SIZE_LIMIT: number = 8e6 - 5000;

export interface ImageData {
    format: string;
    data: Buffer;
}

export async function fitIntoSizeLimit(image: Buffer): Promise<ImageData> {
    const sharpImage = sharp(image);
    const metadata = await sharpImage.metadata();
    const format = metadata.format;
    const height = metadata.height;
    if (format == null || height == null) {
        throw new Error();
    }
    if (image.length <= SIZE_LIMIT) {
        return {
            format,
            data: image,
        };
    }

    // Try compressing once
    let compressed =
        await sharpImage
            .jpeg({
                quality: 80,
                chromaSubsampling: '4:4:4',
            })
            .toBuffer();
    let currentHeight = height;
    let size;
    while ((size = compressed.length) > SIZE_LIMIT) {
        console.error(`Size: ${size} > 7 995 000, resizing`);
        const ratio = Math.sqrt(size / SIZE_LIMIT);
        console.error(`Ratio: ${ratio}`);
        if (ratio < 1.01) {
            currentHeight -= 20;
        } else {
            currentHeight = Math.floor(currentHeight / ratio);
        }
        console.error(`Target height: ${currentHeight}`);
        compressed =
            await sharpImage
                .resize(undefined, currentHeight)
                .jpeg({
                    quality: 80,
                    chromaSubsampling: '4:4:4',
                })
                .toBuffer();
    }
    console.error(`Done resizing: ${image.length} -> ${size}`);

    return {
        format: 'jpeg',
        data: compressed,
    };
}
