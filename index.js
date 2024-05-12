const manager = require("./scr/tg/accountManager");
const near_wallet = require("./scr/near_wallet");

(async () => {
    let accounts = await manager.start_Accounts();
    for (let account in accounts){
        await near_wallet.farming(accounts[account]);
    }

})();

