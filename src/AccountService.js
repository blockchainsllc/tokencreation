/* global Web3 */
/* global BigNumber */
/* global Buffer */
/* global Accounts */
(function(){

var scryptsy  = require("scryptsy");
var crypt_aes = aesjs;
var ethUtil   = window.daoUtils.ethutil;// require('ethereumjs-util');
var EthTx     = window.daoUtils.tx;// require('ethereumjs-util');

var Buffer    = window.daoUtils.buffer.Buffer;
var gas      = 50000;
var gasPrice = 56000000000;
var fnHash   = "0xa4821719";

function formatHex(str){
    str = str ? String(str) : '00';
    return str.length % 2 ? '0' + str : str;
}

function randomBytes(length) {
    var charset = "abcdef0123456789";
    var i;
    var result = "";
    var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
    if(window.crypto && window.crypto.getRandomValues) {
        values = new Uint32Array(length);
        window.crypto.getRandomValues(values);
        for(i=0; i<length; i++) {
            result += charset[values[i] % charset.length];
        }
        return result;
    } else if(isOpera) {//Opera's Math.random is secure, see http://lists.w3.org/Archives/Public/public-webcrypto/2013Jan/0063.html
        for(i=0; i<length; i++) {
            result += charset[Math.floor(Math.random()*charset.length)];
        }
        return result;
    }
    else throw new Error("Your browser sucks and can't generate secure random numbers");
}

function toHex(val) {
   return "0x"+new BigNumber(val).toString(16);
}

function nextNonce(adr) {
      if (!localStorage) return 0;
      var n = localStorage.getItem("nonce_"+adr);
      if (n=== undefined || n===null) n=-1;
      n=parseInt(n)+1;
      localStorage.setItem("nonce_"+adr,n);
      return n; 
}

function getValueWithoutGas(value) {
    return new BigNumber(value).minus(gas*gasPrice);
}


angular.module('tokensale').service('accountService', ['$q','$http','$interval', function($q,$http,$interval) {

   
   // init web3 && accounts
   var web3 = new Web3();
   return {
      
      getAccounts : function() {
         return this.accountList || (this.accountList = accounts.list());
      },
      
      // create the account and returns a primse with the account.
      createAccount :  function() {
         var d          = $q.defer();
         var _          = this;
         
         var private = new Buffer(randomBytes(64), 'hex');
         var public = ethUtil.privateToPublic(private);
         var address = ethUtil.publicToAddress(public).toString('hex');
         while (address.length<40) address="0"+address;
         
         _.accountList=[{
               address : "0x"+address,
               private : private.toString('hex')
         }];
            
         d.resolve(_.accountList[0]);
         return d.promise;
      },
      
      // starts a webworker to encrypt the private key.
      createExportData :  function(account, passphrase, $scope, prefixPath) {
         var d = $q.defer();
         
         // start worker with eventHandler
         var worker = new Worker(prefixPath+'src/accountWorker.js');
         worker.addEventListener("message", function(ev) {
            var data = ev.data;
            if (data.action=='progress' && data.val - $scope.accountProgress > 1) {
               $scope.accountProgress=data.val;
               $scope.$apply();
               $("#accountProgress").html(" "+parseInt(data.val)+"% done ");
            }
            else if (data.action=='done') {
               $scope.accountProgress=0;
               $("#accountProgress").html("");
               d.resolve(data.result);
            }
         });
         worker.onerror = function(ev) {
            $scope.accountProgress=0;
            $("#accountProgress").html("");
            d.reject(ev.message);
         }
         
         // start the export-event
         worker.postMessage({action:'export', account: account, passphrase:passphrase, randomBuffer:crypto.getRandomValues(new Uint8Array(64))});
         return d.promise;
      },

      signTransaction : function(options) {
         var d            = $q.defer();
         var ac           = this.accountList[0];
         var rawTx = {
            nonce: toHex(nextNonce(options.account)).substr(2),
            gasPrice: toHex(gasPrice).substr(2),
            gasLimit: toHex(gas).substr(2),
            to      : '0x'+formatHex(ethUtil.stripHexPrefix(options.to)),
            value   : toHex(getValueWithoutGas(web3.toWei(options.amount,'ether'))).substr(2),
            data    : fnHash
         };
         var tx = new EthTx(rawTx);
         tx.sign(new Buffer(this.accountList[0].private, 'hex'));
         d.resolve({ data: '0x'+ tx.serialize().toString('hex'), value: web3.toWei(options.amount,'ether')});
         return d.promise;
      } 
      
   };
   
}]);

})();

