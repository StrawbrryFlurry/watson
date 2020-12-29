import { CommandArgumentType } from '@watson/common';

export const ReadableArgumentTypeHelper = (type: CommandArgumentType) => {
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
    case CommandArgumentType.SENTENCE:
      readableName = "Sentence (Multi word text)";
      break;
    case CommandArgumentType.STRING:
      readableName = "String (Text)";
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
