import {
  Collection,
  DMChannel,
  Message,
  MessageEmbed,
  MessageReaction,
  NewsChannel,
  ReactionCollector,
  TextChannel,
} from "discord.js";
import { Observable, Subject } from "rxjs";

import { CustomComponentException } from "../../exceptions/custom-component.exception";
import { isNil } from "../../utils";

export interface ReactiveOptions {
  /**
   * The time the message stays reactive for.
   * A lot of listeners might impact the performance of your application.
   * @default 60000ms One minute
   */
  timeReactive?: number;
  reactionsFilter?: (r: MessageReaction) => boolean;
}

export abstract class WatsonComponent<O extends ReactiveOptions> {
  protected channel: TextChannel | DMChannel | NewsChannel;
  protected content: string | MessageEmbed;
  protected _messageRef: Message;
  protected isSent: boolean;
  protected timeReactive: number;
  protected options: O;
  private _reactionListener: Subject<MessageReaction>;

  private _reactionCollector: ReactionCollector;
  private _collection: Collection<string, MessageReaction>;
  public onReaction: Observable<MessageReaction>;

  constructor(content: string | MessageEmbed, options: O) {
    this.content = content;
    this.options = options;
    this.isSent = false;
    this._reactionListener = new Subject();
    this.options.timeReactive ??= 60000;
  }

  /**
   * Is called after the event listeners are attached.
   */
  protected abstract onListenerAttach(): void | Promise<void>;

  /**
   * Sends the message to the channel specified
   */
  public async send(channel: TextChannel | DMChannel | NewsChannel) {
    if (this.isSent === true) {
      throw new CustomComponentException(
        "The message of the component was already sent"
      );
    }

    this.channel = channel;

    this._messageRef = await this.channel.send(this.content as any);
    this.isSent = true;
    await this.attachReactionListener();
  }

  private async attachReactionListener() {
    const filter = this.options.reactionsFilter ?? (() => true);

    this._reactionCollector = this._messageRef.createReactionCollector({
      filter,
      time: this.options.timeReactive,
    }) as any;

    this._reactionCollector.on("collect", (reaction) => {
      this._reactionListener.next(reaction);
    });

    this._reactionCollector.on("end", (collection) => {
      this._reactionListener.complete();
      this._collection = collection;
    });

    this.onReaction = this._reactionListener.asObservable();

    await this.onListenerAttach();
  }

  /**
   * @returns All reactions on the message object.
   * @returns Undefined when the listener isn't completed.
   */
  public get collection() {
    if (!this._reactionListener.closed) {
      return undefined;
    }

    return this._collection;
  }

  /**
   * @returns The message object that was sent.
   * @returns Undefined when the message was not yet sent.
   */
  public get message() {
    if (!this.isSent) {
      return undefined;
    }

    return this._messageRef;
  }

  /**
   * Edits the message to change its content.
   * @returns The updated message
   */
  public update(updatedContent: string | MessageEmbed) {
    return this._messageRef.edit(updatedContent as any);
  }

  public delete() {
    if (!this.isSent) {
      throw new CustomComponentException(
        "Cannot delete a message that has not been sent"
      );
    }

    return this._messageRef.delete();
  }

  public codeblockify(content: string, type?: string) {
    type = isNil(type) ? "" : type;
    return `\`\`\`${type}\n` + content + "\n```";
  }
}
