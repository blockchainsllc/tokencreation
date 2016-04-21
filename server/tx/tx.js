var fs         = require("fs");
var pathutil   = require("path");
var nodemailer = require('nodemailer');
var Web3       = require("web3");

var tx          = require("../config.json");
var daoabi      = require("./dao.abi.json");
var conf        = tx;
var web3        = new Web3();
var transporter = nodemailer.createTransport();


function log(msg) {
   console.log(new Date().toISOString()+": "+msg);
}


function configure() {
  web3.setProvider(new web3.providers.HttpProvider(tx.client));
  tx.web3=web3;
  tx.daoContract = web3.eth.contract(daoabi).at(tx.dao);
}



function getStats() {
   if (!tx.web3) configure();
   return {
      balance    : web3.toBigNumber(web3.fromWei(web3.eth.getBalance(tx.dao),"ether")).toFormat(2),
      price      : web3.toBigNumber( web3.toBigNumber(tx.daoContract.divisor()).toNumber() / 20).toFormat(2),
      daysLeft   : parseInt ((web3.toBigNumber(tx.daoContract.closingTime()).toNumber()- Date.now()/1000)/(3600*24)),
      tokens     : web3.toBigNumber(web3.fromWei(tx.daoContract.totalSupply(),"ether")).toFormat(2),
      dao        : tx.dao,
      units      : 100,
      shapeshift : tx.shapeshift,
      toc        : tx.ToC || {url:"explainer.html",selector:".dao-toc"}
   }
}



function handleTransactionsForPath(path) {
  
  configure();  
  
  var stats = fs.statSync(path);
  if (stats.isDirectory()) {
	  fs.readdir(path, function(err, names) {
		  names.forEach(function(name){
			if (name.indexOf(".json")>0 && name.indexOf("@")>0) 
				handleTx(path+"/"+name);
		  });
	  });
  }
  else if (stats.isFile()) 
	  handleTx(path);
}

function handleTx(path) {
   fs.readFile(path,'utf8',function(err,content){
      if (err)
        log(err);
      else {
         var tx = JSON.parse(content);
         
         if (tx.key)
            sendPrivateKey(path, tx); 
         else if (hasEnoughBalance(tx)) 
            sendTransaction(path,tx);
         else 
            log(path+" : not enough balance!");
      }
   });
}

function sendPrivateKey(path, tx) {
   sendMail(tx.email, 
     conf.mailer.sendKey.subject,
     conf.mailer.sendKey.text, 
     {
        filename : tx.filename,
        content  : JSON.stringify(tx.key),
        contentType: "application/json"
     },
     tx.key
   );
   moveTo('privateKeys',path, tx);
}

function hasEnoughBalance(tx) {
   var balance = web3.eth.getBalance(tx.adr);
   return web3.toBigNumber(tx.amount).lte(balance);
}

function sendTransaction(path,tx) {
   
   var blockDiff = 2, blockNumber  = 0;
   moveTo('sending',path,tx);
         
   web3.eth.sendRawTransaction(tx.tx, function(err, txhash ) { 
      if (err || !txhash) 
         handleError("Did not accept the Transaction : "+err); 
      else {
         tx.txhash=txhash;
         setTimeout(waitForBlockNumber, 1000);
      }
   });
   
   function waitForBlockNumber(){
      web3.eth.getTransaction(tx.txhash, function(error,result) {
         if (error)
           handleError("The Transaction was lost : "+error);
         else {
            // no results just mean it is not commited yet
            if (result && result.blockNumber) {
               blockNumber = result.blockNumber; 
               setTimeout(waitForBlocks, 1000);
            }
            else 
               setTimeout(waitForBlockNumber, 1000);
         }
      });
   }
   
   function waitForBlocks() {
      web3.eth.getBlockNumber(function(error, result){
         if (error)
            handleError("The Transaction was lost : "+error);
         else {
            if (result-blockNumber >= blockDiff) {
               sendMail(tx.email, 
                  conf.mailer.confirmTx.subject,
                  conf.mailer.confirmTx.text,
                  null,
                  {
                     amount : web3.fromWei(tx.amount,'ether'),
                     adr    : tx.adr,
                     dao    : conf.dao
                  }
               );
                 
               moveTo("confirmed",path,tx);
            }
            else
               setTimeout(waitForBlocks, 1000);
         }
      });
   }
   
   function handleError(error) {
      log(path+" Error sending tx:"+error);
      tx.err=error;
      tx.sendCount=(tx.sendCount||0)+1;
      moveTo('err',path,tx);
   }
      
}


function sendMail(to, subject, txt, file, values) {
   if (values)
      Object.keys(values).forEach(function(k){               
          txt = txt.replace("$"+k+"$", values[k]);
      })
   var msg = {
      from   : conf.mailer.from,
      to     : to,
      subject: subject,
      text   : txt
   };
   if (file) 
      msg.attachments=[file];
      
   transporter.sendMail(msg, function(err,data) {
      if (err)
         log("Error sending mail to "+to+" : "+err.stack);
      else
         log("send mail to "+to+"\n"+data);  
   });
}

function moveTo(subDir, path, tx) {
   log(path+" : move to "+subDir);
   var targetDir = pathutil.join(pathutil.dirname(path),'..', subDir);
   
   try {
     if (!fs.statSync(targetDir).isDirectory())
       log("ERROR cannot access "+targetDir);
   } catch (err) {
     fs.mkdirSync(targetDir);
   }
   
   var oldPath = tx.path || path;   
   tx.path=pathutil.join(targetDir,  pathutil.basename(path));     
   if (oldPath!=tx.path)    fs.unlink(oldPath);
   fs.writeFileSync(tx.path, JSON.stringify(tx));
}


tx.configure = configure;
tx.sendMail = sendMail;
tx.handleTransactionsForPath = handleTransactionsForPath;
tx.getStats=getStats;




module.exports = tx;
