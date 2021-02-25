export enum CommandTokenType {
  PARAMETER = "command:token:parameter",
  ARGUMENT = "tokenizer:type:argument",
  STRING_ARGUMENT = "tokenizer:type:string.argument",
  BASE = "tokenizer:type:base",
}

export interface CommandToken {
  content: string;
  type: CommandTokenType;
}
