var autoRefreshTimer='', eventsCompleted = new Array(), firstServerLoad = new Array(), preEventsReload = new Array(),
audio_default = $("#audio_default")[0], audio_boss = $("#audio_boss")[0];

firstServerLoad["serverA"] = true;
firstServerLoad["serverB"] = true;
firstServerLoad["serverC"] = true;

create_alert('asdgds', 'info');		
//Contador de tiempo de eventos. ¿cómo hacerlo?


function setCookie(c_name,value,exdays) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name) {
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	
	if (c_start == -1) {
		c_start = c_value.indexOf(c_name + "=");
	}
	
	if (c_start == -1) {
		c_value = null;
	} else {
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);
		if (c_end == -1) {
			c_end = c_value.length;
		}
		c_value = unescape(c_value.substring(c_start,c_end));
	}
	return c_value;	
}

function checkCookie() {
	var servers = getCookie('eolTimer_servers'),
	prefAutoRefresh = getCookie('eolTimer_autorefresh'),
	prefNotifyPreEvents = getCookie('eolTimer_notifyPreEvents'),
	prefNotifySound = getCookie('eolTimer_notifySounds'),
	prefRealNames = getCookie('eolTimer_realNames'),
	prefTableCondensed = getCookie('eolTimer_tableMini'),
	prefEventsCompleted = getCookie('eolTimer_eventsCompleted');
	
	if (servers==undefined || servers==null || servers=="") {
		setCookie('eolTimer_servers', 'none,none,none', 365);		
		servers = 'none,none,none';
	}

	//Pongo los select
	var aux = servers.split(',');
	$('#serverA').val(aux[0]);
	$('#serverB').val(aux[1]);
	$('#serverC').val(aux[2]);

	$('#servers th.serverA').text(world_names[aux[0]]);	
	$('#servers th.serverB').text(world_names[aux[1]]);	
	$('#servers th.serverC').text(world_names[aux[2]]);	

	//Preferencias vacías
	if (prefAutoRefresh==undefined || prefAutoRefresh==null || prefAutoRefresh=="") {
		setCookie('eolTimer_autorefresh', 'none', 365);
		prefAutoRefresh = 'none';
	}
	if (prefNotifyPreEvents==undefined || prefNotifyPreEvents==null || prefNotifyPreEvents=="") {
		setCookie('eolTimer_notifyPreEvents', 'none', 365);
		prefNotifyPreEvents = 'none';
	}
	if (prefNotifySound==undefined || prefNotifySound==null || prefNotifySound=="") {
		setCookie('eolTimer_notifySounds', 'none', 365);
		prefNotifySound = 'none';
	}
	if (prefRealNames==undefined || prefRealNames==null || prefRealNames=="") {
		setCookie('eolTimer_realNames', 'none', 365);
		prefRealNames = 'none';
	}
	if (prefTableCondensed==undefined || prefTableCondensed==null || prefTableCondensed=="") {
		setCookie('eolTimer_tableMini', 'none', 365);
		prefTableCondensed = 'none';
	}
	if (prefEventsCompleted==undefined || prefEventsCompleted==null || prefEventsCompleted=="") {
		setCookie('eolTimer_eventsCompleted', 'none', 365);
		prefEventsCompleted = 'none';
	}

	//Checks estado inicial según cookies
	if (prefAutoRefresh == 'checked') {		
		$('#auto-refresh').attr('checked', 'checked');	
		clearInterval(autoRefreshTimer);	
		autoRefreshTimer = setInterval( checkServers, 25000 ); //25 segundos
		$('#timer_status').text('ON').addClass('on');
	} else {
		$('#auto-refresh').removeAttr('checked');		
		$('#timer_status').text('OFF').removeClass('on');
	}
	
	if (prefNotifyPreEvents == 'checked')
		$('#notify_pre-events').attr('checked', 'checked');		
	else
		$('#notify_pre-events').removeAttr('checked');	

	if (prefNotifySound == 'checked')
		$('#notify_sounds').attr('checked', 'checked');		
	else
		$('#notify_sounds').removeAttr('checked');	

	if (prefRealNames == 'checked') 
		$('#real_names').attr('checked', 'checked');		
	else {
		$('#real_names').removeAttr('checked');	
		changeRealNameEvents();
	}

	if (prefTableCondensed == 'checked') {
		$('#table_condensed').attr('checked', 'checked');		
		$('#event_table').addClass('table-condensed');
	} else {
		$('#table_condensed').removeAttr('checked');
		$('#event_table').removeClass('table-condensed');	
	}

	//Estado inicial de Tabla de eventos según la cookie
	if (prefEventsCompleted != 'none') {
		var aux = prefEventsCompleted.split(';');
		for (x in aux) {
			var ev_data = aux[x].split(',');

			//ID ev_data[0]; STATUS (1/0) ev_data[1]
			if (ev_data[1] == '1') {		
				$('#'+ev_data[0]).addClass('success').find('input.check_event').attr('checked', 'checked');
				eventsCompleted.push(ev_data[0]); //array de completados
			}
		}
		console.log(eventsCompleted);
	}
}



