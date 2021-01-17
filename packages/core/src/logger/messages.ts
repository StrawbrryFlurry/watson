import { TReceiver, Type } from '@watsonjs/common';
import { blue, cyan, yellow } from 'cli-color';

import { InstanceWrapper, Module } from '../injector';
import { CommandRoute, ConcreteEventRoute, SlashRoute } from '../routes';

// WATSON FACTORY
export const CREATE_APP_CONTEXT = () => `Creating application context...`;

// *END

// WATSON APPLICATION
export const APP_STRATED = () => `Watson application successfully started`;

// *END

// ROUTES EXPLORER
export const EXPLORE_START = () => `Exploring application event handlers`;

export const EXPLORE_RECEIVER = (receiver: InstanceWrapper) =>
  `From ${blue(receiver.name)} in ${yellow(receiver.host.name)}`;

export const MAP_COMMAND = (route: CommandRoute) =>
  `Mapped command ${cyan(route.prefix)}${cyan(route.name)} in ${blue(
    route.host.name
  )}`;

export const MAP_EVENT = (route: ConcreteEventRoute<any>) =>
  `Mapped event ${yellow(route.eventType)} in ${blue(route.host.name)}`;

export const MAP_SLASH_COMMAND = (route: SlashRoute) =>
  `Mapped slash command ${cyan(route.name)} in ${blue(route.host.name)}`;

// *END

// METADATA RESOLVER
export const ADD_MODULE = (module: Type) =>
  `Added module ${yellow(module.name)}`;

export const REFLECT_MODULE_IMPORTS = () => `Reflecting module imports`;
export const REFLECT_MODULE_COMPONENTS = () => `Reflecting module components`;
export const BIND_GLOBAL_MODULES = () => `Binding global module exports`;

// *END

// INSTANCE LOADER
export const CREATING_COMPONENT_INSTANCES = () =>
  `Creating component instances`;

export const CREATE_INSTANCE = (instance: InstanceWrapper) =>
  `Creating instance of ${blue(instance.name)}`;

// *END

// GLOAL
export const COMPLETED = () => `Completed`;

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
