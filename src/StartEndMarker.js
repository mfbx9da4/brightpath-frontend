import { PureComponent } from "react"
import { spinner } from "./spinner"

const mapboxgl = window.mapboxgl || {}

export class StartEndMarker extends PureComponent {
  _marker = null
  el = document.createElement("div")

  constructor(props) {
    super(props)
    this.el.className = "marker"
    this.el.innerHTML = this.label
    this.el.style.background = this.color
    this.el.style.display = "none"
  }

  get label() {
    return this.props.type === "start" ? "S" : "E"
  }

  get color() {
    return this.props.type === "start" ? "#686de0" : "#6ab04c"
  }

  get marker() {
    if (!this._marker) {
      this._marker = new mapboxgl.Marker(this.el)
        .setLngLat(this.props.coordinates)
        .addTo(this.props.map)
    }
    return this._marker
  }

  componentWillUnmount() {
    this.marker.remove()
  }

  drawMarker = () => {
    const { map, coordinates } = this.props
    this.el.style.background = this.color
    this.el.style.display = "flex"
    if (this.props.loading) {
      this.el.innerHTML = spinner()
    } else {
      this.el.innerHTML = this.label
    }
    this.marker.setLngLat(coordinates).addTo(map)
  }

  render() {
    this.drawMarker()
    return null
  }
}
