
class CrochetStructure {
    // let crochetType;

    // let hookSize;     // metric size of the hook, in mm
    // let yarnWeight;   // weight of the yarn, by categories

    // how dense the crochet is: 1.0 is normal, < 1.0 is tighter, > 1.0 is looser
    // let tensionLength;      // tension of stitch length
    // let tensionWidth;      // tension of stitch width

    // used to show a more correct representation of the crochet
    // let stitchLength = 1.0;
    // let stitchWidth = 1.0;

    // let totalStitches = 0;
    // let firstStitch;
    // let rows = [];

    // let usingTest = false;
    // let csName = "None";

    // let useOriginStitchForCentering = true;
    // PVector centroid;

    // let allNodes = [];
    // let allSprings = [];

    // for visualizing points
    // let showVisualPoints = false;
    // let visualPoints = [];

    CrochetStructure(ct, hs, yw) {
        this.crochetType = ct;
        this.hookSize = hs;
        this.yarnWeight = yw;
        // TODO since hook and yarn were given instead of the sizes of a gauge, find the standard tension
        this.tensionLength = 1.0;
        this.tensionWidth = 1.0;

        this.useOriginStitchForCentering = true;  
        this.usingTest = false;     
        this.showVisualPoints = false;     
        this.visualPoints = [];
    }

    CrochetStructure(ct, wid10x10, len10x10) {
        // wid10x10 and len10x10 are given in cm
        this.crochetType = ct;
        this.hookSize = 0.0;
        this.yarnWeight = null;
        this.tensionLength = len10x10 / 10.0;
        this.tensionWidth = wid10x10 / 10.0;

        // FIXME
        stitchWidthMultiplier = 30 * this.tensionWidth;
        stitchLengthMultiplier = 30 * this.tensionLength;    
        
        this.useOriginStitchForCentering = true;  
        this.usingTest = false; 
        this.showVisualPoints = false;     
        this.visualPoints = [];
    }

    CheckNodeSelection() {
        // make sure only one Node is pressed
        let foundPressed = false;
        for (let n = 0; n < this.allNodes.length; n++) {
            let node = this.allNodes[n];
            if (node.move && !foundPressed) {
                foundPressed = true;
            } else if (node.move && foundPressed) {
                node.released();
            }
        }
    }

    DetectNodeCollisions() {
        for (let i = 0; i < this.allNodes.length; i++) {
            for (let j = 0; j < this.allNodes.length; j++) {
                if (i != j) {
                    let pos1 = this.allNodes[i].pos;
                    let pos2 = this.allNodes[j].pos;
                    let dist = pos1.dist(pos2);
                    let collDist = this.allNodes[i].radius + this.allNodes[i].radius;;
                    if (dist < collDist) {
                        // collision
                        console.log("Collision");
                    }

                }
            }
        }
    }

    Draw() {
        // if (VERBOSE) console.log("CrochetStructure::Draw");
        
        // move current center of coordinate system from (0,0,0) to center
        // translate(WIDTH/2, HEIGHT/2, 0);  // not with JS
        // translate(this.centroid.x, this.centroid.y, this.centroid.z);

        // first update nodes, then update springs
        for (let n = 0; n < this.allNodes.length; n++) {
            this.allNodes[n].update();
        }
        for (let s = 0; s < this.allSprings.length; s++) {
            this.allSprings[s].update();
        }
        // make sure only one Node is pressed
        CheckNodeSelection();
        // DetectNodeCollisions();

        // then draw
        for (let r = 0; r < this.rows.length; r++) {
            this.rows[r].Draw();
        }
        // for (Spring s : this.allSprings) {
        //     s.Draw();
        // }
        // for (Node n : this.allNodes) {
        //     n.Draw();
        // }

        /*if (showCentroid) {
            push();
            noFill();  // fill(0, 0, 0);
            stroke(0, 0, 0);
            translate(this.centroid.x, this.centroid.y, this.centroid.z);
            // translate(0, 0, 0);  // this is now at the center of the window
            sphere(sphereRadius * 1.5);
            pop();
        }*/

        if (this.showVisualPoints) {
            let counterVP = 0;
            for (let i = 0; i < this.visualPoints.length; i++) {
                let vp = this.visualPoints[i];
                counterVP++;

                noStroke();
                if (counterVP % 2 == 0) fill(0);
                else fill(255);

                push();
                rotateX(radians(ROTATION.x));
                rotateY(radians(ROTATION.y));
                rotateZ(radians(ROTATION.z));

                let zoomPos = p5.Vector.mult(vp, ZOOM);
                translate(zoomPos.x, zoomPos.y, zoomPos.z);
                scale(ZOOM, ZOOM, ZOOM);

                sphere(sphereRadius/2);
                pop();
            }
        }

        // move current center of coordinate system from center to (0,0,0)
        // translate(-WIDTH/2, -HEIGHT/2, 0);  // not with JS
    }

    PressNodes() {
        for (let n = 0; n < this.allNodes.length; n++) {
            this.allNodes[n].pressed();
        }
    }

    ReleaseNodes() {
        for (let n = 0; n < this.allNodes.length; n++) {
            this.allNodes[n].released();
        }
    }

    Generate() {
        // call GenerateRestrained with no restralets
        let minRows = 0;
        let maxRows = MAX_let;
        let minStitches = 1;
        let maxStitches = MAX_let;
        let numStitchesFirstRow = 5;
        let sameStitch = false;
        let sType = StitchTypes.NONE;
        // CrochetType type = null;
        let canBeCirc = true; 
        let canBeBAF = true;

        return GenerateRestrained(minRows, maxRows, minStitches, maxStitches, numStitchesFirstRow, canBeCirc, canBeBAF, sameStitch, sType);
    }

