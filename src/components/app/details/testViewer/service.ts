import {get, post} from '@devtron-labs/devtron-fe-common-lib'
import {SelectedNames} from './Test.types'

function generateQueryParams(selectedNames: SelectedNames){
    const strings = Object.entries(selectedNames).map(([category, names])=>names.map(name=>`&${category}[]=${name}`))
    return encodeURI(`?${strings.filter(s=>s.length > 0).join('&')}`)
}

export async function getTestSuites(pipelineId: number | string, triggerId: number | string, selectedNames) {
    return post(`test/suites/proxy`, { link: `triggers/${pipelineId}/${triggerId}${generateQueryParams(selectedNames)}` })
}

export async function getTestCase(testCaseId: number) {
    return get(`test/cases/${testCaseId}`);
}

export async function getSuiteDetail(testSuitesId: number, testSuiteId: number) {
    return get(`test/suites/${testSuiteId}`);
}

// export async function getTriggerList(pipelineId, selectedNames, startDate, endDate) {
//     return get(`test/trigger/${pipelineId}${generateQueryParams}`);
// }

export async function getTriggerList(pipelineId, selectedNames: SelectedNames, startDate, endDate){
    return post(`test/suites/proxy`, {link: `triggers/${pipelineId}${generateQueryParams(selectedNames)}&startDate=${startDate}&endDate=${endDate}`})
}

export async function getFilters(pipelineId: number | string, triggerId?:number | string){
    return post(`test/suites/proxy`, {link: `filters/${pipelineId}${triggerId ? '/'+triggerId : ''}`})
}
// "test/suites/list"
// "test/suites/list/details"
// "test/suites/{id}"
// "test/cases"
// "test/cases/{id}"
// "test/trigger/{appId}"
// "test/trigger/{appId}/{envId}"
