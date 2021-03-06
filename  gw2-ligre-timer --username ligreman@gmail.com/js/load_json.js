var world_names = new Array(),
	event_names = new Array(),
	map_names = new Array(),
	events_table = new Array(),
	my_events = new Array(),
	my_pre_events = new Array(),
	aliases = new Array(),
	temples_table = new Array(),
	id_codes = new Array(),
	codes_id = new Array();

// en, es, fr, de

	if ($.support.cors == false)
	{
		create_alert('No se soporta CORS', 'fail');
	} else {
		create_alert('Soporta CORS', 'success');
	}

	//Worlds
	var url = "json/world_"+lang+".json";
	//console.log("Loading JSON: "+url);

	$.ajax({	  
	  url: url,
	  dataType: 'json',
	  //xhrFields: { withCredentials: false },
	  async: false
	}).done(function(data) {
		//console.log("Worlds JSON loaded ("+data.length+" items)");

		$.each(data, function(key, value) {

			$("#serverA, #serverB, #serverC").append('<option value="'+value.id+'">'+value.name+'</option>');
			world_names[parseInt(value.id)] = value.name;
		});		

		//console.log("Iterations: "+i);
		//console.log(world_names);
		//console.log("Iterations 2: "+i);
	}).fail(function (){
		create_alert('Error loading JSON '+url, 'fail');
	});


	//Events
	url = "json/event_"+lang+".json";
	//console.log("Loading JSON: "+url);

	$.ajax({
	  url: url,
	  dataType: 'json',
	  async: false
	}).done(function(data) {
		//console.log("Events JSON loaded ("+data.length+" items)");

		$.each(data, function(key, value) {
			event_names[value.id] = value.name;
		});		
	}).fail(function (){
		create_alert('Error loading JSON '+url, 'fail');
	});


	//Maps
	url = "json/map_"+lang+".json";
	//console.log("Loading JSON: "+url);

	$.ajax({
	  url: url,
	  dataType: 'json',
	  async: false
	}).done(function(data) {
		//console.log("Maps JSON loaded ("+data.length+" items)");

		$.each(data, function(key, value) {
			map_names[parseInt(value.id)] = value.name;
		});		
	}).fail(function (){
		create_alert('Error loading JSON '+url, 'fail');
	});


	//Aliases
	url = "json/alias_"+lang+".json";
	//console.log("Loading JSON: "+url);

	$.ajax({
	  url: url,
	  dataType: 'json',
	  async: false
	}).done(function(data) {
		//console.log("Aliases JSON loaded ("+data.length+" items)");			

		$.each(data, function(key, value) {
			aliases[value.id] = value.alias;			
		});
	}).fail(function (){
		create_alert('Error loading JSON '+url, 'fail');
	});


	//Events and PreEvents
	url = "json/events_table.json";
	//console.log("Loading JSON: "+url);

	$.ajax({
	  url: url,
	  dataType: 'json',
	  async: false
	}).done(function(data) {
		//console.log("Events Table JSON loaded ("+data.events.length+" items)");	
		//console.log(data);
		
		var insider, event_dom = $('div#data div.events');

		$.each(data.events, function(key, value) {	
			insider = new Array();
			$.each(value.pre_events, function(key2, value2){	
				insider.push(value2.id);
				event_dom.append('<p id="'+value2.id+'"><span class="serverA">none</span> <span class="serverB">none</span> <span class="serverC">none</span></p>');
				my_pre_events[value2.id] = value.id;
			});
	
			events_table[value.id] = insider;		

			event_dom.append('<p id="'+value.id+'"><span class="serverA">none</span> <span class="serverB">none</span> <span class="serverC">none</span></p>');
			my_events[value.id] = aliases[value.id];	

			//asociación id y code
			id_codes[value.code] = value.id;
			codes_id[value.id] = value.code;
		});	

		delete insider;
		//console.log(events_table);
		//console.log("-------------------------------");
		//console.log(my_events);
		//console.log(my_pre_events);
		//console.log(my_maps);
		//console.log(id_codes);

		//Inicio otras cosas de la página
		generateTable(events_table);
		checkCookie();
	}).fail(function (){
		create_alert('Error loading JSON '+url, 'fail');
	});



	//Temples
	url = "json/temples_table.json";	

	$.ajax({
	  url: url,
	  dataType: 'json',
	  async: false
	}).done(function(data) {
		//console.log("Temples JSON loaded ("+data.length+" items)");			

		$.each(data.temples, function(key, value) {
			temples_table[value.id] = value.god;			
		});
	}).fail(function (){
		create_alert('Error loading JSON '+url, 'fail');
	});


	//Hours
	url = "json/boss_hours.json";	

	var remanentHours = new Array();

	$.ajax({
	  url: url,
	  dataType: 'json',
	  async: false
	}).done(function(data) {
		var ahora = new Date();
		
		$.each(data.hours, function(key, value) {
			if (value!=undefined && value.boss!="-") {
				horaBoss = convertToUTC(parseInt(value.hour));
				minutoBoss = parseInt(value.minute);

				if (horaBoss>ahora.getHours()) {
					create_bossHour(aliases[value.boss], convertToUTC(value.hour), value.minute);			
				} else if (horaBoss==ahora.getHours() && minutoBoss>ahora.getMinutes()) {
					create_bossHour(aliases[value.boss], convertToUTC(value.hour), value.minute);
				} else {
					remanentHours[key] = value;
				}
			}
		});


		//Las remanentes
		$.each(remanentHours, function(key,value) {
			//console.log(value);
			if (value!=undefined && value.boss!="-") {
				create_bossHour(aliases[value.boss], convertToUTC(value.hour), value.minute);
			}
		});
		//console.log(remanentHours);


	}).fail(function (){
		create_alert('Error loading JSON '+url, 'fail');
	});


	delete url;

//}