function checkServers() {	
	//Recojo servidores
	var serverA = $('#serverA').val(),
	serverB = $('#serverB').val(),
	serverC = $('#serverC').val(),
	urlA = 'https://api.guildwars2.com/v1/events.json?world_id='+serverA,
	urlB = 'https://api.guildwars2.com/v1/events.json?world_id='+serverB,
	urlC = 'https://api.guildwars2.com/v1/events.json?world_id='+serverC;

	/*TEST*///urlA = 'events_example.json';

	//Llamo a API por cada servidor
	if (serverA!='none') {
		$.ajax({
		  url: urlA,
		  dataType: 'json',
		  async: true,
		  beforeSend: loading("serverA")
		}).done(function(data) {
			//$.getJSON(urlA).done( function(data) {
			checkData(data, "serverA", serverA);			
		}).fail(function (){
			create_alert(text["error_updating_server"]+' '+world_names[serverA], 'error');
		}).always(function () {
			$('#servers .serverA .update').remove();
		});		
	}

	if (serverB!='none') {
		$.ajax({
		  url: urlB,
		  dataType: 'json',
		  async: true,
		  beforeSend: loading("serverB")
		}).done(function(data2) {
			//$.getJSON(urlA).done( function(data) {
			checkData(data2, "serverB", serverB);			
		}).fail(function (){
			create_alert(text["error_updating_server"]+' '+world_names[serverB], 'error');
		}).always(function () {
			$('#servers .serverB .update').remove();
		});		
	}

	if (serverC!='none') {
		$.ajax({
		  url: urlC,
		  dataType: 'json',
		  async: true,
		  beforeSend: loading("serverC")
		}).done(function(data3) {
			//$.getJSON(urlA).done( function(data) {
			checkData(data3, "serverC", serverC);			
		}).fail(function (){
			create_alert(text["error_updating_server"]+' '+world_names[serverC], 'error');
		}).always(function () {
			$('#servers .serverC .update').remove();
		});		
	}	
}

function loading(server) {
	console.log("Comprobando servidor: "+server);
	$('#servers .'+server).append('<img class="update" src="img/loading.gif" />');
}


