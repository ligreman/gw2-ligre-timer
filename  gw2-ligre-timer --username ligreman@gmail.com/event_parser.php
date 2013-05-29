
<?php
	/*
		Ha de coger la lista de eventos que tengo en cuenta (events_table.json), la lista completa (event_<lang>.json) y generar una tercera lista "completa" pero sólo con los eventos que tengo en cuenta.
	*/
procesar('en');
procesar('es');
procesar('fr');
procesar('de');

function procesar($lang) {
	$todos = leerListaCompleta($lang);
	$mios = leerMiLista();

	foreach ($mios as $value) {
		$cuento[] = $value->id;

		$pres = $value->pre_events;
		if (count($pres)>0) {
			foreach ($pres as $value2) {
				$cuento[] = $value2->id;		
			}
		}
	}
	//var_dump($cuento);

	$salida = array();
	foreach ($todos as $evento) {
		if (in_array($evento->id, $cuento)) {
			$salida[] = '{"id":"'.$evento->id.'","name":"'.$evento->name.'"}';		
		}
	}
	$final = '[' . implode(',', $salida) . ']';

	file_put_contents('updated/event_'.$lang.'.json', $final);
	echo 'OK: event_'.$lang.'.json' . "\n";
}



function leerListaCompleta($lang) {
	$file = file_get_contents('json/event_'.$lang.'.json');
	$file = str_replace("'", '´', $file);	

	
	return json_decode($file);	
}

function leerMiLista() {
	$file = file_get_contents('json/events_table.json');
	$file = str_replace("'", '´', $file);	
	
	$dat = json_decode($file);	
	return $dat->events;
}

?>