const { connect, keyStores, KeyPair, utils } = require("near-api-js");
const nearAPI = require("near-api-js");
const log = require('./utils/logger');

function getDelayTime(retryCount) {
    return Math.pow(2, retryCount) * 1000; 
};

async function delay(delayTime) {
    return new Promise(resolve => setTimeout(resolve, delayTime)); 
};

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
    let retriesLeft = 5;
    let callContract = async (near_account_id, retriesLeft = 5) => {
        try {
            const callContract = await wallet.functionCall({
                contractId: "game.hot.tg",
                methodName: "get_user",
                args: {
                    "account_id": near_account_id
                },
            });
            return callContract.status.SuccessValue;
        }
        catch (err){
            if (retriesLeft > 0) {
                log.debug(`NearRetryer: retrying left ${retriesLeft}`)
                const delayTime = getDelayTime(5 - retriesLeft);
                await delay(delayTime);
                return await callContract(near_account_id, retriesLeft - 1);
            } else {
                log.debug(`NearRetryer: request error ${err}`)
                throw err;
            };
        };
    };
    let SuccessValue = await callContract(near_account_id);
    const decodedValue = JSON.parse(Buffer.from(SuccessValue, 'base64').toString('utf-8'));
    return decodedValue;
};

let get_NearBalance = async (near_account_id, keyPair) => {
    const myKeyStore = new keyStores.InMemoryKeyStore();
    await myKeyStore.setKey("mainnet", near_account_id, keyPair);
    const connection = await connect({
        networkId: "mainnet",
        nodeUrl: "https://rpc.mainnet.near.org",
        keyStore: myKeyStore,
    });
    const wallet = await connection.account(near_account_id);
    const balance = await wallet.getAccountBalance();
    const formattedBalance = {
        total: utils.format.formatNearAmount(balance.total, 5),
        available: utils.format.formatNearAmount(balance.available, 5)
      };
      
    return formattedBalance;
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
    let retriesLeft = 5;
    let callContract = async (signature, retriesLeft = 5) => {
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
            return callContract.status.SuccessValue;
        }
        catch (err){
            if (retriesLeft > 0) {
                log.debug(`NearRetryer: retrying left ${retriesLeft}`)
                const delayTime = getDelayTime(5 - retriesLeft);
                await delay(delayTime);
                return await callContract(signature, retriesLeft - 1);
            } else {
                log.debug(`NearRetryer: request error ${err}`)
                throw err;
            };
        };
    };
    await callContract(signature);
    return;
};

module.exports.get_GameStatus = get_GameStatus;
module.exports.get_KeyPair = get_KeyPair;
module.exports.get_LastHash = get_LastHash;
module.exports.get_HotBalance = get_HotBalance;
module.exports.claim = claim;
module.exports.get_NearBalance = get_NearBalance;
