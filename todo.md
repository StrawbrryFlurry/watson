# TODOs

Todos for the initial MVP (Minimum Viable Product) and the next beta release.

# Scope - (MVP)

## Different provider scopes for injectables

Right now all injectables are initialized during the bootstrapping process. We would like to also support providers that are instantiated at runtime depending on the use case.

```
Singleton (Default) - Instantiated during bootstrapping, shared among all modules that import the same exporting module.

Transient - Instantiated for each command / event call.

Scoped - Instantiated for every scope if present, otherwise the module is used as a scope.
```

## Add more providers to the module DI scope

## Migrate parameter injectables to services

Migrate services like the `ComponentFactory` or `inquirables` as well as to transient providers that öcan be injected to a receiver / service instead of the method.

## Re-implement the Command decorator

Change the registration to work with the parameters provided in the command method instead of the parameters provided in its configuration.

```TS
@Receiver()
class SomeReceiver {
  /**
   * `!boop @Michael`
   * > Boop Michael :3
   */
  @Command("boop")
  boop(mention: UserMention) {
    const { user } = mention;
    return `Boop ${user.username} :3`;
  }
}
```

## Rate limiting

## Interceptors

See https://docs.nestjs.com/interceptors#interceptors

## Improve DI token management

All custom providers should use a `InjectionToken` instead of a class / string reference.

Internal providers should be more distinguishable within a modules Provider / Injectable map.

## Change the `UsePipe` to fit a unique use case

Update the `UsePipe` decorator so that it can be used to update an argument of a command after it has been parsed.

## Rework injectable metadata like the command channel or user e.g. `InjectChannel`

Should these injectables also be migrated to transient providers? If not how should they be parsed if they stay in the command method? Should they get a type like `UserChannelContext` instead?

## Make `CommandContainer`, Parser and such "public"

Should the dev have access to the parsed results and update them if needed? If so, how would this be done?

## Update error handling

During the rewrite of the parsing / command implementation the error handling did not get updated. It should be able to provide feedback about parsing errors as well as errors thrown within a command / event context.

## Callbacks for commands?

```TS
@Receiver()
class SomeReceiver {
  @CallbackFor("boop", {
    step: "boop-accepted",
    verifyFn?: (messageResponse: Message / MessageAST) => boolean
  })
  onBoop(response: string, commandArgs?: [unknown]) {
    if(response === "y") {
      const [{user}] = commandArgs;
      return `Boop ${username}!`;
    }
  }

  @Command("boop")
  boop(boopee: UserMention) {
    const { user } = boopee;
    return `Are you sure you want to boop ${user.username}? <y / n>`;
  }
}
```

## Prefixes should be injectables / providers

Custom command prefixes need to be injectables constructed by the framework in oder to access other framework providers.

# Scope - Beta@Next

## Decouple the framework from DiscordJs

Use standardized classes for Discord objects and the client (`DiscordAdapter`) instead of the ones provided by DiscordJs.

This is to decouple the framework form DiscordJs and support other clients in the future.

## e2e / unit testing support

Initial release of the `@watsonjs/testing` module with initial testing capabilities. See `@angular/core/testing` / `@nestjs/testing`.

## Support for slash commands

Support Discord slash commands.

## Support sharding

Support sharding - Maybe across multiple servers?

## Web Dashboard

Integrated web API & boilerplate to manage the bot instance and configuration.

## Database / TypeORM module

## Support for external modules
