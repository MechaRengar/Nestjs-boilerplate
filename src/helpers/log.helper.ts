import { ConsoleLogColours } from '../constants';

export class LogHelper {
    static success({ message }: { message: string }) {
        console.log(ConsoleLogColours.fg.green, message);
    }
    static error({ message }: { message: string }) {
        console.log(ConsoleLogColours.fg.red, message);
    }
}
