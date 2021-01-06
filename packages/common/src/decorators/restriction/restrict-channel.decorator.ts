import { createRestrictionDecorator } from '.';

export interface IChannelRestrictionOptions {
  isId: boolean;
}

export function RestrictChannel(channel: string): MethodDecorator;
export function RestrictChannel(channel: string[]): MethodDecorator;
export function RestrictChannel(
  channel: string | string[],
  options?: IChannelRestrictionOptions
): MethodDecorator;
export function RestrictChannel(
  channel: string | string[],
  options?: IChannelRestrictionOptions
): MethodDecorator {
  return createRestrictionDecorator("channel", channel, options);
}
