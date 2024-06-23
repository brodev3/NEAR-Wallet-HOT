const log = require("./utils/logger");
const telegram = require("./tg/tg");
const axiosRetry = require("./utils/axiosRetryer");
const near = require("./near");
const notion = require("./utils/notion");
const { getErrorTypeFromErrorMessage } = require("near-api-js/lib/utils/rpc_errors");

async function auth(Account){
    try {
        Account.axios.defaults.headers.common['telegram-data'] = ``;
        Account.axios.defaults.headers.common['Authorization'] = Account.hotToken;
        let respStatus = await axiosRetry.post(Account.axios, "https://api0.herewallet.app/api/v1/user/hot/web_auth", null);
        Account.axios.defaults.headers.common['telegram-data'] = respStatus.data.params;
        Account.TgWebData = respStatus.data.params;
    }
    catch (err){
        log.error(`Account: ${Account.username} ${err}`);
        console.log(err)
    };
};

async function get_NextClaim(Account){
    try {
        let game_state = await near.get_GameStatus(Account.near_account_id, Account.keyPair);
        let nextClaim = Math.floor(game_state.last_claim / 1000000) + (Math.floor(Math.random() * (136 - 121 + 1)) + 121) * 60 * 1000;
        return nextClaim;
    }
    catch (err){
        log.error(`Account: ${Account.username} ${err}`);
        console.log(err)
    };
};

async function claim(Account){
    try {
        await Account.connect();
        log.info(`${Account.username} connected`);
        await auth(Account);
        let game_state = await near.get_GameStatus(Account.near_account_id, Account.keyPair)
        let game_status = {
            game_state : game_state
        };
        game_status = JSON.stringify(game_status);
        let respStatus = await axiosRetry.post(Account.axios, "https://api0.herewallet.app/api/v1/user/hot/claim/status", game_status);
        let respClaim = await axiosRetry.post(Account.axios, "https://api0.herewallet.app/api/v1/user/hot/claim", game_status);
        let respSignature = await axiosRetry.post(Account.axios, "https://api0.herewallet.app/api/v1/user/hot/claim/signature", game_status);
        await near.claim(Account.near_account_id, Account.keyPair, respSignature.data)
        let nextClaimMS = (Math.floor(Math.random() * (123 - 117 + 1)) + 117) * 60 * 1000;
        let hot = await near.get_HotBalance(Account.near_account_id, Account.keyPair) / 1000000;
        setTimeout(claim, nextClaimMS, Account);
        log.info(`Account ${Account.username} | Claimed HOT. Balance: ${hot}`);
        await notion.findAndUpdatePage("Brothers", Account.username + ".tg", "HOT", hot);
        let nearBalance = await near.get_NearBalance(Account.near_account_id, Account.keyPair);
        await notion.findAndUpdatePage("Brothers", Account.username + ".tg", "NEAR", +nearBalance.available);
        await Account.client.disconnect();
        await Account.client.destroy();
        return true;
    }
    catch (err){
        log.error(`Account: ${Account.username} ${err}`);
        console.log(err)
    };
};

async function farming(Account){
    try {
        const currentTimestamp = Date.now();
        let nextClaim  = await get_NextClaim(Account);
        if (nextClaim <= currentTimestamp)
            await claim(Account);
        else 
            setTimeout(claim, nextClaim - currentTimestamp, Account);
            log.info(`Account ${Account.username} | Waiting claim...`);
        return;
    }
    catch (err){
        log.error(`Account ${Account.username} | Error: ${err}`);
    };
};

module.exports.farming = farming;
module.exports.auth = auth;


