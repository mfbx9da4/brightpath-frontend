import * as React from "preact"
const { Component } = React

export class Footer extends Component {
  render({ isNavigating, currentDistance, toggleNavigatingMode }) {
    return (
      <div
        style={{ left: 0, right: 0, bottom: 0, position: "fixed", zIndex: 10 }}
      >
        <button
          style={{
            padding: 20,
            background: "white",
            zIndex: 10,
          }}
          onClick={toggleNavigatingMode}
        >
          Navigation mode is{" "}
          {isNavigating
            ? "ON"
            : "OFF " +
              (currentDistance ? `${currentDistance.toFixed(2)} Km` : "")}
        </button>
      </div>
    )
  }
}