    GenerateRestrained(minRows, maxRows, minStitches, maxStitches, numStitchesFirstRow, canBeCirc, canBeBAF, allSameStitch, stitchType) {
        // minRows and maxRows specify a maximum and minmum number of rows, with the lowest being 0
        // minStitches and maxStitches specify a maximum and minmum number of stitches in a rows, with the lowest being 1
        // numStitchesFirstRow specify the number of stitches to use for the first row
        // canBeCirc and canBeBAF define whether the structure can be circular of back&forth, if both true/false then it's random
        // allSameStitch specifies whether to only use CH and SC (true), or any type of stitch (false)
        // stitchType is used if allSameStitch == true (else it is .NONE), this specifies which stitch type + CH can be used
        
        this.csName = "generated crochet structure";

        let enableDec = false;  // TODO

        if (maxRows < minRows) maxRows = minRows;
        if (minRows < 1) minRows = 1;
        if (maxRows < 1 || maxRows == MAX_let || maxRows > 50) maxRows = 50;  // FIXME
        let numOfRows = let(random(minRows, maxRows));

        if (numStitchesFirstRow < 1 || numStitchesFirstRow > 10) numStitchesFirstRow = let(random(4, 10));

        if (minStitches < numStitchesFirstRow) minStitches = numStitchesFirstRow;
        if (maxStitches < minStitches) maxStitches = minStitches;
        if (minStitches < 1) minStitches = 1;
        if (maxStitches < 1 || maxStitches == MAX_let || maxStitches > 300) maxStitches = 300;  // FIXME

        if (canBeCirc && canBeBAF) {  // TODO remove this and implement if (canBeCirc && canBeBAF) below
            let rand = let(random(0, 2)); 
            if (rand == 0) canBeBAF = false;
            else canBeCirc = false;
        }

        // generate something random with single stitches, increases, and decreased
        if (canBeCirc && !canBeBAF) {
            this.crochetType = CrochetType.CIRCULAR;

            // randomly decide whether to start on magic ring circle or circle of multiple CHs
            // TODO

            // first row: start with slip knot and CH 2
            this.firstStitch = new Stitch();
            let stitch_ch1 = new Stitch(StitchTypes.CH, StitchDescription.REGULAR, this.firstStitch, null);
            let stitch_ch2 = new Stitch(StitchTypes.CH, StitchDescription.REGULAR, stitch_ch1, null);
            let firstRowStitches = [this.firstStitch, stitch_ch1, stitch_ch2];
            array.push(this.rows, new Row(firstRowStitches, this.crochetType));
            
            // second row: choose random start stitches
            let currType = GetRandomStitchType();  // FIXME
            if (allSameStitch) currType = stitchType;
            let secondRowStitches = [];
            secondRowStitches = InitStitchIncNum(secondRowStitches, stitch_ch2, stitch_ch1, currType, numStitchesFirstRow);
            array.push(this.rows, new Row(secondRowStitches, this.crochetType));
            
            // consecutive rows
            let prevStitch = secondRowStitches[secondRowStitches.length-1];
            let ontoStitch = secondRowStitches[0];
            let stitchesInPrevRow = numStitchesFirstRow;
            for (let r = 0; r < numOfRows-2; r++) {  // -2 because of first two rows above
                let currRowStitches = [];
                let stitchesInCurrRow = stitchesInPrevRow;
                for (let s = 0; s < stitchesInPrevRow; s++) {
                    currType = GetRandomStitchType();
                    if (allSameStitch) currType = stitchType;

                    let prob = random(0, 1);
                    if (prob > 0.8 && stitchesInCurrRow < maxStitches) {  // do and increase
                        currRowStitches = InitStitchInc(currRowStitches, prevStitch, ontoStitch, currType);
                        stitchesInCurrRow++;
                    } else if (prob > 0.7 && stitchesInCurrRow > minStitches && enableDec && s < stitchesInPrevRow-1) { 
                        currRowStitches = InitStitchDec(currRowStitches, prevStitch, ontoStitch, ontoStitch.nextStitch, currType);
                        ontoStitch = ontoStitch.nextStitch;
                        stitchesInCurrRow--;
                        s++;
                    } else {
                        currRowStitches = InitStitchSingle(currRowStitches, prevStitch, ontoStitch, currType);
                    }
                    prevStitch = currRowStitches[currRowStitches.length-1];
                    ontoStitch = ontoStitch.nextStitch;
                }
                stitchesInPrevRow = stitchesInCurrRow;
                array.push(this.rows, new Row(currRowStitches, this.crochetType));
            }
        } else if (!canBeCirc && canBeBAF) {
            this.crochetType = CrochetType.BACKFORTH;

            // first row: start with slip knot and CH 2
            this.firstStitch = new Stitch();
            let firstRowStitches = [this.firstStitch];
            let prevStitch = this.firstStitch;
            let ontoStitch = null;
            for (let s = 0; s < numStitchesFirstRow; s++) {
                firstRowStitches = InitStitchSingle(firstRowStitches, prevStitch, null, StitchTypes.CH);
                prevStitch = firstRowStitches[firstRowStitches.length-1];
            }
            array.push(this.rows, new Row(firstRowStitches, this.crochetType));

            // consecutive rows: start with CH 2, then turn
            let stitchesInPrevRow = numStitchesFirstRow;
            for (let r = 0; r < numOfRows-1; r++) {  // -1 because of first row above
                ontoStitch = prevStitch;  // last stitch in previous row
                let currRowStitches = [];

                // CH before the actual first stitch
                let chains = 0;  // TODO should be checking next stitch type to determine the number of chains (if !allSameStitch)
                if (stitchType == StitchTypes.SC) chains = 1;
                else if (stitchType == StitchTypes.HDC || stitchType == StitchTypes.DC) chains = 2;
                else if (stitchType == StitchTypes.TR) chains = 3;
                for (let i = 0; i < chains; i++) {
                    currRowStitches = InitStitchSingle(currRowStitches, prevStitch, null, StitchTypes.CH);
                    prevStitch = currRowStitches[currRowStitches.length-1];
                }

                let stitchesInCurrRow = stitchesInPrevRow;
                for (let s = 0; s < stitchesInPrevRow; s++) {
                    let currType = GetRandomStitchType();
                    if (allSameStitch) currType = stitchType;

                    let prob = random(0, 1);
                    if (prob > 0.8 && stitchesInCurrRow < maxStitches) {  // do and increase
                        currRowStitches = InitStitchInc(currRowStitches, prevStitch, ontoStitch, currType);
                        stitchesInCurrRow++;
                    } else if (prob > 0.7 && stitchesInCurrRow > minStitches && enableDec && s < stitchesInPrevRow-1) { 
                        currRowStitches = InitStitchDec(currRowStitches, prevStitch, ontoStitch, ontoStitch.prevStitch, currType);
                        ontoStitch = ontoStitch.nextStitch;
                        stitchesInCurrRow--;
                        s++;
                    } else {
                        currRowStitches = InitStitchSingle(currRowStitches, prevStitch, ontoStitch, currType);
                    }
                    prevStitch = currRowStitches[currRowStitches.length-1];
                    ontoStitch = ontoStitch.prevStitch;
                }
                stitchesInPrevRow = stitchesInCurrRow;
                array.push(this.rows, new Row(currRowStitches, this.crochetType));
            }

        } else if (canBeCirc && canBeBAF) {
            // TODO implement the combination of CIRCULAR and BACKFORTH
            // would need to adjust how positioning works and there would not be a need for CrochetType
        } else {
            console.log("WARNING::FIXME::GenerateRestrained(): crochet type not set");
            return false;
        }

        PositionStitches();
        return true;
    }

