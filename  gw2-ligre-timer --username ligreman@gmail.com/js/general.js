var autoRefreshTimer='', eventsCompleted = new Array(), firstServerLoad = new Array(), preEventsReload = new Array(),
audio_default = $("#audio_default")[0], audio_boss = $("#audio_boss")[0];

firstServerLoad["serverA"] = true;
firstServerLoad["serverB"] = true;
firstServerLoad["serverC"] = true;

create_alert(text['disclaimer'], 'info');		
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
	prefEventsCompleted = getCookie('eolTimer_eventsCompleted'),
	prefChromeNotifications = getCookie('eolTimer_chromeNotifications');
	
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
	if (prefChromeNotifications==undefined || prefChromeNotifications==null || prefChromeNotifications=="" || !window.webkitNotifications) {
		setCookie('eolTimer_chromeNotifications', 'none', 365);
		prefChromeNotifications = 'none';
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

	if (prefChromeNotifications == 'checked')
		$('#use_chrome').attr('checked', 'checked');		
	else
		$('#use_chrome').removeAttr('checked');	

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
		//console.log(eventsCompleted);
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
			checkData(data3, "serverC", serverC);			
		}).fail(function (){
			create_alert(text["error_updating_server"]+' '+world_names[serverC], 'error');
		}).always(function () {
			$('#servers .serverC .update').remove();
		});		
	}
}

function loading(server) {
	//console.log("Comprobando servidor: "+server);
	$('#servers .'+server).append('<img class="update" src="img/loading.gif" />');
}


