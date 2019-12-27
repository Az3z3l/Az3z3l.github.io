<html>
<body>
<form action=# method='post'>
<input type='text' name='input'>
<input type='text' name='input2'>
<input type='submit' name='submit'>
</form>
<?php
if(!isset($_SESSION)){
	session_start();
	//echo $start_time;
}
if(!isset($_SESSION['start_time'])) {
	$_SESSION['start_time'] = time();	
}


//echo "session" . $_SESSION['input'];
//echo "\n";
$a = 'inctf{';
$in = $_POST['input'];
$in2 = $_POST['input2'];
$_SESSION['input'] .= $in;


if (strlen($_SESSION['input']) === 6){ 
if($_SESSION['input'] === $a && $_SESSION['rand']===$in2) {
	$now_time = time();
	$diff_time = $now_time - $_SESSION['start_time'];
	if($diff_time > 25) {
	echo "Too Slow";
	}
	else {
		echo "inctf{FLaggg}";
		session_destroy();
	}
}
else
{
	echo "NOPE";
	session_destroy();
}
}



else {
	if(strlen($_SESSION['input'])!=1)
	{
	if($_SESSION['rand']===$in2) {
		$_SESSION['rand'] = strval(rand(1,100));
		$now_time = time();
		$diff_time = $now_time - $_SESSION['start_time'];
		if($diff_time > 25) {
			echo $_SESSION['start_time'];
			echo "\n";
			echo $now_time;
			echo "\n";
			echo $diff_time;
			echo "Timeout";
			session_destroy();

		}
		else {
			echo "Your Auth Code is ";
			echo $_SESSION['input'];
			echo "\n";
			echo $_SESSION['rand'];
			echo "\n";
			
		}

		
	}
	else if($_SESSION['rand']!=in2){
		if(strlen($_SESSION['input'])===0) {
			echo "Welcome";
		}
		else{
			echo "Sorry Wrong Auth";
			session_destroy();
		}

	}
	}

	else { 
		$_SESSION['rand'] = strval(rand(1,100));
		$now_time = time();
		$diff_time = $now_time - $_SESSION['start_time'];
		if($diff_time > 25) {
			echo $_SESSION['start_time'];
			echo "\n";
			echo $now_time;
			echo "\n";
			echo $diff_time;
			echo "Timeoutt";
			session_destroy();

		}

		else {
			echo "Your Authh Code is ";
			echo $_SESSION['input'];
			echo "\n";
			echo $_SESSION['rand'];
			echo "\n";
		}
	}
	
}



?>


</body>
</html>
