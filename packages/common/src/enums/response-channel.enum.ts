export enum ResponseChannelType {
  /**
   * Sends the response as a direct message to the user.
   */
  DM = "channel:directmessage",
  /**
   * Sends the response to the same channel the command was executed in.
   */
  SAME = "channel:same",
  /**
   * Sends the response to a specific channel that needs to be specified.
   *
   * @default The same channel
   */
  OTHER = "channel:other",
}
