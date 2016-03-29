var window = this;
importScripts('../bower_components/buffer/buffer.js','./scryptsy.js','./aes.js','./ethutil.js','../bower_components/web3/dist/web3.js',
 '../bower_components/hooked-web3-provider/build/hooked-web3-provider.js');

var scryptsy  = require("scryptsy");
var crypt_aes = aesjs;
var ethUtil   = require('ethereumjs-util');
var Buffer    = buffer.Buffer;

onmessage = function(e) {
   if (e.data && e.data.action=='export') {
   
      var account    = e.data.account;
      var passphrase = e.data.passphrase;
      var randomBuffer= e.data.randomBuffer;
         
      // random-function
      var randomBytes = new Buffer(randomBuffer), nextRandomIndex = 0;
      function getRandomValues(count) {
         var result = randomBytes.slice(nextRandomIndex, nextRandomIndex + count);
         nextRandomIndex += count;
         if (result.length != count)            throw new Error('not enough random data');
         return result;
      }
      
      var salt   = getRandomValues(32);
      var iv     = getRandomValues(16);
      var secret = new Buffer(new Uint8Array(32));
      for (var i=0;i<32;i++) secret[i]=parseInt("0x"+account.private.substr(i*2,2));
      
      // encrypt the key
      var derivedKey = scryptsy(new Buffer(passphrase), salt, 262144, 1, 8, 32, function(progress) {
         postMessage({action:'progress',val:progress.percent});
      });

      var counter    = new crypt_aes.Counter(iv);
      var aes        = new crypt_aes.ModeOfOperation.ctr(derivedKey.slice(0, 16), counter);
      var ivHex      = iv.toString('hex');
      var ciphertext = aes.encrypt(secret);
     
      // create resulting structure
      postMessage({ action:'done', result:{
         address: account.address.substring(2),
         Crypto: {
               cipher: "aes-128-ctr",
               cipherparams: {
                  iv: ivHex,
               },
               ciphertext: ciphertext.toString('hex'),
               kdf: "scrypt",
               kdfparams: {
                  dklen: 32,
                  n: 262144,
                  p: 8,
                  r: 1,
                  salt: salt.toString('hex'),
               },
               mac: ethUtil.sha3(Buffer.concat([derivedKey.slice(16, 32), ciphertext])).toString('hex'),
         },
         id: account.address.substring(2),
         version: 3
      }});
      
      close();
   }
};