    SetupTest(num) {
        this.usingTest = true;

        // TODO make first row CH 2 or magic ring
        // first row 
        this.firstStitch = new Stitch();

        if (num == 0) {
            this.rows = SetupCircleSC(this.firstStitch);
            this.csName = "SC circle";
        } else if (num == 1) {
            this.rows = SetupCircleDiff(this.firstStitch);
            this.csName = "stitch circle";
        } else if (num == 2) {
            this.rows = SetupCirclePI(this.firstStitch);
            this.csName = "PI circle";
        } else if (num == 3) {
            this.rows = SetupCircleThatCups(this.firstStitch);
            this.csName = "cupping circle";
        } else if (num == 4) {
            this.rows = SetupCircleThatCupsRandomIncs(this.firstStitch);
            this.csName = "cupping with random increases";
        } else if (num == 5) {
            this.rows = SetupHat(this.firstStitch);
            this.csName = "hat";
        } else if (num == 6) {
            this.rows = SetupCylindricalSpiral(this.firstStitch);
            this.csName = "cylindrical spiral";
        } else if (num == 7) {
            this.rows = SetupCylindrical(this.firstStitch);
            this.csName = "cylindrical";
        } else if (num == 8) {
            this.rows = SetupFlatCircle(this.firstStitch, 6, 1, StitchTypes.SC);
            this.csName = "flat circle";
        } else if (num == 9) {
            this.rows = SetupCircleWithDecreases(this.firstStitch);
            this.csName = "circle with decreases";
        } else if (num == 10) {
            this.rows = SetupBackAndForthSquare(this.firstStitch, StitchTypes.DC, 4, 5, false, false);
            this.csName = "back & forth";
        } else if (num == 11) {
            this.rows = SetupBackAndForthSquare(this.firstStitch, StitchTypes.DC, 3, 6, true, false);
            this.csName = "back & forth WITH increase";
        } else if (num == 12) {
            this.rows = SetupBackAndForthSquare(this.firstStitch, StitchTypes.DC, 3, 6, false, true);
            this.csName = "back & forth WITH decrease";
        }

        PositionStitches();
    }

    PositionStitches() {
        // set references in this.allNodes and this.allSprings
        for (let r = 0; r < this.rows.length; r++) {
            let row = this.rows[r];
            for (let s = 0; s < row.count; s++) {
                let stitch = row.stitches[s];
                array.push(this.allNodes, stitch.node);
                for (let sp = 0; sp < stitch.springs.length; sp++) {
                    array.push(this.allSprings, stitch.springs[sp]);
                }
            }
        }

        // count stitches
        for (let r = 0; r < this.rows.length; r++) {
            this.totalStitches += this.rows[r].count;
        }

        if (this.crochetType == CrochetType.CIRCULAR) ApplyTension();
        else PositionOneStitchThenActivateSprings();
        // PositionOneStitchThenActivateSprings();

        // // TODO create one row at a time and fix position+tension on each row
        // if (this.crochetType == CrochetType.CIRCULAR) {
        //     // FixStitchPositionsCircular();  // only does circular
        //     ApplyTension();  // ok cupping and bad ruffling
        //     // ApplyTensionToCircularRows();  // new version that positions based on up vector, not finished
        // } else if (this.crochetType == CrochetType.BACKFORTH) {
        //     FixStitchPositionsBackForth();
        //     // TODO tension for back and forth
        // }

        // find this.centroid after stitches have been poitioned
        this.centroid = FindCentroid(true, this.rows, this.totalStitches);
        if (VERBOSE) console.log("centroid: " + this.centroid);
    }

