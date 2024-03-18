import { SELECT_ALL_VALUE } from '../../../config'

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    environment: searchParams.get('environment') || SELECT_ALL_VALUE,
})
