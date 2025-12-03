import { Plugin } from 'obsidian';

export interface AzureImageToTextSettings {
    apiKey: string;
    endpoint: string;
    modelName: string;
    deploymentName: string;
    prompt: string;
    processedTag: string;
}

export interface IAzureImageToTextPlugin extends Plugin {
    settings: AzureImageToTextSettings;
    saveSettings: () => Promise<void>;
}
