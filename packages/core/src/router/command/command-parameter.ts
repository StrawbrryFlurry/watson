import { CommandParameter } from '@watsonjs/common';

export class CommandParameterHost<T = any> implements CommandParameter<T> {
  name: string;
  type: T;
  label: string;
  default: T;
  choices: T[];
  hungry: false;
  optional: boolean;
  dependencyIndex: number;

  constructor(definition: CommandParameter) {
    Object.assign(this, definition);
  }
}
