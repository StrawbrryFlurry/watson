export type ConditionalAny<T, A> = T extends any ? A : T;
export type ValuesOf<T extends any[]> = T[number];
