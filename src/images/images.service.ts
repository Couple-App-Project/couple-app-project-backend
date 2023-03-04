import { Injectable } from '@nestjs/common';
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Multer } from 'multer';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

  async uploadBackgroundImage(file: Multer.File, coupleId: number) {
    // 5MB limit
    if (file.size > 5242880) {
      throw new Error('파일 용량 초과.');
    }

    await this.deleteBackgroundImage(coupleId);

    const fileKey = `couples/${coupleId}/background-image/${Date.now()}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
    });
    await this.s3.send(command);
  }

  async uploadDiaryImages(files: Multer.File[], diaryId: number) {
    if (files.some((file) => file.size > 5242880)) {
      throw new Error('용량을 초과하는 파일이 있음.');
    }

    await this.deleteImagesOfDiary(diaryId);

    const folderName = `diaries/${diaryId}/`;

    for (const file of files) {
      const fileKey = `${folderName}${Date.now()}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
      });

      await this.s3.send(command);
    }
  }

  async getFolder(folderName: string) {
    const listCommand = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: folderName,
    });

    const listResponse = await this.s3.send(listCommand);
    const contents = listResponse.Contents || [];

    const getCommands = contents.map((content) => {
      return new GetObjectCommand({
        Bucket: this.bucketName,
        Key: content.Key,
      });
    });

    return await Promise.all(
      getCommands.map(async (getCommand) => {
        return await getSignedUrl(this.s3, getCommand, {
          expiresIn: 60 * 60,
        });
      }),
    );
  }

  async getBackgroundImage(coupleId: number) {
    const folderName = `couples/${coupleId}/background-image/`;
    return await this.getFolder(folderName);
  }

  async getDiaryImages(diaryId: number) {
    const folderName = `diaries/${diaryId}/`;
    return await this.getFolder(folderName);
  }

  async deleteFolder(folderName: string) {
    const listObjectsResponse = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: folderName,
      }),
    );

    const contents = listObjectsResponse.Contents;

    if (!contents) {
      return;
    }

    const objectsToDelete = contents.map(({ Key }) => ({ Key }));

    await this.s3.send(
      new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: { Objects: objectsToDelete },
      }),
    );
  }

  async deleteImagesOfDiary(diaryId: number) {
    const folderName = `diaries/${diaryId}/`;
    await this.deleteFolder(folderName);
  }

  async deleteBackgroundImage(coupleId: number) {
    const folderName = `couples/${coupleId}/background-image/`;
    await this.deleteFolder(folderName);
  }
}
