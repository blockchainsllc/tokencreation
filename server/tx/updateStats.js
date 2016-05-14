var fs   = require('fs'); 
var tx   = require("./tx.js");

tx.getETH(function(price) {
   var stats= tx.getStats(price);
   var code = 'window.daoStats='+JSON.stringify(stats)+"\n" +
            'function updateDAOStats() {\n'+
            '  $(".dao-stat-adr").html(window.daoStats.dao);\n'+
//            '  $(".dao-stat-token-sold").html(window.daoStats.tokens * window.daoStats.units);\n'+
//            '  $(".dao-stat-days-left").html(window.daoStats.daysLeft);\n'+
//            '  $(".dao-stat-token-price").html(window.daoStats.price+" ETH");\n'+
//            '  $(".dao-stat-total-eth").html(window.daoStats.balance+" ETH");\n'+
            
            '  $(".dao-stat-end").html(window.daoStats.end);\n'+
            '  $(".dao-stat-token-sold-data").attr("data-perc",formatStats(window.daoStats.tokens * window.daoStats.units,"M"));\n'+
            '  $(".dao-stat-days-left-data").attr("data-perc",formatStats(window.daoStats.daysLeft,"time"));\n'+
            '  $(".dao-stat-next-price-data").attr("data-perc",formatStats(window.daoStats.nextPrice,"time"));\n'+
            '  $(".dao-stat-total-usd-data").attr("data-perc",formatStats(window.daoStats.balance_usd,"M"));\n'+
            '  $(".dao-stat-token-price-data").attr("data-perc",window.daoStats.price);\n'+
            '  $(".dao-stat-total-eth-data").attr("data-perc",formatStats(window.daoStats.balance,"M"));\n'+
            '  window.daoStats.nextPrice = window.daoStats.nextPrice - 1.0/(24*60);\n'+
            '  window.daoStats.daysLeft = window.daoStats.daysLeft - 1.0/(24*60);\n'+
            '  if (window.daoStats.nextPrice<0) \n'+
            '     window.daoStats.nextPrice=window.daoStats.daysLeft>4 ? 1 : 0;\n'+
            '  if (window.daoStats.daysLeft<0) \n'+
            '     $("#crowdsaleApp").html("Thank you! The Creation Phases is over now."); \n'+
            '  else \n'+
            '    setTimeout(function() {\n'+
            '      updateDAOStats();\n'+
            '		$(".fact-number").each(function(){\n'+
            '            var dataperc = $(this).attr("data-perc");\n'+
            '            var unit     = "", p = dataperc.indexOf(" ");\n'+
            '            if (p>0) {\n'+
            '                unit = dataperc.substring(p+1);\n'+
            '                dataperc = dataperc.substring(0,p);\n'+
            '                $(this).find(".unit").html(unit); \n'+
            '            }\n'+
            '               \n'+
            '			$(this).each(function(){			\n'+
            '				$(this).find(".factor").countTo({\n'+
            '					to: dataperc,\n'+
            '					speed: 30,\n'+
            '					refreshInterval: 50,	\n'+
            '              decimals : dataperc.indexOf(".")<0?0:2\n'+
            '				});  \n'+
            '			});\n'+
            '		});\n'+
            '     '+
            '    },1000*60);\n'+
            '}\n'+
            'updateDAOStats();\n';

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

