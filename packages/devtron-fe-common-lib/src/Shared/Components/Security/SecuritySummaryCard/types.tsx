import { SeverityCount } from '@Shared/types'
import { ImageCardAccordionProps } from '@Shared/Components/ImageCardAccordion/types'
import { ApiResponseResultType } from '../SecurityModal'

export type SecuritySummaryCardProps = {
    severityCount: SeverityCount
    scanToolId: number
    rootClassName?: string
    isHelmApp?: boolean
    isSecurityScanV2Enabled: boolean
    responseData: ApiResponseResultType
    hidePolicy?: boolean
} & Pick<ImageCardAccordionProps, 'SecurityModalSidebar'>
