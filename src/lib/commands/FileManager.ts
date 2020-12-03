import { readdir } from 'fs/promises';
import { glob } from 'glob';
import { join, resolve } from 'path';

export class FileManager {
  public baseDir: string;

  constructor() {
    this.baseDir = join(__dirname, "../../");
  }

  public async getFolderContent(path: string) {
    const files = await readdir(path);
    return files.map((file) => join(path, file));
  }

  public async getFileByWildcard(wildcard: string): Promise<string[]> {
    return new Promise((res, rej) => {
      glob(wildcard, (err, files) => {
        if (err) rej(err);
        const resolvedFiles = files.map((file) => resolve(file));

        res(resolvedFiles);
      });
    });
  }
}
