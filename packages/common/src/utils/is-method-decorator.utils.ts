export const isMethodDecorator = <T>(
  descriptor: TypedPropertyDescriptor<T> | PropertyDecorator | undefined = {}
): boolean => "value" in descriptor;
