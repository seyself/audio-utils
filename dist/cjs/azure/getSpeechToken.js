"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpeechToken = getSpeechToken;
const axios_1 = __importDefault(require("axios"));
async function getSpeechToken(options) {
    const speechKey = options?.apiKey || process.env.AZURE_SPEECH_KEY;
    const speechRegion = options?.region || process.env.AZURE_SPEECH_REGION;
    if (!speechKey || !speechRegion || speechKey === 'paste-your-speech-key-here' || speechRegion === 'paste-your-speech-region-here') {
        return JSON.stringify({ error: 'You forgot to add your speech key or region to the .env file.' });
    }
    const headers = {
        headers: {
            'Ocp-Apim-Subscription-Key': speechKey,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    try {
        let url = `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
        if (options?.endpoint) {
            url = `${options.endpoint}sts/v1.0/issueToken`;
        }
        const tokenResponse = await axios_1.default.post(url, null, headers);
        return JSON.stringify({ token: tokenResponse.data, region: speechRegion });
    }
    catch (err) {
        return JSON.stringify({ error: 'There was an error authorizing your speech key.' });
    }
}
