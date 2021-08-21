import { EOL } from 'os';

import { ArgumentOutOfRangeException } from '../exceptions';
import { isNil, isString } from '../utils/shared.utils';

/**
 * While not strictly necessary this StringBuilder
 * implementation allows for passing strings or
 * a collection of characters to be passed as
 * a reference and not by value. This is currently
 * used in the tokenizing process.
 *
 * @see {@link [C# StringBuilder](https://docs.microsoft.com/en-us/dotnet/api/system.text.stringbuilder?view=net-5.0)}
 */
export class StringBuilder {
  private _chars: string[];

  public get length(): number {
    return this._chars.length;
  }

  /**
   * The current characters of the StringBuilder
   */
  public get chars(): string[] {
    return this._chars;
  }

  /**
   * A default value for the StringBuilder
   */
  constructor(value?: string | StringBuilder) {
    if (value instanceof StringBuilder) {
      this._chars = value.chars;
    }

    if (isString(value)) {
      this.append(value);
    }
  }

  /**
   * If the character is present in the
   * StringBuilder
   */
  public has(char: string) {
    return this._chars.indexOf(char) === -1 ? false : true;
  }

  /**
   * Appends `value` to the StringBuilder
   */
  public append(value: string): StringBuilder;
  public append(value: string[]): StringBuilder;
  public append(value: number): StringBuilder;
  public append(value: number[]): StringBuilder;
  public append(value: StringBuilder): StringBuilder;
  public append(value: boolean): StringBuilder;
  public append(
    value: string | StringBuilder | string[] | number | number[] | boolean
  ): StringBuilder {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const v = value[i];
        this._saveAppendAsCharArray(v);
      }
    } else {
      this._saveAppendAsCharArray(value);
    }

    return this;
  }

  /**
   * Inserts `value` at `index` in the StringBuilder
   */
  public insert(value: string, index: number = 0): StringBuilder {
    if (isNil(value)) {
      return;
    }
    const v = value.split("");
    this._chars.splice(index, 0, ...v);
    return this;
  }

  /**
   * Appends the default line terminator
   * at the end of the current StringBuilder
   */
  public appendLine(): StringBuilder;
  /**
   * Appends the default line terminator
   * at after the newly added value.
   */
  public appendLine(value: string): StringBuilder;
  public appendLine(value?: string) {
    if (!isNil(value)) {
      this.append(value);
    }
    this.append(EOL);
    return this;
  }

  public toString(): string {
    return this._chars.join();
  }

  /**
   * Clears the data in the instance
   * and removes the reference to the
   * previous character array
   */
  public clear(): StringBuilder {
    this._chars = [];

    return this;
  }

  /**
   * Replaces all occurrences of `oldValue`
   * with `newValue` in this `StringBuilder`
   */
  public replace(oldValue: string, newValue: string = ""): StringBuilder {
    const tempString = this.toString();
    const regex = new RegExp(oldValue, "g");
    this._chars = tempString.replace(regex, newValue).split("");

    return this;
  }

  /**
   * Removes from the StringBuilder at `startIndex`
   * as many characters as specified in `length`
   */
  public remove(startIndex: number, length: number): string[] {
    const isIndexOutOfBounds = startIndex >= this.length || startIndex < 0;
    const endIndex = startIndex + length;
    const isLengthOutOfBounds = endIndex >= this.length || length < 0;

    if (isIndexOutOfBounds) {
      throw new ArgumentOutOfRangeException(0, startIndex);
    }

    if (isLengthOutOfBounds) {
      throw new ArgumentOutOfRangeException(1, length);
    }

    return this._chars.splice(startIndex, length);
  }

  /**
   * Same as {@link _appendAsCharArray} but
   * makes sure the value is a string
   */
  private _saveAppendAsCharArray(
    value?: string | number | boolean | StringBuilder
  ): void {
    if (isNil(value)) {
      return;
    }

    let v: string = value as string;

    if (!isString(value)) {
      if (value instanceof StringBuilder) {
        v = value.toString();
      } else {
        v = String(value);
      }
    }

    this._appendAsCharArray(v);
  }

  private _appendAsCharArray(value: string) {
    const charArray = value.split("");
    this._chars.push(...charArray);
  }
}
