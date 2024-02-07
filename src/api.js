// const BASE_URL = "http://localhost:8080";
const BASE_URL = "https://brightpath-backend.onrender.com"

export const fetchPath = async body => {
  try {
    const response = await fetch(`${BASE_URL}/findpath`, {
      credentials: "omit",
      headers: { "content-type": "text/plain;charset=UTF-8" },
      referrerPolicy: "no-referrer-when-downgrade",
      body: JSON.stringify(body),
      method: "POST",
      mode: "cors",
    })
    const json = await response.json()
    return json
  } catch (err) {
    return { error: { message: "Offline" } }
  }
}

// const fetchPath2 = async ({ body, onStartFetchPath }) => {
//   console.log("fetch path", body.fromLocation, body.toLocation)
//   // if (state.isDrawing) return
//   onStartFetchPath()
//   const json = await fetchPath(body)
//   if (json.error) {
//     onError(json)
//   }
//   onSuccess(json)
//   console.log("json.distance", json.distance)
//   currentDistance = json.distance
//   const geojson = json.data
//   var coordinates = geojson.features[0].geometry.coordinates
//   console.log("got data", coordinates.length)
//   if (coordinates.length === 0) {
//     state.isDrawing = false
//     updatePlaceholderStart(state)
//     return alert("Path Not Found")
//   }
//   await pathDrawer.draw(geojson)
//   state.isDrawing = false
// }