function checkData(data, idDom, serverId) {
	//Recorro el array de data y de los eventos que yo tengo en cuenta miro el estado de cada uno de ellos, comparandolos con la estructura data
	//if (my_events.hasOwnProperty("33F76E9E-0BB6-46D0-A3A9-BE4CDFC4A3A4"))
	//Campos de data.events -> world_id, map_id, event_id, state (Warmup, Preparation, Active, Success, Fail)
	//var habiaPreEvents = false;
	console.log("En "+idDom+" hay "+data.events.length	+" eventos");	

	$.each(data.events, function(key, value) {
		//var habiaPreEvents = false;

		//Compruebo si es uno de los pre eventos primero
		if (my_pre_events.hasOwnProperty(value.event_id)) {
			var parentEvent = my_pre_events[value.event_id]; //El evento padre

			//console.log("Lo he hecho: "+ eventsCompleted.indexOf(parentEvent));
			//console.log(eventsCompleted);
			//console.log(parentEvent);

			//Compruebo si hay cambio de estado
			if (checkStateChange(value.event_id, value.state, idDom)) {
				//Si ha cambiado actualizo
				$('#data .events #'+value.event_id+' .'+idDom).text(value.state); //datos del prevento				
				//console.log(idDom+' Actualizado estado de pre-evento '+value.event_id+' a '+value.state);

				//Si es estado Active
				if (value.state == 'Active') {
					$('#event_table #'+parentEvent+' .'+idDom).attr('data-status', 'Chain').children('.name').text(text["prevents"]); //padre
						//Siempre creo las alertas/log
						create_alert(text["prevents_of"]+' <strong>'+my_events[parentEvent]+'</strong> '+text["are_active_in"]+' <u>'+world_names[serverId]+'</u>: <em>('+event_names[value.event_id]+')</em>', 'warning');		
					
					if ($('#notify_pre-events').is(':checked')  &&  eventsCompleted.indexOf(parentEvent) == -1) {
						notification('<p class="noty_server"><em>'+world_names[serverId]+'</em></p><div class="noty_data"><img src="img/events/'+parentEvent+'.jpg" /><p>'+text["prevents_of"]+' <strong>'+my_events[parentEvent]+'</strong> '+text["are_active"]+'.</p></div><p class="noty_prevent">('+event_names[value.event_id]+')</p>', 'warmup');			
					}

					if (firstServerLoad[idDom]) {
                        preEventsReload.push("$('#event_table #"+parentEvent+" ."+idDom+"').attr('data-status', 'Chain').children('.name').text('"+text['prevents']+"');");
                    }
				} 

				//Si falla el preEvento también cambio el padre
				if (value.state == 'Fail') {
					$('#event_table #'+parentEvent+' .'+idDom).attr('data-status', 'Fail').children('.name').text(text["Fail"]); //padre
					//No tengo que hacer el Reload aquí, porque el pre-evento falló, no me interesa más
				}
			}
		}


		//Compruebo si es uno de los eventos para terminar
		if (my_events.hasOwnProperty(value.event_id)) {	
			//Compruebo si ha cambiado de estado respecto a la anterior ejecución
			if (checkStateChange(value.event_id, value.state, idDom)) {
				//Actualizo el estado en tabla y DATA
				$('#data .events #'+value.event_id+' .'+idDom).text(value.state);

				$('#event_table #'+value.event_id+' .'+idDom).attr('data-status', value.state).children('.name').text(text[value.state]);								
				//console.log(idDom+' Actualizado estado de '+value.event_id+' a '+value.state);
				
				//Si el estado nuevo es Active, notifico, ya que es un evento BOSS	
				if (value.state == 'Active') {					
					create_alert('<strong>'+my_events[value.event_id]+'</strong> '+text["is_active_in"]+' <u>'+world_names[serverId]+'</u>', 'success');

					if (eventsCompleted.indexOf(value.event_id) == -1) {
						notification('<p class="noty_server"><em>'+world_names[serverId]+'</em></p><div class="noty_data"><img src="img/events/'+value.event_id+'.jpg" /><p><strong>'+my_events[value.event_id]+'</strong> '+text["is_active"]+'</p></div>', 'boss');
					}					
				}
			}
		}


		//En la primera vez que cargo eventos, pongo el lugar y demás cosas del tooltip
		if (firstServerLoad[idDom] == true) {
			$('#event_table #'+value.event_id+' label.checkbox').attr('data-content', map_names[value.map_id]).attr('data-original-title', text['location']);			
		}
	});

	firstServerLoad[idDom] = false;
	//console.log(map_names);
	
	//Para que no me sobreescriban los eventos a los pre-eventos la primera vez que cargo todo
	if (preEventsReload.length > 0) {
		$.each(preEventsReload, function(key2, value2) {
			//console.log("EJECUTANDO: "+value2);
        	eval(value2);
		});
		preEventsReload = new Array();
	}
}


