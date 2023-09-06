import { SortingOrder } from "../app/types"
import { sortObjectArrayAlphabetically, versionComparator } from "../common"
import { ChartDetailType } from "./types"

export const processChartData = (data: ChartDetailType[]): ChartDetailType[] => {
    let resultData = []
    const uniqueChartList = new Map<string, ChartDetailType>()
    data.forEach((element) => {
        const chartDetail = uniqueChartList.get(element.name)
        if (chartDetail) {
            chartDetail.count++
            chartDetail.versions.push({ id: element.id, version: element.version })
            if (chartDetail.version < element.version) {
                chartDetail.version = element.version
                chartDetail.chartDescription = element.chartDescription
            }
        } else {
            uniqueChartList.set(element.name, {
                ...element,
                count: 0,
                versions: [{ id: element.id, version: element.version }],
            })
        }
    })
    uniqueChartList.forEach((element) => {
        element.versions?.sort((a, b) => versionComparator(a, b, 'version', SortingOrder.DESC))
        resultData.push(element)
    })
    resultData = sortObjectArrayAlphabetically(resultData, 'name')
    return resultData
}