import { Channel, Message, VoiceChannel } from "discord.js";

/**
 * Injects the channel that the
 * event was emitted from.
 */
export abstract class ChannelCtx extends Channel {}

/**
 * Injects the voice channel
 * that the user, who has used the command
 * is in.
 */
export abstract class VoiceChannelCtx extends VoiceChannel {}

/**
 * Injects the message that emitted
 * the event
 */
export abstract class MessageCtx extends Message {}