    PositionOneStitchThenActivateSprings() {
        let rowCounter = 0;
        for (let r = 0; r < this.rows.length; r++) {
            let row = this.rows[r];
            rowCounter++;
            // if (rowCounter > 2) break;
            for (let s = 0; s < row.count; s++) {
                let stitch = row.stitches[s];
                let prevStitch = stitch.prevStitch;
                let ontoStitch = stitch.ontoStitch;
                let pos = createVector(0, 0, 0);

                // find which way to calculate stitch position
                if (ontoStitch == null && prevStitch == null) {
                    // SLKN or MR
                    pos.set(0, 0, 0);
                } else if (ontoStitch != null && prevStitch != null) {
                    // SC, HDC, DC, TR, SLST
                    // TODO find letersection polet of ontoStitch.upVector and prevStitch.forwardVector

                    // let tmp_o = p5.Vector.mult(ontoStitch.upVector, stitch.length * stitchLengthMultiplier);
                    // tmp_o = p5.Vector.add(ontoStitch.GetPosition(), tmp_o);
                    let tmp_o = createVector(ontoStitch.upVector.x, ontoStitch.upVector.y, ontoStitch.upVector.z);
                    tmp_o.mult(stitch.length * stitchLengthMultiplier);
                    p5.Vector.add(ontoStitch.GetPosition(), tmp_o, tmp_o);
                    // tmp_o.add(ontoStitch.GetPosition());
                    array.push(this.visualPoints, tmp_o);  // white

                    // let tmp_p = p5.Vector.mult(prevStitch.forwardVector, stitch.width * stitchWidthMultiplier);
                    // // tmp_p = p5.Vector.add(tmp_o, tmp_p);
                    // tmp_p = p5.Vector.add(prevStitch.GetPosition(), tmp_p);
                    let tmp_p = createVector(prevStitch.forwardVector.x, prevStitch.forwardVector.y, prevStitch.forwardVector.z);
                    tmp_p.mult(stitch.width * stitchWidthMultiplier);
                    // tmp_p.add(prevStitch.GetPosition());
                    p5.Vector.add(prevStitch.GetPosition(), tmp_p, tmp_p);
                    array.push(this.visualPoints, tmp_p);  // black

                    pos = tmp_o;
                    // pos = p5.Vector.lerp(tmp_o, tmp_p, 0.5);
                    // pos = tmp_p;
                    // pos = p5.Vector.lerp(tmp_p, tmp_o, 0.5);

                    let dirPrevCurr = p5.Vector.sub(pos, prevStitch.GetPosition());
                    dirPrevCurr.normalize();
                    let dirCurrNext = stitch.forwardVector;
                    let dot = dirPrevCurr.dot(dirCurrNext); 

                    if (pos.dist(prevStitch.GetPosition()) < (stitch.width * stitchWidthMultiplier)) {
                        // get vector from prevPos to pos, give it the desired width length and translate the prevPos in direction of pos
                        if (VERBOSE) console.log("(s=" + s + ") pos too close to prev. pos = " + pos);
                        if (pos.dist(prevStitch.GetPosition()) == 0) {
                            pos = tmp_p;
                            if (VERBOSE) console.log(" set pos as tmp_p");
                            stitch.node.col = createVector(0, 0, 0);
                        } 
                    } else if (dot < 0 && s > 2) {  // if dot < 0 then there are >90 deg between vectors (obtuse) (acute is <90)         
                        // TODO check if on the correct side
                        // check that pos is not on opposite side of foward vector (not if CH because of turn around?)
                        // pos = tmp_p;
                    }

                    // console.log("\nstitch with onto and prev");
                    // console.log("currStitch " + stitch.stitchType + " | ");
                    // console.log("ontoStitch " + ontoStitch.stitchType + " | pos: " + ontoStitch.GetPosition() + " | upV: " + ontoStitch.upVector + " | tmp_o: " + tmp_o);
                    // console.log("prevStitch " + prevStitch.stitchType + " | pos: " + prevStitch.GetPosition() + " | forwardV: " + prevStitch.forwardVector + " | tmp_p: " + tmp_p);

                } else if (ontoStitch == null && prevStitch != null) {
                    // CH or SK
                    // TODO use prevStitch.forwardVector to find a position for stitch
                    pos = p5.Vector.mult(prevStitch.forwardVector, stitch.width * stitchWidthMultiplier);
                    pos = p5.Vector.add(prevStitch.GetPosition(), pos);
                } else if (ontoStitch != null && prevStitch == null) {
                    // not a thing, there should always be a prevStitch of there is an ontoStitch
                    console.log("WARNING::FIXME::PositionOneStitchThenActivateSprings(): (prev = null) but (onto != null)");
                }
                stitch.SetPosition(pos);

                // update springs of structure (up to and including current stitch) while still finding a relaxed state
                UpdatePreviousStitches(r, s, 1000, false);

                // if (stitch.ontoStitch != null) stitch.ontoStitch.RecalculateVectors();
                stitch.RecalculateVectors();
                if (VERBOSE) console.log("- forward vector = " + stitch.forwardVector);
            }
        }
        // update all including newest
        UpdatePreviousStitches(this.rows.length-1, this.rows[this.rows.length-1].count-1, 1000, true);
    }

    UpdatePreviousStitches(r, s, n, includeCurrent) {
        // activate all previous rows and stitches, except in current row; only activate positioned stitches
        if (!includeCurrent)
            s = s-1;

        for (let rr = r; rr >= 0; rr--) {
            let startS = (rr == r) ? s : this.rows[rr].count - 1;
            for (let ss = startS; ss >= 0; ss--) {
                let aPrevStitch = this.rows[rr].stitches[ss];
                aPrevStitch.SpringsActivateAll();
            }
        }
        // update the activated stitches n times  // TODO update while not relaxed
        for (let updates = n; updates > 0; updates--) {  
            for (let rr = r; rr >= 0; rr--) {
                let startS = (rr == r) ? s : this.rows[rr].count - 1;
                for (let ss = startS; ss >= 0; ss--) {
                    let aPrevStitch = this.rows[rr].stitches[ss];
                    aPrevStitch.SpringsUpdateAll();
                }
            }
        }
        // deactivate the activated stitches
        for (let rr = r; rr >= 0; rr--) {
            let startS = (rr == r) ? s : this.rows[rr].count - 1;
            for (let ss = startS; ss >= 0; ss--) {
                let aPrevStitch = this.rows[rr].stitches[ss];
                aPrevStitch.SpringsDeactivateAll();
                aPrevStitch.RecalculateVectors();
            }
        }
    }

