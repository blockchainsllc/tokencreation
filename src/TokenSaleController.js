/* global strftime */
/* global marked */

(function(){

var prefixPath="tokensale/";
   
// define the module
angular
.module('tokensale', [ 'ngMaterial', 'ngAnimate','ngMessages' ])
.controller('TokenSaleController', [ '$scope', '$mdBottomSheet', '$mdDialog','$log', '$q', '$http','$timeout','accountService',  TokenSaleController ])
.config(function($mdThemingProvider){
    $mdThemingProvider.theme('default')
    .primaryPalette('blue-grey')
    .accentPalette('red');
})
// ethaddress - check if this ia a correct address
.directive("ethaddress", function(){
   return {
      restrict: 'A',
      require : 'ngModel',
      link: function(scope, ele, attrs, ctrl){
         ctrl.$parsers.unshift(function(value) {
            if(value){
               var valid = isValidAddress(value);
               ctrl.$setValidity('ethaddress', valid);
            }
            return valid ? value : undefined;
         });
      }
   }
})
// compare passwords
.directive("compareTo", function() {
    return { require: "ngModel",  scope: {  otherModelValue: "=compareTo"  }, link:  function(scope, element, attributes, ngModel) {
        ngModel.$validators.compareTo = function(modelValue) {    return modelValue == scope.otherModelValue;  };
        scope.$watch("otherModelValue", function()           {    ngModel.$validate();                        });
    }};
});


// functions...

// normalize eth-adr
function normalizeAdr(adr, len) {
    if (adr.indexOf("0x")>=0) adr=adr.substring(2);
    while (adr.length< (len || 40)) adr="0"+adr; 
    return adr;
}

function round(val,len) {
   if (!val) return 0;
   len = len || 100;
   return Math.round(val*len)/len;
}

// create random hex number
function s4() {
   return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

// check eth-address
function isValidAddress(adr) {
   if (!adr) return false;
   if (adr.indexOf("0x")==0) adr=adr.substring(2);
   var pattern =  /[0-9a-fA-F]{40}/g;
   return pattern.test(adr) && adr.length==40;
}

// create a link to MistBrowser dependend OS
function detectMistLink() {
   var ua = navigator.platform, baseUrl='https://github.com/ethereum/mist/releases';
   var version='0.5.2';
   
   function createLink(os) { return baseUrl+'/download/'+version+"/Ethereum-Wallet-"+os+"-"+version.replace(/\./g,'-')+".zip"; }
   
   if (ua.indexOf("Win")>=0) 
      return  (navigator.appVersion.indexOf("WOW64")>=0 || navigator.appVersion.indexOf("Win64")>=0 )
         ? createLink('win64') :  createLink('win32'); 
         
   else if (ua.indexOf("Linux")>=0) 
      return  (ua.indexOf("x86_64")>=0 || ua.indexOf("x86-64")>=0)
         ? createLink('linux64') :  createLink('linux32');
            
   else if (navigator.appVersion.indexOf("Mac")>=0)
      return createLink('MacOSX');
   else
      return baseUrl;
}


// define main-controller
function TokenSaleController( $scope, $mdBottomSheet, $mdDialog,  $log, $q, $http,$timeout,accountService) {

   // helper for error-handling
   function showError(title,msg,ev) {
          $mdDialog.show(
            $mdDialog.alert()
            .title(title|| 'Error during sending transaction!')
            .content(msg || "Could not send the transaction")
            .ariaLabel('Error '+title)
            .ok('OK')
            .targetEvent(ev));
   }

  var stats = window.daoStats || {};

  // set scope-params  
  $scope.account={ existing:false};
  
  // TC-Handling
  $scope.acceptedTC = false;
  $scope.acceptTC = function(ev) {
      $http.get(prefixPath+"md/tc.md.txt").then(function(response) {
         var parentScope=$scope;
         $mdDialog.show({
            parent:      angular.element(document.body),
            targetEvent: ev,
            template:
               '<md-dialog aria-label="Terms and Conditions of the Slock Token Sale" ng-cloak >' +
               '  <md-toolbar><div class="md-toolbar-tools"><h2>Terms and Conditions of the DAO Token Sale</h2></div></md-toolbar>'+
               '  <md-dialog-content class="tocContent" data-ng-init="init()" style="order:0;-webkit-order:0;-ms-flex-order:0"><div style="padding:10px">'+marked(response.data)+'</div></md-dialog-content>' +
               '  <md-dialog-actions style="text-align: right">' +
               '    <md-button ng-click="closeDialog()" class="md-primary">' +
               '      Close' +
               '    </md-button>' +
               '    <md-button ng-click="acceptDialog()" class="md-primary" ng-disabled="!scrolled">' +
               '       <md-tooltip md-visible="!scrolled">You must read the T&Cs to the end in order to accept them.</md-tooltip> ' +
               '      Accept' +
               '    </md-button>' +
               '  </md-dialog-actions>' +
               '</md-dialog>',
            controller: function ToCController($scope, $mdDialog) {
               $scope.closeDialog  = function() {   $mdDialog.hide();     }
               $scope.acceptDialog = function() {   
                  parentScope.acceptedTC=true;  
                  $mdDialog.hide();  
                  setTimeout(function() {
                     $('html, body').animate({
                        scrollTop: $("#dao_choose_currency").offset().top-130 + 'px'
                     }, 'fast');
                  },500);                  
               }
               $scope.scrolled=true;
               $scope.init = function() {
                  setTimeout(function() {
                     var cc = $(".tocContent");
                     cc.scroll(function(){
                        if(cc.scrollTop() + cc.innerHeight() + 30 > cc.prop("scrollHeight")){
                           $scope.scrolled=true;
                           $scope.$apply();
                        }
                     });
                     $scope.scrolled=false;
                     $scope.$apply();
                  },500);
               }
            }
         });
         
         
      });
  };
  

  // determine the OS and set the download-link
  $scope.mist_link = detectMistLink();
  
  
   // user-options
   $scope.accountProgress = 0;
   $scope.daoAddress      = stats.dao ||  "0xAEEF46DB4855E25702F8237E8f403FddcaF931C0";
   $scope.tokenPrice      = stats.price || 1;
   $scope.tokenUnits      = stats.units || 100; 
   $scope.btceth          = 0.2;
   $scope.account.getAccounts = function() {  return accountService.getAccounts();  };
   $scope.createAccount = function(ev) {
      
         // create the account
          accountService.createAccount($scope.password).then(function(account){
         
            accountService.createExportData({private:account.private, address:account.address}, $scope.password, $scope, prefixPath).then(function(result) {
               // download file
               result.id = s4() + s4() + '-' + s4() + '-' + s4() + '-' +  s4() + '-' + s4() + s4() + s4();
               var key = JSON.stringify(result);
               var fileName = 'UTC--' + strftime.utc()('%Y-%m-%dT%H-%M-%S') + '.0--' + account.address.substring(2);
               var save = document.createElement('a');
               save.href = "data:text/plain,"+escape(unescape(encodeURIComponent(key)));
               save.innerHTML="dummy";
               save.target = '_blank';
               save.download = fileName;
               save.style.display='none';
               document.body.appendChild(save);
               save.click();
               window.setTimeout(function() {
                  document.body.removeChild(save);
               },30000);
               
               // set data in account
               $scope.account.adr=account.address;
               $scope.account.isNew=true;
               $scope.account.unlocked=true;
               $scope.account.email=$scope.email;
               
               if ($scope.email) {
                  // sending the key to be mailed
                  $http.post(prefixPath+"server/addTx.php",{
                        key     : result,
                        filename: fileName,
                        adr     : $scope.account.adr,
                        email   : $scope.email
                  },{}).then(function(result){
                     if (!result.data.accepted)
                        showError("Error sending the key to the server",result.data.error,ev);
                  }, function(error){
                     showError("Error sending the key to the server",error,ev);
                  });
               }
               
            });
         });
   };
  
  
   // sends some ether in a Transaction
   $scope.sendEther = function(ev, amount, cb) {
       if (amount) $scope.account.ether=amount;
       $scope.account.isSendingEther=true;
       accountService.signTransaction({
          account: $scope.account.adr,
          from   : $scope.account.adr,
          to     : $scope.daoAddress,
          amount : $scope.account.ether
       }).then(function(res){
           
           // sending the signed transaction to us in order to execute it later
           $http.post(prefixPath+"server/addTx.php",{
               tx    : res.data,
               adr   : $scope.account.adr,
               amount: res.value,
               email : $scope.email
           },{}).then(function(result){
              $scope.account.isSendingEther=false;
              if (result.data.accepted) 
                $scope.account.success= cb ? cb() : true;
              else
                showError("Error sending the signed data to the server",result.data.error,ev);
           }, function(error){
              showError("Error sending the signed data to the server",error,ev);
              $scope.account.isSendingEther=false;
           });
           
       },function(res){
          $scope.account.isSendingEther=false;
          showError("Error signing the transaction",res,ev);
       },function(update){
          $scope.account.status = update.msg;
       });
   };
   
   $scope.sendBTC = function(ev, btc, id) {
       // sending the key to be mailed
      $scope.account.isSendingBTC=true;
      $http.post(prefixPath+"server/gatecoin.php",{
            dao     : $scope.daoAddress,
            amount  : btc+'',
            data    : '0x13d4bc24'+ normalizeAdr($scope.account.adr,64)
      },{}).then(function(result){
         $scope.account.isSendingBTC=false;
         if (result.data.error)
            showError("Error establishing the gatecoin-connection",result.data.msg,ev);
         else {
             $scope.account.btc= {
               adr   : result.data.address,
               amount: btc
            };
            var $qrDepAddr=$("#"+id);
            $qrDepAddr.empty();
            $qrDepAddr.qrcode({width: 175, height: 175, text: 'bitcoin:' + $scope.account.btc.adr + '?amount=' + $scope.account.btc.amount});
            
            // start watching ...
            function checkTx() {
                $http.post("server/gatecoin.php",result.data,{}).then(function(checkRes){
                   if (checkRes.data && checkRes.data.payments) {
                      var status="";
                      checkRes.data.payments.forEach(function(p){
                         if (p.txID==result.data.txID) {
                            status = p.status;
                            p.expires = new Date(parseInt(p.expiryDate)*1000).toLocaleTimeString();
                            p.created = new Date(parseInt(p.expiryDate)*1000).toLocaleTimeString();
                            $scope.account.btc.tx=p;
                         }
                      });
                      
                      $scope.account.btc.status=status;
                      
                      if (status=='New' || status=='Unconfirmed') 
                         $timeout(checkTx, 10000);
                   }
                });
            }
            
            checkTx();
         }
      }, function(error){
         showError("Error establishing the gatecoin-connection",error,ev);
         $scope.account.isSendingBTC=false;
      });
   };
   


    // sending the key to be mailed
    $http.get("https://www.gatecoin.com/api/Public/LiveTickers").then(function(result){
      result.data.tickers.forEach(function(c) {
        if (c.currencyPair.indexOf("ETHBTC")==0) 
          $scope.btceth=c.ask;
      }, this);
    }, function(error){
    });


  
   $scope.needsAccount = function() {  return $scope.acceptedTC && $scope.account.currencyType; };
   
   $scope.showBuy   = function() {  
      if ($scope.account.currencyType=='FIAT' && $scope.account.existing!='yes_mist') return false;
      return $scope.needsAccount() &&  $scope.account.existing && (
         $scope.account.existing=='no' ? 
             ($scope.account.unlocked && $scope.account.currencyType!='FIAT') : 
             ($scope.account.currencyType=='ETH' || ( isValidAddress($scope.account.adr) || $scope.account.existing=='yes_mist'))
         ); 
   };
   
   
   
   $scope.openShapeShift = function() {
      if (!$scope.shapePopup || $scope.shapePopup.closed) {  
         var link = "https://shapeshift.io/shifty.html?destination="+$scope.account.adr+"&output=ETH&apiKey="+window.daoStats.shapeshift.publicKey;
         $scope.shapePopup = window.open(link,'1418115287605','width=850,height=450,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=0,left=0,top=0');
      }
      $scope.shapePopup.focus();
   };
            
            
}




})();

// create init-function
