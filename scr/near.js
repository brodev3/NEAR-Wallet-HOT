const { connect, keyStores, KeyPair } = require("near-api-js");
const nearAPI = require("near-api-js");
const log = require('./utils/logger');

let get_KeyPair = async (privateKey) => {
    let kp = KeyPair.fromString(privateKey);
    return kp;
};

let get_GameStatus = async (near_account_id, keyPair) => {
    const myKeyStore = new keyStores.InMemoryKeyStore();
    await myKeyStore.setKey("mainnet", near_account_id, keyPair);
    const connection = await connect({
        networkId: "mainnet",
        nodeUrl: "https://rpc.mainnet.near.org",
        keyStore: myKeyStore,
    });
    const wallet = await connection.account(near_account_id);
    let SuccessValue = null;
    try {
        const callContract = await wallet.functionCall({
            contractId: "game.hot.tg",
            methodName: "get_user",
            args: {
                "account_id": near_account_id
            },
        });
        SuccessValue = callContract.status.SuccessValue;
    }
    catch (err){
        log.error(err)
    }
    
    const decodedValue = JSON.parse(Buffer.from(SuccessValue, 'base64').toString('utf-8'));
    return decodedValue;
};

let get_LastHash = async (near_account_id, keyPair) => {
    const myKeyStore = new keyStores.InMemoryKeyStore();
    await myKeyStore.setKey("mainnet", near_account_id, keyPair);
    const connection = await connect({
        networkId: "mainnet",
        nodeUrl: "https://rpc.mainnet.near.org",
        keyStore: myKeyStore,
    });
    const wallet = await connection.account(near_account_id);
    const transactions = await wallet.getTransactions(accountId, 10, null);
    const lastTransactionHash = transactions[0].hash;
    return lastTransactionHash;
};

let get_HotBalance = async (near_account_id, keyPair) => {
    const myKeyStore = new keyStores.InMemoryKeyStore();
    await myKeyStore.setKey("mainnet", near_account_id, keyPair);
    const connection = await connect({
        networkId: "mainnet",
        nodeUrl: "https://rpc.mainnet.near.org",
        keyStore: myKeyStore,
    });
    const wallet = await connection.account(near_account_id);
    let response = null;
    try {
        const contract = new nearAPI.Contract(wallet, "game.hot.tg", {
            viewMethods: ["ft_balance_of"],
        });
        response = await contract.ft_balance_of({ account_id: near_account_id });
    }
    catch (err){
        log.error(err)
    }
    return response;
};

let claim = async (near_account_id, keyPair, signature) => {
    const myKeyStore = new keyStores.InMemoryKeyStore();
    await myKeyStore.setKey("mainnet", near_account_id, keyPair);
    const connection = await connect({
        networkId: "mainnet",
        nodeUrl: "https://rpc.mainnet.near.org",
        keyStore: myKeyStore,
    });
    const wallet = await connection.account(near_account_id);
    try {
        const callContract = await wallet.functionCall({
            contractId: "game.hot.tg",
            methodName: "l2_claim",
            args: {
                "max_ts": signature.max_ts,
                "mining_time": signature.mining_time,
                "signature": signature.signature
            },
        });
    }
    catch (err){
        log.error(err)
    }
    return;
};

module.exports.get_GameStatus = get_GameStatus;
module.exports.get_KeyPair = get_KeyPair;
module.exports.get_LastHash = get_LastHash;
module.exports.get_HotBalance = get_HotBalance;
module.exports.claim = claim;
