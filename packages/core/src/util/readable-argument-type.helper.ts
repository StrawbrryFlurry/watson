import { CommandArgument } from '@watsonjs/common';

export const ReadableArgumentTypeHelper = (type: CommandArgument) => {
  let readableName: string;

  switch (type) {
    case CommandArgumentType.CHANNEL:
      readableName = "Text Channel";
      break;
    case CommandArgumentType.DATE:
      readableName = "Date";
      break;
    case CommandArgumentType.NUMBER:
      readableName = "Number";
      break;
    case CommandArgumentType.ROLE:
      readableName = "Guild Role";
      break;
    case CommandArgumentType.STRING:
      readableName = "String (Multi word text marked with '\"')";
      break;
    case CommandArgumentType.TEXT:
      readableName = "Plain text";
      break;
    case CommandArgumentType.USER:
      readableName = "Guild Member";
      break;
    default:
      readableName = "Not Defined!";
      break;
  }

  return readableName;
};
