import { HttpClient, mergeDefaults } from '@watsonjs/common';
import { map } from 'rxjs/operators';

import { DISCORD_GATEWAY_URL, DISCORD_GATEWAY_VERSION, DISCORD_URL } from '../constants';
import { containerInstanceHelper } from '../helpers';
import { WatsonContainer } from '../watson-container';
import { ClusterManager } from './cluster';
import { IBotIdentificationResponse, IFetchableShardValue } from './interfaces';
import { Shard } from './shard';

export interface IShardingManagerOptions {
  /**
   * If undefined Watson will figure out the reccomended amount
   * of shards for the client.
   */
  shardCount?: number | undefined;
  token: string;
}

const DEFAULT_SHARDING_OPTIONS: Partial<IShardingManagerOptions> = {
  shardCount: undefined,
};

/**
 * @note
 * The ShardingManager will use the http client set up in the apps root module
 * If none is set it will create a new instance without any configuration
 */
export class ShardingManager {
  public shards = new Map<string, Shard>();

  public clusterManager: ClusterManager;

  private http: HttpClient;
  private token: string;
  private shardCount: number;

  private identificationStats: IBotIdentificationResponse;

  constructor(options: Partial<IShardingManagerOptions>) {
    const { shardCount, token } = mergeDefaults(
      options,
      DEFAULT_SHARDING_OPTIONS
    );

    this.token = token;
    this.shardCount = shardCount;
  }

  public async init(container: WatsonContainer) {
    this.http = await containerInstanceHelper(container, HttpClient);
    await this.setupShardOptions();
  }

  /**
   * Calls the function in all workers
   */
  public broadcast(fn: Function | string) {}

  /**
   * Invokes a function on all workers or just one fi specified
   */
  public invoke(fn: Function | string, shardId?: string) {}

  /**
   * Fetches a value from all workers or just one if specified
   */
  public fetch(value: IFetchableShardValue, shardId?: string) {}

  private fetchReccomendedShardCount() {
    return this.http
      .get<IBotIdentificationResponse>(
        `${DISCORD_URL}/${DISCORD_GATEWAY_VERSION}/${DISCORD_GATEWAY_URL}/bot`,
        {
          headers: {
            Authorization: `Bot ${this.token}`,
          },
        }
      )
      .pipe(map((res) => res.data))
      .toPromise();
  }

  private async setupShardOptions() {
    let shardCount: number;

    if (typeof this.shardCount === "undefined") {
      this.identificationStats = await this.fetchReccomendedShardCount();

      shardCount = this.identificationStats.shards;
      this.shardCount = shardCount;
    }
  }
}
