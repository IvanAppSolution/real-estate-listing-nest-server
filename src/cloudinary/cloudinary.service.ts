import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse, TransformationOptions } from 'cloudinary';
// import { CloudinaryResponse } from './cloudinary-response';
import * as streamifier from 'streamifier';


@Injectable()
export class CloudinaryService {
//   uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
//     return new Promise<UploadApiResponse>((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         (error, result) => {
//           if (error) return reject(new Error('Cloudinary upload error'));
//           if (!result) return reject(new Error('Upload failed: No result returned'));
//           resolve(result);
//         },
//       );

//       streamifier.createReadStream(file.buffer).pipe(uploadStream);
//     });
//   }
// }

// @Injectable()
// export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'real-estate-listings', // Optional: organize uploads in folders
          resource_type: 'auto', // Auto-detect file type
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(new Error('Cloudinary upload error'));
          }
          
          if (!result) {
            console.error('Cloudinary upload error: No result returned');
            return reject(new Error('Upload failed: No result returned'));
          }
          
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  // Optional: Add method to upload multiple files
  async uploadMultipleFiles(files: Express.Multer.File[]): Promise<UploadApiResponse[]> {
    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  // Optional: Add method to delete a file
  async deleteFile(publicId: string): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      void cloudinary.uploader.destroy(
        publicId, 
        (error: UploadApiErrorResponse | undefined, result: Record<string, unknown> | undefined) => {
          if (error) {
            console.error('Cloudinary delete error:', error);
            return reject(new Error('Cloudinary delete error'));
          }
          
          if (!result) {
            return reject(new Error('Delete failed: No result returned'));
          }
          
          resolve(result);
        }
      );
    });
  }

  // Optional: Get optimized image URL
  getOptimizedUrl(publicId: string, options?: TransformationOptions): string {
    const config = {
      fetch_format: 'auto' as const,
      quality: 'auto' as const,
      ...(options as Record<string, unknown>),
    };
    return cloudinary.url(publicId, config);
  }
}