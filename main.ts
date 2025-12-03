import { AzureImageToTextSettings, IAzureImageToTextPlugin } from 'interfaces';
import { App, Modal, Notice, Plugin, TFile } from 'obsidian';
import { AzureImageToTextSettingsTab } from 'settings';
import OpenAI from 'openai';

const DEFAULT_SETTINGS: AzureImageToTextSettings = {
    apiKey: '',
    endpoint: 'https://...',
    modelName: 'gpt-5-chat',
    deploymentName: 'gpt-5-chat',
    prompt: 'You are assistant, used to transcribe text from photos to text.',
    processedTag: 'ai/processed',
};

export default class MyPlugin
    extends Plugin
    implements IAzureImageToTextPlugin
{
    settings: AzureImageToTextSettings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new AzureImageToTextSettingsTab(this.app, this));

        this.addCommand({
            id: 'obsidian-azure-image-to-text',
            name: 'Add text from images to the note',
            callback: () => {
                this.processActiveFile();
            },
        });
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private async processActiveFile() {
        const file = this.app.workspace.getActiveFile();
        if (!file) {
            return;
        }
        const cache = this.app.metadataCache.getFileCache(file);
        if (!cache) {
            return;
        }

        const isProcessed = cache?.frontmatter?.tags?.contains(
            this.settings.processedTag
        );

        if (isProcessed) {
            new Notice('This file was already analyzed');
            return;
        }

        const notice = new Notice('Starting', 0);
        const imageFiles = [] as TFile[];
        cache.embeds?.forEach((link) => {
            const linked = this.app.metadataCache.getFirstLinkpathDest(
                link.link,
                file.path
            );
            if (linked?.extension && this.isImage(linked?.extension)) {
                imageFiles.push(linked);
            }
        });

        const client = new OpenAI({
            baseURL: this.settings.endpoint,
            apiKey: this.settings.apiKey,
            dangerouslyAllowBrowser: true,
        });

        const imageTexts = [] as string[];
        for (const index in imageFiles) {
            const image = imageFiles[index];
            notice.setMessage(
                `Processing ${+index + 1}/${imageFiles.length}: ${image.name}`
            );
            const arrayBuffer = await this.app.vault.readBinary(image);
            const base64 = this.arrayBufferToBase64(arrayBuffer);

            try {
                const completion = await client.chat.completions.create({
                    messages: [
                        { role: 'system', content: this.settings.prompt },
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: `data:image/${image.extension.toLowerCase()};base64,${base64}`,
                                    },
                                },
                            ],
                        },
                    ],
                    model: this.settings.deploymentName,
                    max_tokens: 1024,
                });
                const text = completion.choices[0].message.content;
                text && imageTexts.push(text);
            } catch (err) {
                new Notice(`API error for ${file.name}:`, err.message);
            }
        }

        notice.setMessage('Saving');

        await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
            if (!frontmatter.tags) {
                frontmatter.tags = [];
            }

            if (!frontmatter.tags.includes(this.settings.processedTag)) {
                frontmatter.tags.push(this.settings.processedTag);
            }
        });

        const divider = '\n\n---\n';
        await this.app.vault.append(
            file,
            `${divider}${imageTexts.join(divider)}`
        );

        notice.setMessage('Done');
    }

    private isImage(extension: string) {
        return extension
            .toLowerCase()
            .match(/(png|jpg|jpeg|gif|bmp|svg|webp|tif)/i);
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}

class SampleModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.setText('Woah!');
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
