const mapboxgl = window.mapboxgl || {}

export class PathDrawer {
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
    this.map.addLayer({
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