function checkData(data, idDom, serverId) {
	//Recorro el array de data y de los eventos que yo tengo en cuenta miro el estado de cada uno de ellos, comparandolos con la estructura data
	//if (my_events.hasOwnProperty("33F76E9E-0BB6-46D0-A3A9-BE4CDFC4A3A4"))
	//Campos de data.events -> world_id, map_id, event_id, state (Warmup, Preparation, Active, Success, Fail)
	//console.log("En "+idDom+" hay "+data.events.length	+" eventos");	

	$.each(data.events, function(key, value) {
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
					  if ($('#use_chrome').is(':checked')  &&  window.webkitNotifications.checkPermission()==0) {
				  		chromeNotification('img/events/'+parentEvent+'.jpg', text["prevents_of"]+' '+my_events[parentEvent]+' '+text["are_active"], world_names[serverId]+' -- '+event_names[value.event_id], 'warmup');
					  } else {
					  	//Notificación normal
						notification('<p class="noty_server"><em>'+world_names[serverId]+'</em></p><div class="noty_data"><img src="img/events/'+parentEvent+'.jpg" /><p>'+text["prevents_of"]+' <strong>'+my_events[parentEvent]+'</strong> '+text["are_active"]+'.</p></div><p class="noty_prevent">('+event_names[value.event_id]+')</p>', 'warmup');
					  }
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
					  if ($('#use_chrome').is(':checked')  &&  window.webkitNotifications.checkPermission()==0) {
				  		chromeNotification('img/events/'+value.event_id+'.jpg', my_events[value.event_id]+' '+text["is_active"], world_names[serverId], 'boss');
					  } else {
						notification('<p class="noty_server"><em>'+world_names[serverId]+'</em></p><div class="noty_data"><img src="img/events/'+value.event_id+'.jpg" /><p><strong>'+my_events[value.event_id]+'</strong> '+text["is_active"]+'</p></div>', 'boss');
					  }
					}					
				}
			}
		}

		//En la primera vez que cargo eventos, pongo el lugar y demás cosas del tooltip
		if (firstServerLoad[idDom] == true) {
			$('#event_table #'+value.event_id+' a[data-toggle=popover]').attr('data-content', '<img src=\'img/locations/'+value.event_id+'.jpg\' />').attr('data-original-title', map_names[value.map_id]+' <a class="close" href="#">&times;</a>');			
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
	
	$('#servers th.serverA').text(world_names[$(this).val()]);	

	if ($(this).val() == 'none') {
		$('#event_table th.serverA').text(text["server"]+' A');
		$('#event_table td.serverA').removeAttr('data-status');
		$('#event_table td.serverA span.name').text('--');

		//En la tabla oculta he de poner eventos a null todos
		$('#data .events span.serverA').text('none');
	}
});
$('#serverB').change(function(){
	var aux = $('#serverA').val() + ',' + $(this).val() + ',' + $('#serverC').val();
	setCookie("eolTimer_servers", aux, 365);	

	$('#servers th.serverB').text(world_names[$(this).val()]);	

	if ($(this).val() == 'none') {
		$('#event_table th.serverB').text(text["server"]+' B');
		$('#event_table td.serverB').removeAttr('data-status');
		$('#event_table td.serverB span.name').text('--');

		//En la tabla oculta he de poner eventos a null todos
		$('#data .events span.serverB').text('none');
	}
});
$('#serverC').change(function(){
	var aux = $('#serverA').val() + ',' + $('#serverB').val() + ',' + $(this).val();
	setCookie("eolTimer_servers", aux, 365);	

	$('#servers th.serverC').text(world_names[$(this).val()]);	

	if ($(this).val() == 'none') {
		$('#event_table th.serverC').text(text["server"]+' C');
		$('#event_table td.serverC').removeAttr('data-status');
		$('#event_table td.serverC span.name').text('--');

		//En la tabla oculta he de poner eventos a null todos
		$('#data .events span.serverC').text('none');
	}
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

	//Usar notificaciones Chrome
$('#use_chrome').change(function() {
	if ($(this).is(':checked')) {
		setCookie('eolTimer_chromeNotifications', 'checked', 365);		

		if (window.webkitNotifications.checkPermission!=0) {
			window.webkitNotifications.requestPermission();
		}
	} else
		setCookie('eolTimer_chromeNotifications', 'none', 365);			
});

	//Auto-refresh
$('#auto-refresh').on('click', function() {
	if($(this).is(':checked')) {  
		clearInterval(autoRefreshTimer);
        autoRefreshTimer = setInterval( checkServers, 25000 ); //25 segundos
        setCookie('eolTimer_autorefresh', 'checked', 365);
        $('#timer_status').text('ON').addClass('on');
        //console.log("Auto-refresh ON");
    } else {  
        //Elimino el setInterval
        clearInterval(autoRefreshTimer);
        setCookie('eolTimer_autorefresh', 'none', 365);
        $('#timer_status').text('OFF').removeClass('on');
        //console.log("Auto-refresh OFF");
    } 
});


//Botones
$('#btn_reset').on('click', function(e){	
	e.preventDefault();
	var answer = confirm(text["reset_events_ask"]);
	if (answer) {
		$('input.check_event').removeAttr('checked');
		$('tr.event').removeClass('success');	
		eventsCompleted = new Array();
		saveCookieEventsCompleted();
	}	
});

//Cargo los datos en la tabla al pulsar el botón
$('#update_timers').on('click', function(e) {
	e.preventDefault();
	
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
	//console.log("Creando tabla");
	var tabla = $('#event_table tbody');
	for(x in data) {
		//Para cada evento padre creo una entrada (los pre-eventos no los muestro en tabla)
		tabla.append('<tr class="event t50" id="'+x+'"><td class="middle"><a href="#" class="btn btn-info btn-mini" data-toggle="popover" data-content="" data-original-title=""><i class="icon-info-sign icon-white"></i></a></td><th><label class="checkbox inline event_name"><input class="check_event" type="checkbox" /> <strong><span class="name" data-altname="'+my_events[x]+'">'+event_names[x]+'</span></strong></label></th><td class="serverA"><span class="name">--</span></td><td class="serverB"><span class="name">--</span></td><td class="serverC"><span class="name">--</span></td></tr>');
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

		//console.log(eventsCompleted);

		//Salvo cambios
		saveCookieEventsCompleted();
	});

	// popover
	$("[data-toggle=popover]")
		.popover({placement:'right', trigger:'click', html:true, delay:{show:500, hide:100}})
		.click(function(e) { 
			e.preventDefault();

			$(".popover").on('click', function() { 
				$("[data-toggle=popover]").popover('hide'); 
			});
		 });
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

	//El sonido
    if ($('#notify_sounds').is(':checked')) {
    	//Alerta sonora
    	if (n_type == 'boss')
    	   	audio_boss.play();
    	else
    		audio_default.play();
    }
}

function chromeNotification(icon, title, text, n_type) {
	if (window.webkitNotifications) {            
		if (window.webkitNotifications.checkPermission() != 0) {
			window.webkitNotifications.requestPermission();
	    } else {
	    	var notification = window.webkitNotifications.createNotification(icon, title, text);

		    notification.onclick = function () { notification.close(); }
		    notification.ondisplay = function () { setTimeout(function(){ notification.close(); }, 20000); }
		    
		    notification.show();  

		    //El sonido
		    if ($('#notify_sounds').is(':checked')) {
		    	//Alerta sonora
		    	if (n_type == 'boss')
		    	   	audio_boss.play();
		    	else
		    		audio_default.play();
		    }  
	    }
	} else {
		//Por si acaso, un fallback
		notification(title+'; '+text, n_type);
	}
}


function create_alert(txt, type) {
	if (type=="error") type = "alert-error";
	if (type=="success") type = "alert-success";
	if (type=="info" || type==undefined) type = "alert-info";
	if (type=="warning") type = "";

	var current = new Date(),
	date = '[';

	var h = ""+current.getHours(),
	m = ""+current.getMinutes();

	if (h.length == 1)
		date = date + '0' + h;
	else
		date = date + h;

	date = date + ':';

	if (m.length == 1)
		date = date + '0' + m;
	else
		date = date + m;

	date = date + ']';

	$('#alerts div.messages').prepend('<div class="alert '+type+' fade in"><button type="button" class="close" data-dismiss="alert">&times;</button><span class="date-mini">' + date + "</span> " + txt + '</div>');	
}

function clock() {
	var Digital=new Date();
	var hours=Digital.getHours(), minutes=Digital.getMinutes(), seconds=Digital.getSeconds();
	
	if (minutes<=9)
 		minutes="0"+minutes;
 	if (seconds<=9)
 		seconds="0"+seconds;

 	$('#clock').text(hours+":"+minutes+":"+seconds);
 	setTimeout("clock()", 1000);
}



function checkTemples() {
	var firstLoad = true;

	//Limpieza de tabla
	$('#temples_table').empty();	

	//Genero la tabla
	$('#temples_table').append('<thead class="header"><tr><td></td></tr></thead><tfoot><tr><td></td></tr></tfoot><tbody></tbody>');

	for (y in temples_table) {		
		//genero las cabeceras de la tabla		
		$('#temples_table thead tr, #temples_table tfoot tr').append('<th>'+temples_table[y]+'</th>');
	}

	for(x in world_names) {	
		//Genero las filas
		var tr = '<tr id="tm_'+x+'"><th>'+world_names[x]+'</th>';

		for (y in temples_table) {
			tr = tr + '<td class="'+y+'">--</td>';
		}

		tr = tr + '</tr>';
		$('#temples_table tbody').append(tr);
	}


	//Por cada templo, consulto su estado en todos los mundos, así solo hago 1 consulta por templo
	for (y in temples_table) {		
		//console.log("Consulto "+temples_table[y]);
		//Consulto el estado del templo en cuestion en el servidor
		$.ajax({
		  //url: 'example_events.json',
		  url: 'https://api.guildwars2.com/v1/events.json?event_id='+y,
		  dataType: 'json',
		  async: false
		}).done(function(data) {	
			//console.log(data);			
			$.each(data.events, function(key, value) {
				//console.log('#tm_'+value.world_id+' td.'+y);
				$('#tm_'+value.world_id+' td.'+y).text(text['temple'+value.state]).addClass(value.state);				
			});
		}).fail(function (){
			//alert("error");
			create_alert('Error checking temple '+temples_table[y], 'fail');
		});			
	}

}