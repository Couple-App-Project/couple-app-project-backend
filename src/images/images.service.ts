import { Injectable } from '@nestjs/common';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Multer } from 'multer';
import { CurrentUserDto } from '../users/dto/current-user.dto';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImagesService {
  constructor(private configService: ConfigService) {}

  private s3 = new S3Client({
    region: this.configService.get('AWS_S3_REGION'),
    credentials: {
      accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY'),
    },
  });
  private bucketName = this.configService.get('AWS_S3_BUCKET');

  async uploadBackgroundImage(file: Multer.File, user: CurrentUserDto) {
    const fileKey = `users/${user.userId}/background-image`;
    const params = {
      Bucket: this.bucketName,
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
      Bucket: this.bucketName,
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
