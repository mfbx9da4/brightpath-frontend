const nullGeoJson = {
  type: "FeatureCollection",
  features: [
    {
      geometry: {
        coordinates: [],
        type: "LineString",
      },
    },
  ],
}

export class PathDrawer {
  constructor(map) {
    this.map = map
    this.drawInterval = 1
    this.name = "path"
    this.isDrawing = false
    this.geojson = nullGeoJson
    this.index = 0
    this.map.addSource(this.name, {
      type: "geojson",
      data: nullGeoJson,
    })
    this.map.addLayer({
      id: this.name,
      type: "line",
      source: this.name,
      paint: { "line-color": "#4834d4", "line-width": 5, "line-opacity": 0.75 },
    })
  }

  draw(geojson) {
    this.geojson = geojson || nullGeoJson
    this.index = 0
    if (this.isDrawing) return
    this._animateDrawPath()
  }

  get pathCoordinates() {
    return this.geojson.features[0].geometry.coordinates
  }

  _drawPartialPath = () => {
    const coords = this.pathCoordinates
    const copy = JSON.parse(JSON.stringify(this.geojson))
    copy.features[0].geometry.coordinates = coords.slice(0, this.index + 1)
    this.map.getSource(this.name).setData(copy)
  }

  _animateDrawPath = () => {
    this.isDrawing = true
    if (this.index <= this.pathCoordinates.length) {
      this._drawPartialPath()
      this.index++
      return setTimeout(() => this._animateDrawPath(), this.drawInterval)
    }
    this.isDrawing = false
  }
}
