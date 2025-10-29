import { useState } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ConditionalWrap,
    Icon,
    IconName,
    motion,
    noop,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

export const MetricsInfoCard = ({
    dataTestId,
    metricTitle,
    metricValue,
    metricUnit,
    valueOutOf,
    iconName,
    redirectionLink,
    tooltipContent,
}: {
    dataTestId: string
    metricTitle: string
    metricValue: string
    metricUnit?: string
    valueOutOf?: string
    iconName: IconName
    redirectionLink?: string
    tooltipContent?: string
}) => {
    const [isHovering, setIsHovering] = useState(false)

    const handleHoverStart = () => setIsHovering(true)
    const handleHoverEnd = () => setIsHovering(false)

    return (
        <ConditionalWrap condition={!!redirectionLink} wrap={noop}>
            <motion.div
                data-testid={dataTestId}
                onHoverStart={redirectionLink ? handleHoverStart : noop}
                onHoverEnd={redirectionLink ? handleHoverEnd : noop}
                className={`flexbox-col br-8 bg__primary border__secondary cn-9 ${isHovering ? 'shadow__card--10' : ''}`}
            >
                <div className="flexbox dc__gap-12 p-16 dc__content-space">
                    <div className="flexbox-col">
                        <Tooltip alwaysShowTippyOnHover content={tooltipContent}>
                            <span className={`fs-13 fw-4 lh-20 ${isHovering ? 'dc__underline-dotted' : ''}`}>
                                {metricTitle}
                            </span>
                        </Tooltip>
                        <div className="flexbox dc__gap-4 dc__align-baseline font-ibm-plex-sans">
                            <span className="fs-24 fw-6 lh-1-5">{metricValue}</span>
                            {valueOutOf && (
                                <span className="fs-16 fw-4 lh-20 dc__first-letter-capitalize">/ {valueOutOf}</span>
                            )}
                            {metricUnit && (
                                <span className="fs-16 fw-4 lh-20 dc__first-letter-capitalize">{metricUnit}</span>
                            )}
                        </div>
                    </div>
                    <div>
                        {isHovering ? (
                            <Button
                                dataTestId={`redirect-to-${metricTitle}`}
                                icon={<Icon name="ic-arrow-square-out" color="B500" />}
                                ariaLabel="redirect"
                                showAriaLabelInTippy={false}
                                style={ButtonStyleType.default}
                                variant={ButtonVariantType.borderLess}
                            />
                        ) : (
                            <Icon size={36} color={null} name={iconName} />
                        )}
                    </div>
                </div>
            </motion.div>
        </ConditionalWrap>
    )
}
