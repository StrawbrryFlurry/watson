import { RouterRef } from '@core/router';
import { CommandRoute, EventRoute, Type } from '@watsonjs/common';
import { blue, cyan, yellow } from 'cli-color';

// WATSON FACTORY
export const CREATE_APP_CONTEXT = () => `Creating application context...`;

// *END

// WATSON APPLICATION
export const APP_STARTING = () => "Starting Watson application...";

export const APP_STARTED = () => `Watson application successfully started`;

// *END

// ROUTES EXPLORER
export const EXPLORE_START = () => `Exploring application event handlers`;

export const EXPLORE_ROUTER = (router: RouterRef) =>
  `From ${blue(router.name)} in ${yellow(router)}`;

export const MAP_COMMAND = (route: CommandRoute) =>
  `Mapped command } in ${blue(route.host.name)}`;

export const MAP_EVENT = (route: EventRoute) =>
  `Mapped event ${yellow(route.event)} in ${blue(route.host.name)}`;

export const MAP_SLASH_COMMAND = (route: any) =>
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

export const CREATE_INSTANCE = (instance: Type) =>
  `Creating instance of ${blue(instance.name)}`;

// *END

// GLOBAL
export const COMPLETED = () => `Completed`;

export type Interceptor<T extends string = "guard" | "pipe" | "filter"> = T;
/*
export const INTERCEPTOR_NOT_FOUND = (
  type: Interceptor,
  name: string,
  method: Function,
  router: InstanceWrapper<RouterDef>,
  module: Module
) =>
  `The ${type} ${name} used to decorate the handler ${method.name} in router ${router.name} was not found in the module ${module.name}`;

export const INVALID_COMPONENT_DEF_MESSAGE = (
  type: TComponent,
  name: string,
  message: string
) => `Failed to parse ${type}, ${name}.\n${message}`;

export const BAD_INTERCEPTOR_IMPLEMENTATION = (
  type: Interceptor,
  name: string,
  method: Function,
  router: InstanceWrapper<RouterDef>,
  module: Module
) =>
  `The ${type} ${name} used to decorate the handler ${method.name} in router ${router.name} does not implement it's interface correctly.`;
*/
