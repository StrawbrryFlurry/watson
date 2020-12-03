import { green, white, yellow } from 'chalk';

export const log = (type: string, message: string) => {
  const d = new Date();
  console.log(
    green(`[DJS] ${process.pid}`),
    white(
      `${d.getHours()}:${d.getMinutes()} ${d.getDate()}.${
        d.getMonth() + 1
      }.${d.getFullYear()}`
    ),
    yellow(`[${type}]`),
    green(message)
  );
};
