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
