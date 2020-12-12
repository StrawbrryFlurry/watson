# Basic NestApplication bootstrapping process

NestFactory is called with the root module and optional configuration

The factory then goes trough the following steps:

- Creating a server instance // Optionally using a provided one
- Creating a configuration
- Creatign an ApplicationContainer that stores all Application Data such as modules using the configuration
- initializes the container

  - Sets the server instance in the container
  - initializes the server instance
  - Scans the root module for imports, exports and controllers and adds them in the container
  - Creates instances of each type for all modules in the container and adds them to the modules in the container

  // The modules in the container are stored with a random token as key and the module class as its value
  // Modules contain maps for their imports, injectables and so on in a map containing the prototype.name and a instance wrapper.

  // The wrapper gets created inside the addInjectable method of the module

  The instance wrapper has the following values while being set:

  - name: (provider as Type<Injectable>).name,
  - metatype: provider as Type<Injectable>,
  - instance: null,
  - isResolved: false,
  - scope: getClassScope(provider),
  - host: this, // The module

- After being constructed the class instance is being added to the instance property of the wrapper
