import { MethodDescriptor, Reflector } from '@core/di';
import {
  ApplicationCommandConfiguration,
  ApplicationCommandMetadata,
  ApplicationCommandRoute,
  ApplicationCommandType,
  CommandParameterType,
  getFunctionParameters,
  isNil,
  isNilOrEmpty,
  PARAM_METADATA,
  RouterDecoratorOptions,
  SlashCommandChannelParameterOptions,
  SlashCommandMetadata,
  SlashCommandNumberParameterOptions,
  SlashCommandParameter,
  SlashCommandParameterApiType,
  SlashCommandParameterMetadata,
  SlashCommandStringParameterOptions,
  Type,
  W_PARAM_TYPE,
  ɵHasParamType,
} from '@watsonjs/common';

export class ApplicationCommandConfigurationImpl
  implements ApplicationCommandConfiguration
{
  public name: string;
  public description: string | null;
  public type: ApplicationCommandType;

  public params: SlashCommandParameter[];

  constructor(
    public host: ApplicationCommandRoute,
    private options: ApplicationCommandMetadata | SlashCommandMetadata,
    private routerOptions: RouterDecoratorOptions,
    private method: MethodDescriptor
  ) {
    const { name, type } = options;
    this.name = name;
    this.type = <ApplicationCommandType>type;

    this.description = (<SlashCommandMetadata>options).description ?? null;
    this._applyCommandConfiguration();
  }

  private _applyCommandConfiguration() {
    const { host, method } = this;

    const parameters = Reflector.reflectMethodParameters(
      host.metatype,
      method.descriptor.name
    );

    const paramMetadata = Reflector.reflectMetadata<
      SlashCommandParameterMetadata[]
    >(PARAM_METADATA, method.descriptor);

    const parameterNames = getFunctionParameters(method.descriptor);

    for (let i = 0; i < parameters.length; i++) {
      const parameter = parameters[i];
      const metadata = paramMetadata.find((meta) => meta.parameterIndex === i);
      const type = ((<any>parameter) as ɵHasParamType)[W_PARAM_TYPE];
      const apiType = this._getApiParameterType(type);

      if (isNil(metadata)) {
        if (isNil(type)) {
          continue;
        }

        if (this.type !== ApplicationCommandType.Message) {
          throw `Only SlashCommands can have parameters assigned to them`;
        }

        const name = parameterNames[i];

        this.params.push({
          paramType: type,
          apiType: apiType,
          default: null,
          description: name,
          name: name,
          optional: false,
          type: null,
          configuration: undefined,
          parameterIndex: i,
        });
        continue;
      }

      const commandParameter: SlashCommandParameter = {
        ...metadata,
        paramType: type,
        apiType,
      };

      this._validateParameter(commandParameter);

      this.params.push(commandParameter);
    }
  }

  private _validateParameter(parameter: SlashCommandParameter) {
    const { name, description, choices } =
      parameter as SlashCommandNumberParameterOptions &
        SlashCommandChannelParameterOptions &
        SlashCommandStringParameterOptions &
        Required<SlashCommandParameter>;

    if (!isNil(choices)) {
      const { length } = choices;
      if (length > 25) {
        throw `Slash Commands can only have a maximum of 25 characters has ${length}`;
      }
    }

    if (isNilOrEmpty(name) || name.length > 32) {
      throw `Slash command parameter names can only have a maximum of 32 characters and cannot be empty`;
    }

    if (isNilOrEmpty(description) || description.length > 100) {
      throw `Slash command parameter descriptions can only have a maximum of 100 characters and cannot be empty`;
    }
  }

  private _getApiParameterType(
    type: SlashCommandParameterApiType | Type
  ): SlashCommandParameterApiType {
    if (typeof type === "number") {
      if (
        type < SlashCommandParameterApiType.String ||
        type > SlashCommandParameterApiType.Number
      ) {
        throw `Unknown SlashCommandParameterApiType ${type}`;
      }

      return type;
    }
    const paramType = type[W_PARAM_TYPE] as CommandParameterType;

    const isOfType = (...types: CommandParameterType[]) => {
      for (const t of types) {
        if (paramType === t) {
          return true;
        }
      }
      return false;
    };

    if (
      isOfType(
        CommandParameterType.String,
        CommandParameterType.StringExpandable,
        CommandParameterType.StringLiteral,
        CommandParameterType.StringTemplate,
        CommandParameterType.URL,
        CommandParameterType.CodeBlock,
        CommandParameterType.Custom,
        CommandParameterType.Emote
      )
    ) {
      return SlashCommandParameterApiType.String;
    }

    if (isOfType(CommandParameterType.Number)) {
      return SlashCommandParameterApiType.Number;
    }

    if (isOfType(CommandParameterType.Channel)) {
      return SlashCommandParameterApiType.Channel;
    }

    if (isOfType(CommandParameterType.User, CommandParameterType.Role)) {
      return SlashCommandParameterApiType.Mentionable;
    }

    throw `Unknown SlashCommandParameterApiType ${type}`;
  }
}
