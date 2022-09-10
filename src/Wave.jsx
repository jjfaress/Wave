import { Button, Checkbox, Paper, Slider } from "@mui/material";
import "./Wave.scss";
import { useState } from "react";
import { parseTex } from "tex-math-parser";
import linear from "linear-solve";
import { addStyles, EditableMathField } from "react-mathquill";

addStyles();

export default function Wave() {
  const [state, setState] = useState({
    equation: `3000*\\sin(0.1x)/200`,
    advanced: false,
  });

  const getPoints = () => {
    const raw = String.raw`${state.equation}`;
    const tree = parseTex(raw);
    let points = [];
    for (let i = 0; i <= 100; i++) {
      let code = tree.compile().evaluate({ x: i });
      points[i] = code;
    }
    return points;
  };

  const coefMatrix = (n) => {
    const id = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));
    for (let i = 0; i < id.length; i++) {
      id[i][i] = 4;
      if (i < n - 1) {
        id[i][i + 1] = 1;
      }
      if (i > 0) {
        id[i][i - 1] = 1;
      }
    }
    id[0][0] = 2;
    id[n - 1][n - 1] = 7;
    id[n - 1][n - 2] = 2;
    return id;
  };

  const getCoef = (points) => {
    let n = points.length - 1;
    let C = coefMatrix(n);
    let P = Array(n);
    for (let i = 0; i < n; i++) {
      P[i] = 2 * (2 * points[i] + points[i + 1]);
    }
    P[0] = points[0] + 2 * points[1];
    P[n - 1] = 8 * points[n - 1] + points[n];
    let A = linear.solve(C, P);
    let B = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      B[i] = 2 * points[i + 1] - A[i + 1];
    }
    B[n - 1] = (A[n - 1] + points[n]) / 2;

    return [A, B];
  };

  const getControlPoints = (points) => {
    let bc = getCoef(points);
    let A = bc[0];
    let B = bc[1];
    let coords = [];
    for (let i = 0; i < points.length - 1; i++) {
      coords[i] = [points[i], A[i], B[i], points[i + 1]];
    }
    // console.log(coords)
    return coords;
  };

  const buildSvgPath = (coords) => {
    let d = ``;
    for (let i = 0; i < coords.length; i++) {
      let a = i + 0.25;
      let b = i + 0.5;
      let c = i + 0.75;
      let M = `${i} ${coords[i][0]}`;
      let c1 = `${a} ${coords[i][1]}`;
      let c2 = `${b} ${coords[i][2]}`;
      let c3 = `${c} ${coords[i][3]}`;
      d += `M ${M} C ${c1}, ${c2}, ${c3}`;
    }
    return d;
  };

  const path = buildSvgPath(getControlPoints(getPoints()));

  return (
    <div className="container">
      <Paper elevation={16} className="paper">
        <div className="input">
          <Button
            onClick={() => {
              setState({
                ...state,
                advanced: !state.advanced,
              });
            }}
          >
            advanced settings
          </Button>
          <div id="basic">
            <div className="col">
              <div className="param">
                <span className="info">Amplitude</span>
                <Slider track={false} className="slider" />
              </div>
              <div className="param">
                <span className="info">Magnitude</span>
                <Slider track={false} className="slider" />
              </div>
            </div>
            <div className="col">
              <div className="param">
                <span className="info">Magnitude</span>
                <Slider track={false} className="slider" />
              </div>
              <div className="param">
                <span className="info">Magnitude</span>
                <Slider track={false} className="slider" />
              </div>
            </div>

            <div className="checkBoxes">
              <Checkbox />
              <Checkbox />
            </div>
          </div>
          <div className={state.advanced ? "active" : "inactive"}>
            <EditableMathField
              id="editor"
              latex={state.equation}
              onChange={(field) => {
                setState({
                  ...state,
                  equation: field.latex(),
                });
              }}
            />
            <Button
              onClick={() => {
                setState({
                  ...state,
                  advanced: !state.advanced,
                });
              }}
            >
              Basic settings
            </Button>
          </div>
        </div>
      </Paper>
      <div className="output">
        <svg
          version="1.1"
          transform="scale(1.2)"
          width="700"
          height="300"
          viewBox="0 -150 150 300"
          className="svg"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={path} id="path" stroke="black" />
        </svg>
      </div>
    </div>
  );
}
