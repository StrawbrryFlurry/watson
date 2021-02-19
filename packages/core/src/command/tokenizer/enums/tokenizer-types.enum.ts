export enum TokenizerEventTypes {
  ARGUMENT_STRAT = "tokenizer:type:argument.start",
  BASE_START = "tokenizer:type:argument.start",
  CONTINUE = "tokenizer:type:continue",
  SENTENCE_START = "tokenizer:type:sentence.start",
  CURRENT_END = "tokenizer:typecurrent.end",
}

export enum TokenizerContextType {
  NONE = "tokenizer:context:none",
  START = "tokenizer:context:start",
  ARGUMENT = "tokenizer:type:argument",
  BASE = "tokenizer:type:base",
  SENTENCE = "tokenizer:type:sentence",
}
