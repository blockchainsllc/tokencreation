<?php
header('Content-Type: application/json');
$config = json_decode(file_get_contents('config.json'));
$data   = file_get_contents('php://input');
$ch     = curl_init($config->client);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type:     application/json','Content-Length: ' . strlen($data)));
curl_setopt($ch, CURLOPT_POST);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
echo curl_exec($ch);
