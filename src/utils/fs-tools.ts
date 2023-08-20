import { existsSync, mkdirSync, readdirSync } from 'fs';

export const createFolderIfNotExists = (folderPath: string) => {
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath, { recursive: true });
  }
};

export const findFileInFolder = (
  folderPath: string,
  target: string,
  compareFunc: Function = (item, target) => item === target,
) => {
  const entries = readdirSync(folderPath);
  return entries.find((item) => compareFunc(item, target));
  // item.split('-')[0] === targetFileHash);
};
