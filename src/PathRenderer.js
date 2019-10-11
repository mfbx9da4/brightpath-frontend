import * as React from "preact"
import { fetchPath } from "./api"
import { PathDrawer } from "./pathdrawer"
const { Component } = React

export class PathRenderer extends Component {
  constructor(props) {
    super(props)
    this.pathDrawer = new PathDrawer(props.map)
    if (this.props.drawRef) {
      this.props.drawRef(this.fetchAndDraw)
    }
  }

  componentDidMount() {
    this.fetchAndDraw()
  }

  equal(arr1, arr2) {
    if (arr1.length !== arr2.length) return false
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false
    }
    return true
  }

  shouldComponentUpdate(nextProps) {
    const {
      body: { toLocation },
    } = nextProps
    if (this.equal(this.props.body.toLocation, toLocation)) {
      return false
    }
    return true
  }

  draw = async json => {
    const geojson = json.data
    await this.pathDrawer.draw(geojson)
    this.props.onFinishDrawing()
  }

  onSuccess = json => {
    this.props.onSuccess(json)
    this.setState({ isDrawing: true })
  }

  onFinishDrawing = () => {
    this.props.onFinishDrawing()
    this.setState({ isDrawing: false })
  }

  fetchAndDraw = async () => {
    console.log("fetchAndDraw")
    const { body, onError, onStart } = this.props
    onStart()
    console.log(
      "From - To",
      body.fromLocation.toString(),
      body.toLocation.toString(),
    )
    if (this.state.isDrawing) return
    const json = await fetchPath(body)
    if (json.error) {
      return onError(json)
    }
    const coordinates = json.data.features[0].geometry.coordinates
    if (coordinates.length === 0) {
      return onError({ error: { message: "Path Not Found" } })
    }
    console.log("Coords len", coordinates.length)
    console.log("json.distance", json.distance)
    this.onSuccess(json)
    await this.draw(json)
    this.onFinishDrawing()
  }

  render() {
    this.fetchAndDraw()
    return null
  }
}