    FixStitchPositionsCircular() {
        if (VERBOSE) console.log("CrochetStructure::FixStitchPositionsCircular");

        // first distribute the stitches in each row in a circular fashion
        // then normalize all stitches, row by row
        for (let i = 0; i < this.rows.length; i++) {
            // DistributeStitchesInRowCircularlyAroundCenter(this.rows[i]);
            DistributeStitchesEvenlyCircular(this.rows[i], true);
            // NormalizeStitchesInCircularRow(this.rows[i]);
        }
        for (let i = 0; i < this.rows.length; i++) {
            NormalizeStitchesInCircularRow(this.rows[i]);
        }
    }

    ApplyTension() {
        let printStuff = true;
        // change positions of stitches to accommodate the tension and number of stitches in a row
        let zAdd = 1.0 * stitchLengthMultiplier, zPrev = 0.0;
        let counter = 0;
        for (let r = 0; r < this.rows.length; r++) {
            let row = this.rows[r];
            let stitchWidth = 1.0;
            if (printStuff) console.log("\n ----------------------------");
            if (printStuff) console.log("\nROW: " + counter);

            // distribute stitches evenly around the first stitch in the first row
            // move each stitch closer to its ontoStitch, until the length between them is equal to stitch.length
            DistributeStitchesEvenlyCircular(row, true);
            NormalizeStitchesInCircularRow(row);

            let actualCircumference = row.GetRowCircumferenceActual(true);
            let desiredCircumference = row.GetRowCircumferenceDesired();

            if (printStuff) console.log("BEFORE: circumference | actual = " + actualCircumference + " | desired = " + desiredCircumference);
            let ratioCirc = desiredCircumference / actualCircumference;
            let diff = abs(desiredCircumference - actualCircumference);
            // console.log("- Difference: " + diff);

            // if (counter > 3) return;
            if (actualCircumference > desiredCircumference) {  // && (counter > 1)) {
                // TODO there could be cuffing, since the circumference is less that a circle's circumference
                if (printStuff) console.log("CUPP ?");

                let currStitchLength = row.stitches[0].length;
                // let pos1 = row.stitches[0].GetPosition();
                // let pos2 = row.stitches[1].GetPosition();
                // let redEdgeDist = pos1.dist(pos2);  // current length of edge is > 1, but we want it to be 1
                // let redEdgeRatio = currStitchLength * stitchLengthMultiplier / redEdgeDist;
                // TODO it is not always the case that every red edge is the same length

                for (let s = 0; s < row.count; s++) { // for (Stitch stitch : row.stitches) {
                    if (printStuff && counter > 3) console.log("\nOn stitch ...");
                    // find stitchVector (vector from ontoStitch to currStitch)
                    let stitch = row.stitches[s];
                    let stitchVector = createVector();  // from zero to position vector
                    p5.Vector.sub(stitch.GetPosition(), stitch.ontoStitch.GetPosition(), stitchVector);  // store difference in vector

                    // find the radii previous row (which has been fixed) and the radius that this row will have 
                    let currRad = 0;  // need to go back to first row to find the radius
                    let ontoStitch = stitch;
                    while (ontoStitch.ontoStitch != null) {
                        let xyV1 = createVector(ontoStitch.GetPosition().x, ontoStitch.GetPosition().y, 0);
                        let xyV2 = createVector(ontoStitch.ontoStitch.GetPosition().x, ontoStitch.ontoStitch.GetPosition().y, 0);
                        currRad += xyV1.dist(xyV2);
                        ontoStitch = ontoStitch.ontoStitch;
                    }
                    let prevRad = 0;  // radius of previous row
                    if (stitch.ontoStitch != null) {
                        ontoStitch = stitch.ontoStitch;
                        while (ontoStitch.ontoStitch != null) {
                            let xyV1 = createVector(ontoStitch.GetPosition().x, ontoStitch.GetPosition().y, 0);
                            let xyV2 = createVector(ontoStitch.ontoStitch.GetPosition().x, ontoStitch.ontoStitch.GetPosition().y, 0);
                            prevRad += xyV1.dist(xyV2);
                            ontoStitch = ontoStitch.ontoStitch;
                        }
                    }

                    // each red edge must become redEdgeRatio % of what is was, so that they will all have the width of the stitch
                    //  since each red edge is equal in length, the whole circumference will become redEdgeRatio % of what is was
                    //  as the radius doubles when the circumference doubbles, the radius will become redEdgeRatio % of what is was
                    // let newRad = currRad * redEdgeRatio;
                    let newRad = currRad * (desiredCircumference / actualCircumference);
                    if (printStuff) console.log("- currRad: " + currRad + " | newRad: " + newRad + " | prevRad: " + prevRad);

                    let stitchCurrLen = currRad - prevRad;
                    if (printStuff) console.log("- stitchCurrLen = " + stitchCurrLen);
                    // NEW
                    ratioCirc = desiredCircumference / actualCircumference;
                    // we want the actualCircumference to be ratioCirc of what is currently is
                    // same goes for radius: we want it to become ratioCirc of what it currently is
                    // since we cannot change prevRad, we must change newRad
                    let desiredStitchLen = (newRad - prevRad) / stitchLengthMultiplier;
                    if (printStuff) console.log("- desiredStitchLen = " + desiredStitchLen);

                    // cannot adjust rad in previous rows, only current, so current stitch length becomes
                    let v1 = (newRad % stitchLengthMultiplier) / stitchLengthMultiplier;
                    let v2 = (prevRad % stitchLengthMultiplier) / stitchLengthMultiplier;
                    // let newStitchLen = (v1 >= v2) ? v1 - v2 : 1.0 + v2 - v1;
                    let newStitchLen = v1 - v2;
                    newStitchLen = desiredStitchLen;
                    if (printStuff) console.log("- newStitchLen = " + newStitchLen);

                    // store the old position for printing
                    let oldStitchPos = stitch.GetPosition();

                    // get X and Y coord of stitch, by scaling the stitchVector and translating
                    let newXYpos = createVector();
                    p5.Vector.mult(stitchVector, newStitchLen, newXYpos);
                    if (stitch.ontoStitch != null) newXYpos.add(stitch.ontoStitch.GetPosition());

                    // get Z coord of stitch, using pythagoras
                    let zPlus = sqrt((currStitchLength * currStitchLength) - (newStitchLen * newStitchLen)) * stitchLengthMultiplier;
                    if (let.isNaN(zPlus)) zPlus = 0;  // FIXME added because of NaN of DEC stitches
                    if (stitch.ontoStitch != null) zPlus += stitch.ontoStitch.GetPosition().z;
                    // console.log("- zPlus = " + zPlus);

                    // set the new position
                    let newStitchPos = createVector(newXYpos.x, newXYpos.y, zPlus);
                    stitch.SetPosition(newStitchPos);

                    // checks
                    let newLen = (stitch.GetPosition().dist(stitch.ontoStitch.GetPosition()) / 30.0);
                    if (!AreAlmostEqual(newLen, stitch.length)) console.log("ALMOST: stitch length is " + newLen + " but should be " + stitch.length);
                    if (printStuff) console.log("- old pos: " + oldStitchPos + " | new pos: " + newStitchPos + " | length = " + newLen);
                }

                // TODO e.g. if stitches cannot be moved inwards untill each red edge == 1.0, 
                //  that is, they'll reach their lowest value and then start increasing again going inward,
                //  then stop .....
            } else if (actualCircumference < desiredCircumference) {
                // TODO there could be ruffling, since the circumference is greater that a circle's circumference
                if (printStuff) console.log("RUFF ?");

                // skip first row
                if (counter == 0) {
                    if (printStuff) console.log("\nSkip first row");  // TODO don't skip?
                    continue;
                }

                let even = (row.count % 2) == 0 ? true : false;
                let sign = 1;
                for (let i = 0; i < row.count; i++) {
                    if (printStuff) console.log("\nOn stitch ...");
                    let currIdx = i;
                    let prevIdx = (i > 0) ? i-1 : row.count-1;

                    // look at the current stitch and the one before it
                    // make sure that the distance between them is stitch.width (/2*2 for each?)
                    // do this by raising / lowering the z-coord of the prev stitch
                    let posPrev = row.stitches[prevIdx].GetPosition();
                    let posCurr = row.stitches[currIdx].GetPosition();
                    let posPrevOnto = row.stitches[prevIdx].ontoStitch.GetPosition();
                    let posCurrOnto = row.stitches[currIdx].ontoStitch.GetPosition();

                    let vCurr = createVector();
                    let vPrev = createVector();
                    p5.Vector.sub(posCurr, posCurrOnto, vCurr);
                    p5.Vector.sub(posPrev, posPrevOnto, vPrev);

                    // TODO find amplitude and period such that the length of the sine wave will be desiredCircumference
                    // sine wave
                    let amplitude = 0.33;
                    let period = 3.0;
                    let sine_val = amplitude * sin(period * currIdx * (TWO_PI/row.count));
                    let newZ = row.stitches[currIdx].GetPosition().z + sine_val * stitchLengthMultiplier;
                    let posCurrNew = createVector(posCurr.x, posCurr.y, newZ);
                    row.stitches[currIdx].SetPosition(posCurrNew);

                    let currLen = row.stitches[currIdx].GetPosition().dist(row.stitches[currIdx].ontoStitch.GetPosition());
                    if (printStuff) console.log("- curr len = " + currLen);
                    sign *= -1;
                }
            } else {
                // TODO if actualCircumference == desiredCircumference,
                //  still need to check width of every stitch, which should be 1.0
            }

            // find new actual circumference now
            let newActualCirc = row.GetRowCircumferenceActual(true);

            let tempV = createVector(row.stitches[0].GetPosition().x, row.stitches[0].GetPosition().y, 0);
            let newRadius = tempV.dist(createVector(0, 0, 0));
            if (printStuff) console.log("AFTER: circumference | actual = " + newActualCirc + " | desired = " + desiredCircumference);

            counter++;
        }
    }

