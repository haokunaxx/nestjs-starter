import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  Body,
  UploadedFile,
  UseInterceptors,
  StreamableFile,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';

import { join, resolve } from 'path';
import { createReadStream } from 'fs';

import { UploadService } from './upload.service';
import { MergeChunksDto } from './dto/merge-chunks.dto';

import { Public } from 'src/decorators/auth.decorator';

const dirPath = resolve(__dirname, '../../static');

@Controller('upload')
export class UploadController {
  constructor(private service: UploadService) {}

  /**
   * 文件下载
   */
  @Get(':hash')
  @Public()
  async getFile(
    @Param('hash') hash: string,
    @Res({
      passthrough: true,
    })
    res: Response,
  ): Promise<StreamableFile> {
    const [foundFile] = await this.service.findImage(hash);
    if (!foundFile) {
      throw new NotFoundException();
    }
    const file = createReadStream(join(dirPath, hash));
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename=${foundFile.name}`,
    });
    return new StreamableFile(file);
  }

  /**
   * 文件上传
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.service.saveFile(file, dirPath);
  }

  /**
   * 切片上传
   */
  @Post('chunk')
  @UseInterceptors(FileInterceptor('file'))
  chunkUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      index: number;
      hash: string;
    },
  ) {
    const { hash, index } = body;
    return this.service.chunkUpload({
      file: file.buffer,
      hash,
      index,
    });
  }

  /**
   * 切片下载
   */
  @Post('chunk-merge')
  mergeChunks(
    @Body()
    body: MergeChunksDto,
  ) {
    return this.service.mergeChunks(body);
  }
}
