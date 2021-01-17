import { ShardingManager, ShardingManagerMode } from 'discord.js';

export interface IShardingOptions {
  totalShards?: number | "auto";
  shardList?: number[] | "auto";
  mode?: ShardingManagerMode;
  respawn?: boolean;
  shardArgs?: string[];
  token?: string;
  execArgv?: string[];
}

export class ShardingAdapter {
  private readonly baseAdapter = `${__dirname}/discordjs-adapter.js`;
  private readonly shardManager: ShardingManager;

  constructor(options?: IShardingOptions) {
    this.shardManager = new ShardingManager(this.baseAdapter, options);
    this.shardManager.on("shardCreate", console.log);
  }
}
