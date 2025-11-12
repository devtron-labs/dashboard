import { FunctionComponent, useEffect, useRef } from 'react'
import { Link, useRouteMatch } from 'react-router-dom'

import {
    FiltersTypeEnum,
    Icon,
    TableCellComponentProps,
    TableSignalEnum,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib/dist'

import { CustomerObservabilityDTO, ObservabilityListFields } from '../types'

export const CustomerListCellComponent: FunctionComponent<
    TableCellComponentProps<CustomerObservabilityDTO, FiltersTypeEnum.STATE, {}>
> = ({
    field,
    row: {
        data: { id, name, status, projects, totalVms, activeVms, healthStatus, icon },
    },
    isRowActive,
    signals,
}: TableCellComponentProps<CustomerObservabilityDTO, FiltersTypeEnum.STATE, {}>) => {
    const linkRef = useRef<HTMLAnchorElement>(null)
    const match = useRouteMatch()

    useEffect(() => {
        const handleEnter = ({ detail: { activeRowData } }) => {
            if (activeRowData.data.id === id) {
                linkRef.current?.click()
            }
        }

        if (isRowActive) {
            signals.addEventListener(TableSignalEnum.ENTER_PRESSED, handleEnter)
        }

        return () => {
            signals.removeEventListener(TableSignalEnum.ENTER_PRESSED, handleEnter)
        }
    }, [isRowActive])

    switch (field) {
        case ObservabilityListFields.ICON:
            return (
                <span className="flexbox dc__align-items-center dc__gap-6 py-10">
                    <Icon name={icon as any} color={null} size={24} />
                </span>
            )
        case ObservabilityListFields.PROJECT_NAME:
            return (
                <Link
                    ref={linkRef}
                    to={`${match.path}/${name}/overview`}
                    className="flexbox dc__align-items-center dc__gap-6 py-10"
                >
                    <Tooltip content={name}>
                        <span className="dc__truncate">{name}</span>
                    </Tooltip>
                </Link>
            )
        case ObservabilityListFields.STATUS:
            return (
                <span className="flexbox dc__align-items-center dc__gap-6">
                    <Icon name={status === 'ACTIVE' ? 'ic-success' : 'ic-error'} color={null} />
                    {status}
                </span>
            )
        case ObservabilityListFields.PROJECTS:
            return <span className="flexbox dc__align-items-center dc__gap-6 py-10">{projects}</span>
        case ObservabilityListFields.TOTAL_VMS:
            return <span className="flexbox dc__align-items-center dc__gap-6 py-10">{totalVms}</span>
        case ObservabilityListFields.ACTIVE_VMS:
            return <span className="flexbox dc__align-items-center dc__gap-6 py-10">{activeVms}</span>
        case ObservabilityListFields.HEALTH_STATUS:
            return (
                <div className="flexbox dc__align-items-center dc__gap-6 py-10">
                    <Tooltip content={healthStatus}>
                        <span className="dc__truncate">{healthStatus}</span>
                    </Tooltip>
                </div>
            )
        default:
            return null
    }
}
