export class ArgumentOutOfRangeException<T> extends Error {
  constructor(argumentIndex: number, argumentValue: T) {
    super(
      `Argument at index: ${argumentIndex} - ${argumentValue} it outside the accepted range.`
    );
  }
}
