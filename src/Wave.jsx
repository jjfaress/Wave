import { Paper } from "@mui/material";
import './Wave.scss'
import { useEffect, useState } from "react";
import EquationEditor from "equation-editor-react";
import { parseTex } from "tex-math-parser";
import linear from "linear-solve";


export default function Wave() {
    
    const [equation, setEquation] = useState(`y=sin(x)`);

    useEffect(()=>{
        try {
            buildSvgPath(getControlPoints(getPoints()))
        }
        catch (e) {
            console.log(e)
        }
    })

    const getPoints = () => {
        const raw = String.raw`${equation}`;
        const tree = parseTex(raw);
        let points = [];
        for (let i = 0; i < 50; i++) {
            let code = tree.compile().evaluate({x: i});
            points[i] = code;
        }
        return points;
    }

    const coefMatrix = (n) => {
        const id = Array(n).fill(0).map(()=>Array(n).fill(0))
        for (let i = 0; i < id.length; i++) {            
            id[i][i] = 4;
            if (i < n-1){
               id[i][i+1] = 1; 
            }           
            if (i > 0) {
                id[i][i-1] = 1;
            }
        }
        id[0][0] = 2;
        id[n-1][n-1] = 7;
        id[n-1][n-2] = 2;
        return id
    }
    
    const getCoef = (points) => {
        let n = points.length-1;
        let C = coefMatrix(n);
        let P = Array(points);
        for (let i = 0; i < n; i++) {
            P[i] = 2 * (2 * points[i] + points[i+1]);
        }
        P[0] = points[0] + 2 * points[1];
        P[n - 1] = 8 * points[n - 1] + points[n];
        let A = linear.solve(C, P);
        let B = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            B[i] = 2 * points[i+1] - A[i+1];
        }
        B[n-1] = (A[n-1] + points[n]) / 2;

        return [A, B];
    }

    const getControlPoints = (points) => {
        let ce = getCoef(points);
        let A = ce[0];
        let B = ce[1];
        let coords = [];
        for (let i = 0; i < points.length; i++) {
            coords[i] = [points[i], A[i], B[i], points[i+1]]
        }
        return coords;
    }

    const buildSvgPath = (coords) => {
        let d = ``;
        for (let i = 0; i < 2; i++) {
            let M = coords[i][0];
            let c1 = coords[i][1];
            let c2 = coords[i][2];
            let c3 = coords[i][3];
            d += `M ${i} ${M} C ${c1}, ${c2}, ${c3} `; 
        }
        return d;
    }


  return (
    <div className='container'>
        <Paper elevation={16} className="menu">
            <div className='editor'>
                <EquationEditor 
                value={equation}
                onChange={setEquation}
                autoCommands = 'pi theta'
                autoOperatorNames="sin cos tan sec csc cot" 
                className='editor'
                />
            </div> 
        </Paper>
        <div className="output">

        </div>
    </div>
  )
}

