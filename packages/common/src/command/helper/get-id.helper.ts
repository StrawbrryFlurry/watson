import { CHANNEL_MENTION_REGEXP, ROLE_MENTION_REGEXP, USER_MENTION_REGEXP } from '../../constants';

export type IGetIdTypes = "role" | "user" | "channel";

export function getId(type: IGetIdTypes, id: string) {
  let regExp: RegExp;

  switch (type) {
    case "channel":
      regExp = CHANNEL_MENTION_REGEXP;
      break;
    case "role":
      regExp = ROLE_MENTION_REGEXP;
      break;
    case "user":
      regExp = USER_MENTION_REGEXP;
      break;
  }

  try {
    const parseResult = id.match(regExp);

    if (parseResult === null) {
      return undefined;
    }

    const [parsed] = id.match(/(\d+)/)!;
    return parsed;
  } catch {
    return undefined;
  }
}
