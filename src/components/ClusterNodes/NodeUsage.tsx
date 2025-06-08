import { Icon, IconsProps } from '@devtron-labs/devtron-fe-common-lib'

import { NodeUsageProps } from './types'

export const NodeUsage = ({ currentUsage, prevUsage, compareWithPrevious }: NodeUsageProps) => {
    const currentUsageNumeric = parseInt(currentUsage, 10)
    const prevUsageNumeric = parseInt(prevUsage, 10)

    const isUsageIncreased = currentUsageNumeric > prevUsageNumeric
    const isUsageDecreased = currentUsageNumeric < prevUsageNumeric

    const getUsageIconConfig = (): IconsProps => {
        if (isUsageIncreased) {
            return {
                name: 'ic-arrow-right',
                color: 'R500',
                rotateBy: -90,
            }
        }

        if (isUsageDecreased) {
            return {
                name: 'ic-arrow-right',
                color: 'G500',
                rotateBy: 90,
            }
        }

        return {
            name: 'ic-minus',
            color: 'N700',
        }
    }

    const getClassNameBasedOnUsage = () => {
        if (isUsageIncreased) {
            return 'bcr-1 cr-7'
        }

        if (isUsageDecreased) {
            return 'bcg-1 cg-7'
        }

        return 'bg__secondary cn-7'
    }

    return compareWithPrevious ? (
        <>
            <div>{prevUsage || '-'}</div>
            {currentUsage ? (
                <div className={`dc__w-fit-content flex left dc__gap-4 br-4 px-6 py-2 ${getClassNameBasedOnUsage()}`}>
                    <p className="m-0 fs-12 lh-16">{currentUsage}</p>
                    <Icon {...getUsageIconConfig()} size={14} />
                </div>
            ) : (
                <div>-</div>
            )}
        </>
    ) : (
        <div>{currentUsage || '-'}</div>
    )
}
