import {
  BaseRoute,
  CommandParameterMetadata,
  ExecutionContext,
  isFunction,
  isNil,
  PARAM_METADATA,
  ParameterMetadata,
  PipelineBase,
  SlashCommandParameterMetadata,
} from '@watsonjs/common';
import { getFunctionParameters, getInjectableDef, Reflector, resolveAsyncValue } from '@watsonjs/di';

export type RouteHandlerParameterFactory = (
  ctx: ExecutionContext
) => Promise<unknown[]>;

export class RouteParamsFactory {
  public create(routeRef: BaseRoute): RouteHandlerParameterFactory {
    const { metatype, propertyKey, type } = routeRef;

    const handlerParameters = Reflector.reflectMethodParameters(
      metatype,
      propertyKey
    );

    const parameterMetadata = Reflector.reflectMetadata<ParameterMetadata[]>(
      PARAM_METADATA,
      metatype,
      propertyKey,
      []
    )!;

    let resolveTypeParameterFn: (
      ctx: ExecutionContext,
      parameterIdx: number,
      metadata: ParameterMetadata
    ) => unknown = () => {};

    switch (type) {
      case "command":
        resolveTypeParameterFn = this._resolveCommandParameter.bind(this);
        break;
      case "event":
        resolveTypeParameterFn = this._resolveEventParameter.bind(this);
        break;
      case "interaction":
        resolveTypeParameterFn = this._resolveInteractionParameter.bind(this);
        break;
    }

    const resolvedParameterMetadata = handlerParameters.map(
      (parameter, idx) => {
        const metadata = parameterMetadata.find(
          (metadata) => metadata.parameterIndex === idx
        );

        if (!isNil(metadata)) {
          return metadata;
        }

        return null;
      }
    );

    return async (ctx: ExecutionContext): Promise<unknown[]> => {
      const resolvedParams: unknown[] = [];

      for (let i = 0; i < handlerParameters.length; i++) {
        const parameter = handlerParameters[i];
        const metadata = resolvedParameterMetadata[i];

        if (isNil(metadata)) {
          const { providedIn } = getInjectableDef(parameter);

          /**
           * Only resolve context bound types as
           * other types will likely be used by
           * the command binding e.g AChannel,
           * AUser, AString... or other parts
           * of the framework.
           */
          if (providedIn === "ctx") {
            resolvedParams[i] = await resolveAsyncValue(ctx.get(parameter));
            continue;
          }

          resolvedParams[i] = null;
          continue;
        }

        const { factory } = metadata;

        if (isFunction(factory)) {
          resolvedParams[i] = await resolveAsyncValue(factory(ctx));
          continue;
        }

        resolvedParams[i] = resolveTypeParameterFn(ctx, i, metadata);
      }

      return resolvedParams;
    };
  }

  private _resolveCommandParameter(
    ctx: ExecutionContext,
    idx: number,
    metadata?: ParameterMetadata
  ) {
    const pipeline = ctx.switchToCommand();
    const commandMetadata = (metadata ?? {}) as CommandParameterMetadata;

    let { name } = commandMetadata;

    if (isNil(name)) {
      name = this._getParameterNameFromPipeline(pipeline, idx);
    }

    const { ast } = pipeline;
    const { value } = ast!.arguments.get(name)!;

    return value;
  }

  private async _resolveEventParameter() {
    // TODO: I don't think there are any event parameters?
  }

  private _resolveInteractionParameter(
    ctx: ExecutionContext,
    idx: number,
    metadata?: ParameterMetadata
  ) {
    const pipeline = ctx.switchToInteraction();
    const interactionMetadata =
      metadata ?? ({} as SlashCommandParameterMetadata);

    let { name } = interactionMetadata as SlashCommandParameterMetadata;

    if (isNil(name)) {
      name = this._getParameterNameFromPipeline(pipeline, idx);
    }

    pipeline;
  }

  private _getParameterNameFromPipeline<T extends BaseRoute>(
    pipeline: PipelineBase<T>,
    parameterIdx: number
  ) {
    const { handler } = pipeline.route;
    const parameterNames = getFunctionParameters(handler);

    return parameterNames[parameterIdx];
  }
}

//   private async fromParamFactory(
//     ctx: ExecutionContext,
//     factory: ParamFactoryFunction
//   ) {
//     if (isFunction(factory)) {
//       return undefined;
//     }

//     const factoryResult = factory(ctx);
//     return resolveAsyncValue(factoryResult);
//   }

//   private fromInquirable(pipe: CommandPipelineHost, type: InquirableType) {
//     switch (type) {
//       case InquirableType.ASK:
//         return this.createAskInquirable(pipe);
//       case InquirableType.REACT:
//         return this.createReactInquirable(pipe);
//       case InquirableType.COLLECT:
//         return this.createCollectionInquirable(pipe);
//     }
//   }

//   private createAskInquirable(pipe: CommandPipelineHost): AskFunction {
//     const channel = pipe.getChannel() as TextChannel;
//     const askFilter = (message: Message) => message.author.id === pipe.user.id;

//     return async (
//       message: string | MessageEmbed,
//       options: AwaitMessagesOptions = {}
//     ) => {
//       await channel.send(message);

//       const { time = 10000 } = options;
//       const result = await channel.awaitMessages(askFilter, {
//         ...options,
//         max: 1,
//         time: time,
//       });

//       if (result.size === 0) {
//         return undefined;
//       }

//       return result.first();
//     };
//   }

//   private createReactInquirable(pipe: CommandPipelineHost): ReactFunction {
//     const channel = pipe.getChannel() as TextChannel;

//     return async (
//       message: string | MessageEmbed,
//       options: AwaitReactionsOptions = {},
//       customReactionFilter?: CollectorFilter
//     ) => {
//       const messageRef = await channel.send(message);

//       const { time = 10000 } = options;
//       const reactionFilter = customReactionFilter
//         ? customReactionFilter
//         : (reaction: MessageReaction, user: User) => user.id === pipe.user.id;

//       const result = await messageRef.awaitReactions(reactionFilter, {
//         ...options,
//         time,
//       });

//       if (result.size === 0) {
//         return undefined;
//       }

//       return result.array();
//     };
//   }

//   private createCollectionInquirable(
//     pipe: CommandPipelineHost
//   ): CollectFunction {
//     const { channel } = pipe;

//     return async (
//       message: string | MessageEmbed,
//       filter: CollectorFilter,
//       type,
//       options = {}
//     ) => {
//       const { time = 10000 } = options;
//       const messageRef = channel.send(message);

//       if (type === "message") {
//         const result = await channel.awaitMessages(filter, {
//           ...options,
//           time,
//         });

//         return result.array();
//       } else if (type === "reaction") {
//         const result = await (
//           await messageRef
//         ).awaitReactions(filter, {
//           ...options,
//           time,
//         });

//         return result.array();
//       }
//     };
//   }
