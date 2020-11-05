
export function getBinWiseArr (testTimeArray:Array<number>, numOfBins:number, binWidth:number): Array<number> {
    const binWiseArr = Array(numOfBins).fill(0);
    for (let i = 0; i < testTimeArray.length; i++) {
        let indexToPush = Math.floor(Number(testTimeArray[i]) / binWidth);
        if (indexToPush === numOfBins) {
            indexToPush--;
        }
        binWiseArr[indexToPush] += 1;
    }
    return binWiseArr;
}