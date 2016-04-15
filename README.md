## TokenSale Library ##

The intention of this library is to be included in existing site in order to provide an easy way for people to buy such tokens.
To set it up, you need simply need to follow these steps:

* in your existing site add containers to be replaced with the content from this library.

    ```html
    <div id="dao_container">
       loading the TokenSale....
    </div>
    <div id="dao_stats">
       the statisticss...
    </div>
    <div id="dao_balancecheck">
       loading balancecheck
    </div>
    ```
Also if you want to support for IE8-11 you should add this meta-tag in your header:

    ```html
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />    
    ```

    
* at the end of the html-file include this script:
* 
    ```html
    <script src="tokensale/src/init.js"></script>
    ```
     
* edit the configuration found in tokensale/server/config.json

    ```javascript
    {
      "client"  : "http://MyIP:8545",   // this is a running client to be used to check balances and execute signed transactions. 
      "dao"     : "0x...",              // the address of the DAO
      "data"    : "/data/dao",          // this is the path where all incoming data (transactions and privatekeys to be mailed) will be stored and executed. (make sure this directory is included in the php php_admin_value open_basedir)
      "mailer"  : {
        "from"    : "mymail@mydomain.org",  // the from-address for all outgoing emails.
        "sendKey" : {                       // the email-templates for sending the key to the user
            "subject" : "Your new DAO-Account",
            "text"    : "Dear User\n\nYou just created a new Account in order to take part on the DAO.\nYour public address is 0x$address$\n\nYou may put this key into ~/.ethereum/keystore -folder in order to use it\n\nYour DAO-Team"
        },
        "confirmTx" : {                     // the email-template for confirming the execution of the transaction.
            "subject" : "DAO-Transaction confirmed",
            "text"    : "Dear DAO User\n\nYour Transaction of $amount$ Ether has been confirmed. You can now use your Tokens assigned to the $adr$ to vote.\n\nThe DAO Team"
         }
    },
      "gatecoin" : {                        // in order to use the gatecoin-api, you need to fill the Key here.
         "secretKey"  : "TODO INSERT HERE",
         "publicKey"  : "TODO INSERT HERE"
       },
       "shapeshift" : {                     // in order to use the shift-button, you need a special public key to be put here.
          "publicKey"   : "TODO INSERT HERE"
       }
    }
    ```    
   
* after putting these file to the server, you need to go into the directory tokensale and call

    ```shell   
    bower update
    ```
    
* and in the directory tokensale/server/tx

    ```shell
    npm install
    ```
    
* now active a cronjob, which is used to handle all incoming requests and also updateing the statistics.

    ```shell
    crontab -e
    ```
    
   The lines you should add ther should look like this:
   
   ```shell
    0 * * * * /usr/bin/nodejs {PATHTOSITE}/tokensale/server/tx/updateStats.js /var/log/updatestats 2>&1
    */5 * * * * /usr/bin/node {PATHTOSITE}/tokensale/server/tx/import.js >> /var/log/dao_tx 2>&1
    ```
   This will let the first cronjob update the statistics every hour and check for incoming transaction every 5 min.
   
Before you test the site you may update the statistics even manually, if you don't want to wait for the cronjob to do it:

Go to tokensale/server/tx and run

    nodejs updateStats.js
 


Now it's ready to go!