    FixStitchPositionsBackForth() {
        if (VERBOSE) console.log("CrochetStructure::FixStitchPositionsBackForth");

        for (let i = 0; i < this.rows.length; i++) {
            // console.log("Row");

            let y = this.rows[0].stitches[0].GetPosition().y;
            let sign = (i % 2 == 0) ? 1 : -1;            

            for (let j = 0; j < this.rows[i].count; j++) {
                let currStitch = this.rows[i].stitches[j];
                // console.log("- Stitch:", currStitch.stitchType);
                let prevPos = currStitch.GetPosition();
                if (currStitch.prevStitch != null) {
                    prevPos = currStitch.prevStitch.GetPosition();
                }

                let stitchLen = currStitch.length * stitchLengthMultiplier;
                let ontoStitch = currStitch.ontoStitch;
                if (ontoStitch != null && this.useOriginStitchForCentering) {
                    let ontoStitchPos = ontoStitch.GetPosition();
                    while (ontoStitch != null) {
                        if (ontoStitch != null) {
                            ontoStitchPos = ontoStitch.GetPosition();
                            stitchLen = stitchLen + ontoStitch.length * stitchLengthMultiplier;
                        }
                        ontoStitch = ontoStitch.ontoStitch;
                    }
                }

                if (currStitch.ontoStitch != null) {
                    let ontoStitchPos = currStitch.ontoStitch.GetPosition();
                    currStitch.SetPosition(createVector(ontoStitchPos.x, y - stitchLen, prevPos.z));
                } else if (currStitch.prevStitch != null) {
                    y = prevPos.y;
                    currStitch.SetPosition(createVector(prevPos.x + stitchLengthMultiplier * sign, y, prevPos.z));
                } else { 
                    console.log("HERE");
                }
            }
            
        }
    }

