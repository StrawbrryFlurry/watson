import { Message } from 'discord.js';

export interface ExecutionContext<RouteType> {
  getRouteConfig(): RouteType;
  getMessage(): Message;
}
