import "reflect-metadata";
import { CategoryMetaData, ICategory } from "../../build/cjs/v2";
import { Client, DApplicationCommand, DSimpleCommand } from "discordx";
import { Intents } from "discord.js";
import { importx } from "@discordx/importer";

export class Main {
  private static _client: Client;

  static get Client(): Client {
    return this._client;
  }

  static async start(): Promise<void> {
    this._client = new Client({
      botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    });

    this._client.once("ready", async () => {
      await this._client.initApplicationCommands();
      await this._client.initApplicationPermissions();

      console.log("Bot started");
      CategoryMetaData.get("Admin Commands").forEach(
        (cmd: (DApplicationCommand | DSimpleCommand) & ICategory) =>
          console.log(cmd.name, cmd.description, cmd.category)
      );
    });

    this._client.on("interactionCreate", (interaction) => {
      // do not execute interaction, if it's pagination (avoid warning: selectmenu/button interaction not found)
      if (interaction.isButton() || interaction.isSelectMenu()) {
        if (interaction.customId.startsWith("discordx@pagination@")) {
          return;
        }
      }
      this._client.executeInteraction(interaction);
    });

    await importx(__dirname + "/discords/**/*.{js,ts}");
    await this._client.login(process.env.BOT_TOKEN ?? "");
  }
}

Main.start();