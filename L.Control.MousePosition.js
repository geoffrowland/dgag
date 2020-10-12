L.Control.MousePosition = L.Control.extend({

	_pos: null,

	options: {
		position: 'bottomleft',
		separator: ' : ',
		emptyString: 'Unavailable',
		lngFirst: false,
		numDigits: 5,
		lngFormatter: undefined,
		latFormatter: undefined,
		prefix: "",
		xyPrefix: "X-Y:",
		bngPrefix: "BNG:"
	},

	onAdd: function (map) {
		this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
		L.DomEvent.disableClickPropagation(this._container);
		map.on('mousemove', this._onMouseMove, this);
		this._container.innerHTML = this.options.emptyString;
		return this._container;
	},

	onRemove: function (map) {
		map.off('mousemove', this._onMouseMove)
	},

	getLatLng: function() {
		return this._pos;
	},

	_onMouseMove: function (e) {
		this._pos = e.latlng.wrap();
		var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.wrap().lng) : L.Util.formatNum(e.latlng.wrap().lng, this.options.numDigits);
		lng = lng.toFixed(5);
		var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
		lat = lat.toFixed(5);
        var bngproj = '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs';
        var bngcoords = proj4(bngproj, [e.latlng.lng, e.latlng.lat]);
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
		var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
		//this._container.innerHTML = bngPrefix + bngString + eastingPrefix + bngEasting + northingPrefix + bngNorthing + '  Lng:' + lng + ' Lat:' + lat;
		this._container.innerHTML = bngPrefix + bngString + '  Lng:' + lng + ' Lat:' + lat;
	}

});

L.Map.mergeOptions({
	positionControl: false
});

L.Map.addInitHook(function () {
	if (this.options.positionControl) {
		this.positionControl = new L.Control.MousePosition();
		this.addControl(this.positionControl);
	}
});

L.control.mousePosition = function (options) {
	return new L.Control.MousePosition(options);
};
