import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { Express } from 'express';
import {
  writeFile as _writeFile,
  createReadStream,
  createWriteStream,
  readdirSync,
  rmdirSync,
  unlinkSync,
} from 'fs';
import { promisify } from 'util';
import { createHash } from 'crypto';

import Upload from './upload.entity';
import { createFolderIfNotExists, findFileInFolder } from '../utils/fs-tools';
import { resolve } from 'path';
import { MergeChunksDto } from './dto/merge-chunks.dto';

const writeFile = promisify(_writeFile);

const CHUNK_FOLDER_PATH = resolve(__dirname, '../../static/chunks');
const FILE_FOLDER_PATH = resolve(__dirname, '../../static');

interface UploadChunkParams {
  file: any;
  hash: string;
  index: number;
}

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Upload) private readonly repo: Repository<Upload>,
  ) {}

  /**
   * 保存文件内容
   */
  async uploadFile(dir: string, name: string, data: any) {
    const path = `${dir}/${name}`;
    await writeFile(path, data);
  }

  /**
   * 保存文件信息
   */
  saveFileMetadata(metadata: {
    hash: string;
    name: string;
    // mineType: string;
    // size: number;
  }) {
    const uploadField = this.repo.create(metadata);
    return this.repo.save(uploadField);
  }

  /**
   * 文件上传
   */
  async saveFile(file: Express.Multer.File, dir: string) {
    // 找到 image 文件夹（即要存储文件的目录）
    createFolderIfNotExists(dir);

    const { buffer, originalname, size, mimetype } = file;
    //计算文件 hash
    const hash = this.getFileHashCode(buffer);

    const fileFound = findFileInFolder(
      dir,
      hash,
      (item: string, target) => item === target,
    );

    //FIXME:相同文件且相同文件名还需要保存到数据库吗
    await Promise.all([
      fileFound ? Promise.resolve() : this.uploadFile(dir, hash, buffer),
      this.saveFileMetadata({
        name: originalname,
        hash,
        // mineType: mimetype,
        // size,
      }),
    ]);

    return {
      hash,
    };
  }

  /**
   * 根据 hash 返回查找到的数据
   */
  findImage(hash: string) {
    return this.repo.findBy({
      hash,
    });
  }

  /**
   * 加密文件获得 hash
   */
  getFileHashCode(data: any) {
    const hash = createHash('md5');
    hash.update(data);
    return hash.digest('hex');
  }

  /**
   * 切片上传
   */
  async chunkUpload({ file, hash, index }: UploadChunkParams) {
    const chunkDir = `${CHUNK_FOLDER_PATH}/${hash}`;
    // 找到 切片存放的 文件夹
    createFolderIfNotExists(chunkDir);

    const currentChunkName = `${hash}-${index}`;
    // 根据唯一标识获取该文件的所有切片
    const entries = readdirSync(chunkDir);
    const chunks = entries.filter((item) => item.split('-')[0] === hash);
    console.log('chunks');
    // 判断当前切片是否上传过了
    if (chunks.includes(currentChunkName)) {
      console.log(currentChunkName, index, 'chunk existed');
      return;
    }
    // 上一步没上传则上传切片
    await this.uploadFile(chunkDir, currentChunkName, file);
  }

  /**
   * 合并切片
   */
  async mergeChunks(params: MergeChunksDto) {
    const { hash, total, chunkSize, fileName } = params;
    // 需要合并的 chunks 存放的目录
    const folderWhichStoreTheChunksNeedToMerge = `${CHUNK_FOLDER_PATH}/${hash}`;
    // 写入的文件
    const outputFilePath = `${FILE_FOLDER_PATH}/${hash}`;

    // FIXME: 找不到目录时的逻辑处理
    // 根据唯一标识获取该文件的所有切片
    const entries = readdirSync(folderWhichStoreTheChunksNeedToMerge);
    const chunks = entries.filter((item) => item.split('-')[0] === hash);

    const errorChunksLength = chunks.length !== total;
    if (errorChunksLength) {
      // TODO:删除切片，避免切片出问题后无法重新上传
      throw new BadRequestException('缺少部分切片');
    }

    //确认文件夹是否存在
    createFolderIfNotExists(FILE_FOLDER_PATH);

    //将切片内容写入指定文件
    const writePromises: Promise<any>[] = chunks.map((chunkName) => {
      return new Promise((resolve, reject) => {
        const filePath = `${folderWhichStoreTheChunksNeedToMerge}/${chunkName}`;

        const readStream = createReadStream(filePath); //创建切片可读流
        const writeStream = createWriteStream(outputFilePath, {
          start: Number(chunkName.split('-')[1]) * chunkSize,
        });
        readStream.pipe(writeStream);
        readStream.on('end', () => {
          unlinkSync(filePath);
          resolve(undefined);
        });
        readStream.on('error', (err) => {
          reject(err);
        });
      });
    });
    try {
      await Promise.all(writePromises);
      // 写入完成后删除存放切片的目录
      rmdirSync(folderWhichStoreTheChunksNeedToMerge);
    } catch {
      throw new InternalServerErrorException('切片合并出错');
    }

    // TODO:保存至数据库
    this.saveFileMetadata({
      hash,
      name: fileName,
    });

    return {
      hash,
    };
  }
}
