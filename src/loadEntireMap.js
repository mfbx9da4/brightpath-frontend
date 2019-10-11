// const BASE_URL = "http://localhost:8080";
const BASE_URL = "https://brightpath.herokuapp.com"

export const fetchAndDrawEntireMap = async map => {
  console.log("start fetching")
  const response = await fetch(`${BASE_URL}/map-data/`, {
    method: "GET",
  }).catch(err => console.error(err))
  console.log("start parsing")
  const geojson = await response.json()
  console.log("got data", geojson.features.length)

  drawGeoJSON(map, geojson, {
    paint: {
      "line-color": "#f08",
      "line-opacity": 0.2,
    },
  })
}

const drawGeoJSON = (map, geojson, options = {}) => {
  const defaultOptions = {
    id: `path${Date.now()}`,
    type: "line",
  }
  const opts = {
    ...defaultOptions,
    ...options,
    source: {
      type: "geojson",
      data: geojson,
    },
  }
  map.addLayer(opts)
}
