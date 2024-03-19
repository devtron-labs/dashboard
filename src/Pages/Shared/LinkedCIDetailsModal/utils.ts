import { SELECT_ALL_VALUE } from '../../../config'

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    environment: searchParams.get('environment') || SELECT_ALL_VALUE,
})

export const LinkedCITippyContent = (workflowCount: number) => {
    return `This build pipeline is linked as image source in ${workflowCount} ${workflowCount === 1 ? 'workflow' : 'workflows'}.`
}
