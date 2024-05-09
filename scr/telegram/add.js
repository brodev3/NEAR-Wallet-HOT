const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const log = require("../utils/logger");
const manager = require("./accountManager");
const utils = require("../utils/utils");


(async () => {
    let data = utils.get_AccountsData();
    let listAccounts = Object.keys(data);
    for (let account of listAccounts){
        let accountData = data[account];
        console.log("Adding data to " + accountData.username)
        let token = await input.text("Hot token?");
        let privateKey = await input.text("privateKey?");
        data[account]["hotToken"] = token;
        data[account]["privateKey"] = privateKey;
        utils.write_AccountsData(data);
    };
})();