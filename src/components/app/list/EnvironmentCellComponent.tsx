import { FiltersTypeEnum, TableCellComponentProps } from '@devtron-labs/devtron-fe-common-lib'

import { App, Environment } from './types'

export const EnvironmentCellComponent = ({
    row: { data },
    isExpandedRow,
    isRowInExpandState,
    expandRowCallback,
}: TableCellComponentProps<App | Environment, FiltersTypeEnum.URL>) => {
    if (isExpandedRow) {
        return <div className="flex left">{(data as Environment).name}</div>
    }

    const app = data as App
    const envCount = app.environments.length
    const isEnvConfigured = app.defaultEnv.name

    if (!envCount || isRowInExpandState) {
        return null
    }

    return (
        <div className="flex left dc__gap-8">
            <span
                data-testid={`${app.defaultEnv.name}-environment`}
                className={`dc__truncate cn-9 ${isEnvConfigured ? '' : 'cn5'}`}
            >
                {isEnvConfigured ? app.defaultEnv.name : 'Not configured'}
            </span>

            {envCount > 1 ? (
                <button
                    type="button"
                    className="dc__no-border dc__outline-none dc__transparent fw-5 dc__link cn-4 p-0 m-0 dc__underline-onhover fs-12 lh-18 dc__truncate-text mw-18"
                    onClick={expandRowCallback}
                >
                    +{envCount - 1} more
                </button>
            ) : null}
        </div>
    )
}
