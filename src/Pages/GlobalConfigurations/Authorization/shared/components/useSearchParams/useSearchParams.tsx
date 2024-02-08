import { useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

const useSearchParams = <T,>({
    serializeToSearchParams,
    parseSearchParams,
}: {
    serializeToSearchParams?: (searchParams: URLSearchParams, paramsToSerialize: T) => URLSearchParams
    parseSearchParams: (searchParams: URLSearchParams) => T
}): {
    params: T
    updateSearchParams: (paramsToSerialize: T, options?: { overrideExisting?: boolean }) => void
} => {
    const location = useLocation()
    const history = useHistory()
    const searchParams = new URLSearchParams(location.search)

    const params = useMemo(() => parseSearchParams(searchParams), [searchParams])

    // Overriding update here
    const updateSearchParams = (paramsToSerialize: T, options: { overrideExisting?: boolean } = {}) => {
        let _searchParams: URLSearchParams
        if (serializeToSearchParams) {
            _searchParams = serializeToSearchParams(searchParams, paramsToSerialize)
        } else {
            if (options.overrideExisting) {
                _searchParams = new URLSearchParams()
            } else {
                _searchParams = new URLSearchParams(searchParams)
            }
            Object.keys(paramsToSerialize).forEach((key) => {
                if (paramsToSerialize[key]) {
                    _searchParams.delete(key)
                    if (Array.isArray(paramsToSerialize[key])) {
                        paramsToSerialize[key].forEach((val) => {
                            _searchParams.append(key, val)
                        })
                    } else {
                        _searchParams.set(key, paramsToSerialize[key])
                    }
                }
            })
        }
        history.replace({ search: _searchParams.toString() })
    }

    return { params, updateSearchParams }
}

export default useSearchParams
