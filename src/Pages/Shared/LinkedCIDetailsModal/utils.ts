import { SELECT_ALL_VALUE } from '../../../config'
import { ENVIRONMENT_FILTER_SEARCH_KEY } from './constants'

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    environment: searchParams.get(ENVIRONMENT_FILTER_SEARCH_KEY) || SELECT_ALL_VALUE,
})

export const getLinkedCITippyContent = (workflowCount: number = 0) =>
    `This build pipeline is linked as image source in ${workflowCount} ${workflowCount === 1 ? 'workflow' : 'workflows'}.`
