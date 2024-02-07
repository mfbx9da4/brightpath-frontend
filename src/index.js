import "./index.css"
import { Mapbox } from "./mapbox"
import { Footer } from "./Footer"
import { PathRenderer } from "./PathRenderer"
import { CurrentLocationRenderer } from "./CurrentLocationRenderer"
import * as React from "preact"
import { fetchPath } from "./api"

import { fetchAndDrawEntireMap } from "./loadEntireMap"
import { StartEndMarker } from "./StartEndMarker"

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
    this.fetchIndex = 0
    this.state = {
      isNavigating: false,
      isLoading: true,
      draftStartCoordinate: null,
      startEndCoordinates: {
        start: { lng: -0.0805621104047134, lat: 51.517472862493804 },
        end: { lng: -0.0716729944249721, lat: 51.51922576352587 },
      },
      pathGeoJson: null,
      distance: null,
    }
    this.fetchPath(this.state.startEndCoordinates)
  }

  onClickMap = async (e) => {
    if (this.state.isNavigating) return
    const coordinate = e.lngLat
    if (this.state.draftStartCoordinate) {
      const coordinates = {
        start: this.state.draftStartCoordinate,
        end: coordinate,
      }
      this.setState({
        draftStartCoordinate: null,
        startEndCoordinates: coordinates,
        isLoading: true,
        pathGeoJson: null,
      })

      await this.fetchPath(coordinates)
    } else {
      this.setState({ draftStartCoordinate: coordinate })
    }
  }

  async fetchPath(coordinates) {
    const fetchIndex = ++this.fetchIndex
    try {
      const body = {
        fromLocation: [coordinates.start.lng, coordinates.start.lat],
        toLocation: [coordinates.end.lng, coordinates.end.lat],
      }
      const json = await fetchPath(body)
      const path = json.data.features[0].geometry.coordinates
      if (path.length === 0) {
        throw new Error("path_not_found")
      }
      console.log("Path length", path.length)
      console.log("Path distance", json.distance)
      if (fetchIndex !== this.fetchIndex) return
      this.setState({
        isLoading: false,
        distance: json.distance,
        pathGeoJson: json.data,
      })
    } catch (error) {
      if (fetchIndex !== this.fetchIndex) return
      console.error(error)
      alert(
        error.message === "path_not_found"
          ? "Path not found"
          : "Oops, something went wrong",
      )
      this.setState({ isLoading: false, distance: null, path: [] })
    }
  }

  async componentDidMount() {
    const map = await Mapbox.withMap()
    this.setState({ map })

    let lastMouseEvent = null
    map.on("mousedown", (e) => (lastMouseEvent = e))
    map.on("mouseup", (e) => {
      const diffX = Math.abs(
        e.originalEvent.pageX - lastMouseEvent.originalEvent.pageX,
      )
      const diffY = Math.abs(
        e.originalEvent.pageY - lastMouseEvent.originalEvent.pageY,
      )
      if (diffX < 5 && diffY < 5) {
        this.onClickMap(e)
      }
    })

    // const locationMarker = new CurrentLocationDrawer(map)
    // pollForCurrentLocation(locationMarker)
    // Debug draw all the streets from the server
    document.querySelector("#draw-all").addEventListener("click", () => {
      fetchAndDrawEntireMap(map)
    })
  }

  toggleNavigatingMode = () => {
    this.setState({ isNavigating: !this.state.isNavigating })
  }

  render(
    props,
    {
      isNavigating,
      distance,
      map,
      draftStartCoordinate,
      isLoading,
      startEndCoordinates,
      pathGeoJson,
    },
  ) {
    return (
      <div>
        <Footer
          isNavigating={isNavigating}
          currentDistance={distance}
          toggleNavigatingMode={this.toggleNavigatingMode}
        ></Footer>
        {map && (
          <div>
            {draftStartCoordinate && (
              <StartEndMarker
                map={map}
                type="start"
                coordinates={draftStartCoordinate}
              />
            )}
            {startEndCoordinates && (
              <StartEndMarker
                map={map}
                type="start"
                coordinates={startEndCoordinates.start}
                loading={isLoading}
              />
            )}
            {startEndCoordinates && (
              <StartEndMarker
                map={map}
                type="end"
                coordinates={startEndCoordinates.end}
                loading={isLoading}
              />
            )}
            <PathRenderer map={map} geojson={pathGeoJson} />
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
    .then((reg) => {
      // registration worked
      console.log("Registration succeeded. Scope is " + reg.scope)
    })
    .catch((error) => {
      // registration failed
      console.log("Registration failed with " + error)
    })
}
