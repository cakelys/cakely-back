import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.S3_REGION,
    });
  }

  async generagePresignedDownloadUrl(
    bucketName: string,
    key: string,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    try {
      const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
      return url;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to generate presigned download URL: ${error.message}`,
      );
    }
  }

  async getFile(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    try {
      const data = await this.s3.send(command);
      const body = data.Body as Readable;
      const buffer = await streamToBuffer(body);
      return buffer;
    } catch (error) {
      throw new Error(`Failed to get file from S3: ${error.message}`);
    }
  }

  async uploadFile(bucketName: string, uid: string, file) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `profile-photo/${uid}/${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    const response = await this.s3.send(command);
    const statusCode = response['$metadata'].httpStatusCode;
    if (statusCode !== 200) {
      throw new InternalServerErrorException(
        `Failed to upload file to S3: ${response.$metadata.httpStatusCode}`,
      );
    }
    const url = `https://${bucketName}.s3.amazonaws.com/profile-photo/${uid}/${file.originalname}`;
    return url;
  }
}

function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
