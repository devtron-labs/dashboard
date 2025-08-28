import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    EMPTY_STATE_STATUS,
    GenericEmptyState,
    handleAnalyticsEvent,
    Icon,
    ImageType,
    InfoBlock,
    Popover,
    Progressing,
    SearchBar,
    ToastManager,
    ToastVariantType,
    usePopover,
    useQuery,
} from '@devtron-labs/devtron-fe-common-lib'

import { reSyncChartRepo } from '@Components/chartRepo/chartRepo.service'
import { TOAST_INFO } from '@Config/constantMessaging'
import { URLS } from '@Config/routes'

import AddChartSource from './AddChartSource'
import ChartListPopUpRow from './ChartListPopUpRow'
import { ChartsListProps } from './types'

export const ChartsList = ({ chartsList, isLoading }: ChartsListProps) => {
    // STATES
    const [searchText, setSearchText] = useState('')
    const [chartActiveMap, setChartActiveMap] = useState<Record<string, boolean>>({})

    // HOOKS
    const { open, overlayProps, popoverProps, scrollableRef, triggerProps, closePopover } = usePopover({
        id: 'chart-list-popover',
        variant: 'overlay',
        alignment: 'middle',
        width: 400,
    })

    // QUERIES
    const { isFetching, isSuccess, refetch } = useQuery({
        queryKey: ['reSyncChartRepo'],
        queryFn: reSyncChartRepo,
        enabled: false,
    })

    useEffect(() => {
        setChartActiveMap(
            (chartsList ?? []).reduce((acc, curr) => {
                acc[curr.name] = curr.active
                return acc
            }, {}),
        )
    }, [chartsList])

    useEffect(() => {
        if (!open) {
            setSearchText('')
        }
    }, [open])

    useEffect(() => {
        if (!isFetching && isSuccess) {
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: TOAST_INFO.RE_SYNC,
            })
        }
    }, [isFetching, isSuccess])

    // COMPUTED VALUES
    const filteredChartList = useMemo(() => {
        const searchTextLowerCase = searchText.toLowerCase()
        return (chartsList ?? []).filter((chart) => chart.name.toLowerCase().indexOf(searchTextLowerCase) >= 0)
    }, [chartsList, searchText])

    // HANDLERS
    const handleSourceBtnClick = () => {
        handleAnalyticsEvent({ category: 'Chart Store', action: 'CS_SOURCE' })
    }

    const toggleEnabled = (key: string) => (enabled: boolean) =>
        setChartActiveMap({ ...chartActiveMap, [key]: enabled })

    const handleSearchEnter = (searchKey: string) => {
        setSearchText(searchKey)
    }

    const handleRefetchCharts = async () => {
        await refetch()
    }

    // RENDERERS
    const renderChartListBody = () => {
        if (isLoading) {
            return (
                <div ref={scrollableRef} className="flex column dc__gap-12 flex-grow-1">
                    <Progressing size={24} />
                    <span className="dc__loading-dots">Loading Chart source</span>
                </div>
            )
        }

        if (!chartsList.length) {
            return (
                <div ref={scrollableRef} className="flex-grow-1 flex">
                    <GenericEmptyState
                        imgName="img-no-result"
                        title={EMPTY_STATE_STATUS.CHART.NO_SOURCE_TITLE}
                        subTitle={
                            <div>
                                <span>Add a &nbsp;</span>
                                <NavLink to={URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_CHART_REPO}>
                                    Chart repositories
                                </NavLink>
                                <span>&nbsp;or&nbsp;</span>
                                <NavLink to={URLS.GLOBAL_CONFIG_DOCKER}>OCI Registries</NavLink>
                                <span>to view and deploy helm charts.</span>
                            </div>
                        }
                        imageType={ImageType.Medium}
                    />
                </div>
            )
        }

        return (
            <>
                <SearchBar
                    dataTestId="chart-store-search-box"
                    initialSearchText={searchText}
                    containerClassName="p-12"
                    size={ComponentSizeType.large}
                    handleEnter={handleSearchEnter}
                    inputProps={{
                        placeholder: 'Search by repository or registry',
                        autoFocus: true,
                    }}
                />

                {!!searchText && !filteredChartList.length ? (
                    <div ref={scrollableRef} className="flex-grow-1 flex">
                        <GenericEmptyState
                            imgName="img-no-result"
                            title={`No result for "${searchText}"`}
                            subTitle={EMPTY_STATE_STATUS.CHART.NO_CHART_FOUND}
                            imageType={ImageType.Medium}
                        />
                    </div>
                ) : (
                    <div ref={scrollableRef} className="dc__overflow-auto flexbox-col flex-grow-1 mxh-350">
                        {filteredChartList.map(
                            (list, index) =>
                                list.id !== 1 && (
                                    <ChartListPopUpRow
                                        key={list.name}
                                        index={index}
                                        list={list}
                                        enabled={chartActiveMap[list.name]}
                                        toggleEnabled={toggleEnabled(list.name)}
                                    />
                                ),
                        )}
                        <div className="p-16" style={{ marginTop: 'auto' }}>
                            <InfoBlock
                                variant="help"
                                description={
                                    <div>
                                        <span>
                                            Showing Chart repositories and OCI Registries (used as chart repositories).
                                            You can add other&nbsp;
                                        </span>
                                        <NavLink to={URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_CHART_REPO}>
                                            Chart repositories
                                        </NavLink>
                                        <span>&nbsp;or&nbsp;</span>
                                        <NavLink to={URLS.GLOBAL_CONFIG_DOCKER}>OCI Registries</NavLink>
                                        <span>&nbsp;as chart sources.</span>
                                    </div>
                                }
                            />
                        </div>
                    </div>
                )}
            </>
        )
    }

    return (
        <Popover
            open={open}
            overlayProps={overlayProps}
            popoverProps={popoverProps}
            triggerProps={triggerProps}
            triggerElement={null}
            buttonProps={{
                onClick: handleSourceBtnClick,
                text: 'source',
                variant: ButtonVariantType.secondary,
                size: ComponentSizeType.xxs,
                dataTestId: 'chart-store-source-button',
                startIcon: <Icon name="ic-input" color={null} />,
            }}
        >
            <div className="charts-list flexbox-col mh-400">
                <div className="flex dc__content-space px-16 pt-10 pb-9 border__primary--bottom">
                    <h4 className="m-0 fs-14 lh-1-5 fw-6 cn-9">Helm chart sources</h4>
                    <div className="flex dc__gap-12">
                        <AddChartSource text="Add" />
                        <Button
                            isLoading={isFetching}
                            icon={<Icon name="ic-arrows-clockwise" color={null} />}
                            size={ComponentSizeType.small}
                            variant={ButtonVariantType.borderLess}
                            dataTestId="chart-store-refetch-button"
                            ariaLabel="Refetch charts"
                            onClick={handleRefetchCharts}
                        />
                        <div className="divider__primary" />
                        <Button
                            icon={<Icon name="ic-close-large" size={16} color={null} />}
                            onClick={closePopover}
                            size={ComponentSizeType.small}
                            variant={ButtonVariantType.borderLess}
                            dataTestId="chart-store-close-button"
                            showAriaLabelInTippy={false}
                            ariaLabel="Close"
                            style={ButtonStyleType.negativeGrey}
                        />
                    </div>
                </div>
                {renderChartListBody()}
            </div>
        </Popover>
    )
}
