window.daoStats={"balance":"0.06","price":"1.50","daysLeft":0,"tokens":"0.06","dao":"0xAb872F3aE424B209Cb9C060EE80dF04d99D47633","units":100,"shapeshift":{"publicKey":"TODO INSERT HERE"}}
$(".dao-stat-token-sold").html(window.daoStats.tokens * window.daoStats.units);
$(".dao-stat-days-left").html(window.daoStats.daysLeft);
$(".dao-stat-token-price").html(window.daoStats.price+" ETH");
$(".dao-stat-total-eth").html(window.daoStats.balance+" ETH");
