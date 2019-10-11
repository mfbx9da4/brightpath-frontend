import "./index.css"
import { Map } from "./map"
import { Footer } from "./Footer"
import { PathRenderer } from "./PathRenderer"
import { CurrentLocationRenderer } from "./CurrentLocationRenderer"
import * as React from "preact"
import {
  initPlaceholderStart,
  updatePlaceholderStart,
} from "./startplaceholder"

import { fetchAndDrawEntireMap } from "./loadEntireMap"

// eslint-disable-next-line
const { h, render, Component } = React

/*
  Backend repo can be found here
   https://github.com/mfbx9da4/brightpath-backend
*/
// EDGE CASE: Does not work - find out why
// const body = {
//   fromLocation: [-0.12488277911884893, 51.487325450423924],
//   toLocation: [-0.11963984724806664, 51.489021927247165]
// };

class Root extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isNavigating: false,
      setFrom: true,
      currentDistance: null,
      body: {
        fromLocation: [-0.0805621104047134, 51.517472862493804],
        toLocation: [-0.0716729944249721, 51.51922576352587],
      },
    }
  }

  onClickMap = async e => {
    const { setFrom } = this.state
    if (this.state.isNavigating) return
    const { lng, lat } = e.lngLat
    const coords = [lng, lat]
    if (setFrom) {
      this.setState({
        body: {
          fromLocation: coords,
          toLocation: this.state.body.toLocation,
        },
      })
    } else {
      this.setState({
        body: {
          fromLocation: this.state.body.fromLocation,
          toLocation: coords,
        },
      })
    }
    if (setFrom) {
      updatePlaceholderStart({ coords, isFetching: false })
    }
    this.setState({ setFrom: !setFrom })
  }

  async componentDidMount() {
    const map = await Map.withMap()
    this.setState({ map })
    initPlaceholderStart(map)
    map.on("mousedown", this.onClickMap)
    // const locationMarker = new CurrentLocationDrawer(map)
    // pollForCurrentLocation(locationMarker)
    document.querySelector("#draw-all").addEventListener("click", () => {
      fetchAndDrawEntireMap(map)
    })
  }

  onPathStart = () => {
    this.setState({ isFetching: true, isDrawing: false })
    updatePlaceholderStart({ isFetching: true })
  }

  onPathSuccess = json => {
    const distance = json.distance
    this.setState({ isFetching: false, isDrawing: true, distance })
    updatePlaceholderStart({ isFetching: false })
  }

  onFinishDrawing = () => {
    this.setState({ isFetching: false, isDrawing: false })
    updatePlaceholderStart({ isFetching: false })
  }

  onPathError = () => {
    this.setState({ isFetching: false, isDrawing: false })
    updatePlaceholderStart({ isFetching: false })
  }

  toggleNavigatingMode = () => {
    this.setState({ isNavigating: !this.state.isNavigating })
  }

  render(props, { isNavigating, distance, map, body }) {
    return (
      <div>
        <Footer
          isNavigating={isNavigating}
          currentDistance={distance}
          toggleNavigatingMode={this.toggleNavigatingMode}
        ></Footer>
        {map && (
          <div>
            <PathRenderer
              map={map}
              body={body}
              onStart={this.onPathStart}
              onSuccess={this.onPathSuccess}
              onFinishDrawing={this.onFinishDrawing}
              onError={this.onPathError}
            ></PathRenderer>
            <CurrentLocationRenderer
              map={map}
              isNavigating={isNavigating}
            ></CurrentLocationRenderer>
          </div>
        )}
      </div>
    )
  }
}

render(<Root></Root>, document.querySelector("#react-root"))

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./sw-test/sw.js", { scope: "./sw-test/" })
    .then(reg => {
      // registration worked
      console.log("Registration succeeded. Scope is " + reg.scope)
    })
    .catch(error => {
      // registration failed
      console.log("Registration failed with " + error)
    })
}
