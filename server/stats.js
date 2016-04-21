window.daoStats={"balance":"0.00","price":"1.50","daysLeft":-10,"tokens":"0.00","dao":"0xac8B9227529a6892032088dD6A0CeF2739f1d1b1","units":100,"shapeshift":{"publicKey":"TODO INSERT HERE"},"toc":{"url":"explainer.html","selector":".dao-toc"}}
$(".dao-stat-token-sold").html(window.daoStats.tokens * window.daoStats.units);
$(".dao-stat-days-left").html(window.daoStats.daysLeft);
$(".dao-stat-token-price").html(window.daoStats.price+" ETH");
$(".dao-stat-total-eth").html(window.daoStats.balance+" ETH");
$(".dao-stat-token-sold-data").attr("data-perc",window.daoStats.tokens * window.daoStats.units);
$(".dao-stat-days-left-data").attr("data-perc",window.daoStats.daysLeft);
$(".dao-stat-token-price-data").attr("data-perc",window.daoStats.price);
$(".dao-stat-total-eth-data").attr("data-perc",window.daoStats.balance);
