import { ConfigHeaderTabType } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICFilePlay } from '@Icons/ic-file-play.svg'
import { ReactComponent as ICFileCode } from '@Icons/ic-file-code.svg'
import { ReactComponent as ICArrowSquareIn } from '@Icons/ic-arrow-square-in.svg'
import { ConfigHeaderTabConfigType } from './types'

export const getConfigHeaderTabConfig = (
    tab: ConfigHeaderTabType,
    isOverridden?: boolean,
): ConfigHeaderTabConfigType => {
    switch (tab) {
        case ConfigHeaderTabType.DRY_RUN:
            return {
                text: 'Dry run',
                icon: ICFilePlay,
            }
        case ConfigHeaderTabType.VALUES:
            return {
                text: 'Values',
                icon: ICFileCode,
            }
        case ConfigHeaderTabType.OVERRIDE:
            return {
                text: isOverridden ? 'Override' : 'No override',
                icon: ICFileCode,
            }
        case ConfigHeaderTabType.INHERITED:
            return {
                text: 'Inherited',
                icon: ICArrowSquareIn,
            }
        default:
            return {
                text: tab,
            }
    }
}
