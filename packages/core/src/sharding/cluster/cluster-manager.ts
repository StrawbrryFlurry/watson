import { isMaster, setupMaster } from 'cluster';
import { join } from 'path';

const WORKER_FILE = join(__dirname, "worker.js");

export class ClusterManager {
  constructor() {
    if (isMaster) {
      setupMaster({
        exec: WORKER_FILE,
      });
    }
  }
}
