(function() {
    var prefix = "tokencreation/";
    var server = "tokencreation/server/";
    var addBootStrap = false;
    var addJquery = false;

   // for old browsers...    
   if (typeof Array.prototype.forEach != 'function') 
      Array.prototype.forEach = function(callback){
         for (var i = 0; i < this.length; i++)  callback.apply(this, [this[i], i, this]);
      };
      
    // include css
    [
        'https://fonts.googleapis.com/css?family=Roboto:400,500,700,400italic',
        prefix + 'bower_components/angular-material/angular-material.css',
        prefix + 'css/bootstrap.min.css',
        prefix + 'css/theme-aquatica.css',
        prefix + 'css/custom.css'
    ].forEach(function(path) {
        if (addBootStrap || path.indexOf('bootstrap')<0)    document.write('\x3Clink rel="stylesheet" href="'+path+'"/>');
    });


    // include scripts
    [
        prefix + 'bower_components/jquery/dist/jquery.min.js',
        server + 'stats.js',
        prefix + 'bower_components/angular/angular.min.js',
        prefix + 'bower_components/angular-animate/angular-animate.min.js',
        prefix + 'bower_components/angular-messages/angular-messages.min.js',
        prefix + 'bower_components/angular-aria/angular-aria.min.js',
        prefix + 'bower_components/angular-material/angular-material.min.js',
        prefix + 'bower_components/strftime/strftime.js',
        prefix + 'bower_components/qrcode/dist/jquery.qrcode.min.js',
        prefix + 'bower_components/web3/dist/web3.min.js',
        prefix + 'bower_components/hooked-web3-provider/build/hooked-web3-provider.min.js',
        prefix + 'bower_components/underscore/underscore-min.js',
        prefix + 'bower_components/bignumber.js/bignumber.min.js',
        prefix + 'bower_components/marked/lib/marked.js',
        prefix + 'bower_components/buffer/buffer.min.js',
        prefix + 'bower_components/filesaver/FileSaver.min.js',
        prefix + 'src/scryptsy.min.js',
        prefix + 'src/aes.js',
        prefix + 'src/daoutils.js',
        prefix + 'src/TokenCreationController.js',
        prefix + 'src/AccountService.js',
        prefix + 'src/status.js'
    ].forEach(function(path) {
          if (addJquery || path.indexOf('jquery/')<0)    document.write('\x3Cscript type="text/javascript" src="'+ path+'">\x3C/script>');
    });

    var onLoaded = function(event) { 
        if (!window.daoStats) window.daoStats={};
        window.daoStats.server = server;
        $("#dao_container").load( prefix+"tokencreation.html #dao_include" , function(){
            angular.bootstrap(document, ['tokencreation']);
        });
        $("#dao_stats").load( prefix+"stats.html #dao_stats_include" , function(){
            $(".dao-stat-token-sold").html(window.daoStats.tokens * window.daoStats.units);
            $(".dao-stat-days-left").html(window.daoStats.daysLeft);
            $(".dao-stat-token-price").html(window.daoStats.price+" ETH");
            $(".dao-stat-total-eth").html(window.daoStats.balance+" ETH");
        });
        $("#dao_balancecheck").load( prefix+"balancecheck.html #dao_balancecheck_include", initBalanceCheck );
    };

    if (document.addEventListener)
       document.addEventListener("DOMContentLoaded", onLoaded);
    else if (document.attachEvent)
       document.attachEvent("DOMContentLoaded", onLoaded);
    

})();