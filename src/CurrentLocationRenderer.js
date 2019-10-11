import * as React from "preact"
const { Component } = React

const mapboxgl = window.mapboxgl || {}

export class CurrentLocationRenderer extends Component {
  constructor(props) {
    super(props)
    this.locationMarker = new CurrentLocationDrawer(props.map)
  }
  async componentDidMount() {
    await new Promise(r => setTimeout(r, 2000))
    this.interval = window.setInterval(() => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
          const coords = [position.coords.longitude, position.coords.latitude]
          this.locationMarker.update(coords, this.props.isNavigating)
        })
      }
    }, 1200)
  }

  render() {
    return null
  }
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
  update(coords, shouldFollow) {
    const cur = this.marker.getLngLat()
    const curCoords = [cur.lng, cur.lat]
    if (curCoords[0] !== coords[0] && curCoords[1] !== coords[1]) {
      this.marker.setLngLat(coords)
      if (shouldFollow) this.map.panTo(coords)
    }
  }
}
