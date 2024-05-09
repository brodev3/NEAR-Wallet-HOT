const { connect, keyStores, KeyPair } = require("near-api-js");

// Приватный ключ

(async () => {
    const keyPair = KeyPair.fromString(privateKey);

// Получение учетной записи (account ID) из ключевой пары
    const accountId = keyPair.getPublicKey().toString();

console.log(accountId);

const myKeyStore = new keyStores.InMemoryKeyStore();
await myKeyStore.setKey("mainnet", accountId, keyPair);

const connection = await connect({
    networkId: "mainnet",
    nodeUrl: "https://rpc.mainnet.near.org",
    keyStore: myKeyStore,
});

const wallet = await connection.account(accountId);
console.log(accountId);
})();