    ApplyTensionToCircularRows() {
        if (VERBOSE) console.log("CrochetStructure::ApplyTensionToCircularRows");
        for (let r = 0; r < this.rows.length; r++) {
            let row = this.rows[r];
            if (row.AllStitchesAreTheSameType(StitchTypes.CH)) {
                // the first row should only be made from CHs
                // TODO only if first in next row connects to first in this row; set this.crochetType = CIRCULAR
                DistributeStitchesEvenlyCircular(row, true);
                // else this could be BACKANDFORTH so position accordingly
                continue;
            } else if (r == 1 && (this.rows[0].count < 3 && this.rows[0].AllStitchesAreTheSameType(StitchTypes.CH))) {
                // this is the second row, and the first row was just a CH 1 or 2 to setup a ring
                DistributeStitchesEvenlyCircular(row, true);
                row.FixVectorsInRow();
                continue;
            } else if (row.stitches[0].stitchType == StitchTypes.SLKN) {
                DistributeStitchesEvenlyCircular(row, true);
                row.FixVectorsInRow();
                continue;
            } else if (r == 1 && this.rows[0].stitches[0].stitchType == StitchTypes.SLKN) {
                DistributeStitchesEvenlyCircular(row, true);
                row.FixVectorsInRow();
                continue;
            }

            if (r == 0) {
                console.log("FIXME::ApplyTensionToCircularRows() - (r == 0)");
            }
            if (r < 2) continue;

            // set each stitch's position using its ontoStitch's upVector
            for (let s = 0; s < row.count; s++) {
                let stitch = row.stitches[s];
                // console.log("oldPos = " + stitch.GetPosition());
                if (stitch.ontoStitch != null) {
                    let newPos = createVector(stitch.ontoStitch.upVector.x, stitch.ontoStitch.upVector.y, stitch.ontoStitch.upVector.z);
                    newPos.mult(stitch.length * stitchLengthMultiplier);
                    newPos.add(stitch.ontoStitch.GetPosition());
                    stitch.SetPosition(newPos);
                } else if (stitch.prevStitch != null) {
                    let newPos = createVector(stitch.prevStitch.upVector.x, stitch.prevStitch.upVector.y, stitch.prevStitch.upVector.z);
                    newPos.mult(stitch.length * stitchLengthMultiplier);
                    newPos.add(stitch.prevStitch.GetPosition());
                    stitch.SetPosition(newPos);
                } else {
                    console.log("FIXME::ApplyTensionToCircularRows() - (ontoStitch == prevStitch == NULL)");
                }
                // console.log("newPos = " + stitch.GetPosition());
            }
            row.FixVectorsInRow();

            // for every stitch (in prev row) that has more than one child, update their vectors
            // if (r > 0) {  // prob not needed
            if (r < 2) continue;

            let prevRow = this.rows[r-1];
            PositionChildStitches(prevRow, row);
            
            NormalizeStitchesInCircularRow(row);
            row.FixVectorsInRow();

            // row.UpdateSpringLengthsInRow();
            // row.UpdateSpringWidthsInRow();
            // row.FixVectorsInRow();

            // }

            // compare actual circumference to the desired circumference
            let circumferenceActual = row.GetRowCircumferenceActual(true);
            let circumferenceDesired = row.GetRowCircumferenceDesired();

            // update springs in current row
            // row.UpdateSpringsInRow();
            // row.FixVectorsInRow();

            // // distribute the stitches in a row
            // DistributeStitchesEvenlyCircular(row, true);
            // // normalize the length of the stitches
            // NormalizeStitchesInCircularRow(row);
            // // tension TODO

            // an approach where a stitch is placed above its ontoStitch

        }
    }

