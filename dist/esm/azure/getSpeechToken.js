import axios from 'axios';
export async function getSpeechToken(options) {
    const speechKey = options?.apiKey || process.env.AZURE_SPEECH_KEY;
    const speechRegion = options?.region || process.env.AZURE_SPEECH_REGION;
    if (!speechKey || !speechRegion || speechKey === 'paste-your-speech-key-here' || speechRegion === 'paste-your-speech-region-here') {
        return JSON.stringify({ data: { error: 'You forgot to add your speech key or region to the .env file.' }, status: 400 });
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
        const tokenResponse = await axios.post(url, null, headers);
        return JSON.stringify({ data: { token: tokenResponse.data, region: speechRegion }, status: 200 });
    }
    catch (err) {
        return JSON.stringify({ data: { error: 'There was an error authorizing your speech key.' }, status: 401 });
    }
}
