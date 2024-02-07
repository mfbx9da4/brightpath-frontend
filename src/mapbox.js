const mapboxgl = window.mapboxgl || {}
const apiKey =
  "pk.eyJ1IjoicHN5cmVuZHVzdCIsImEiOiJjajVsZ3RtMXcyZ2Z0MndsbTM2c2VzZTdnIn0.4SXh1jwWtkfJURT7V8kN4w"
mapboxgl.accessToken = apiKey
export const Mapbox = {
  _map: null,
  withMap: async (initialConfig = {}) => {
    if (Mapbox._map) return Mapbox._map
    let map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/psyrendust/cj5lgun8o2h992rpp9vyyb5h1",
      center: [-0.0716729944249721, 51.51922576352587],
      zoom: 14,
      pitch: 0,
      ...initialConfig,
    })
    Mapbox._map = map
    await new Promise((done) => map.on("style.load", done))
    return Mapbox._map
  },
}
