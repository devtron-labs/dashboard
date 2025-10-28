import { FunctionComponent, useEffect, useRef } from 'react'
import { Link, useRouteMatch } from 'react-router-dom'

import {
    FiltersTypeEnum,
    TableCellComponentProps,
    TableSignalEnum,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib/dist'

import { CustomerObservabilityDTO, ProjectListFields } from '../types'

export const CustomerListCellComponent: FunctionComponent<
    TableCellComponentProps<CustomerObservabilityDTO, FiltersTypeEnum.STATE, {}>
> = ({
    field,
    row: {
        data: { id, name, status, project, totalVms, activeVms, healthStatus },
    },
    isRowActive,
    signals,
}: TableCellComponentProps<CustomerObservabilityDTO, FiltersTypeEnum.STATE, {}>) => {
    const linkRef = useRef<HTMLAnchorElement>(null)
    const match = useRouteMatch()

    console.log(match)

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
        case ProjectListFields.PROJECT_NAME:
            return (
                <Link ref={linkRef} to={`${match.path}/${name}`} className="flex left py-10">
                    <Tooltip content={name}>
                        <span className="dc__truncate">{name}</span>
                    </Tooltip>
                </Link>
            )
        case ProjectListFields.STATUS:
            return <span className="flex left py-10">{status}</span>
        case ProjectListFields.PROJECTS:
            return <span className="flex left py-10">{project}</span>
        case ProjectListFields.TOTAL_VMS:
            return <span className="flex left py-10">{totalVms}</span>
        case ProjectListFields.ACTIVE_VMS:
            return <span className="flex left py-10">{activeVms}</span>
        case ProjectListFields.HEALTH_STATUS:
            return (
                <div className="flex left py-10">
                    <Tooltip content={healthStatus}>
                        <span className="dc__truncate">{healthStatus}</span>
                    </Tooltip>
                </div>
            )
        default:
            return null
    }
}
