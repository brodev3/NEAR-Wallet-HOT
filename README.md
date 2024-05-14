# NEAR-Wallet-HOT

<p>
      <img src="https://i.ibb.co/3sHQCSp/av.jpg" >
</p>

<p >
   <img src="https://img.shields.io/badge/build-v_1.0-brightgreen?label=Version" alt="Version">
</p>


## About

Automatically claim HOT rewards, the transaction is sent from the frontend !

Proxy **ONLY SOCKS5**  supported

## Setup

1. Node JS
2. Clone the repository to your disk
3. In the folder, change the name of the ```config_ex.json``` on ```config.json```
4. Launch the console (for example, Windows PowerShell)
5. Specify the working directory where you have uploaded the repository in the console using the CD command
    ```
    cd C:\Program Files\NEAR-Wallet-HOT
    ```
6. Install packages
   
    ```
    npm install
    ```
7. **If you have used blumer** , you can add data to the config.json from the [blumer](https://github.com/brodev3/blumer) application:
   
   To do this, you need to:
   - Get auth token
      ```
      1. Log in to your account via the telegram web version https://web.telegram.org/
      2. Open the developer console in the browser by pressing F12, then go to the Network section
      3. Launch the Near wallet web application in Telegram in the browser
      4. Log in to your wallet
      5. Enter "status" in the search
      6. Open the issued request, find the "Authorization" parameter in the request header, this is the auth token
      ```
   - Get private key

   - Use ```add.js``` to add accounts:
     ```
     node scr/tg/add
     ```
     
8. Use ```import.js``` to import accounts:
    ```
    node scr/tg/import
    ```
You need to create an application and get the api_id and api_hash for yours accounts.

Proxy format: ```ip:port:login:pass``` OR send empty string for direct connection

Visit: https://my.telegram.org/


10. To start: 
    ```
    node index
    ```
