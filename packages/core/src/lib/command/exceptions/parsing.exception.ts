import {
  ParameterConfiguration,
  RuntimeException,
  Token,
} from "@watsonjs/common";

export class ParsingException extends RuntimeException {
  public readonly token: Token | null;
  public readonly parameter: ParameterConfiguration | null;

  constructor(
    token: Token | null,
    parameter: ParameterConfiguration | null,
    message: string
  ) {
    super(message);
    this.token = token;
    this.parameter = parameter;
  }
}
