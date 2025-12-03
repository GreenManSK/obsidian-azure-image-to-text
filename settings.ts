import { IAzureImageToTextPlugin } from 'interfaces';
import { App, PluginSettingTab, Setting } from 'obsidian';

export class AzureImageToTextSettingsTab extends PluginSettingTab {
    constructor(
        app: App,
        private plugin: IAzureImageToTextPlugin
    ) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('API Key')
            .setDesc('API Key for your azure deployment')
            .addText((text) =>
                text
                    .setPlaceholder('API Key...')
                    .setValue(this.plugin.settings.apiKey)
                    .onChange(async (value) => {
                        this.plugin.settings.apiKey = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Endpoint')
            .setDesc('Azure endpoint URL')
            .addText((text) =>
                text
                    .setPlaceholder('Endpoint...')
                    .setValue(this.plugin.settings.endpoint)
                    .onChange(async (value) => {
                        this.plugin.settings.endpoint = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Model Name')
            .setDesc('Name of the model to use')
            .addText((text) =>
                text
                    .setPlaceholder('Model name...')
                    .setValue(this.plugin.settings.modelName)
                    .onChange(async (value) => {
                        this.plugin.settings.modelName = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Deployment Name')
            .setDesc('Azure deployment name')
            .addText((text) =>
                text
                    .setPlaceholder('Deployment name...')
                    .setValue(this.plugin.settings.deploymentName)
                    .onChange(async (value) => {
                        this.plugin.settings.deploymentName = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Prompt')
            .setDesc('Default prompt for image to text conversion')
            .addTextArea((textArea) =>
                textArea
                    .setPlaceholder('Prompt...')
                    .setValue(this.plugin.settings.prompt)
                    .onChange(async (value) => {
                        this.plugin.settings.prompt = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Processed tag')
            .setDesc(
                'Name of a tag that will be added to notes to identify them as processed'
            )
            .addText((text) =>
                text
                    .setPlaceholder('ai/processed')
                    .setValue(this.plugin.settings.processedTag)
                    .onChange(async (value) => {
                        this.plugin.settings.processedTag = value;
                        await this.plugin.saveSettings();
                    })
            );
    }
}
