<?php

$config = json_decode(file_get_contents('config.json'));

$json = file_get_contents('php://input');
$data = json_decode($json);
$path = $config->data."/new";

if (!file_exists($path))   mkdir($path, 0777, true);
$p = $path."/".$data->email."-".uniqid().".json";
file_put_contents($p,$json);
chmod($p,0777);
header('Content-Type: application/json');
echo '{"accepted":true}';

?>
