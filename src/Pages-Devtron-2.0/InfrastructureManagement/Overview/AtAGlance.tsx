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
    showError,
    useQueryClient,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { INFRA_OVERVIEW_QUERY_KEY } from './constants'
import { refreshInfraOverviewCache } from './service'
import { GlanceMetricsKeys, InfraOverviewAtAGlanceProps } from './types'

const INFRA_OVERVIEW_QUERY_KEYS = importComponentFromFELibrary('INFRA_OVERVIEW_QUERY_KEYS', null, 'function')

const InfrastructureManagementAtAGlance = ({
    isFetching,
    isError,
    refetch: refetchOverviewData,
    infraGlanceConfig,
}: InfraOverviewAtAGlanceProps) => {
    const [resyncingCache, setResyncingCache] = useState(false)
    const queryClient = useQueryClient()

    const handleRefetch = async () => {
        setResyncingCache(true)
        try {
            await refreshInfraOverviewCache()

            // Refetch all queries on overview page
            await Promise.all([
                queryClient.refetchQueries({
                    queryKey: [INFRA_OVERVIEW_QUERY_KEY],
                }),
                ...(INFRA_OVERVIEW_QUERY_KEYS
                    ? Object.values(INFRA_OVERVIEW_QUERY_KEYS).map((key) =>
                          queryClient.refetchQueries({ queryKey: [key] }),
                      )
                    : []),
            ])
        } catch (err) {
            showError(err)
        }
        setResyncingCache(false)
    }

    const renderBody = () => {
        if (isFetching) {
            return (
                <div className="dc__grid cards-wrapper">
                    {Object.keys(GlanceMetricsKeys).map((key) => (
                        <MetricsInfoLoadingCard key={key} />
                    ))}
                </div>
            )
        }

        return isError || !infraGlanceConfig ? (
            <GenericSectionErrorState
                subTitle=""
                reload={refetchOverviewData}
                rootClassName="bg__primary br-8 border__secondary"
            />
        ) : (
            <div className="dc__grid cards-wrapper">
                {infraGlanceConfig.map((config) => (
                    <MetricsInfoCard key={config.metricTitle} {...config} />
                ))}
            </div>
        )
    }

    return (
        <div className="flexbox-col dc__gap-12">
            <div className="flexbox dc__content-space dc__align-items-center">
                <h2 className="fs-20 fw-4 lh-1-5 cn-9 m-0">At a Glance</h2>
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

export default InfrastructureManagementAtAGlance
