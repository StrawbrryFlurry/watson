export enum CommandTokenType {
  PARAMETER = "command:token:parameter",
  ARGUMENT = "tokenizer:type:argument",
  STRING_ARGUMENT = "tokenizer:type:string.argument",
  BASE = "tokenizer:type:base",
}

export class CommandToken {
  public content: string;
  public type: CommandTokenType;
  public startIndex: number;
  public endIndex: number;
  public tokenIndex: number;

  constructor(initialChar: string = "") {
    this.content = initialChar;
  }

  public append(char: string) {
    this.content = String(this.content) + String(char);
  }

  public markAsCompleted(lineIdx: number) {
    this.endIndex = lineIdx;
  }

  public getCharAtIndex(idx: number) {
    return this.content.charAt(idx);
  }

  public get hasFinished() {
    return !!this.endIndex;
  }
}