    PositionChildStitches(parentRow, childRow) {
        // iterate over stitches in parentRow and look at their childStitches
        //  the childStitches are in childRow
        for (let s = 0; s < parentRow.count; s++) {
            let parent = parentRow.stitches[s];
            let numChildren = parent.childStitches.length;
            console.log("This parent has " + numChildren + " childStitches.");
            if (numChildren <= 1) {
                console.log("- SKIP - parent has <= 1 child");
                continue;
            } else if (numChildren == 2 && (parent.childStitches[0].stitchType == StitchTypes.SLST || 
                                            parent.childStitches[1].stitchType == StitchTypes.SLST)) {
                // if one of the stitches is a SLST, then ignore this (TODO maybe not)
                console.log("- SKIP - parent has 2 children and one of them is a SLST");
                continue;
            }

            // new new version
            // eac

            // new version
            //  position first child half-way to prevStitch
            //  position last child third-way to nextStitch
            //  if numChildren is odd, the middle child should not be moved
            //  for children between first and middle child, position each between them at an equal distance
            //  for children between last and middle child, position each between them at an equal distance
            //      if numChildren is even, use the original position as center between first and last child
            let odd = (numChildren % 2) != 0;
            let idxMiddle = ceil(numChildren / 2);
            let posOriginal = parent.childStitches[0].GetPosition();  // all children have the same position at start
            for (let c = 0; c < numChildren; c++) {
                let child = parent.childStitches[c];
                let newPos = createVector();
                
                if (c == 0) {
                    console.log("- first child");
                    // this is the first child
                    let prevStitch = child.prevStitch;
                    let posPrev = prevStitch.GetPosition();
                    if (s == 0) {  // if (!childRow.IsStitchInRow(parent.childStitches[0].prevStitch))
                        console.log("- - first in row");
                        // then prevStitch is in the previous row, so create a pseudo pos for it
                        // posPrev = ComputeStitchPosFromUpVector(prevStitch);
                        let tmpPos = createVector(prevStitch.upVector.x, prevStitch.upVector.y, prevStitch.upVector.z);
                        tmpPos.mult(child.length * stitchLengthMultiplier);
                        tmpPos.add(prevStitch.GetPosition());
                        posPrev = tmpPos;
                    }
                    // position half-way to prevStitch
                    let vecOrigToPrev = p5.Vector.sub(posPrev, posOriginal);
                    vecOrigToPrev.mult(0.5);
                    newPos = p5.Vector.add(posOriginal, vecOrigToPrev);

                } else if (c == numChildren - 1) {
                    console.log("- last child");
                    // this is the last child
                    let nextStitch = child.nextStitch;
                    let posNext;
                    if (nextStitch != null) {
                        posNext = nextStitch.GetPosition();
                    } else {
                        console.log("- - no next stitch");
                        // then there is no next stitch, so make one
                        let posPrev = child.prevStitch.GetPosition();
                        let posPrevPrev = child.prevStitch.prevStitch.GetPosition();
                        let vecPrevPrevToPrev = p5.Vector.sub(posPrev, posPrevPrev);
                        posNext = p5.Vector.add(posPrev, vecPrevPrevToPrev);
                    }
                    // position third-way to nextStitch
                    let vecOrigToNext = p5.Vector.sub(posNext, posOriginal);
                    vecOrigToNext.mult(0.3);
                    newPos = p5.Vector.add(posOriginal, vecOrigToNext);
                } if (odd && c == idxMiddle) {
                    console.log("- middle child");
                    // this is the odd middle child
                    continue;
                }

                console.log("- old pos: " + child.GetPosition() + "\n- new pos: " + newPos);
                child.SetPosition(newPos);
            }
        }
    }
    
    GetApproximateRealSize() {

        // get positions of stitches furthest away from centroid
        let posFurthestXPos = createVector(this.centroid.x, 0, 0);
        let posFurthestXNeg = createVector(this.centroid.x, 0, 0);
        let posFurthestYPos = createVector(0, this.centroid.y, 0);
        let posFurthestYNeg = createVector(0, this.centroid.y, 0);
        let posFurthestZPos = createVector(0, 0, this.centroid.z);
        let posFurthestZNeg = createVector(0, 0, this.centroid.z);

        let firstPos = this.firstStitch.GetPosition();
        // find the positions furthest away for the centroid for each plane
        for (let r = 0; r < this.rows.length; r++) {
            let row = this.rows[r];
            for (let s = 0; s < row.count; s++) {
                let stitch = row.stitches[s];
                let currPos = stitch.GetPosition();
                let dist = currPos.dist(this.centroid);
                
                // check x
                let tempPosX = createVector(currPos.x, 0, 0);
                if (tempPosX.x >= this.centroid.x && currPos.dist(posFurthestXPos) > this.centroid.dist(posFurthestXPos)) {
                    posFurthestXPos = tempPosX;

                } else if (tempPosX.x < this.centroid.x && currPos.dist(posFurthestXNeg) > this.centroid.dist(posFurthestXNeg)) {
                    posFurthestXNeg = tempPosX;
                }

                // check y
                let tempPosY = createVector(0, currPos.y, 0);
                if (tempPosY.y >= this.centroid.y && currPos.dist(posFurthestYPos) > this.centroid.dist(posFurthestYPos)) {
                    posFurthestYPos = tempPosY;

                } else if (tempPosY.y < this.centroid.y && currPos.dist(posFurthestYNeg) > this.centroid.dist(posFurthestYNeg)) {
                    posFurthestYNeg = tempPosY;
                }

                // check z
                let tempPosZ = createVector(0, 0, currPos.z);
                if (tempPosZ.z >= this.centroid.z && currPos.dist(posFurthestZPos) > this.centroid.dist(posFurthestZPos)) {
                    posFurthestZPos = tempPosZ;

                } else if (tempPosZ.z < this.centroid.z && currPos.dist(posFurthestZNeg) > this.centroid.dist(posFurthestZNeg)) {
                    posFurthestZNeg = tempPosZ;
                }
            }
        }

        if (VERBOSE) console.log("pos furthest X:\n\t+ " + posFurthestXPos + "\n\t- " + posFurthestXNeg);
        if (VERBOSE) console.log("pos furthest Y:\n\t+ " + posFurthestYPos + "\n\t- " + posFurthestYNeg);
        if (VERBOSE) console.log("pos furthest Z:\n\t+ " + posFurthestZPos + "\n\t- " + posFurthestZNeg);

        let rs_x = posFurthestXPos.dist(posFurthestXNeg) / stitchLengthMultiplier;
        let rs_y = posFurthestYPos.dist(posFurthestYNeg) / stitchLengthMultiplier;
        let rs_z = posFurthestZPos.dist(posFurthestZNeg) / stitchLengthMultiplier;

        return "~ " + nf(rs_x, 0, 1) + " x " + nf(rs_y, 0, 1) + " x " + nf(rs_z, 0, 1) + " cm";
    }
}