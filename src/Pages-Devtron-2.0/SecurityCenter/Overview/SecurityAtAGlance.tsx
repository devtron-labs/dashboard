import { useState } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    GenericSectionErrorState,
    Icon,
    MetricsInfoCard,
    MetricsInfoLoadingCard,
    useQueryClient,
} from '@devtron-labs/devtron-fe-common-lib'

import { SECURITY_OVERVIEW_QUERY_KEYS } from './constants'
import { useGetSecurityGlanceMetrics } from './services'
import { SecurityGlanceMetricKeys } from './types'

const SecurityAtAGlance = () => {
    const queryClient = useQueryClient()
    const [resyncingCache, setResyncingCache] = useState(false)

    const handleRefetch = async () => {
        setResyncingCache(true)
        await Promise.all(
            // Refetch all queries on overview page
            Object.values(SECURITY_OVERVIEW_QUERY_KEYS).map((key) =>
                queryClient.refetchQueries({
                    queryKey: [key],
                }),
            ),
        )
        setResyncingCache(false)
    }

    const { isFetching, isError, data, refetch } = useGetSecurityGlanceMetrics()

    const renderBody = () => {
        if (isFetching) {
            return (
                <div className="dc__grid cards-wrapper">
                    {Object.keys(SecurityGlanceMetricKeys).map((key) => (
                        <MetricsInfoLoadingCard key={key} withSubtitle />
                    ))}
                </div>
            )
        }

        if (isError) {
            return (
                <GenericSectionErrorState
                    subTitle=""
                    reload={refetch}
                    rootClassName="bg__primary br-8 border__secondary"
                />
            )
        }

        return (
            <div className="dc__grid cards-wrapper">
                {data.map(({ metricTitle, ...props }) => (
                    <MetricsInfoCard key={metricTitle} metricTitle={metricTitle} {...props} />
                ))}
            </div>
        )
    }

    return (
        <div className="flexbox-col dc__gap-12">
            <div className="flex dc__content-space">
                <h2 className="m-0 fs-20 lh-1-5 fw-4 cn-9">At a Glance</h2>
                <Button
                    dataTestId="refresh-overview-data"
                    icon={<Icon name={resyncingCache ? 'ic-circle-loader' : 'ic-arrows-clockwise'} color={null} />}
                    variant={ButtonVariantType.borderLess}
                    style={ButtonStyleType.neutral}
                    size={ComponentSizeType.small}
                    ariaLabel="Refresh data"
                    showAriaLabelInTippy={false}
                    disabled={isFetching || resyncingCache}
                    onClick={handleRefetch}
                />
            </div>
            {renderBody()}
        </div>
    )
}

export default SecurityAtAGlance
