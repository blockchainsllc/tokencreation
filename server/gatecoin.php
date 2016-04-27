<?php
header('Content-Type: application/json');

$json   = file_get_contents('php://input');
$data   = json_decode($json);

function execRequest($request_type, $path, $curl_post_data) {
   $config       = json_decode(file_get_contents('config.json'));
   $secretKey    = $config->gatecoin->secretKey;
   $publicKey    = $config->gatecoin->publicKey;

   $uri          = "https://www.gatecoin.com/api/".$path;
   $nonce        = microtime(true);
   $ct           = strcasecmp($request_type, 'POST') ==0 ? 'application/json' : '';
   $message      = $request_type . $uri . $ct . $nonce;
   $hash         = hash_hmac('sha256', strtolower($message), $secretKey, true); 
   $hashInBase64 = base64_encode($hash);

   $ch           = curl_init($uri);
   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
   if ($request_type!='GET')
      curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($curl_post_data));
   curl_setopt($ch, CURLOPT_HTTPHEADER, array('API_REQUEST_SIGNATURE:' . $hashInBase64, 'API_REQUEST_DATE:' . $nonce, 'API_PUBLIC_KEY:' . $publicKey,'Content-type:     application/json'));
   return curl_exec($ch);
}

function createQuote($amount, $dao, $data ) {
   $res = execRequest("POST","Merchant/Payment/Quote", array('CurrencyTo'=>'ETH','Amount'=>$amount, 'IsAmountInCurrencyFrom'=>'True', 'Reference'=>$dao, 'ExtraData'=>$data));
   if (!$res) 
      echo json_encode(array('error'=>true, 'msg'=>'Could not create quote!'));
   else {
      $res = json_decode($res);
      if (!$res->address) 
         echo json_encode(array('error'=>true,'src'=>$res, 'msg'=>'Unable to create the quote :'.$res->responseStatus->message));
      else 
         return $res;
   }
   return '';
}


if (isset($data->txID))
  $result = json_decode(execRequest("GET","Merchant/Payment/".$data->txID, array()));
else
  $result = createQuote($data->amount,$data->dao,$data->data);
if (!$result) return;
    echo json_encode($result);

?>
