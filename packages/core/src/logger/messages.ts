import { TReceiver } from '@watson/common';

import { InstanceWrapper, Module } from '../injector';

export const AddingCommand = () => ``;
export const AddingSlashCommand = () => ``;
export const AddingModule = () => ``;

type Changeable = "guard" | "pipe" | "filter";

export const changeableNotFound = (
  type: Changeable,
  name: string,
  method: Function,
  receiver: InstanceWrapper<TReceiver>,
  module: Module
) =>
  `The ${type} ${name} used to decorate the handler ${method.name} in receiver ${receiver.name} was not found in the module ${module.name}`;

export const badChangeableImplementation = (
  type: Changeable,
  name: string,
  method: Function,
  receiver: InstanceWrapper<TReceiver>,
  module: Module
) =>
  `The ${type} ${name} used to decorate the handler ${method.name} in receiver ${receiver.name} does not implement it's interface correctly.`;
