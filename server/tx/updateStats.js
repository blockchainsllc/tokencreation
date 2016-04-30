var fs   = require('fs'); 
var tx   = require("./tx.js");

tx.getETH(function(price) {
   var stats= tx.getStats(price);
   var code = 'window.daoStats='+JSON.stringify(stats)+"\n" +
            '$(".dao-stat-adr").html(window.daoStats.dao);\n'+
            '$(".dao-stat-token-sold").html(window.daoStats.tokens * window.daoStats.units);\n'+
            '$(".dao-stat-days-left").html(window.daoStats.daysLeft);\n'+
            '$(".dao-stat-token-price").html(window.daoStats.price+" ETH");\n'+
            '$(".dao-stat-total-eth").html(window.daoStats.balance+" ETH");\n'+
            
            '$(".dao-stat-end").html(window.daoStats.end);\n'+
            '$(".dao-stat-token-sold-data").attr("data-perc",formatStats(window.daoStats.tokens * window.daoStats.units,"M"));\n'+
            '$(".dao-stat-days-left-data").attr("data-perc",formatStats(window.daoStats.daysLeft,"time"));\n'+
            '$(".dao-stat-next-price-data").attr("data-perc",formatStats(window.daoStats.nextPrice,"time"));\n'+
            '$(".dao-stat-total-usd-data").attr("data-perc",formatStats(window.daoStats.balance_usd,"M"));\n'+
            '$(".dao-stat-token-price-data").attr("data-perc",window.daoStats.price);\n'+
            '$(".dao-stat-total-eth-data").attr("data-perc",formatStats(window.daoStats.balance,"M"));\n';

   fs.writeFile(process.argv[2] ||  __dirname+"/../stats.js",code);
   fs.appendFile(process.argv[2] ||  __dirname+"/stats.csv",
      new Date().toJSON()+";"+
      stats.daysLeft+";"+
      (stats.tokens*stats.units)+";"+
      stats.price+";"+
      stats.balance+";"+
      (parseFloat(stats.balance)*price.usd)+"\n"
   );
   
});

