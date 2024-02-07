import * as React from "preact"
import { PathDrawer } from "./pathdrawer"
const { Component } = React

export class PathRenderer extends Component {
  constructor(props) {
    super(props)
    this.pathDrawer = new PathDrawer(props.map)
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.geojson !== this.props.geojson
  }

  draw = () => {
    this.pathDrawer.draw(this.props.geojson)
  }

  render() {
    this.draw()
    return null
  }
}
