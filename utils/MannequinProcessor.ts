
/**
 * MannequinProcessor.ts
 * Implements the "Safety Bridge" by converting private images into 
 * abstract 18% Grey sculptural guides locally using a Sobel filter.
 */

export const processToMannequin = async (imageSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return reject("Could not get canvas context");

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const width = canvas.width;
            const height = canvas.height;

            // 1. Grayscale & Noise Reduction (Simple Box Blur)
            // (Skipping complex blur for performance, using direct Sobel)

            // 2. Sobel Operator for Edge Detection
            const output = ctx.createImageData(width, height);
            const outData = output.data;

            const grayscale = new Uint8Array(width * height);
            for (let i = 0; i < data.length; i += 4) {
                grayscale[i / 4] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
            }

            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const idx = y * width + x;

                    // Sobel kernels
                    // Gx: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]
                    // Gy: [[-1, -2, -1], [ 0,  0,  0], [ 1,  2,  1]]

                    const gx =
                        -1 * grayscale[idx - width - 1] + 1 * grayscale[idx - width + 1] +
                        -2 * grayscale[idx - 1] + 2 * grayscale[idx + 1] +
                        -1 * grayscale[idx + width - 1] + 1 * grayscale[idx + width + 1];

                    const gy =
                        -1 * grayscale[idx - width - 1] - 2 * grayscale[idx - width] - 1 * grayscale[idx - width + 1] +
                        1 * grayscale[idx + width - 1] + 2 * grayscale[idx + width] + 1 * grayscale[idx + width + 1];

                    const mag = Math.sqrt(gx * gx + gy * gy);

                    // 3. 18% Grey (#808080) Mapping
                    // We use the edge magnitude to modulate the grey slightly for "clay look"
                    // but fundamentally keep it near #808080 (128, 128, 128)

                    const baseGrey = 128;
                    const edgeIntensity = Math.min(255, mag * 2);

                    // Lighten edges to give "sculpted" feel to the silhouette
                    const color = Math.max(0, Math.min(255, baseGrey + (edgeIntensity > 30 ? edgeIntensity : -20)));

                    const outIdx = idx * 4;
                    outData[outIdx] = color;     // R
                    outData[outIdx + 1] = color;   // G
                    outData[outIdx + 2] = color;   // B
                    outData[outIdx + 3] = 255;       // A
                }
            }

            ctx.putImageData(output, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = reject;
        img.src = imageSrc;
    });
};

export const processToSkeleton = async (imageSrc: string): Promise<string> => {
    // Basic thresholding and inversion to create a "Blueprint/Stick Figure" look
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject("Could not get context");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const val = avg > 128 ? 255 : 0; // High contrast
                data[i] = data[i + 1] = data[i + 2] = 255 - val; // Inverted
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = imageSrc;
    });
};
