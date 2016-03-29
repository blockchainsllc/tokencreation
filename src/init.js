(function() {
    var prefix = "tokensale/";

    // include css
    [
        'https://fonts.googleapis.com/css?family=Roboto:400,500,700,400italic',
        prefix + 'bower_components/angular-material/angular-material.css',
        prefix + 'css/bootstrap.min.css',
        prefix + 'css/theme-aquatica.css',
        prefix + 'css/custom.css'
    ].forEach(function(path) {
            document.write('\x3Clink rel="stylesheet" href="'+path+'"/>');
    });


    // include scripts
    [
        'bower_components/jquery/dist/jquery.min.js',
        'src/stats.js',
        'bower_components/angular/angular.min.js',
        'bower_components/angular-animate/angular-animate.min.js',
        'bower_components/angular-messages/angular-messages.min.js',
        'bower_components/angular-aria/angular-aria.min.js',
        'bower_components/angular-material/angular-material.min.js',
        'bower_components/strftime/strftime.js',
        'bower_components/qrcode/dist/jquery.qrcode.min.js',
        'bower_components/web3/dist/web3.min.js',
        'bower_components/hooked-web3-provider/build/hooked-web3-provider.min.js',
        'bower_components/underscore/underscore-min.js',
        'bower_components/bignumber.js/bignumber.min.js',
        'bower_components/marked/lib/marked.js',
        'bower_components/buffer/buffer.min.js',
        'src/scryptsy.min.js',
        'src/aes.js',
        'src/daoutils.js',
        'src/CrowdsaleController.js',
        'src/AccountService.js',
        'src/status.js'
    ].forEach(function(path) {
            document.write('\x3Cscript type="text/javascript" src="'+prefix+path+'">\x3C/script>');
    });

    document.addEventListener("DOMContentLoaded", function(event) { 
        $("#dao_container").load( prefix+"tokensale.html #dao_include" , function(){
            angular.bootstrap(document, ['crowdsale']);
        });
        $("#dao_stats").load( prefix+"stats.html #dao_stats_include" , function(){
            $(".dao-stat-token-sold").html(window.daoStats.tokens * window.daoStats.units);
            $(".dao-stat-days-left").html(window.daoStats.daysLeft);
            $(".dao-stat-token-price").html(window.daoStats.price+" ETH");
            $(".dao-stat-total-eth").html(window.daoStats.balance+" ETH");
        });
        $("#dao_balancecheck").load( prefix+"balancecheck.html #dao_balancecheck_include", initBalanceCheck );
    });




})();