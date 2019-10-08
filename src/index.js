import "./index.css"
import { spinner } from "./spinner"
import * as React from "preact"
// eslint-disable-next-line
const { h, render, Component } = React

/*
  Backend repo can be found here
   https://github.com/mfbx9da4/brightpath-backend
*/

let isNavigating = false
class Root extends Component {
  state = {
    isNavigating: false,
  }

  toggleNavigatingMode = () => {
    isNavigating = !isNavigating
    this.setState({ isNavigating })
  }

  render() {
    return (
      <div style={{ position: "absolute", zIndex: 10, right: 0 }}>
        <button
          style={{ padding: 20, background: "white" }}
          onClick={this.toggleNavigatingMode}
        >
          Navigation mode is {this.state.isNavigating ? "ON" : "OFF"}
        </button>
      </div>
    )
  }
}

render(<Root></Root>, document.querySelector("#react-root"))

const mapboxgl = window.mapboxgl || {}

// const BASE_URL = "http://localhost:8080";
const BASE_URL = "https://brightpath.herokuapp.com"
const apiKey =
  "pk.eyJ1IjoicHN5cmVuZHVzdCIsImEiOiJjajVsZ3RtMXcyZ2Z0MndsbTM2c2VzZTdnIn0.4SXh1jwWtkfJURT7V8kN4w"
mapboxgl.accessToken = apiKey

let state = {
  isDrawing: false,
}
const fetchAndDrawPath = async (pathDrawer, body) => {
  console.log("fetch path", body.fromLocation, body.toLocation)
  if (state.isDrawing) return
  state.isDrawing = true
  state.isFetching = true
  updatePlaceholderStart(state)
  const response = await fetch(`${BASE_URL}/findpath`, {
    credentials: "omit",
    headers: { "content-type": "text/plain;charset=UTF-8" },
    referrerPolicy: "no-referrer-when-downgrade",
    body: JSON.stringify(body),
    method: "POST",
    mode: "cors",
  }).catch(err => {
    state.isDrawing = false
    state.isFetching = false
    updatePlaceholderStart(state)
    alert("Offline")
  })
  state.isFetching = false
  updatePlaceholderStart(state)
  const json = await response.json()
  const geojson = json.data
  var coordinates = geojson.features[0].geometry.coordinates
  console.log("got data", coordinates.length)
  if (coordinates.length === 0) {
    state.isDrawing = false
    updatePlaceholderStart(state)
    return alert("Path Not Found")
  }
  await pathDrawer.draw(geojson)
  state.isDrawing = false
}

const fetchAndDrawMap = async map => {
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

class PathDrawer {
  constructor(map) {
    this.isFirstTime = true
    this.map = map
    this.drawInterval = 1
    this.name = "path"
    this._initPath()
  }

  _initPath() {
    const nullData = {
      type: "FeatureCollection",
      features: [],
    }
    this.map.addSource(this.name, {
      type: "geojson",
      data: nullData,
    })
    map.addLayer({
      id: this.name,
      type: "line",
      source: this.name,
      paint: { "line-color": "#4834d4", "line-width": 5, "line-opacity": 0.75 },
    })
    this._initMarkers(nullData)
  }

  async draw(geojson) {
    await this._redrawPath(geojson)
  }

  _initMarkers() {
    this.elStart = document.createElement("div")
    this.elStart.className = "marker"
    this.elStart.innerHTML = "S"
    this.elStart.style.background = "#4834d4"
    this.elStart.style.display = "none"
    this.start = new mapboxgl.Marker(this.elStart)
      .setLngLat([-0.0715888, 51.5210999])
      .addTo(this.map)
    this.elEnd = document.createElement("div")
    this.elEnd.className = "marker"
    this.elEnd.style.background = "#6ab04c"
    this.elEnd.innerHTML = "E"
    this.elEnd.style.display = "none"
    this.end = new mapboxgl.Marker(this.elEnd)
      .setLngLat([-0.0715888, 51.5210999])
      .addTo(this.map)
  }

  _redrawMarkers(geojson) {
    const coordinates = this._getCoordinates(geojson)
    this.start.setLngLat(coordinates[0])
    this.elStart.style.display = "flex"
    this.end.setLngLat(coordinates[coordinates.length - 1])
    this.elEnd.style.display = "flex"
  }

  async _redrawPath(geojson) {
    this._redrawMarkers(geojson)
    await new Promise(resolve => {
      this._animateDrawPath(geojson, 0, resolve)
    })
  }

  _getCoordinates(geojson) {
    return geojson.features[0].geometry.coordinates
  }

  _updatePath(geojson, i) {
    // Could improve by copying once and pushing rather
    // than slicing
    const coords = this._getCoordinates(geojson)
    const copy = JSON.parse(JSON.stringify(geojson))
    copy.features[0].geometry.coordinates = coords.slice(0, i + 1)
    this.map.getSource(this.name).setData(copy)
    // if (i === coords.length - 1) {
    //   map.panTo(coords[i])
    // }
  }

  _animateDrawPath(geojson, i, resolve) {
    if (i < this._getCoordinates(geojson).length) {
      this._updatePath(geojson, i++)
      return setTimeout(
        () => this._animateDrawPath(geojson, i, resolve),
        this.drawInterval,
      )
    }
    resolve()
  }
}

// Initialize the map
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/psyrendust/cj5lgun8o2h992rpp9vyyb5h1",
  center: [-0.0716729944249721, 51.51922576352587],
  zoom: 14,
  pitch: 0,
})

