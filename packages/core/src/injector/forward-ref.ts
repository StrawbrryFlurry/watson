import { Type } from '@watsonjs/common';

export const forwardRef = (targetFn: () => Type) => ({ forwardRef: targetFn });
