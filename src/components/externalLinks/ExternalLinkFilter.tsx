import { FilterSelectPicker } from '@devtron-labs/devtron-fe-common-lib'
import { useEffect } from 'react'
import {
    ExternalLinkFiltersProps,
    ExternalLinkFilters,
    IdentifierOptionType,
    ExternalLinkIdentifierType,
} from './ExternalLinks.type'

const createAppFilterKey = (value: string) => {
    const appValue = value.split('|')
    return `${appValue[0]}_${appValue[2] === ExternalLinkIdentifierType.DevtronApp ? 'd' : 'h'}`
}

export const ExternalLinkFilter = ({
    allApps,
    updateSearchParams,
    appliedApps,
    setAppliedApps,
    queryParams,
}: ExternalLinkFiltersProps) => {
    // To update the dropdown selections on query param value change or page reload
    useEffect(() => {
        if (allApps.length > 0 && queryParams.has('apps')) {
            const _appliedAppIds = queryParams.get('apps').split(',')
            const _appliedApps = allApps.filter((app) => _appliedAppIds.includes(createAppFilterKey(app.value)))

            setAppliedApps(_appliedApps)
        }
    }, [allApps, queryParams.get('apps')])

    const handleUpdateFilters = (filterKey: ExternalLinkFilters) => (selectedOptions: IdentifierOptionType[]) => {
        console.log(selectedOptions, 'selectedOptions')
        setAppliedApps(selectedOptions)
        updateSearchParams({ [filterKey]: selectedOptions.map((option) => String(option.value)) })
    }

    return (
        <div className="filters-wrapper ml-8">
            <FilterSelectPicker
                placeholder="Application"
                inputId="app-list-app-status-select"
                options={allApps}
                appliedFilterOptions={appliedApps}
                isDisabled={false}
                isLoading={false}
                handleApplyFilter={handleUpdateFilters(ExternalLinkFilters.APPS)}
            />
        </div>
    )
}
