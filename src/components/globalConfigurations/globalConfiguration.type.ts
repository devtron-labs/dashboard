import React from 'react'
import { AppCheckList, ChartCheckList } from '../checkList/checklist.type'

interface CheckList {
    isLoading: boolean
    isAppCreated: boolean
    appChecklist: AppCheckList
    chartChecklist: ChartCheckList
    appStageCompleted: number
    chartStageCompleted: number
}
export interface BodyType {
    getHostURLConfig: () => void
    checkList: CheckList
    serverMode: string
    handleChecklistUpdate: (itemName: string) => void
    isSuperAdmin: boolean
}

export interface ProtectedInputType {
    name: string
    value: string | number
    onChange: (e: any) => void
    error?: React.ReactNode
    label?: React.ReactNode
    tabIndex?: number
    disabled?: boolean
    hidden?: boolean
    labelClassName?: string
    placeholder?: string
    dataTestid: string
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
    isRequiredField?: boolean
}
