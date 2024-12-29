export interface GetSpeechTokenOptions {
    endpoint?: string;
    apiKey?: string;
    region?: string;
}
export interface GetSpeechTokenResponse {
    data: string;
    status: number;
}
export declare function getSpeechToken(options?: GetSpeechTokenOptions): Promise<GetSpeechTokenResponse>;
//# sourceMappingURL=getSpeechToken.d.ts.map