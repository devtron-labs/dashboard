import { SELECT_ALL_VALUE, URLS } from '../../../config'
import { ENVIRONMENT_FILTER_SEARCH_KEY } from './constants'
import { LinkedCIAppUrlProps } from './types'

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    environment: searchParams.get(ENVIRONMENT_FILTER_SEARCH_KEY) || SELECT_ALL_VALUE,
})

export const getLinkedCITippyContent = (workflowCount: number = 0) =>
    `This build pipeline is linked as image source in ${workflowCount} ${workflowCount === 1 ? 'workflow' : 'workflows'}.`

export const getLinkedCIAppUrl = ({ appId, environmentId }: LinkedCIAppUrlProps): string => {
    const envId = environmentId ? `/${environmentId}` : ''
    const link = `${URLS.APP}/${appId}/${URLS.APP_DETAILS}${envId}`
    return link
}
