import { FunctionComponent, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import {
    FiltersTypeEnum,
    TableCellComponentProps,
    TableSignalEnum,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib/dist'

import { ObservabilityProject, ProjectListFields } from '../types'

export const ProjectListCellComponent: FunctionComponent<
    TableCellComponentProps<ObservabilityProject, FiltersTypeEnum.STATE, {}>
> = ({
    field,
    row: {
        data: { id, name, description, status, totalVms, activeVms, healthStatus },
    },
    isRowActive,
    signals,
}: TableCellComponentProps<ObservabilityProject, FiltersTypeEnum.STATE, {}>) => {
    const linkRef = useRef<HTMLAnchorElement>(null)

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
                <Link ref={linkRef} to="test" className="flex left py-10">
                    <Tooltip content={name}>
                        <span className="dc__truncate">{name}</span>
                    </Tooltip>
                </Link>
            )
        case ProjectListFields.PROJECT_DESCRIPTION:
            return <span className="flex left py-10">{description}</span>
        case ProjectListFields.STATUS:
            return <span className="flex left py-10">{status}</span>
        case ProjectListFields.TOTAL_VMS:
            return <span className="flex left py-10">{totalVms}</span>
        case ProjectListFields.ACTIVE_VMS:
            return (
                <div className="flex left py-10">
                    <Tooltip content={activeVms}>
                        <span className="dc__truncate">{activeVms}</span>
                    </Tooltip>
                </div>
            )
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