function checkStateChange(eventId, actualState, idDom) {
	//Cojo el estado anterior del evento de los DATA
	var prevState = $('#data .events #'+eventId+' .'+idDom).text();
	if (actualState != prevState)
		return true;
	else
		return false;
}



//Listener de dropdowns
$('#serverA').change(function(){
	var aux = $(this).val() + ',' + $('#serverB').val() + ',' + $('#serverC').val();
	setCookie("eolTimer_servers", aux, 365);	
	
	//$('#servers th.serverA').text($(this).children('option:selected').text());	
	$('#servers th.serverA').text(world_names[$(this).val()]);	
});
$('#serverB').change(function(){
	var aux = $('#serverA').val() + ',' + $(this).val() + ',' + $('#serverC').val();
	setCookie("eolTimer_servers", aux, 365);	

	$('#servers th.serverB').text(world_names[$(this).val()]);	
});
$('#serverC').change(function(){
	var aux = $('#serverA').val() + ',' + $('#serverB').val() + ',' + $(this).val();
	setCookie("eolTimer_servers", aux, 365);	

	$('#servers th.serverC').text(world_names[$(this).val()]);	
});


//Listener de checkbox
	//Notificar Pre eventos
$('#notify_pre-events').change(function() {
	if ($(this).is(':checked'))
		setCookie('eolTimer_notifyPreEvents', 'checked', 365);		
	else
		setCookie('eolTimer_notifyPreEvents', 'none', 365);			
});

	//Sonidos
$('#notify_sounds').change(function() {
	if ($(this).is(':checked'))
		setCookie('eolTimer_notifySounds', 'checked', 365);		
	else
		setCookie('eolTimer_notifySounds', 'none', 365);			
});

	//Nombres de eventos
$('#real_names').change(function() {
	changeRealNameEvents();

	if ($(this).is(':checked'))
		setCookie('eolTimer_realNames', 'checked', 365);		
	else
		setCookie('eolTimer_realNames', 'none', 365);			
});

	//Tabla condensada
$('#table_condensed').change(function() {
	if ($(this).is(':checked')) {
		setCookie('eolTimer_tableMini', 'checked', 365);		
		$('#event_table').addClass('table-condensed');
	} else {
		setCookie('eolTimer_tableMini', 'none', 365);			
		$('#event_table').removeClass('table-condensed');
	}
});


	//Auto-refresh
$('#auto-refresh').on('click', function() {
	if($(this).is(':checked')) {  
		clearInterval(autoRefreshTimer);
        autoRefreshTimer = setInterval( checkServers, 25000 ); //25 segundos
        setCookie('eolTimer_autorefresh', 'checked', 365);
        $('#timer_status').text('ON').addClass('on');
        console.log("Auto-refresh ON");
    } else {  
        //Elimino el setInterval
        clearInterval(autoRefreshTimer);
        setCookie('eolTimer_autorefresh', 'none', 365);
        $('#timer_status').text('OFF').removeClass('on');
        console.log("Auto-refresh OFF");
    } 
});


//Botones
$('#btn_reset').on('click', function(e){	
	e.preventDefault();
	var answer = confirm("Reset all the completed events?");
	if (answer) {
		$('input.check_event').removeAttr('checked');
		$('tr.event').removeClass('success');	
	}	
});

//Cargo los datos en la tabla al pulsar el botón
$('#update_timers').on('click', function(e) {
	e.preventDefault();
	
	//Cambio mi texto
	//$(this).text('Update timers');
	
	//Si está marcada la casilla de auto-refresh
	if ($('#auto-refresh').is(':checked')) {
		checkServers();
		clearInterval(autoRefreshTimer);
		autoRefreshTimer = setInterval( checkServers, 25000 ); //25 segundos
		$('#timer_status').text('ON').addClass('on');
		//console.log("Auto-refresh ON");
	} else {
		checkServers();
		clearInterval(autoRefreshTimer);
		$('#timer_status').text('OFF').removeClass('on');
	}
});






