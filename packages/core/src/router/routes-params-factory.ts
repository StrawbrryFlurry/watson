import { resolveAsyncValue } from '@core/utils';
import {
  CommandParameterMetadata,
  ExecutionContext,
  getFunctionParameters,
  HasProvScope,
  isFunction,
  isNil,
  ParameterMetadata,
  Type,
  W_PROV_SCOPE,
} from '@watsonjs/common';

export class RouteParamsFactory {
  public async createFromContext(
    params: Type[],
    paramMetadata: ParameterMetadata[],
    ctx: ExecutionContext
  ) {
    const resolvedParams: any[] = [];

    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      const metadata = paramMetadata.find(
        (metadata) => metadata.parameterIndex === i
      );

      if (!metadata) {
        const provScope = (param as any as HasProvScope)[W_PROV_SCOPE];

        /**
         * Only resolve context bound types as
         * other types will likely be used by
         * the command binding e.g AChannel,
         * AUser, AString... or other parts
         * of the framework.
         */
        if (provScope === "ctx") {
          resolvedParams[i] = await resolveAsyncValue(ctx.get(param));
        }

        continue;
      }

      const { factory } = metadata;

      if (isFunction(factory)) {
        resolvedParams[i] = await resolveAsyncValue(factory(ctx));
        continue;
      }

      const type = ctx.getType();
      let parameterValue: null | Promise<any> = null;

      switch (type) {
        case "command":
          parameterValue = this._resolveCommandParameter(ctx, i, metadata);
          break;
        case "event":
          parameterValue = this._resolveEventParameter();
          break;
        case "interaction":
          parameterValue = this._resolveInteractionParameter();
          break;
      }

      resolvedParams[i] = await resolveAsyncValue(parameterValue);
    }

    return resolvedParams;
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
      const { handler } = pipeline.getCommand();
      const parameterNames = getFunctionParameters(handler);

      name = parameterNames[idx];
    }

    const { ast } = pipeline;
    const { value } = ast!.arguments.get(name)!;

    return value;
  }

  private async _resolveEventParameter() {
    // TODO: I don't think there are any event parameters?
  }

  private async _resolveInteractionParameter() {
    // TODO:
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
