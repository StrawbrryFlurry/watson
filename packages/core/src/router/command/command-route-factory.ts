import {
  CommandArgumentType,
  CommandParameter,
  ICommandParameterMetadata,
  isEmpty,
  isInternalParameterType,
  isObject,
  mergeDefaults,
  NON_DECLARATIVE_PARAM_METADATA,
  PARAM_METADATA,
  TReceiver,
  Type,
} from '@watsonjs/common';
import { WatsonContainer } from 'watson-container';

import { InstanceWrapper, Reflector } from '../../injector';
import { CommandDefinition } from './command-definition';
import { CommandParameterHost } from './command-parameter';

export class CommandRouteFactory {
  private reflector: Reflector = new Reflector();

  constructor(private readonly container: WatsonContainer) {}

  public fromReceiver(receiver: InstanceWrapper<TReceiver>) {
    const { metatype } = receiver;

    const methods = this.reflector.reflectMethodsOfType(metatype);

    if (isEmpty(methods)) {
      return;
    }

    for (const method of methods) {
      const { propertyKey } = method;
      const commandDef = new CommandDefinition();
      const parameters = this.reflector.reflectMethodParameters(
        metatype,
        propertyKey
      );

      // TODO:: Create route
      if (isEmpty(parameters)) {
        continue;
      }

      for (
        let parameterIndex = 0;
        parameterIndex < parameters.length;
        parameterIndex++
      ) {
        const parameter = parameters[parameterIndex];
        this.reflector.reflectMetadata<boolean | null>(
          NON_DECLARATIVE_PARAM_METADATA,
          metatype,
          propertyKey
        );

        if (!this.isParamDeclarative(parameter)) {
          continue;
        }

        const parameterDef = this.createParameterDef(
          parameter,
          metatype,
          propertyKey,
          parameterIndex
        );

        commandDef.addParameter(parameterDef);
      }
    }
  }

  /**
   * Checks if the type of a given
   * parameter is part of the command
   * definition or context based
   * (`ComponentFactory` for example).
   */
  private isParamDeclarative(parameter: Object | Function | Type) {
    if (!isObject(parameter)) {
      return false;
    }

    /**
     * Is custom parameter type
     */
    if ("parse" in (parameter as CommandArgumentType)) {
      return true;
    }

    return isInternalParameterType(parameter);
  }

  private createParameterDef(
    parameterType: Object,
    receiver: Type,
    propertyKey: string,
    dependencyIndex: number
  ): CommandParameterHost {
    let metadata =
      this.reflector.reflectMetadata<ICommandParameterMetadata>(
        PARAM_METADATA,
        receiver,
        propertyKey
      ) || {};

    const parameterDef: CommandParameter = mergeDefaults<CommandParameter>(
      metadata,
      {
        name: "",
        dependencyIndex: dependencyIndex,
        type: parameterType,
        optional: false,
        hungry: false,
        label: "",
        choices: undefined,
        default: undefined,
      }
    );

    const parameter = new CommandParameterHost(parameterDef);

    return parameter;
  }

  private processReceiverMethod(metatype: Type, propertyKey: string) {}
}
