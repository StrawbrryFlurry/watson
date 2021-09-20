import { WatsonEvent } from '@watsonjs/common';
import { ClientEvents } from 'discord.js';

export function parseToDiscordJsEvent(
  event: WatsonEvent
): keyof ClientEvents | "raw" {
  switch (event) {
    case WatsonEvent.CHANNEL_CREATE:
      return "channelCreate";
    case WatsonEvent.CHANNEL_DELETE:
      return "channelDelete";
    case WatsonEvent.CHANNEL_PINS_UPDATE:
      return "channelPinsUpdate";
    case WatsonEvent.CHANNEL_UPDATE:
      return "channelUpdate";
    case WatsonEvent.CLIENT_READY:
      return "ready";
    case WatsonEvent.GUILD_BAN_ADD:
      return "guildBanAdd";
    case WatsonEvent.GUILD_BAN_REMOVE:
      return "guildBanRemove";
    case WatsonEvent.GUILD_CREATE:
      return "guildCreate";
    case WatsonEvent.GUILD_DELETE:
      return "guildDelete";
    case WatsonEvent.GUILD_EMOJI_CREATE:
      return "emojiCreate";
    case WatsonEvent.GUILD_EMOJI_DELETE:
      return "emojiDelete";
    case WatsonEvent.GUILD_EMOJI_UPDATE:
      return "emojiUpdate";
    case WatsonEvent.GUILD_INTEGRATIONS_UPDATE:
      return "guildIntegrationsUpdate";
    case WatsonEvent.GUILD_MEMBERS_CHUNK:
      return "guildMembersChunk";
    case WatsonEvent.GUILD_MEMBER_ADD:
      return "guildMemberAdd";
    case WatsonEvent.GUILD_MEMBER_AVAILABLE:
      return "guildMemberAvailable";
    case WatsonEvent.GUILD_MEMBER_REMOVE:
      return "guildMemberRemove";
    case WatsonEvent.GUILD_MEMBER_SPEAKING:
      return "guildMemberSpeaking";
    case WatsonEvent.GUILD_MEMBER_UPDATE:
      return "guildMemberUpdate";
    case WatsonEvent.GUILD_ROLE_CREATE:
      return "roleCreate";
    case WatsonEvent.GUILD_ROLE_DELETE:
      return "roleDelete";
    case WatsonEvent.GUILD_ROLE_UPDATE:
      return "roleUpdate";
    case WatsonEvent.GUILD_UNAVAILABLE:
      return "guildUnavailable";
    case WatsonEvent.GUILD_UPDATE:
      return "guildUpdate";
    case WatsonEvent.INTERACTION_CREATE:
      return "inviteCreate";
    case WatsonEvent.INVITE_CREATE:
      return "inviteCreate";
    case WatsonEvent.INVITE_DELETE:
      return "inviteDelete";
    case WatsonEvent.MESSAGE_BULK_DELETE:
      return "messageDeleteBulk";
    case WatsonEvent.MESSAGE_CREATE:
      return "message";
    case WatsonEvent.MESSAGE_DELETE:
      return "messageDelete";
    case WatsonEvent.MESSAGE_REACTION_ADD:
      return "messageReactionAdd";
    case WatsonEvent.MESSAGE_REACTION_REMOVE:
      return "messageReactionRemove";
    case WatsonEvent.MESSAGE_REACTION_REMOVE_ALL:
      return "messageReactionRemoveAll";
    case WatsonEvent.MESSAGE_REACTION_REMOVE_EMOJI:
      return "messageReactionRemoveEmoji";
    case WatsonEvent.MESSAGE_UPDATE:
      return "messageUpdate";
    case WatsonEvent.PRESENCE_UPDATE:
      return "presenceUpdate";
    case WatsonEvent.RATE_LIMIT:
      return "rateLimit";
    case WatsonEvent.RAW:
      return "raw";
    case WatsonEvent.TYPING_START:
      return "typingStart";
    case WatsonEvent.USER_UPDATE:
      return "userUpdate";
    case WatsonEvent.VOICE_BROADCAST_SUBSCRIBE:
      return "subscribe" as any;
    case WatsonEvent.VOICE_BROADCAST_UNSUBSCRIBE:
      return "unsubscribe" as any;
    case WatsonEvent.VOICE_STATE_UPDATE:
      return "voiceStateUpdate";
  }

  return "raw";
}
