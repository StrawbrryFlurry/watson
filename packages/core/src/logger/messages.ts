import { TReceiver } from '@watson/common';
import { blue, cyan } from 'cli-color';

import { InstanceWrapper, Module } from '../injector';
import { CommandRoute, SlashRoute } from '../routes';

export const MAP_COMMAND = (route: CommandRoute) =>
  `Mapping command ${cyan(route.prefix)}${cyan(route.name)} in ${blue(
    route.host.name
  )}`;
export const MAP_SLASH_COMMAND = (route: SlashRoute) =>
  `Mapping slash command ${cyan(route.name)} in ${blue(route.host.name)}`;
export const ADD_MODULE = (module: Module) =>
  `Adding module ${cyan(module.name)}`;

type Changeable = "guard" | "pipe" | "filter";

export const CHANGEABLE_NOT_FOUND = (
  type: Changeable,
  name: string,
  method: Function,
  receiver: InstanceWrapper<TReceiver>,
  module: Module
) =>
  `The ${type} ${name} used to decorate the handler ${method.name} in receiver ${receiver.name} was not found in the module ${module.name}`;

export const BAD_CHANGEALE_IMPLEMENTATION = (
  type: Changeable,
  name: string,
  method: Function,
  receiver: InstanceWrapper<TReceiver>,
  module: Module
) =>
  `The ${type} ${name} used to decorate the handler ${method.name} in receiver ${receiver.name} does not implement it's interface correctly.`;
