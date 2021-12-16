import { MethodDescriptor, Reflector } from '@core/di';
import {
  CommandConfiguration,
  CommandCooldownOptions,
  CommandOptions,
  CommandParameterMetadata,
  CommandRoute,
  COOLDOWN_METADATA,
  getFunctionParameters,
  isEmpty,
  isNil,
  PARAM_METADATA,
  ParameterConfiguration,
  RouterDecoratorOptions,
  W_PARAM_TYPE,
} from '@watsonjs/common';

export class CommandConfigurationImpl implements CommandConfiguration {
  public name: string;
  public alias: string[];
  public caseSensitive: boolean;
  public params: ParameterConfiguration[] = [];
  public description: string;
  public tags: string[];
  public commandGroup: string;

  public cooldown?: CommandCooldownOptions;

  public hidden: boolean;

  public fullDescription: string;
  public usage: string | string[] | null;
  public deleteCommandMessage: boolean;

  constructor(
    public host: CommandRoute,
    private commandOptions: CommandOptions,
    private routerOptions: RouterDecoratorOptions,
    private method: MethodDescriptor
  ) {
    this._configure();
  }

  private _configure() {
    this._setName();
    this._setConfiguration();
    this._applyCommandParameters();
    this._applyCooldown();
  }

  private _setName(): void {
    const { commandOptions, method } = this;

    if (commandOptions.name) {
      this.name = commandOptions.name!;
      return;
    }

    this.name = method.propertyKey;
  }

  private _applyCommandParameters(): void {
    const { host, method } = this;

    const parameters = Reflector.reflectMethodParameters(
      host.metatype,
      method.descriptor.name
    );

    const paramMetadata = Reflector.reflectMetadata<CommandParameterMetadata[]>(
      PARAM_METADATA,
      method.descriptor
    );

    const parameterNames = getFunctionParameters(method.descriptor);

    for (let i = 0; i < parameters.length; i++) {
      const parameter = parameters[i];
      const metadata = paramMetadata.find((meta) => meta.parameterIndex === i);

      const type = (parameter as any)[W_PARAM_TYPE];

      if (isNil(metadata)) {
        if (isNil(type)) {
          continue;
        }

        const name = parameterNames[i];

        this.params.push({
          name: name,
          description: name,
          default: null,
          type: null,
          group: null,
          hungry: false,
          optional: false,
          paramType: type,
          configuration: null as any,
          parameterIndex: i,
        });
        continue;
      }

      this.params.push({
        ...(metadata as Required<CommandParameterMetadata>),
        paramType: type,
      });
    }
  }

  private _applyCooldown(): void {
    const {
      host,
      method: { descriptor },
    } = this;

    const metadata = Reflector.reflectMetadata<CommandCooldownOptions>(
      COOLDOWN_METADATA,
      descriptor
    );

    if (!isNil(metadata)) {
      this.cooldown = metadata;
      return;
    }

    const routerMetadata = Reflector.reflectMetadata<CommandCooldownOptions>(
      COOLDOWN_METADATA,
      host.metatype
    );

    if (!isNil(routerMetadata)) {
      this.cooldown = routerMetadata;
      return;
    }
  }

  private _setConfiguration(): void {
    const {
      alias,
      caseSensitive,
      description,
      hidden,
      tags,
      fullDescription,
      deleteCommandMessage,
      usage,
    } = this.commandOptions;

    const { group } = this.routerOptions;

    this.alias = alias ?? [];

    this.description = description ?? fullDescription ?? "";
    this.fullDescription = fullDescription ?? description ?? "";
    this.tags = tags ?? [];

    this.deleteCommandMessage = deleteCommandMessage ?? false;
    this.usage = usage ?? null;

    this.hidden = isNil(hidden) ? true : hidden;
    this.caseSensitive = isNil(caseSensitive) ? false : caseSensitive;
    this.commandGroup = group!;
  }

  public hasParams(): boolean {
    return !isEmpty(this.params);
  }
}
