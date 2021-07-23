import { CommandTokenKind, ICommandToken } from '@watsonjs/common';

export class CommandToken implements ICommandToken {
  public rawContent: string;
  public type: CommandTokenKind;
  public startIndex: number;
  public endIndex: number;
  public tokenIndex: number;

  constructor(initialChar: string = "") {
    this.rawContent = initialChar;
  }

  public append(char: string) {
    this.rawContent = String(this.rawContent) + String(char);
  }

  public markAsCompleted(lineIdx: number) {
    this.endIndex = lineIdx;
  }

  public getCharAtIndex(idx: number) {
    return this.rawContent.charAt(idx);
  }

  public get content() {
    return this.type === CommandTokenType.STRING_ARGUMENT
      ? this.rawContent.substr(1).substring(0, this.rawContent.length - 2)
      : this.rawContent;
  }

  public get hasFinished() {
    return !!this.endIndex;
  }
}
