import { spinner } from "./spinner"

const mapboxgl = window.mapboxgl || {}

let placeholderStart
let placeholderStartEl
export function initPlaceholderStart(map) {
  placeholderStartEl = document.createElement("div")
  placeholderStartEl.className = "marker"
  placeholderStartEl.innerHTML = "S"
  placeholderStartEl.style.background = "#686de0"
  placeholderStartEl.style.display = "none"
  placeholderStart = new mapboxgl.Marker(placeholderStartEl)
    .setLngLat([0, 0])
    .addTo(map)
}

export function updatePlaceholderStart({ coords, isFetching }) {
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
