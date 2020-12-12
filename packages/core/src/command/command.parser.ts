import { Message } from 'discord.js';
import { ClientEvents } from 'discord.js';
import { WatsonApplicationContext } from './../watson-application-context';

export class CommandParser {
    private context: WatsonApplicationContext;
    
    public CommandParser(context: WatsonApplicationContext) {
        this.context = context;
    }

    public parse(message: Message) {
        // Check if prefix matches (maybe)
        // Check if command registered
        // Check if command takes subcommand
        // Parse agruments according to specification
    }
}