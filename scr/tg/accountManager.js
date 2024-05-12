const utils = require("../utils/utils");
const telegram = require("./tg");
const { SocksProxyAgent } = require('socks-proxy-agent');
const axios = require('axios');
const log = require("../utils/logger");
const axiosRetry = require('axios-retry').default;
const near = require("../near");

class Account {
    constructor(username, session, api_id, api_hash, proxy, hotToken, privateKey) {
        this.username = username;
        this.api_id = api_id;
        this.api_hash = api_hash;
        this.session = session;
        this.proxy = proxy;
        this.hotToken = hotToken;
        this.privateKey = privateKey;
        this.near_account_id = username + ".tg";
        this.UA = utils.get_UA();
    };

    async connect(){
        this.client = await telegram.get_Client(this.session, this.api_id, this.api_hash, this.proxy);
        let options = {};
        if (this.proxy != false){
            this.proxyAgent  = new SocksProxyAgent(`socks5://${this.proxy.username}:${this.proxy.password}@${this.proxy.ip}:${this.proxy.port}`);
            options = {
                httpsAgent: this.proxyAgent, 
                httpAgent: this.proxyAgent,
                headers: {'User-Agent': this.UA}
            };
        }
        else 
            options = {
                headers: {'User-Agent': this.UA}
            };
        this.axios = await axios.create(options);
        axiosRetry(this.axios, { 
            retries: 10,
            retryDelay: (retryCount) => {
                log.info(`Retry attempt: ${retryCount}`);
                return retryCount * 2000; // time interval between retries
            }, });
    };
};

let add_NewAccount = function (accountData){
    let accountsData = utils.get_AccountsData();
    let listAccounts = Object.keys(accountsData);
    if (accountData.username in listAccounts == false)
        accountsData[accountData.username] = {
            api_id: accountData.api_id,
            api_hash: accountData.api_hash,
            session: accountData.session,
            proxy: accountData.proxy,
            hotToken: accountData.hotToken,
            privateKey: accountData.privateKey
        }
        utils.write_AccountsData(accountsData);
        log.info(`${accountData.username} added`);
};

let start_Accounts = async function (){
    let accountsData = utils.get_AccountsData();
    let listAccounts = Object.keys(accountsData);
    let result = {};
    for (let account of listAccounts){
        let accountData = accountsData[account];
        result[account] = new Account(account, accountData.session, accountData.api_id, accountData.api_hash, accountData.proxy, accountData.hotToken, accountData.privateKey);
        result[account].keyPair = await near.get_KeyPair(result[account].privateKey);
    };
    return result;
};

module.exports.add_NewAccount = add_NewAccount;
module.exports.start_Accounts = start_Accounts;
module.exports.Account = Account;