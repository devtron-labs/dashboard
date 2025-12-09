import { ReactNode, useState } from 'react'
import { NavLink } from 'react-router-dom'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CHART_COLORS,
    ConditionalWrap,
    Icon,
    motion,
    Tooltip,
    useTheme,
} from '@devtron-labs/devtron-fe-common-lib'

import { ChartHeaderTabProps, CoveredLineProps, MetricsInfoCardProps, SectionEmptyStateProps } from './types'

export const ChartHeaderTab = ({ title, subtitle, onClick, isLoading, isActive = false }: ChartHeaderTabProps) => (
    <>
        <button
            type="button"
            className={`dc__unset-button-styles py-12 px-20 flexbox-col dc__align-start cn-9 ${isActive ? 'dc__border-bottom-2--b5' : ''}`}
            onClick={onClick}
            disabled={isLoading}
        >
            <span className="fs-13 lh-20 fw-4">{title}</span>
            {isLoading ? (
                <span className="shimmer h-20 w-40 mt-5 mb-5" />
            ) : (
                <span className="font-ibm-plex-sans fs-20 fw-6 lh-1-5">{subtitle}</span>
            )}
        </button>
        <div className="divider__secondary" />
    </>
)

const navLinkWrap = (redirectionLink: string) => (children: ReactNode) => (
    <NavLink to={redirectionLink}>{children}</NavLink>
)

export const MetricsInfoLoadingCard = ({ withSubtitle }: { withSubtitle?: boolean }) => (
    <div className="flexbox-col br-8 bg__primary border__secondary">
        <div className="flexbox dc__gap-12 p-16 dc__content-space">
            <div className="flexbox-col">
                <span className="h-12 mt-4 mb-4 w-40 shimmer" />
                <span className="h-24 mt-6 mb-6 w-40 shimmer" />
            </div>
            <div className="h-24 w-24 m-6 shimmer" />
        </div>
        {withSubtitle && (
            <div className="border__secondary--top px-16 py-8">
                <span className="w-100px h-18 shimmer" />
            </div>
        )}
    </div>
)

export const MetricsInfoCard = ({
    dataTestId,
    metricTitle,
    metricValue,
    metricUnit,
    valueOutOf,
    iconName,
    subtitle,
    redirectionLink,
    tooltipContent,
    subtitleRedirection,
}: MetricsInfoCardProps) => {
    const [isHovering, setIsHovering] = useState(false)

    const handleHoverStart = () => setIsHovering(true)
    const handleHoverEnd = () => setIsHovering(false)

    return (
        <ConditionalWrap condition={!!redirectionLink} wrap={navLinkWrap(redirectionLink)}>
            <motion.div
                data-testid={dataTestId}
                onHoverStart={handleHoverStart}
                onHoverEnd={handleHoverEnd}
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
                        {redirectionLink && isHovering ? (
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
                {subtitle && (
                    <div className="border__secondary--top px-16 py-8">
                        <ConditionalWrap condition={!!subtitleRedirection} wrap={navLinkWrap(subtitleRedirection)}>
                            <span className={`fs-13 fw-4 lh-1-5 ${subtitleRedirection ? 'cb-5' : 'cn-7'}`}>
                                {subtitle}
                            </span>
                        </ConditionalWrap>
                    </div>
                )}
            </motion.div>
        </ConditionalWrap>
    )
}

export const SectionLoadingCard = () => (
    <div className="flexbox-col dc__gap-8 p-16">
        <div className="shimmer h-20 w-150" />
        <div className="shimmer h-20 w-120" />
        <div className="shimmer h-20 w-80px" />
        <div className="shimmer h-20 w-60" />
    </div>
)

export const SectionEmptyState = ({
    iconName = 'ic-priority-medium-fill',
    iconColor,
    title,
    subtitle,
    buttonConfig,
}: SectionEmptyStateProps) => (
    <div className="flex column p-16 dc__gap-12">
        <Icon name={iconName} size={24} color={iconColor} />
        <div className="flexbox-col dc__gap-2 fs-13 lh-20">
            <span className="text-center fw-6 cn-9">{title}</span>
            {subtitle && <span className="text-center fw-4 cn-8">{subtitle}</span>}
        </div>
        {buttonConfig && <Button {...buttonConfig} />}
    </div>
)

export const LoadingCoveredLine = () => (
    <div className="flexbox-col dc__gap-16">
        <div className="flex dc__content-space">
            <span className="shimmer h-20 w-40" />
            <span className="shimmer h-20 w-40" />
        </div>
        <div className="shimmer h-8 br-4" />
    </div>
)

export const CoveredLine = ({ title, value, coveragePercent, backgroundColor = 'LimeGreen500' }: CoveredLineProps) => {
    const { appTheme } = useTheme()
    const bgColor = CHART_COLORS[appTheme][backgroundColor]

    return (
        <div className="flexbox-col dc__gap-8">
            <div className="flex dc__content-space">
                <span className="fs-13 fw-4 lh-1-5 cn-9">{title}</span>
                <span className="fs-14 lh-1-5 fw-6 cn-9">{value}</span>
            </div>
            <div className="h-8 br-4 bcb-1">
                <div className="h-100 br-4" style={{ width: `${coveragePercent}%`, backgroundColor: bgColor }} />
            </div>
        </div>
    )
}
