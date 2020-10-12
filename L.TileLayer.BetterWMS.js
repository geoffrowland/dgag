L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({
  
  onAdd: function (map) {
    // Triggered when the layer is added to a map.
    //   Register a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onAdd.call(this, map);
    map.on('click', this.getFeatureInfo, this);
  },
  
  onRemove: function (map) {
    // Triggered when the layer is removed from a map.
    //   Unregister a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onRemove.call(this, map);
    map.off('click', this.getFeatureInfo, this);
  },
  
  getFeatureInfo: function (evt) {
  if ((this._map.getZoom() >= this.options.minZoom) && (this._map.getZoom() <= this.options.maxZoom)) {
    // Make an AJAX request to the server and hope for the best
    var url = this.getFeatureInfoUrl(evt.latlng),
        showResults = L.Util.bind(this.showGetFeatureInfo, this);
    $.ajax({
      url: url,
      success: function (data, status, xhr) {
        var err = typeof data === 'string' ? null : data;
        //Fix for blank popup window
        var doc = (new DOMParser()).parseFromString(data, "text/html"); 
        if (doc.body.innerHTML.trim().length > 0)
          showResults(err, evt.latlng, data);
      },
      error: function (xhr, status, error) {
        //showResults(error);  
      }
    });
   }
  },
  
  getFeatureInfoUrl: function (latlng) {
    // Construct a GetFeatureInfo request URL given a point
    var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
        size = this._map.getSize(),
        
        params = {
          request: 'GetFeatureInfo',
          service: 'WMS',
          srs: 'EPSG:4326',
          styles: this.wmsParams.styles,
          transparent: this.wmsParams.transparent,
          version: this.wmsParams.version,      
          format: this.wmsParams.format,
          bbox: this._map.getBounds().toBBoxString(),
          height: size.y,
          width: size.x,
          layers: this.wmsParams.layers,
          query_layers: this.wmsParams.layers,
          info_format: 'text/plain'
        };
        
    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;
    
    return this._url + L.Util.getParamString(params, this._url, true);
  },
  
  showGetFeatureInfo: function (err, latlng, content) {
    if (err) { console.log(err); return; } // do nothing if there's an error
    var lng = latlng.lng;
    var lat = latlng.lat;
    var bngproj = '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs';
    var bngcoords = proj4(bngproj, [lng, lat]);
    var bngEasting = bngcoords[0].toFixed(0);
    var bngNorthing = bngcoords[1].toFixed(0);
        // get the 100km-grid indices
        var e100k = Math.floor(bngEasting/100000);
        var n100k = Math.floor(bngNorthing/100000);

        // validate BNG
        if (e100k<0 || e100k>6 || n100k<0 || n100k>12) {
		    var bngEasting = "";
            var bngNorthing = "";	
            var bngString = "";
            var eastingPrefix = "";
            var northingPrefix = "";
            var bngPrefix = "";
            
		} else {	
            // translate those into numeric equivalents of the grid letters
            var l1 = (19-n100k) - (19-n100k)%5 + Math.floor((e100k+10)/5);
            var l2 = (19-n100k)*5%25 + e100k%5;
            // compensate for skipped 'I' and build grid letter-pairs
            if (l1 > 7) l1++;
            if (l2 > 7) l2++;
            var letterPair = String.fromCharCode(l1+'A'.charCodeAt(0), l2+'A'.charCodeAt(0));
            // add leading 0s if necessary
            var osEasting = "0000" + bngEasting;
            var osNorthing = "0000" + bngNorthing;       
            var bngString = letterPair + " " + osEasting.substr(-5) + " " + osNorthing.substr(-5);
            var eastingPrefix = "  Easting:";
            var northingPrefix = " Northing:";
            var bngPrefix = "BNG:";
        }  
    blscontent = '';
    bls = content.split('GBR_BGS_625k_BLS');
    if (bls.length > 1) {
		blsname = bls[1].split("LEX_D = \'")[1];
		blsname = blsname.split("\'")[0];
		if (blsname != '') {blsname = 'Bedrock: ' + blsname};
		blsdesc = bls[1].split("RCS_D = \'")[1];
		blsdesc = blsdesc.split("\'")[0];
		if (blsdesc != '') {blsdesc = '<br/>Description: ' + blsdesc};
		blstime1 = bls[1].split("MAX_TIME_Y = \'")[1];
		blstime1 = blstime1.split("\'")[0];
		blstime1 = blstime1 / 1000000;
		blstime2 = bls[1].split("MIN_TIME_Y = \'")[1];
		blstime2 = blstime2.split("\'")[0];
		blstime2 = blstime2 / 1000000;
		blstime = '<br/>Time: ' + blstime1 + ' to ' + blstime2 + ' million years ago';
		blsage1 = bls[1].split("MAX_TIME_D = \'")[1];
		blsage1 = blsage1.split("\'")[0];
		blsage2 = bls[1].split("MIN_TIME_D = \'")[1];
		blsage2 = blsage2.split("\'")[0];
		if (blsage1 == blsage2) {blsage = blsage1} else {blsage = blsage1 + ' to ' + blsage2};
		if (blsage != '') {blsage = '<br/>Age: ' + blsage};
		blsepoch1 = bls[1].split("MAX_EPOCH = \'")[1];
		blsepoch1 = blsepoch1.split("\'")[0];
		blsepoch2 = bls[1].split("MIN_EPOCH = \'")[1];
		blsepoch2 = blsepoch2.split("\'")[0];
		if (blsepoch1 == blsepoch2) {blsepoch = blsepoch1} else {blsepoch = blsepoch1 + ' to ' + blsepoch2};
		if (blsepoch != '') {blsepoch = '<br/>Epoch: ' + blsepoch};
		blssubperiod1 = bls[1].split("MAX_SUBPER = \'")[1];
		blssubperiod1 = blssubperiod1.split("\'")[0];
		blssubperiod2 = bls[1].split("MIN_SUBPER = \'")[1];
		blssubperiod2 = blssubperiod2.split("\'")[0];
		if (blssubperiod1 == blssubperiod2) {blssubperiod = blssubperiod1} else {blssubperiod = blssubperiod1 + ' to ' + blssubperiod2};
		if (blssubperiod != '') {blssubperiod = '<br/>Subperiod: ' + blssubperiod};
		blsperiod1 = bls[1].split("MAX_PERIOD = \'")[1];
		blsperiod1 = blsperiod1.split("\'")[0];
		blsperiod2 = bls[1].split("MIN_PERIOD = \'")[1];
		blsperiod2 = blsperiod2.split("\'")[0];
		if (blsperiod1 == blsperiod2) {blsperiod = blsperiod1} else {blsperiod = blsperiod1 + ' to ' + blsperiod2};
		if (blsperiod != '') {blsperiod = '<br/>Period: ' + blsperiod};
		blsera1 = bls[1].split("MAX_ERA = \'")[1];
		blsera1 = blsera1.split("\'")[0];
		blsera2 = bls[1].split("MIN_ERA = \'")[1];
		blsera2 = blsera2.split("\'")[0];
		if (blsera1 == blsera2) {blsera = blsera1} else {blsera = blsera1 + ' to ' + blsera2};
		if (blsera != '') {blsera = '<br/>Era: ' + blsera};
		blseon1 = bls[1].split("MAX_EON = \'")[1];
		blseon1 = blseon1.split("\'")[0];
		blseon2 = bls[1].split("MIN_EON = \'")[1];
		blseon2 = blseon2.split("\'")[0];
		if (blseon1 == blseon2) {blseon = blseon1} else {blseon = blseon1 + ' to ' + blseon2};
		if (blseon != '') {blseon = '<br/>Eon: ' + blseon};
	    blscontent = blsname + blsdesc + blstime + blsage + blsepoch + blssubperiod + blsperiod + blsera + blseon + '<br/><br/>Locaton: ' + bngString + '<br/>';
    };

    slscontent = '';
    sls = content.split('GBR_BGS_625k_SLS');
    if (sls.length > 1) {
		slsname = sls[1].split(" = \'")[3];
		slsname = slsname.split("\'")[0];
		slsdesc = sls[1].split(" = \'")[5];
		slsdesc = slsdesc.split("\'")[0];
		slsage1 = sls[1].split("MAX_TIME_D = \'")[1];
		slsage1 = slsage1.split("\'")[0];
		slsage2 = sls[1].split("MIN_TIME_D = \'")[1];
		slsage2 = slsage2.split("\'")[0];
		if (slsage1 == blsage2) {slsage = slsage1} else {slsage = slsage1 + ' to ' + slsage2};
		slsepoch1 = sls[1].split("MAX_EPOCH = \'")[1];
		slsepoch1 = slsepoch1.split("\'")[0];
		slsepoch2 = sls[1].split("MIN_EPOCH = \'")[1];
		slsepoch2 = slsepoch2.split("\'")[0];
		if (slsepoch1 == slsepoch2) {slsepoch = slsepoch1} else {slsepoch = slsepoch1 + ' to ' + slsepoch2};
		slssubperiod1 = sls[1].split("MAX_SUBPER = \'")[1];
		slssubperiod1 = slssubperiod1.split("\'")[0];
		slssubperiod2 = sls[1].split("MIN_SUBPER = \'")[1];
		slssubperiod2 = slssubperiod2.split("\'")[0];
		if (slssubperiod1 == slssubperiod2) {slssubperiod = slssubperiod1} else {slssubperiod = slssubperiod1 + ' to ' + slssubperiod2};
		slsperiod1 = sls[1].split("MAX_PERIOD = \'")[1];
		slsperiod1 = slsperiod1.split("\'")[0];
		slsperiod2 = sls[1].split("MIN_PERIOD = \'")[1];
		slsperiod2 = slsperiod2.split("\'")[0];
		if (slsperiod1 == slsperiod2) {slsperiod = slsperiod1} else {slsperiod = slsperiod1 + ' to ' + slsperiod2};
		slsera1 = sls[1].split("MAX_ERA = \'")[1];
		slsera1 = slsera1.split("\'")[0];
		slsera2 = sls[1].split("MIN_ERA = \'")[1];
		slsera2 = slsera2.split("\'")[0];
		if (slsera1 == slsera2) {slsera = slsera1} else {slsera = slsera1 + ' to ' + slsera2};
		slseon1 = sls[1].split("MAX_EON = \'")[1];
		slseon1 = slseon1.split("\'")[0];
		slseon2 = sls[1].split("MIN_EON = \'")[1];
		slseon2 = slseon2.split("\'")[0];
		if (slseon1 == slseon2) {slseon = slseon1} else {slseon = slseon1 + ' to ' + slseon2};		
	    slscontent = 'Surface deposit: ' + slsname + '<br/>Description: ' + slsdesc + '<br/>Age:' + slsage + '<br/>Epoch: ' + slsepoch + '<br/>Subperiod: ' + slssubperiod + '<br/>Period: ' + slsperiod + '<br/>Era: ' + slsera + '<br/>Eon: ' + slseon + '<br/><br/>Locaton: ' + bngString + '<br/>';
    };
 
    bedrockcontent = '';
    bedrock = content.split('@BGS.50k.Bedrock');
    if (bedrock.length > 1) {   
        age1 = bedrock[1].split(";")[31];
        age2 = bedrock[1].split(";")[32];
        if (age1 == age2) {age = age1} else {age = age1 + ' to ' + age2};
        
        period1 = bedrock[1].split(";")[45];
        period2 = bedrock[1].split(";")[46];
        if (period1 == period2) {period = period1} else {period = period1 + ' to ' + period2};
        name = bedrock[1].split(";")[30];
        type = bedrock[1].split(";")[47];
        if (type != '') {
		type = type[0].toUpperCase() + type.slice(1);
		type = '<br/>Type: ' + type
	};
	if (name == 'LYNDHURST MEMBER - SAND, SILT AND CLAY') {name = name + '<br />HEADON FORMATION<br />SOLENT GROUP'};
	if (name == 'HEADON FORMATION - CLAY, SILT AND SAND') {name = name + '<br />SOLENT GROUP'};
//
	if (name == 'BECTON BUNNY MEMBER - CLAY') {name = name + '<br />BECTON SAND FORMATION<br />BARTON GROUP'};
        if (name == 'BECTON SAND FORMATION - SAND') {name = name + '<br />BARTON GROUP'};
        if (name == 'CHAMA SAND FORMATION - SAND, SILT AND CLAY') {name = name + '<br />BARTON GROUP'};
	if (name == 'BECTON SAND FORMATION AND CHAMA SAND FORMATION (UNDIFFERENTIATED) - SAND, SILT AND CLAY') {name = name + '<br />BARTON GROUP'};    
	if (name == 'WARREN HILL SAND MEMBER - SAND') {name = name + '<br>BARTON CLAY FORMATION<br />BARTON GROUP'};  
	if (name == 'BARTON CLAY FORMATION - CLAY') {name = name + '<br />BARTON GROUP'};
//	    
	if (name == 'BOSCOMBE SAND FORMATION - CLAY') {name = name + '<br />BRACKLESHAM GROUP'};
	if (name == 'BOSCOMBE SAND FORMATION - SAND') {name = name + '<br />BRACKLESHAM GROUP'};  
	if (name == 'CREECH BARROW LIMESTONE MEMBER - LIMESTONE') {name = name + '<br />CREECH BARROW LIMESTONE FORMATION<br />BRACKLESHAM GROUP'};
	if (name == 'CREECH BRICK CLAY MEMBER - CLAY') {name = name + '<br />BRANKSOME SAND FORMATION<br />BRACKLESHAM GROUP'};
	if (name == 'BRANKSOME SAND FORMATION - CLAY') {name = name + '<br />BRACKLESHAM GROUP'};   
        if (name == 'BRANKSOME SAND FORMATION - SAND') {name = name + '<br />BRACKLESHAM GROUP'};
	if (name == 'PARKSTONE CLAY MEMBER - CLAY') {name = name + '<br />POOLE FORMATION<br />BRACKLESHAM GROUP'};	    
	if (name == 'PARKSTONE SAND MEMBER - SAND') {name = name + '<br />POOLE FORMATION<br />BRACKLESHAM GROUP'};
	if (name == 'BROADSTONE SAND MEMBER - SAND') {name = name + '<br />POOLE FORMATION<br />BRACKLESHAM GROUP'};
	if (name == 'BROADSTONE CLAY MEMBER - CLAY, SILTY') {name = name + '<br />POOLE FORMATION<br />BRACKLESHAM GROUP'};
  	if (name == 'BROADSTONE CLAY MEMBER - SAND') {name = name + '<br />POOLE FORMATION<br />BRACKLESHAM GROUP'};
        if (name == 'OAKDALE CLAY MEMBER - SAND') {name = name + '<br />POOLE FORMATION<br />BRACKLESHAM GROUP'};	    
	if (name == 'OAKDALE CLAY MEMBER - CLAY') {name = name + '<br />POOLE FORMATION<br />BRACKLESHAM GROUP'};
        if (name == 'OAKDALE SAND MEMBER - SAND') {name = name + '<br />POOLE FORMATION<br />BRACKLESHAM GROUP'};
	if (name == 'BROADSTONE SAND MEMBER AND OAKDALE SAND MEMBER (UNDIFFERENTIATED) - SAND') {name = name + '<br />POOLE FORMATIONY<br />BRACKLESHAM GROUP'}; 
	if (name == 'CREEKMOOR CLAY MEMBER - CLAY') {name = name + '<br />POOLE FORMATION<br />BRACKLESHAM GROUP'};
        if (name == 'CREEKMOOR SAND MEMBER - SAND') {name = name + '<br />POOLE FORMATION<br />BRACKLESHAM GROUP'};  
	if (name == 'POOLE FORMATION - SAND, SILT AND CLAY') {name = name + '<br />BRACKLESHAM GROUP'};
	if (name == 'POOLE FORMATION - CLAY') {name = name + '<br />BRACKLESHAM GROUP'};
	if (name == 'POOLE FORMATION - SAND AND GRAVEL') {name = 'POOLE FORMATION - SAND AND GRAVEL<br />BRACKLESHAM GROUP'};
	if (name == 'POOLE FORMATION - SAND') {name = 'POOLE FORMATION - SAND<br />BRACKLESHAM GROUP'};
//
	if (name == 'LONDON CLAY FORMATION - SAND') {name = 'LONDON CLAY FORMATION - SAND<br />THAMES GROUP'};	
	if (name == 'LONDON CLAY FORMATION - CLAY, SILT AND SAND') {name = 'LONDON CLAY FORMATION - CLAY, SILT AND SAND<br />THAMES GROUP'};
	if (name == 'LYTCHETT MATRAVERS SAND MEMBER - SAND') {name = 'LYTCHETT MATRAVERS SAND MEMBER - SAND<br />LONDON CLAY FORMATION<br />THAMES GROUP'};    
	if (name == 'WARMWELL FARM SAND MEMBER - SAND') {name = 'KIMBRIDGE MEMBER AND TILEHURST MEMBER (UNDIFFERENTIATED) - SAND<br />(WARMWELL FARM SAND MEMBER - SAND)<br />HARWICH FORMATION<br />THAMES GROUP'; age = 'YPRESIAN'; period = 'EOCENE'};     
	if (name == 'WEST PARK FARM MEMBER - SAND') {name = 'KIMBRIDGE MEMBER - SAND<br />(WEST PARK FARM MEMBER - SAND)<br />HARWICH FORMATION<br />THAMES GROUP'; age = 'YPRESIAN'; period = 'EOCENE'};     
	if (name == 'WEST PARK FARM MEMBER - CLAY') {name = 'UPNOR FORMATION AND READING FORMATION (UNDIFFERENTIATED) - CLAY<br />(WEST PARK FARM MEMBER - CLAY)<br />LAMBETH GROUP'; age = 'THANETIAN to YPRESIAN'; period = 'PALEOCENE to EOCENE'}; 
        if (name == 'READING FORMATION - SAND, SILT AND CLAY') {name = 'UPNOR FORMATION AND READING FORMATION (UNDIFFERENTIATED) - SAND, SILT AND CLAY<br />LAMBETH GROUP'; age = 'THANETIAN to YPRESIAN'; period = 'PALEOCENE to EOCENE'};
        if (name == 'READING FORMATION - SAND') {name = 'UPNOR FORMATION AND READING FORMATION (UNDIFFERENTIATED) - SAND<br />LAMBETH GROUP'; age = 'THANETIAN to YPRESIAN'; period = 'PALEOCENE to EOCENE'};
        if (name == 'READING FORMATION - SAND AND GRAVEL') {name = 'UPNOR FORMATION AND READING FORMATION (UNDIFFERENTIATED) - SAND AND GRAVEL<br />LAMBETH GROUP'; age = 'THANETIAN to YPRESIAN'; period = 'PALEOCENE to EOCENE'};
//
	if (name == 'PORTSDOWN CHALK FORMATION - CHALK') {name = 'PORTSDOWN CHALK FORMATION - CHALK<br />WHITE CHALK SUBGROUP<br />CHALK GROUP'};	    
	if (name == 'SEAFORD CHALK FORMATION, NEWHAVEN CHALK FORMATION AND CULVER CHALK FORMATION (UNDIFFERENTIATED) - CHALK') {name = 'SEAFORD CHALK FORMATION, NEWHAVEN CHALK FORMATION AND CULVER CHALK FORMATION (UNDIFFERENTIATED) - CHALK<br />WHITE CHALK SUBGROUP<br />CHALK GROUP'};
	if (name == 'SPETISBURY CHALK MEMBER - CHALK') {name = 'SPETISBURY CHALK MEMBER - CHALK<br />CULVER CHALK FORMATION<br />WHITE CHALK SUBGROUP<br />CHALK GROUP'};
	if (name == 'TARRANT CHALK MEMBER - CHALK') {name = 'TARRANT CHALK MEMBER - CHALK<br />CULVER CHALK FORMATION<br />WHITE CHALK SUBGROUP<br />CHALK GROUP'};
	if (name == 'CULVER CHALK FORMATION - CHALK') {name = 'CULVER CHALK FORMATION - CHALK<br />WHITE CHALK SUBGROUP<br />CHALK GROUP'};
	if (name == 'NEWHAVEN CHALK FORMATION - CHALK') {name = 'NEWHAVEN CHALK FORMATION - CHALK<br />WHITE CHALK SUBGROUP<br />CHALK GROUP'};
	if (name == 'SEAFORD CHALK FORMATION - CHALK') {name = 'SEAFORD CHALK FORMATION - CHALK<br />WHITE CHALK SUBGROUP<br />CHALK GROUP'};
	if (name == 'SEAFORD CHALK FORMATION AND NEWHAVEN CHALK FORMATION (UNDIFFERENTIATED) - CHALK') {name = 'SEAFORD CHALK FORMATION AND NEWHAVEN CHALK FORMATION (UNDIFFERENTIATED) - CHALK<br />WHITE CHALK SUBGROUP<br />CHALK GROUP'};
	if (name == 'LEWES NODULAR CHALK FORMATION - CHALK') {name = 'LEWES NODULAR CHALK FORMATION - CHALK<br />WHITE CHALK SUBGROUP<br />CHALK GROUP'};	    
	if (name == 'HOLYWELL NODULAR CHALK FORMATION - CHALK') {name = 'HOLYWELL NODULAR CHALK FORMATION - CHALK<br />WHITE CHALK SUBGROUP<br />CHALK GROUP'};
	if (name == 'ZIG ZAG CHALK FORMATION - CHALK') {name = 'ZIG ZAG CHALK FORMATION - CHALK<br />GREY CHALK SUBGROUP<br />CHALK GROUP'};
	if (name == 'WEST MELBURY MARLY CHALK FORMATION - CHALK') {name = 'WEST MELBURY MARLY CHALK FORMATION - CHALK<br />GREY CHALK SUBGROUP<br />CHALK GROUP'};
	if (name == 'MELBURY SANDSTONE MEMBER - SANDSTONE') {name = 'MELBURY SANDSTONE MEMBER - SANDSTONE<br />UPPER GREENSAND FORMATION<br />SELBORNE GROUP'};
        if (name == 'BOYNE HOLLOW CHERT MEMBER - CHERT') {name = 'BOYNE HOLLOW CHERT MEMBER - CHERT<br />UPPER GREENSAND FORMATION<br />SELBORNE GROUP'};	    
	if (name == 'BOYNE HOLLOW CHERT MEMBER - SANDSTONE') {name = 'BOYNE HOLLOW CHERT MEMBER - SANDSTONE<br />UPPER GREENSAND FORMATION<br />SELBORNE GROUP'};  	    
	if (name == 'CANN SAND MEMBER - SANDSTONE') {name = 'CANN SAND MEMBER - SANDSTONE<br />UPPER GREENSAND FORMATION<br />SELBORNE GROUP'};  	    
	if (name == 'UPPER GREENSAND FORMATION - SANDSTONE, GLAUCONITIC') {name = 'UPPER GREENSAND FORMATION - SANDSTONE, GLAUCONITIC<br />SELBORNE GROUP'}; 
	if (name == 'UPPER GREENSAND FORMATION - SANDSTONE') {name = 'UPPER GREENSAND FORMATION - SANDSTONE<br />SELBORNE GROUP'}; 
	if (name == 'GAULT FORMATION - MUDSTONE, SANDY') {name = 'GAULT FORMATION - MUDSTONE, SANDY<br />SELBORNE GROUP'};
	if (name == 'GAULT FORMATION - MUDSTONE') {name = 'GAULT FORMATION - MUDSTONE<br />SELBORNE GROUP'};
        if (name == 'CHILD OKEFORD SAND MEMBER - SANDSTONE') {name = 'CHILD OKEFORD SAND MEMBER - SANDSTONE<br />LOWER GREENSAND GROUP'};
//
        if (name == 'PEVERIL POINT MEMBER - LIMESTONE AND MUDSTONE, INTERBEDDED') {name = 'PEVERIL POINT MEMBER - LIMESTONE AND MUDSTONE, INTERBEDDED<br />DURLSTON FORMATION<br />PURBECK GROUP'};
	if (name == 'STAIR HOLE MEMBER - LIMESTONE') {name = 'STAIR HOLE MEMBER - LIMESTONE<br />DURLSTON FORMATION<br />PURBECK GROUP'};
	if (name == 'DURLSTON FORMATION - LIMESTONE') {name = 'DURLSTON FORMATION - LIMESTONE<br />PURBECK GROUP'};
	if (name == 'WORBARROW TOUT MEMBER - LIMESTONE AND [SUBEQUAL/SUBORDINATE] ARGILLACEOUS ROCKS, INTERBEDDED') {name = 'WORBARROW TOUT MEMBER - LIMESTONE AND [SUBEQUAL/SUBORDINATE] ARGILLACEOUS ROCKS, INTERBEDDED<br />LULWORTH FORMATION<br />PURBECK GROUP'};	    
	if (name == 'WORBARROW TOUT MEMBER - LIMESTONE') {name = 'WORBARROW TOUT MEMBER - LIMESTONE<br />LULWORTH FORMATION<br />PURBECK GROUP'};
	if (name == 'WORBARROW TOUT MEMBER - SANDSTONE') {name = 'WORBARROW TOUT MEMBER - SANDSTONE<br />LULWORTH FORMATION<br />PURBECK GROUP'};
        if (name == 'RIDGEWAY MEMBER - MUDSTONE') {name = 'RIDGEWAY MEMBER - MUDSTONE<br />LULWORTH FORMATION<br />PURBECK GROUP'};
        if (name == 'RIDGEWAY MEMBER AND WORBARROW TOUT MEMBER (UNDIFFERENTIATED) - LIMESTONE') {name = 'RIDGEWAY MEMBER AND WORBARROW TOUT MEMBER (UNDIFFERENTIATED) - LIMESTONEE<br />LULWORTH FORMATION<br />PURBECK GROUP'};
	if (name == 'MUPE MEMBER - LIMESTONE') {name = 'MUPE MEMBER - LIMESTONE<br />LULWORTH FORMATION<br />PURBECK GROUP'};
	if (name == 'MUPE MEMBER AND RIDGEWAY MEMBER (UNDIFFERENTIATED) - MUDSTONE') {name = 'MUPE MEMBER AND RIDGEWAY MEMBER (UNDIFFERENTIATED) - MUDSTONE<br />LULWORTH FORMATION<br />PURBECK GROUP'};	 
	if (name == 'LULWORTH FORMATION - LIMESTONE') {name = 'LULWORTH FORMATION - LIMESTONE<br />PURBECK GROUP'};	    
	if (name == 'PORTLAND FREESTONE MEMBER - LIMESTONE') {name = 'PORTLAND FREESTONE MEMBER - LIMESTONE<br />PORTLAND STONE FORMATION<br />PORTLAND GROUP'};
	if (name == 'PORTLAND CHERT MEMBER - LIMESTONE') {name = 'PORTLAND CHERT MEMBER - LIMESTONE<br />PORTLAND STONE FORMATION<br />PORTLAND GROUP'};
	if (name == 'PORTLAND SAND FORMATION - SANDSTONE') {name = 'PORTLAND SAND FORMATION - SANDSTONE<br />PORTLAND GROUP'};
//	    
	if (name == 'ABBOTSBURY IRONSTONE FORMATION - IRONSTONE') {name = 'ABBOTSBURY IRONSTONE FORMATION - IRONSTONE<br />CORALLIAN GROUP'};
	if (name == 'SANDSFOOT GRIT MEMBER - SANDSTONE AND [SUBEQUAL/SUBORDINATE] ARGILLACEOUS ROCKS, INTERBEDDED') {name = 'SANDSFOOT GRIT MEMBER - SANDSTONE AND [SUBEQUAL/SUBORDINATE] ARGILLACEOUS ROCKS, INTERBEDDED<br />SANDSFOOT FORMATION<br />CORALLIAN GROUP'};
	if (name == 'SANDSFOOT GRIT MEMBER - LIMESTONE AND [SUBEQUAL/SUBORDINATE] SANDSTONE, INTERBEDDED') {name = 'SANDSFOOT GRIT MEMBER - LIMESTONE AND [SUBEQUAL/SUBORDINATE] SANDSTONE, INTERBEDDED<br />SANDSFOOT FORMATION<br />CORALLIAN GROUP'};
	if (name == 'SANDSFOOT CLAY MEMBER - MUDSTONE') {name = 'SANDSFOOT CLAY MEMBER - MUDSTONE<br />SANDSFOOT FORMATION<br />CORALLIAN GROUP'};
	if (name == 'SANDSFOOT FORMATION - MUDSTONE, SANDSTONE AND LIMESTONE') {name = 'SANDSFOOT FORMATION - MUDSTONE, SANDSTONE AND LIMESTONE<br />CORALLIAN GROUP'};
        if (name == 'ECCLIFFE MEMBER - LIMESTONE, OOIDAL') {name = 'ECCLIFFE MEMBER - LIMESTONE, OOIDAL<br />CLAVELLATA FORMATION<br />CORALLIAN GROUP'};
        if (name == 'CLAVELLATA FORMATION - LIMESTONE') {name = 'CLAVELLATA FORMATION - LIMESTONE<br />CORALLIAN GROUP'};
	if (name == 'OSMINGTON OOLITE FORMATION - LIMESTONE, OOIDAL') {name = 'OSMINGTON OOLITE FORMATION - LIMESTONE, OOIDAL<br />CORALLIAN GROUP'};
	if (name == 'BENCLIFF GRIT MEMBER - SANDSTONE') {name = 'BENCLIFF GRIT MEMBER - SANDSTONEE<br />REDCLIFF FORMATION<br />CORALLIAN GROUP'};
	if (name == 'NOTHE CLAY MEMBER - MUDSTONE') {name = 'NOTHE CLAY MEMBER - MUDSTONE<br />REDCLIFF FORMATION<br />CORALLIAN GROUP'};
	if (name == 'NOTHE GRIT MEMBER - SANDSTONE') {name = 'NOTHE GRIT MEMBER - SANDSTONE<br />REDCLIFF FORMATION<br />CORALLIAN GROUP'};
	if (name == 'REDCLIFF FORMATION - MUDSTONE AND SANDSTONE') {name = 'REDCLIFF FORMATION - MUDSTONE AND SANDSTONE<br />CORALLIAN GROUP'};    
//
	if (name == 'TODBER FREESTONE MEMBER - MUDSTONE') {name = 'TODBER FREESTONE MEMBER - MUDSTONE<br />STOUR FORMATION<br />CORALLIAN GROUP'};    
	if (name == 'TODBER FREESTONE MEMBER - LIMESTONE') {name = 'TODBER FREESTONE MEMBER - LIMESTONE<br />STOUR FORMATION<br />CORALLIAN GROUP'};
	if (name == 'NEWTON CLAY MEMBER - MUDSTONE, SANDY') {name = 'NEWTON CLAY MEMBER - MUDSTONE, SANDY<br />STOUR FORMATION<br />CORALLIAN GROUP'};
	if (name == 'HINTON ST MARY CLAY MEMBER - MUDSTONE') {name = 'HINTON ST MARY CLAY MEMBER - MUDSTONE<br />STOUR FORMATION<br />CORALLIAN GROUP'};
	if (name == 'CUCKLINGTON OOLITE MEMBER - LIMESTONE, OOIDAL') {name = 'CUCKLINGTON OOLITE MEMBER - LIMESTONE, OOIDAL<br />STOUR FORMATION<br />CORALLIAN GROUP'};
	if (name == 'WOODROW CLAY MEMBER - MUDSTONE') {name = 'WOODROW CLAY MEMBER - MUDSTONE<br />STOUR FORMATION<br />CORALLIAN GROUP'};
	if (name == 'CLAVELLATA FORMATION - LIMESTONE, ARGILLACEOUS ROCKS AND SUBORDINATE SANDSTONE, INTERBEDDED') {name = 'CLAVELLATA FORMATION - LIMESTONE, ARGILLACEOUS ROCKS AND SUBORDINATE SANDSTONE, INTERBEDDED<br />CORALLIAN GROUP'};
	if (name == 'STURMINSTER PISOLITE MEMBER - LIMESTONE, OOIDAL') {name = 'STURMINSTER PISOLITE MEMBER - LIMESTONE, OOIDAL<br />STOUR FORMATION<br />CORALLIAN GROUP'};
	if (name == 'STOUR FORMATION - MUDSTONE') {name = 'STOUR FORMATION - MUDSTONE<br />CORALLIAN GROUP'};
	if (name == "LYON'S GATE BED - SANDSTONE") {name = "LYON'S GATE BED - SANDSTONE<br />HAZELBURY BRYAN FORMATIONE<br />CORALLIAN GROUP"};
  	if (name == 'HAZELBURY BRYAN FORMATION - MUDSTONE') {name = 'HAZELBURY BRYAN FORMATION - MUDSTONE<br />CORALLIAN GROUP'};	    
//	    
	if (name == 'STEWARTBY MEMBER AND WEYMOUTH MEMBER (UNDIFFERENTIATED) - MUDSTONE') {name = name +'<br />OXFORD CLAY FORMATION'};
  	if (name == 'PETERBOROUGH MEMBER - MUDSTONE') {name = name + '<br />OXFORD CLAY FORMATION'};
	if (name == 'MOHUNS PARK MUDSTONE BED - MUDSTONE') {name = name + '<br />PETERBOROUGH MEMBER<br />OXFORD CLAY FORMATION'};
        if (name == 'CORNBRASH FORMATION - LIMESTONE') {name = name + '<br />GREAT OOLITE GROUP'};
        if (name == 'FOREST MARBLE FORMATION - LIMESTONE') {name = name +'<br />GREAT OOLITE GROUP'};
	if (name == 'FOREST MARBLE FORMATION - MUDSTONE') {name = name + '<br />GREAT OOLITE GROUP'}; 
	if (name == 'FOREST MARBLE FORMATION - SANDSTONE') {name = name + '<br />GREAT OOLITE GROUP'};
	if (name == 'FROME CLAY FORMATION - MUDSTONE') {name = name + '<br />GREAT OOLITE GROUP'};
	if (name == 'FROME CLAY FORMATION - MUDSTONE, SHELLY') {name = name + '<br />GREAT OOLITE GROUP'};
	if (name == "WATTONENSIS BEDS MEMBER - LIMESTONE") {name = name + "<br />FROME CLAY FORMATION<br />GREAT OOLITE GROUP"};
	if (name == "UPPER FULLER'S EARTH MEMBER - MUDSTONE") {name = name + "<br />FULLER'S EARTH FORMATION<br />GREAT OOLITE GROUP"};
	if (name == "FULLER'S EARTH ROCK MEMBER - LIMESTONE") {name = name+ "<br />FULLER'S EARTH FORMATION<br />GREAT OOLITE GROUP"};
	if (name == "BOWDEN WAY BEDS AND ACUMINATA BEDS (UNDIFFERENTIATED) - MUDSTONE") {name = name+ "<br />LOWER FULLER'S EARTH MEMBER <br />FULLER'S EARTH FORMATION<br />GREAT OOLITE GROUP"};
	if (name == "LOWER FULLER'S EARTH MEMBER - MUDSTONE") {name = name +"FULLER'S EARTH FORMATION<br />GREAT OOLITE GROUP"};
	if (name == "FULLER'S EARTH FORMATION - MUDSTONE") {name = name + "<br />GREAT OOLITE GROUP"};
	if (name == "FULLER'S EARTH FORMATION - MUDSTONE, CALCAREOUS") {name = name + "<br />GREAT OOLITE GROUP"};	   
//
	if (name == "HAM HILL LIMESTONE MEMBER - LIMESTONE") {name = name + "<br />BRIDPORT SAND FORMATION<br />LIAS GROUP"};    
	if (name == "BRIDPORT SAND FORMATION - SANDSTONE") {name = name + "<br />LIAS GROUP"};    
	if (name == "BEACON LIMESTONE FORMATION - LIMESTONE") {name = "BEACON LIMESTONE FORMATION (JUNCTION BED) - LIMESTONE<br />LIAS GROUP"};
	if (name == "THORNCOMBE SAND MEMBER - SANDSTONE") {name = name + "<br />DYRHAM FORMATION<br />LIAS GROUP"};
	if (name == "DOWN CLIFF SAND MEMBER - SANDSTONE") {name = name + "<br />DYRHAM FORMATION<br />LIAS GROUP"};
	if (name == "DOWN CLIFF SAND MEMBER AND THORNCOMBE SAND MEMBER (UNDIFFERENTIATED) - SANDSTONE") {name = name + "<br />DYRHAM FORMATION<br />LIAS GROUP"};	
	if (name == "EYPE CLAY MEMBER - SILTSTONE AND LIMESTONE, INTERBEDDED") {name = name + "<br />DYRHAM FORMATION<br />LIAS GROUP"};
	if (name == "DYRHAM FORMATION - SANDSTONE") {name = name + "<br />LIAS GROUP"};
	if (name == "DYRHAM FORMATION - MUDSTONE AND SANDSTONE") {name = name + "<br />LIAS GROUP"};
	if (name == "DYRHAM FORMATION - SILTSTONE AND SANDSTONE") {name = name + "<br />LIAS GROUP"};
	if (name == "CHARMOUTH MUDSTONE FORMATION AND DYRHAM FORMATION (UNDIFFERENTIATED) - MUDSTONE AND SANDSTONE") {name = name + "<br />LIAS GROUP"};    
	if (name == "GREEN AMMONITE MEMBER - MUDSTONE") {name = name + "<br />CHARMOUTH MUDSTONE FORMATION<br />LIAS GROUP"};
	if (name == "BELEMNITE MARL MEMBER - MUDSTONE, CALCAREOUS") {name = name + "<br />CHARMOUTH MUDSTONE FORMATION<br />LIAS GROUP"};	    
	if (name == "BLACK VEN MARL MEMBER - MUDSTONE, CALCAREOUS") {name = name + "<br />CHARMOUTH MUDSTONE FORMATION<br />LIAS GROUP"};
	if (name == "SHALES WITH BEEF MEMBER - MUDSTONE, CALCAREOUS") {name = name + "<br />CHARMOUTH MUDSTONE FORMATION<br />LIAS GROUP"}; 
	if (name == "CHARMOUTH MUDSTONE FORMATION - MUDSTONE") {name = name + "<br />LIAS GROUP"}; 
	if (name == "BLUE LIAS FORMATION - LIMESTONE AND MUDSTONE, INTERBEDDED") {name = name + "<br />LIAS GROUP"};    
	if (name == "LANGPORT MEMBER AND BLUE LIAS FORMATION (UNDIFFERENTIATED) - MUDSTONE AND LIMESTONE, INTERBEDDED") {name = "LANGPORT MEMBER (WHITE LIAS) OF THE LILSTOCK FORMATION AND BLUE LIAS FORMATION (UNDIFFERENTIATED) - MUDSTONE AND LIMESTONE, INTERBEDDED<br />PENARTH GROUP AND LIAS GROUP"};
	if (name == "LANGPORT MEMBER, BLUE LIAS FORMATION AND CHARMOUTH MUDSTONE FORMATION (UNDIFFERENTIATED) - MUDSTONE AND LIMESTONE, INTERBEDDED") {name = "LANGPORT MEMBER (WHITE LIAS) OF THE LILSTOCK FORMATION, BLUE LIAS FORMATION AND CHARMOUTH MUDSTONE FORMATION (UNDIFFERENTIATED) - MUDSTONE AND LIMESTONE, INTERBEDDED<br />PENARTH GROUP AND LIAS GROUP"};
        if (name == "WHITE LIAS FORMATION - LIMESTONE WITH SUBORDINATE MUDSTONE") {name = "LANGPORT MEMBER (WHITE LIAS) - LIMESTONE WITH SUBORDINATE MUDSTONE<br >LILSTOCK FORMATION<br />LIAS GROUP"};  
	if (name == "WESTBURY FORMATION AND COTHAM MEMBER (UNDIFFERENTIATED) - MUDSTONE AND LIMESTONE, INTERBEDDED") {name = "WESTBURY FORMATION AND COTHAM MEMBER OF THE LILSTOCK FORMATION (UNDIFFERENTIATED) - MUDSTONE AND LIMESTONE, INTERBEDDE<br />PENARTH GROUP"};	
//
	if (name == 'BLUE ANCHOR FORMATION - LIMESTONE') {name = name + '<br />MERCIA MUDSTONE GROUP<br />NEW RED SANDSTONE SUPERGROUP'}; 
	if (name == 'BLUE ANCHOR FORMATION - MUDSTONE') {name = name + '<br />MERCIA MUDSTONE GROUP<br />NEW RED SANDSTONE SUPERGROUP'}; 
	if (name == 'BRANSCOMBE MUDSTONE FORMATION - MUDSTONE') {name = name + '<br />MERCIA MUDSTONE GROUP<br />NEW RED SANDSTONE SUPERGROUP'; age = 'NORIAN'};
	if (name == 'ARDEN SANDSTONE FORMATION - MUDSTONE AND SANDSTONE, INTERBEDDED') {name = 'ARDEN SANDSTONE FORMATION (DUNSCOMBE MUDSTONE FORMATION) - MUDSTONE AND SANDSTONE, INTERBEDDED - MUDSTONE<br />MERCIA MUDSTONE GROUP<br />NEW RED SANDSTONE SUPERGROUP'};
	if (name == 'SIDMOUTH MUDSTONE FORMATION - MUDSTONE') {name = name + '<br />MERCIA MUDSTONE GROUP<br />NEW RED SANDSTONE SUPERGROUP'; age = 'LADINIAN'};
	if (name == 'HELSBY SANDSTONE FORMATION - SANDSTONE') {name = 'HELSBY SANDSTONE FORMATION (OTTER SANDSTONE FORMATION) - SANDSTONE<br />SHERWOOD SANDSTONE GROUP<br />NEW RED SANDSTONE SUPERGROUP'};
	if (name == 'CHESTER FORMATION - CONGLOMERATE') {name = 'CHESTER FORMATION (BUDLEIGH SALTERTON PEBBLE BEDS FORMATION) - CONGLOMERATE<br />SHERWOOD SANDSTONE GROUP<br />NEW RED SANDSTONE SUPERGROUP'};
        if (name == 'LITTLEHAM MUDSTONE FORMATION - MUDSTONE') {name = name + '<br />AYLESBEARE MUDSTONE GROUP<br />NEW RED SANDSTONE SUPERGROUP'; age = 'WUCHIAPINGIAN'; period = 'PERMIAN'};
        if (name == 'EXMOUTH MUDSTONE AND SANDSTONE FORMATION - SANDSTONE') {name = name + '<br />AYLESBEARE MUDSTONE GROUP<br />NEW RED SANDSTONE SUPERGROUP'; age = 'CAPITANIAN TO WUCHIAPINGIAN'; period = 'PERMIAN'};	    
        if (name == 'EXMOUTH MUDSTONE AND SANDSTONE FORMATION - MUDSTONE') {name = name + '<br />AYLESBEARE MUDSTONE GROUP<br />NEW RED SANDSTONE SUPERGROUP'; age = 'CAPITANIAN TO WUCHIAPINGIAN'; period = 'PERMIAN'};	    
        if (name == 'AYLESBEARE MUDSTONE GROUP - SANDSTONE') {name = name + '<br />NEW RED SANDSTONE SUPERGROUP'; age = 'CAPITANIAN TO WUCHIAPINGIAN'; period = 'PERMIAN'};
        if (name == 'AYLESBEARE MUDSTONE GROUP - MUDSTONE') {name = name + '<br />NEW RED SANDSTONE SUPERGROUP'; age = 'CAPITANIAN TO WUCHIAPINGIAN'; period = 'PERMIAN'};
	if (name == 'EXE BRECCIA FORMATION - BRECCIA') {name = name + '<br />EXETER GROUP<br />NEW RED SANDSTONE SUPERGROUP'; age = 'WORDIAN'; period = 'PERMIAN'};
//	if (name == '') {name = ''; age = ''; period = ''};
//	    
        if (name != '') {name = 'Bedrock: ' + name};
	if (age != '') {age = '<br/>Age: ' + age}; 
	if (period != '') {period = '<br/>Period: ' + period}; 
	desc = bedrock[1].split(";")[48];
        if (desc != '') {
            desc = desc[0].toUpperCase() + desc.slice(1);			
			desc = '<br/>Description: ' + desc
		};
        sett1 = bedrock[1].split(";")[49];
        if (sett1 != '') {
            sett1 = sett1[0].toUpperCase() + sett1.slice(1);			
			sett1 = '<br/>Setting: ' + sett1
		};
        sett2 = bedrock[1].split(";")[50];
        if (sett2 == 'Null'){sett2 = ''};
        detail = bedrock[1].split(";")[51];
        if (detail != '') {detail = '<br/>Detail: ' + detail};
        bedrockcontent =  name + age + period + type + desc + sett1 + ' ' + sett2 + detail + '<br/><br/>Locaton: ' + bngString + '<br/>';
     };
    linearcontent = '';
    linear = content.split('@BGS.50k.Linear.features');
    if (linear.length > 1) {
		lname = linear[1].split(/;/)[15];
		linearcontent = 'Linear feature: ' + lname + '<br/><br/>Locaton: ' + bngString + '<br/>';
	};	
    superficialcontent = '';
    superficial = content.split('@BGS.50k.Superficial.deposits');

    if (superficial.length > 1) {
		sname = superficial[1].split(/;/)[30];
		if (sname != '') {sname = 'Surface deposit: ' + sname};        
        sage1 = superficial[1].split(/;/)[31];
        sage2 = superficial[1].split(/;/)[32];
        if (sage1 == sage2) {sage = sage1} else {sage = sage1 + ' to ' + sage2};
        if (sage != '') {sage = '<br/>Age: ' + sage};         
        speriod1 = superficial[1].split(/;/)[45];
        speriod2 = superficial[1].split(/;/)[46];
        if (speriod1 == speriod2) {speriod = speriod1} else {speriod = speriod1 + ' to ' + speriod2};
        if (speriod != '') {speriod = '<br/>Period: ' + speriod}; 
        stype = superficial[1].split(";")[47];
        if (stype != '') {
			stype = stype[0].toUpperCase() + stype.slice(1);
			stype = '<br/>Type: ' + stype
		};
        sdesc = superficial[1].split(";")[48];
        if (sdesc != '') {
            sdesc = sdesc[0].toUpperCase() + sdesc.slice(1);			
			sdesc = '<br/>Description: ' + sdesc
		};
        ssett1 = superficial[1].split(";")[49];
        if (ssett1 != '') {
            ssett1 = ssett1[0].toUpperCase() + ssett1.slice(1);			
			ssett1 = '<br/>Setting: ' + ssett1
		};
        ssett2 = superficial[1].split(";")[50];
        if (ssett2 == 'Null'){ssett2 = ''};
        sdetail = superficial[1].split(";")[51];
        if (sdetail != '') {sdetail = '<br/>Detail: ' + sdetail};
        superficialcontent =  sname + sage + speriod + stype + sdesc + ssett1 + ' ' + ssett2 + sdetail + '<br/><br/>Locaton: ' + bngString + '<br/>';
    };
    masscontent = '';
    mass = content.split('@BGS.50k.Mass.movement');

    if (mass.length > 1) {
		mname = mass[1].split(/;/)[23];
        mage1 = mass[1].split(/;/)[24];
        mage2 = mass[1].split(/;/)[25];
        if (mage1 == mage2) {mage = mage1} else {mage = 'From ' + mage1 + ' to ' + mage2};
     masscontent =  'Mass movement: ' + mname + '<br/>Age: ' + mage + '<br/><br/>Locaton: ' + bngString + '<br/>';
    };
    
    artcontent = '';
    art = content.split('@BGS.50k.Artificial.ground');

    if (art.length > 1) {
		aname = art[1].split(/;/)[23];
        amage1 = art[1].split(/;/)[24];
        amage2 = art[1].split(/;/)[25];
        if (amage1 == amage2) {amage = amage1} else {amage = 'From ' + amage1 + ' to ' + amage2};
     artcontent =  'Artificial: ' + aname + '<br/>Age: ' + amage + '<br/><br/>Locaton: ' + bngString + '<br/>';;
    };

    content = blscontent + slscontent + bedrockcontent + superficialcontent + masscontent + artcontent + linearcontent;
    //if (content.length < 10) {content='No visible geology'};
    // + content;

    L.popup({ maxWidth: 400})
      .setLatLng(latlng)
      .setContent('<div style="overflow:auto">' + content + '<div>')
      .openOn(this._map);
  }
});

L.tileLayer.betterWms = function (url, options) {
  return new L.TileLayer.BetterWMS(url, options);  
};
