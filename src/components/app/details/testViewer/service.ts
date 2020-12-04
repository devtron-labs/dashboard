import {get, post} from '../../../../services/api'
import {SelectedNames} from './Test.types'

function generateQueryParams(selectedNames: SelectedNames){
    const strings = Object.entries(selectedNames).map(([category, names])=>names.map(name=>`&${category}[]=${name}`))
    return encodeURI(`?${strings.filter(s=>s.length > 0).join('&')}`)
}

export async function getTestSuites(appId: number | string, pipelineId: number | string, triggerId: number | string, selectedNames) {
    return get(`test-report/triggers/${appId}/${pipelineId}/${triggerId}${generateQueryParams(selectedNames)}`)
}

export async function getTestCase(appId:number, testCaseId: number) {
    return get(`test-report/testcase/${appId}/${testCaseId}`);
}

export async function getSuiteDetail(appId:number, testSuitesId: number, testSuiteId: number) {
    return get(`test-report/testcase/${appId}/${testSuiteId}`);
}

export async function getTriggerList(appId, pipelineId, selectedNames: SelectedNames, startDate, endDate){
    return get(`test-report/triggers/${appId}/${pipelineId}${generateQueryParams(selectedNames)}&startDate=${startDate}&endDate=${endDate}`)
}

export async function getFilters(appId: number | string, pipelineId: number | string, triggerId?:number | string){
    return get(`test-report/filters/${appId}/${pipelineId}${triggerId ? '/'+triggerId : ''}`)
}


// "test/suites/list"
// "test/suites/list/details"
// "test/suites/{id}"
// "test/cases"
// "test/cases/{id}"
// "test/trigger/{appId}"
// "test/trigger/{appId}/{envId}"
