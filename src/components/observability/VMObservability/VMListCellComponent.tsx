import { FunctionComponent, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import {
    FiltersTypeEnum,
    TableCellComponentProps,
    TableSignalEnum,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib/dist'

import { ObservabilityVM, VMListFields } from '../types'

export const VMListCellComponent: FunctionComponent<
    TableCellComponentProps<ObservabilityVM, FiltersTypeEnum.STATE, {}>
> = ({
    field,
    row: {
        data: { id, name, ipAddress, status, cpu, memory, disk },
    },
    isRowActive,
    signals,
}: TableCellComponentProps<ObservabilityVM, FiltersTypeEnum.STATE, {}>) => {
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
        case VMListFields.VM_NAME:
            return (
                <Link ref={linkRef} to="test" className="flex left py-10">
                    <Tooltip content={name}>
                        <span className="dc__truncate">{name}</span>
                    </Tooltip>
                </Link>
            )
        case VMListFields.VM_IPADDRESS:
            return <span className="flex left py-10">{ipAddress}</span>
        case VMListFields.VM_STATUS:
            return <span className="flex left py-10">{status}</span>
        case VMListFields.VM_CPU:
            return <span className="flex left py-10">{cpu}</span>
        case VMListFields.VM_MEMORY:
            return (
                <div className="flex left py-10">
                    <Tooltip content={memory}>
                        <span className="dc__truncate">{memory}</span>
                    </Tooltip>
                </div>
            )
        case VMListFields.VM_DISK:
            return (
                <div className="flex left py-10">
                    <Tooltip content={disk}>
                        <span className="dc__truncate">{disk}</span>
                    </Tooltip>
                </div>
            )
        default:
            return null
    }
}