map.on("style.load", async function() {
  // EDGE CASE: Does not work
  // const body = {
  //   fromLocation: [-0.12488277911884893, 51.487325450423924],
  //   toLocation: [-0.11963984724806664, 51.489021927247165]
  // };

  const body = {
    fromLocation: [-0.0805621104047134, 51.517472862493804],
    toLocation: [-0.0716729944249721, 51.51922576352587],
  }

  document.querySelector("#draw-all").addEventListener("click", () => {
    fetchAndDrawMap(map)
  })

  initPlaceholderStart(map)
  const pathDrawer = new PathDrawer(map)

  fetchAndDrawPath(pathDrawer, body)

  let setFrom = true
  map.on("mousedown", async e => {
    const { lng, lat } = e.lngLat
    const coords = [lng, lat]
    if (setFrom) {
      body.fromLocation = coords
    } else {
      body.toLocation = coords
      await fetchAndDrawPath(pathDrawer, body)
    }
    if (setFrom) {
      updatePlaceholderStart({ coords, isFetching: false })
    }
    setFrom = !setFrom
  })
})

let placeholderStart
let placeholderStartEl
function initPlaceholderStart(map) {
  placeholderStartEl = document.createElement("div")
  placeholderStartEl.className = "marker"
  placeholderStartEl.innerHTML = "S"
  placeholderStartEl.style.background = "#686de0"
  placeholderStartEl.style.display = "none"
  placeholderStart = new mapboxgl.Marker(placeholderStartEl)
    .setLngLat([0, 0])
    .addTo(map)
}

function updatePlaceholderStart({ coords, isFetching }) {
  if (isFetching) {
    placeholderStartEl.innerHTML = spinner()
    return (placeholderStartEl.style.display = "flex")
  } else if (coords) {
    placeholderStart.setLngLat(coords)
    placeholderStartEl.innerHTML = "S"
    return (placeholderStartEl.style.display = "flex")
  }
  placeholderStartEl.style.display = "none"
}

class CurrentLocationDrawer {
  constructor(map) {
    this.map = map
    this.element = document.createElement("div")
    this.element.className = "current-location"
    this.element.style.background = "#686de0"
    this.element.style.display = "flex"
    this.marker = new mapboxgl.Marker(this.element).setLngLat([0, 0]).addTo(map)
  }
  update(coords) {
    const cur = this.marker.getLngLat()
    const curCoords = [cur.lng, cur.lat]
    if (curCoords[0] !== coords[0] && curCoords[1] !== coords[1]) {
      this.marker.setLngLat(coords)
      if (isNavigating) {
        map.panTo(coords)
      }
    }
  }
}

const locationMarker = new CurrentLocationDrawer(map)

window.setInterval(() => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      const coords = [position.coords.longitude, position.coords.latitude]
      locationMarker.update(coords)
    })
  }
}, 200)

// function renderStatus({ setFrom, fromLocation, toLocation }) {
//   const status = document.querySelector(".status");
//   status.innerHTML = `
//     <div class="coords">
//       <div class="label label-start">
//         Start
//       </div>
//       <div class="start">
//         <div>${fromLocation[0]},</div>
//         <div>${fromLocation[1]}</div>
//       </div>
//       <div class="label label-end">
//         End
//       </div>
//       <div class="end">
//         <div>${toLocation[0]},</div>
//         <div>${toLocation[1]}</div>
//       </div>
//     </div>
//   `;
// }
