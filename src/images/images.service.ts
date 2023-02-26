import { Injectable } from '@nestjs/common';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Multer } from 'multer';
import { CurrentUserDto } from '../users/dto/current-user.dto';
import { Readable } from 'stream';

@Injectable()
export class ImagesService {
  private s3: S3Client = new S3Client({
    region: 'ap-northeast-2',
    credentials: {
      accessKeyId: 'AKIA3KUH4ZFDZF5HDXAE',
      secretAccessKey: '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',
    },
  });

  async uploadBackgroundImage(file: Multer.File, user: CurrentUserDto) {
    const fileKey = `users/${user.userId}/background-image`;
    const params = {
      Bucket: 'couple-app',
      Key: fileKey,
      Body: file.buffer,
    };

    // 5MB limit
    if (file.size > 5242880) {
      throw new Error('파일 용량 초과.');
    }

    const command = new PutObjectCommand(params);
    await this.s3.send(command);
  }

  async getBackgroundImage(user: CurrentUserDto) {
    const command = new GetObjectCommand({
      Bucket: 'couple-app',
      Key: `users/${user.userId}/background-image`,
    });

    const response = await this.s3.send(command);
    const stream = response.Body as Readable;
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
}
