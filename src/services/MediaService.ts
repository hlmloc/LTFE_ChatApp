
export interface UploadedImage {
    url: string;
    name: string;
    mimeType: string;
    size: number;
}

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImage(file: File): Promise<UploadedImage> {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error("Chưa cấu hình Cloudinary");
    }

    if (!file.type.startsWith("image/")) {
        throw new Error("File được chọn không phải hình ảnh");
    }

    const MAX_SIZE = 5 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
        throw new Error("Hình ảnh không được vượt quá 5 MB");
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "echochat/images");

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error?.message || "Upload hình ảnh thất bại"
        );
    }

    if (!data.secure_url) {
        throw new Error("Cloudinary không trả về URL hình ảnh");
    }

    return {
        url: data.secure_url,
        name: file.name,
        mimeType: file.type,
        size: file.size,
    };
}
