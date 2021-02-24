var customStyleJson1 = {
  "version": 8,
  "sprite": "https://api.os.uk/maps/vector/v1/vts/resources/sprites/sprite",
  "glyphs": "https://api.os.uk/maps/vector/v1/vts/resources/fonts/{fontstack}/{range}.pbf",
  "sources": {
    "esri": {
      "type": "vector",
      "url": "https://api.os.uk/maps/vector/v1/vts"
    }
  },
  "layers": [
    {
      "id": "OS/Surfacewater/Local",
      "type": "fill",
      "source": "esri",
      "source-layer": "Surfacewater",
      "filter": [
        "==",
        "_symbol",
        0
      ],
      "minzoom": 11,
      "layout": {},
      "paint": {
        "fill-color": "#7777FF",
        "fill-outline-color": "#7777FF",
        "fill-opacity": 0.4
      }
    },
    {
      "id": "OS/Surfacewater/National/1",
      "type": "fill",
      "source": "esri",
      "source-layer": "Surfacewater",
      "filter": [
        "==",
        "_symbol",
        1
      ],
      "minzoom": 6,
      "maxzoom": 7,
      "layout": {},
      "paint": {
        "fill-color": "#7777FF",
        "fill-opacity": 0.4
      }
    },
    {
      "id": "OS/Surfacewater/Regional/1",
      "type": "fill",
      "source": "esri",
      "source-layer": "Surfacewater",
      "filter": [
        "==",
        "_symbol",
        2
      ],
      "minzoom": 7,
      "maxzoom": 11,
      "layout": {},
      "paint": {
        "fill-color": "#7777FF",
        "fill-opacity": 0.4
      }
    },
    {
      "id": "OS/Ornament/1",
      "type": "fill",
      "source": "esri",
      "source-layer": "Ornament",
      "minzoom": 12,
      "layout": {},
      "paint": {
        "fill-color": "#BABABA",
        "fill-opacity": 0.4
      }
    },
    {
      "id": "OS/Waterlines/District",
      "type": "line",
      "source": "esri",
      "source-layer": "Waterlines",
      "filter": [
        "==",
        "_symbol",
        0
      ],
      "minzoom": 9,
      "maxzoom": 11,
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "#7777FF",
        "line-width": 1.8,
        "line-opacity": 0.8
      }
    },
    {
      "id": "OS/Waterlines/Local",
      "type": "line",
      "source": "esri",
      "source-layer": "Waterlines",
      "filter": [
        "==",
        "_symbol",
        1
      ],
      "minzoom": 11,
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "#7777FF",
        "line-width": 2,
        "line-opacity": 0.8
      }
    },
    {
      "id": "OS/Waterlines/Local_1",
      "type": "line",
      "source": "esri",
      "source-layer": "Waterlines",
      "filter": [
        "==",
        "_symbol",
        1
      ],
      "minzoom": 11,
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "#7777FF",
        "line-width": 2,
        "line-opacity": 0.8
      }
    },
    {
      "id": "OS/Waterlines/MHW",
      "type": "line",
      "source": "esri",
      "source-layer": "Waterlines",
      "filter": [
        "==",
        "_symbol",
        2
      ],
      "minzoom": 12,
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "#7777FF",
        "line-width": 3.2,
        "line-opacity": 0.8
      }
    },
    {
      "id": "OS/Waterlines/MHW_1",
      "type": "line",
      "source": "esri",
      "source-layer": "Waterlines",
      "filter": [
        "==",
        "_symbol",
        2
      ],
      "minzoom": 8,
      "maxzoom": 12,
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "#7777FF",
        "line-width": 2.6,
        "line-opacity": 0.8
      }
    },
    {
      "id": "OS/Waterlines/MLW",
      "type": "line",
      "source": "esri",
      "source-layer": "Waterlines",
      "filter": [
        "==",
        "_symbol",
        3
      ],
      "minzoom": 10,
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "#7777FF",
        "line-width": 1.6,
        "line-opacity": 0.8
      }
    },
    {
      "id": "OS/Waterlines/MLW_1",
      "type": "line",
      "source": "esri",
      "source-layer": "Waterlines",
      "filter": [
        "==",
        "_symbol",
        3
      ],
      "minzoom": 8,
      "maxzoom": 10,
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "#7777FF",
        "line-width": 1.0,
        "line-opacity": 0.8
      }
    },
    {
      "id": "OS/Waterlines/National",
      "type": "line",
      "source": "esri",
      "source-layer": "Waterlines",
      "filter": [
        "==",
        "_symbol",
        4
      ],
      "minzoom": 5,
      "maxzoom": 6,
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "#7777FF",
        "line-width": 0.8,
        "line-opacity": 0.8
      }
    },
    {
      "id": "OS/Waterlines/Regional",
      "type": "line",
      "source": "esri",
      "source-layer": "Waterlines",
      "filter": [
        "==",
        "_symbol",
        5
      ],
      "minzoom": 7,
      "maxzoom": 9,
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "#7777FF",
        "line-width": 2,
        "line-opacity": 0.8
      }
    },
    {
      "id": "OS/Waterlines/Regional_1",
      "type": "line",
      "source": "esri",
      "source-layer": "Waterlines",
      "filter": [
        "==",
        "_symbol",
        5
      ],
      "minzoom": 6,
      "maxzoom": 7,
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "#7777FF",
        "line-width": 1.0,
        "line-opacity": 0.8
      }
    }
  ]
}
;
