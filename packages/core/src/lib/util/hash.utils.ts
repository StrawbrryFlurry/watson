import { h64 } from 'xxhashjs';

export const hash = (data: string): string => h64(data, 0x69).toString(16);
