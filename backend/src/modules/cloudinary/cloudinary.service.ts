import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

function toError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);
  return new Error(JSON.stringify(error));
}

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    folder = 'achromatic',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(toError(error));
          } else if (!result) {
            reject(new Error('Cloudinary upload did not return a result'));
          } else {
            resolve(result);
          }
        },
      );
      const stream = Readable.from(file.buffer);
      stream.pipe(upload);
    });
  }

  async uploadBuffer(
    buffer: Buffer,
    folder = 'achromatic',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(toError(error));
          } else if (!result) {
            reject(new Error('Cloudinary upload did not return a result'));
          } else {
            resolve(result);
          }
        },
      );
      const stream = Readable.from(buffer);
      stream.pipe(upload);
    });
  }

  async deleteFile(publicId: string): Promise<unknown> {
    return (await cloudinary.uploader.destroy(publicId)) as unknown;
  }

  getOptimizedUrl(publicId: string, width?: number, height?: number) {
    return cloudinary.url(publicId, {
      quality: 'auto',
      fetch_format: 'auto',
      ...(width ? { width, crop: 'fill' } : {}),
      ...(height ? { height } : {}),
    });
  }
}
