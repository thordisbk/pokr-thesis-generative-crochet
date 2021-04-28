// functions for creating different stitches
// they use the current row and return it modified

// functions for creating: single stitch, increase, decrease, ...

function InitStitchSingle(rowStitches, prevStitch, ontoStitch, type) {
    let currStitch = new Stitch(type, StitchDescription.REGULAR, prevStitch, ontoStitch);
    array.push(rowStitches, currStitch);
    return rowStitches;
}

function InitStitchInc(rowStitches, prevStitch, ontoStitch, type) {    
    // use to make a normal stitch INCREASE of 2 stitches
    let currStitch1 = new Stitch(type, StitchDescription.INC, prevStitch, ontoStitch);
    let currStitch2 = new Stitch(type, StitchDescription.INC, currStitch1, ontoStitch);
    array.push(rowStitches, currStitch1);
    array.push(rowStitches, currStitch2);
    return rowStitches;
}

function InitStitchIncNum(rowStitches, prevStitch, ontoStitch, type, incs) {    
    // stitch increase of "incs" stitches
    let prev = prevStitch;
    for (let i = 0; i < incs; i++) {
        let currStitch = new Stitch(type, StitchDescription.INC, prev, ontoStitch); 
        array.push(rowStitches, currStitch);
        prev = currStitch;
    }
    return rowStitches;
}

function InitStitchDec(rowStitches, prevStitch, ontoStitch1, ontoStitch2, type) {
    // use to make a normal stitch DECREASE of 2 stitches
    let ontoStitches = [ontoStitch1, ontoStitch2];
    let currStitch = new Stitch(type, prevStitch, ontoStitches); 
    array.push(rowStitches, currStitch);
    return rowStitches;
}

function InitStitchDecNum(rowStitches, prevStitch, ontoStitches, type) {
    // use the make a stitch decrease into the stitches in the list ontoStitches
    let currStitch = new Stitch(type, prevStitch, ontoStitches); 
    array.push(rowStitches, currStitch);
    return rowStitches;
}