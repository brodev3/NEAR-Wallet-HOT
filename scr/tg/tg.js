const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { Api } = require("telegram/tl");
const log = require("../utils/logger");

let get_Client = async (stringSession, apiId, apiHash, proxy) => {
    stringSession = new StringSession(stringSession);
    let options = {};
    if (proxy != false)
        options = {
            connectionRetries: 5,
            useWSS: false,
            proxy: proxy,
            autoReconnect: true
        };
    else
        options = {
            connectionRetries: 5,
            autoReconnect: true
        };
    const client = new TelegramClient(stringSession, Number(apiId), apiHash, options);
    let validSession = await client.connect();
    if (validSession)
        return client;
};

let get_TgWebData = async (client) => {
    let authUrl;
    try {
        const webview = await client.invoke(new Api.messages.RequestWebView({
            peer: 'herewalletbot',
            bot: 'herewalletbot',
            platform: 'android',
            fromBotMenu: false,
            url: 'https://api0.herewallet.app/api/v1/user/'
        }));
        authUrl = webview.url;
        authUrl = webview.url;
    } catch (error) {
        log.error('Error: ' + error);
        return null;
    } 
    return decodeURIComponent(authUrl.split('%26user')[1].split('&tgWebAppVersion')[0]);
};

module.exports.get_Client = get_Client;
module.exports.get_TgWebData = get_TgWebData;
