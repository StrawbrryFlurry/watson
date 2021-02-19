import { isObject } from 'class-validator';

import { mergeDefaults } from '../../utils';

export interface IPrefixOptions {
  /**
   * The prefixes that should be supported
   */
  prefix?: string[];
  /**
   * #TODO:
   * Custom prefix formatting per guild
   */
  customizable?: boolean;
  /**
   * Seperator between the prefix and the command
   * @example
   * prefix = foo
   * command = ban
   * separator = "-"
   *
   * foo-ban `@user`
   *
   * @default separator \s | " " e.g a single whitespace
   */
  separator?: string;
}

const DEFAULT_PREFIX_OPTIONS: IPrefixOptions = {
  customizable: false,
  separator: " ",
};

/**
 * Use this prefix class as an alternative to
 * the string prefix. It allows you to specify
 * the parsing of the prefix more in depth
 */
export class CommandPrefix {
  public readonly prefix: string[];
  public readonly customizable: boolean;
  public readonly separator: string;

  constructor(prefix: string);
  constructor(prefixes: string[]);
  constructor(options: IPrefixOptions);
  constructor(options: string | string[] | IPrefixOptions) {
    if (!Array.isArray(options) && isObject(DEFAULT_PREFIX_OPTIONS)) {
      options = mergeDefaults(
        options as IPrefixOptions,
        DEFAULT_PREFIX_OPTIONS
      );

      Object.assign(this, options);
    } else if (Array.isArray(options)) {
      this.prefix = options;
    } else {
      this.prefix = [options as string];
    }
  }

  public getFirst() {
    return this.prefix[0];
  }
}