//Genera la tabla de datos inicial con servidores
function generateTable(data, maps) {
	console.log("Creando tabla");
	var tabla = $('#event_table tbody');
	for(x in data) {
		//Para cada evento padre creo una entrada (los pre-eventos no los muestro en tabla)
		tabla.append('<tr class="event t50" id="'+x+'"><th><label class="checkbox inline event_name" data-toggle="popover" data-content="" data-original-title=""><input class="check_event" type="checkbox" /> <strong><span class="name" data-altname="'+my_events[x]+'">'+event_names[x]+'</span></strong></label></th><td class="serverA"><span class="name">--</span></td><td class="serverB"><span class="name">--</span></td><td class="serverC"><span class="name">--</span></td></tr>');
	}

	//Eventos de los checkbox
	$('input.check_event').on('change', function() {
		var tr = $(this).closest('tr.event');

		if ($(this).is(':checked')) {
			tr.addClass('success');
			eventsCompleted.push(tr.attr('id'));
		} else {
			tr.removeClass('success');
			var ind = eventsCompleted.indexOf(tr.attr('id'));			
			eventsCompleted.splice(ind, 1);
		}

		
		//alert("Añado/quito "+tr.attr('id'));
		console.log(eventsCompleted);

		//Salvo cambios
		saveCookieEventsCompleted();
	});


	/*
	<a href="#" class="btn btn-large btn-danger" data-toggle="popover" title="" data-content="And here's some amazing content. It's very engaging. right?" data-original-title="A Title">Click to toggle popover</a>
	*/
	// popover demo
	$("[data-toggle=popover]")
		.popover({placement:'top', delay:500, trigger:'hover'})
		.click(function(e) {  });
}



function saveCookieEventsCompleted() {
	//Cojo los estados de los checks de la tabla y los guardo en la cookie
	var datos = "";

	$('#event_table tbody tr').each(function () {
		//alert($(this).attr('id'));
		datos = datos + $(this).attr('id')+',';
		if ( $(this).find('input.check_event').is(':checked') ) {
			datos = datos + '1;';
		} else
			datos = datos + '0;';
	});

	setCookie('eolTimer_eventsCompleted', datos, 365);
}

function changeRealNameEvents() {
	//Intercambio title y contenido en los eventos
	$('#event_table label.event_name span.name').each(function() {
		var title = $(this).attr('data-altname'),
		content = $(this).text();
		$(this).attr('data-altname', content);
		$(this).text(title);
	});
}



/* type: warmup, boss
*/
function notification(n_text, n_type) {
	noty({
      text: n_text,
      type: n_type,
      dismissQueue: true,
      layout: 'bottomRight',
      theme: 'defaultTheme',
      animation: {
        open: {height: 'toggle'},
        close: {height: 'toggle'},
        easing: 'swing',
        speed: 500 // opening & closing animation speed
      },
      timeout: 20000
    });

    if ($('#notify_sounds').is(':checked')) {
    	//Alerta sonora
    	if (n_type == 'boss')
    	   	audio_boss.play();
    	else
    		audio_default.play();
    }
}


function create_alert(txt, type) {
	if (type=="error") type = "alert-error";
	if (type=="success") type = "alert-success";
	if (type=="info" || type==undefined) type = "alert-info";
	if (type=="warning") type = "";

	var current = new Date();
	var date = "[" + current.getHours() + ":" + current.getMinutes() + "]";

	$('#alerts div.messages').prepend('<div class="alert '+type+' fade in"><button type="button" class="close" data-dismiss="alert">&times;</button><span class="date-mini">' + date + "</span> " + txt + '</div>');	
}

/* AUDIOS
<audio>
	<source src="audio/beep.mp3"></source>
	<source src="audio/beep.ogg"></source>
	Your browser isn't invited for super fun audio time.
</audio>

var audio = $("#mySoundClip")[0];
audio.play();
audio.stop();

-- probar en Chrome que a lo mejor no funciona (Play y Stop serían)

http://www.javascriptkit.com/script/script2/soundlink.shtml
*/