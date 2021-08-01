import { ITokenPosition } from './token.interface';

export enum CommandAstType {
  /** The root node of a command AST */
  WatsonCommand,
  /** Prefix used for the command */
  Prefix,
  /** The main command and all subsequent sub commands used */
  Command,
  /** Arguments provided for the command */
  Argument,
  /** A parameter of a command route which a
   * given argument was matched to */
  Parameter,
}

export interface IAstElement<T = any> {
  position: ITokenPosition;
  /** Raw text that this element was parsed from */
  text: string;
  /** The value that this element holds */
  value?: T;
}

export interface IAstPrefix extends IAstElement<string> {
  type: CommandAstType.Prefix;
}

export interface IAstCommand extends IAstElement<string> {
  type: CommandAstType.Command;
  /** Sub commands for this command */
  subCommand?: IAstCommand[];
}

export interface IAstArgument<T = any> extends IAstElement<T> {
  type: CommandAstType.Argument;
  /** The parameter this argument belongs to */
  parameter: {
    type: CommandAstType.Parameter;
    /** The name specified for the parameter in the command route */
    name: string;
  };
}

/**
 *
 * An Ast (Abstract Syntax tree) is a parsed representation
 * of a message command.
 *
 * Command: `!make embed -Header Hi -Body some body text 42`
 *
 * Example Parsed AST:
 * ```
 * {
 *  type: "WatsonCommand",
 *  start: 0,
 *  end: 242,
 *  parameter: {
 *    start: 0,
 *    end: 0,
 *    text: "!",
 *    value: "!",
 *  },
 *  command: {
 *    type: "Command",
 *    start: 1,
 *    end: 4,
 *    text: "make",
 *    value: "make",
 *    subCommand: [
 *      {
 *        type: "Command",
 *        start: 6,
 *        end: 10,
 *        text: "embed",
 *        value: "embed",
 *      },
 *    ],
 *  },
 *  arguments: {
 *    header: {
 *      type: "Argument",
 *      start: 0,
 *      end: 0,
 *      text: "Hi",
 *      value: "Hi",
 *      parameter: {
 *        type: "Parameter",
 *        name: "Header",
 *      },
 *    },
 *    body: {
 *      type: "Argument",
 *      start: 0,
 *      end: 0,
 *      text: "some body text",
 *      value: "some body text",
 *      parameter: {
 *        type: "Parameter",
 *        name: "Body",
 *      },
 *    },
 *    lifespan: {
 *      type: "Argument",
 *      start: 0,
 *      end: 0,
 *      text: "42",
 *      value: 42,
 *      parameter: {
 *        type: "Parameter",
 *        name: "LifeSpan",
 *      },
 *    },
 *  },
 * };
 * ```
 */
export interface ICommandAst<Arguments = any> {
  type: CommandAstType.WatsonCommand;
  /** Prefix used for the command */
  prefix: IAstPrefix;
  /** The main command and all subsequent sub commands used */
  command: IAstCommand;
  /** Arguments provided for the command */
  arguments: {
    [K in keyof Arguments]: IAstArgument;
  };
}
