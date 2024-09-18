const manager = require("./scr/tg/accountManager");
const near_wallet = require("./scr/near_wallet");

(async () => {
    let accounts = await manager.start_Accounts();
    for (let account in accounts){
        setTimeout(near_wallet.farming, (Math.floor(Math.random() * (20 - 2 + 1)) + 2) * 60_000, accounts[account]);
    }

})();

