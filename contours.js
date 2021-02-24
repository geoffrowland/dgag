var customStyleJson = {
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
      "id": "OS/Contours/Index",
      "type": "line",
      "source": "esri",
      "source-layer": "Contours",
      "filter": [
        "==",
        "_symbol",
        0
      ],
      "minzoom": 7,
      "layout": {
        "line-join": "round"
      },
      "paint": {
        "line-color": "#000000",
        "line-width": {
          "stops": [
            [
              7,
              0.1
            ],
            [
              8,
              0.13
            ],
            [
              9,
              0.4
            ],
            [
              10,
              0.4
            ],
            [
              11,
              0.53
            ],
            [
              12,
              0.67
            ],
            [
              13,
              0.8
            ],
            [
              14,
              1
            ],
            [
              15,
              1
            ],
            [
              16,
              1.1
            ]
          ]
        },
        "line-opacity": 0.8
      }
    },
    {
      "id": "OS/Contours/Normal",
      "type": "line",
      "source": "esri",
      "source-layer": "Contours",
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
        "line-color": "#000000",
        "line-width": {
          "stops": [
            [
              12,
              0.4
            ],
            [
              13,
              0.4
            ],
            [
              14,
              0.5
            ],
            [
              15,
              0.5
            ],
            [
              16,
              0.7
            ]
          ]
        },
        "line-opacity": 0.8
      }
    }
  ]
}
;
