import { OptionType } from '@devtron-labs/devtron-fe-common-lib'
import React, { createContext, ReactNode, useContext, useMemo, useRef, useState } from 'react'
import { PermissionType } from '../../../constants'
import { PermissionGroup, User } from '../../../types'
import {
    ActionTypes,
    ChartGroupPermissionsFilter,
    DirectPermissionsRoleFilter,
    EntityTypes,
    K8sPermissionFilter,
} from '../userGroups/userGroups.types'

const context = createContext<
    {
        permissionType: PermissionType
        setPermissionType: (permissionType: PermissionType) => void
        data: User | PermissionGroup
        userGroups: OptionType[]
        setUserGroups: React.Dispatch<React.SetStateAction<OptionType[]>>
    } & Omit<
        {
            directPermission: DirectPermissionsRoleFilter[]
            setDirectPermission: (...rest) => void
            chartPermission: ChartGroupPermissionsFilter
            setChartPermission: React.Dispatch<React.SetStateAction<ChartGroupPermissionsFilter>>
            k8sPermission?: K8sPermissionFilter[]
            setK8sPermission?: React.Dispatch<React.SetStateAction<K8sPermissionFilter[]>>
            currentK8sPermissionRef?: React.MutableRefObject<K8sPermissionFilter[]>
        },
        'data'
    >
>(null)

export const PermissionConfigurationFormProvider = ({
    children,
    data = {} as User | PermissionGroup,
}: {
    children: ReactNode
    data: User | PermissionGroup
}) => {
    const [permissionType, setPermissionType] = useState<PermissionType>(PermissionType.SPECIFIC)

    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([])
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({
        entity: EntityTypes.CHART_GROUP,
        action: ActionTypes.VIEW,
        entityName: [],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [k8sPermission, setK8sPermission] = useState<any[]>([])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentK8sPermissionRef = useRef<any[]>([])
    const [userGroups, setUserGroups] = useState<OptionType[]>([])

    const value = useMemo(
        () => ({
            permissionType,
            setPermissionType,
            directPermission,
            setDirectPermission,
            chartPermission,
            setChartPermission,
            k8sPermission,
            setK8sPermission,
            currentK8sPermissionRef,
            userGroups,
            setUserGroups,
            data,
        }),
        [
            permissionType,
            setPermissionType,
            directPermission,
            setDirectPermission,
            chartPermission,
            setChartPermission,
            k8sPermission,
            setK8sPermission,
            currentK8sPermissionRef,
            userGroups,
            setUserGroups,
            data,
        ],
    )

    return <context.Provider value={value}>{children}</context.Provider>
}

export const usePermissionConfiguration = () => {
    const value = useContext(context)

    if (!value) {
        throw new Error('Please wrap with PermissionConfigurationFormProvider to use the hook')
    }

    return value
}
