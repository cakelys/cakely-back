import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
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

  async generagePresignedDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_RESIZED_BUCKET_NAME,
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
}

function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
