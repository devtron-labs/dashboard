import { Icon, IconsProps, Tooltip } from '@devtron-labs/devtron-fe-common-lib'

import { NodeUsageProps } from './types'
import { getHasCurrentUsageBreachedThreshold, getIsResourceNamePod, getNodeResourceThreshold } from './utils'

export const NodeUsage = ({ name, currentUsage, prevUsage, compareWithPrevious, threshold }: NodeUsageProps) => {
    const currentUsageNumeric = parseInt(currentUsage, 10)
    const prevUsageNumeric = parseInt(prevUsage, 10)

    const isUsageIncreased = currentUsageNumeric > prevUsageNumeric
    const isUsageDecreased = currentUsageNumeric < prevUsageNumeric

    const hasCurrentUsageBreachedThreshold = getHasCurrentUsageBreachedThreshold({
        currentUsage: currentUsageNumeric,
        threshold,
    })

    const getUsageIconConfig = (): Pick<IconsProps, 'name' | 'rotateBy'> => {
        if (isUsageIncreased) {
            return {
                name: 'ic-arrow-right',
                rotateBy: -90,
            }
        }

        if (isUsageDecreased) {
            return {
                name: 'ic-arrow-right',
                rotateBy: 90,
            }
        }

        return {
            name: 'ic-minus',
        }
    }

    return compareWithPrevious ? (
        <>
            <div>{prevUsage || '-'}</div>
            {currentUsage ? (
                <Tooltip
                    alwaysShowTippyOnHover
                    className="no-content-padding"
                    content={
                        <div className="flexbox-col w-150">
                            <div className="flexbox-col dc__gap-2 px-8 pt-8 pb-7 border__white-20--bottom">
                                <p className="text-white fs-12 fw-6 lh-18 m-0">{name}</p>
                                <p
                                    className={`fs-12 fw-4 lh-18 m-0 ${hasCurrentUsageBreachedThreshold ? 'cr-5' : 'cg-5'}`}
                                >
                                    {hasCurrentUsageBreachedThreshold ? 'Threshold breached' : 'Within threshold'}
                                </p>
                            </div>
                            <div className="flexbox-col dc__gap-4 p-8">
                                <div className="flex dc__content-space dc__gap-8">
                                    <p className="text-white fs-12 fw-4 lh-18 m-0">Prev. Usage</p>
                                    <p className="text-white fs-12 fw-4 lh-18 m-0">{prevUsage || '-'}</p>
                                </div>
                                <div className="flex dc__content-space dc__gap-8">
                                    <p className="text-white fs-12 fw-4 lh-18 m-0">Current Usage</p>
                                    <p className="text-white fs-12 fw-4 lh-18 m-0">{currentUsage}</p>
                                </div>
                                <div className="flex dc__content-space dc__gap-8">
                                    <p className="text-white fs-12 fw-4 lh-18 m-0">Threshold</p>
                                    <p className="text-white fs-12 fw-4 lh-18 m-0">
                                        {getNodeResourceThreshold(threshold, !getIsResourceNamePod(name))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    }
                >
                    <div className="flex left dc__gap-6">
                        <div className="dc__w-fit-content flex left dc__gap-4 br-4 px-6 py-2 bg__secondary cn-7">
                            <p className="m-0 fs-12 lh-16">{currentUsage}</p>
                            <Icon {...getUsageIconConfig()} color="N700" size={14} />
                        </div>
                        {hasCurrentUsageBreachedThreshold && <Icon name="ic-error" color={null} />}
                    </div>
                </Tooltip>
            ) : (
                <div>-</div>
            )}
        </>
    ) : (
        <div>{currentUsage || '-'}</div>
    )
}
