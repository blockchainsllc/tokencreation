var fs   = require('fs'); 
var tx   = require("./tx.js");
var stats= tx.getStats();
var code = 'window.daoStats='+JSON.stringify(stats)+"\n" +
           '$(".dao-stat-token-sold").html(window.daoStats.tokens * window.daoStats.units);\n'+
           '$(".dao-stat-days-left").html(window.daoStats.daysLeft);\n'+
           '$(".dao-stat-token-price").html(window.daoStats.price+" ETH");\n'+
           '$(".dao-stat-total-eth").html(window.daoStats.balance+" ETH");\n';

fs.writeFile(process.argv[2] ||  __dirname+"/../../src/stats.js",code);

