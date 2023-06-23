import React, { useState, useEffect } from 'react'
import { useParams, useHistory, RouteComponentProps } from 'react-router'
import { DOCUMENTATION, Moment12HourFormat, URLS } from '../../../config'
import emptyCustomChart from '../../../assets/img/app-not-configured.png'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import { ReactComponent as File } from '../../../assets/icons/ic-file-text.svg'
import { ReactComponent as Edit } from '../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Delete } from '../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as Launch } from '../../../assets/icons/ic-nav-rocket.svg'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    BreadCrumb,
    useBreadcrumb,
    DeleteDialog,
    EmptyState,
    GenericEmptyState,
} from '@devtron-labs/devtron-fe-common-lib'
import { SavedValueType } from './types'
import {
    deleteChartValues,
    getChartValuesTemplateList,
    getChartVersionDetails,
    getChartVersionsMin,
} from '../charts.service'
import './savedValues.scss'
import PageHeader from '../../common/header/PageHeader'
import { toast } from 'react-toastify'
import moment from 'moment'
import Tippy from '@tippyjs/react'
import { EMPTY_STATE_STATUS } from '../../../config/constantMessaging'

export default function SavedValuesList() {
    const history: RouteComponentProps['history'] = useHistory()
    const { chartId } = useParams<{ chartId: string }>()
    const [loader, setLoader] = useState(false)
    const [searchApplied, setSearchApplied] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [savedValueList, setSavedValueList] = useState<SavedValueType[]>([])
    const [filteredSavedValueList, setFilteredSavedValueList] = useState<SavedValueType[]>([])
    const [errorStatusCode, setErrorStatusCode] = useState(0)
    const [appStoreApplicationName, setAppStoreApplicationName] = useState('')
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedValue, setSelectedValue] = useState<SavedValueType>(null)

    useEffect(() => {
        getData()
        getChartDetails()
    }, [])

    async function getData() {
        try {
            setLoader(true)
            const { result } = await getChartValuesTemplateList(chartId)
            const list = (result || [])
                .map((item) => {
                    return { ...item, isLoading: false }
                })
                .sort((a, b) => a['name'].localeCompare(b['name']))
            setSavedValueList(list)
            setFilteredSavedValueList(list)
        } catch (error) {
            showError(error)
            setErrorStatusCode(error['code'])
        } finally {
            setLoader(false)
        }
    }

    async function getChartDetails() {
        try {
            const { result: chartVersionMinResult } = await getChartVersionsMin(chartId)
            const { result } = await getChartVersionDetails(chartVersionMinResult[0].id)
            setAppStoreApplicationName(result.appStoreApplicationName)
        } catch (error) {
            showError(error)
            setErrorStatusCode(error['code'])
        } finally {
            setLoader(false)
        }
    }

    const redirectToChartValuePage = (chartValueId: number, toDeployChartView?: boolean): void => {
        history.push(
            `${URLS.CHARTS_DISCOVER}${URLS.CHART}/${chartId}${
                toDeployChartView ? URLS.DEPLOY_CHART : URLS.PRESET_VALUES
            }/${chartValueId}`,
        )
    }

    const deleteChartValue = () => {
        deleteChartValues(selectedValue.id)
            .then((response) => {
                toast.success('Deleted successfully')
                getData()
            })
            .catch((error) => {
                showError(error)
            })
            .finally(() => {
                setShowDeleteDialog(false)
                setSelectedValue(null)
            })
    }

    const handleFilterChanges = (_searchText: string): void => {
        const _filteredData = savedValueList.filter((cluster) => cluster.name.indexOf(_searchText.toLowerCase()) >= 0)
        setFilteredSavedValueList(_filteredData)
    }

    const clearSearch = (): void => {
        if (searchApplied) {
            handleFilterChanges('')
            setSearchApplied(false)
        }
        setSearchText('')
    }

    const handleFilterKeyPress = (event): void => {
        const theKeyCode = event.key
        if (theKeyCode === 'Enter') {
            handleFilterChanges(event.target.value)
            setSearchApplied(true)
        } else if (theKeyCode === 'Backspace' && searchText.length === 1) {
            clearSearch()
        }
    }
    const renderSearch = (): JSX.Element => {
        return (
            <div className="search dc__position-rel margin-right-0 en-2 bw-1 br-4 h-32">
                <Search className="search__icon icon-dim-18" />
                <input
                    type="text"
                    placeholder="Search"
                    value={searchText}
                    className="search__input"
                    onChange={(event) => {
                        setSearchText(event.target.value)
                    }}
                    onKeyDown={handleFilterKeyPress}
                    data-testid = "preset-value-search-box"
                />
                {searchApplied && (
                    <button className="search__clear-button" type="button" onClick={clearSearch} data-testid = "preset-values-search-close-button">
                        <Clear className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                    </button>
                )}
            </div>
        )
    }

    const renderDeleteDialog = (): JSX.Element => {
        return (
            <DeleteDialog
                title={`Delete preset value '${selectedValue.name}'?`}
                delete={deleteChartValue}
                closeDelete={() => {
                    setShowDeleteDialog(false)
                }}
            >
                <DeleteDialog.Description>
                    <p className="fs-14 cn-7 lh-20">
                        This will delete the preset value and it will no longer be available to be used for deployment.
                    </p>
                    <p className="fs-14 cn-7 lh-20">Are you sure?</p>
                </DeleteDialog.Description>
            </DeleteDialog>
        )
    }

    const renderUploadButton = (): JSX.Element => {
        return (
            <button onClick={() => redirectToChartValuePage(0)} className="add-link cta flex h-32" data-testid="add-preset-values-button">
                <Add className="icon-dim-16 mr-5" />
                New
            </button>
        )
    }

    const renderLearnMoreLink = (): JSX.Element => {
        return (
            <a className="dc__no-decor" href={DOCUMENTATION.CUSTOM_VALUES} target="_blank" rel="noreferrer noopener" data-testid="preset-values-learn-more-link">
                Learn more
            </a>
        )
    }

    const renderSubtitleAndNewButton = (subtitleText: string): JSX.Element => {
        return (
            <>
                <p className="fs-13 fw-4">
                    {subtitleText}&nbsp;
                    {renderLearnMoreLink()}
                </p>
                <div className="flexbox dc__content-space">
                    {renderUploadButton()}
                    {renderSearch()}
                </div>
            </>
        )
    }

    const renderGenericEmptyStateButton = () => {
        return (
             <button onClick={clearSearch} className="add-link cta flex">
                Clear search
            </button>
        )
    }

    const renderEmptyState = (title?: string, subTitle?: string, showClearButton?: boolean): JSX.Element => {
        return (
            <div className='dc__position-rel' style={{ height: 'calc(100vh - 235px)' }}>
                <GenericEmptyState
                    image={emptyCustomChart}
                    heightToDeduct={235}
                    title={title || EMPTY_STATE_STATUS.SAVED_VALUES_EMPTY_STATE.TITLE}
                    subTitle={subTitle || EMPTY_STATE_STATUS.SAVED_VALUES_EMPTY_STATE.SUBTITLE}
                    isButtonAvailable={showClearButton}
                    renderButton={renderGenericEmptyStateButton}
                />
            </div>
        )
    }

    const onDeleteButtonClick = (clickedData: SavedValueType): void => {
        setShowDeleteDialog(true)
        setSelectedValue(clickedData)
    }

    const getUpdatedOnDateTime = (updatedOn: string): string => {
        if (updatedOn && !updatedOn.startsWith('0001-01-01')) {
            return moment(updatedOn).format(Moment12HourFormat)
        }

        return '-'
    }

    const renderSavedValuesList = (): JSX.Element => {
        return (
            <div className="preset-values-container">
                <div className="cn-9 fw-6 fs-16" data-testid="preset-page-heading">Preset values</div>
                {renderSubtitleAndNewButton('Customize, Dry Run and Save values so they’re ready to be used later.')}
                <div className="mt-16 en-2 bw-1 bcn-0 br-8" style={{ minHeight: 'calc(100vh - 235px)' }}>
                    {savedValueList.length === 0 ? (
                        renderEmptyState()
                    ) : filteredSavedValueList.length === 0 ? (
                        renderEmptyState('No matching preset values', 'We couldn’t find any matching results', true)
                    ) : (
                        <>
                            <div className="preset-values-row fw-6 cn-7 fs-12 dc__border-bottom dc__uppercase pt-8 pr-20 pb-8 pl-20" data-testid="preset-values-list-heading">
                                <div />
                                <div>Name</div>
                                <div>Version</div>
                                <div>Last updated by</div>
                                <div>Updated at</div>
                            </div>
                            <div className="preset-value-list" data-testid="preset-values-list">
                                {filteredSavedValueList.map((chartData, index) => (
                                    <div
                                        key={`saved-value-${index}`}
                                        className="preset-values-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pr-20 pb-12 pl-20"
                                        data-testid = "preset-values-list-element"
                                    >
                                        <div className="icon-dim-18">
                                            <File className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                                        </div>
                                        <div
                                            className="cb-5 pointer dc__ellipsis-right"
                                            onClick={() => redirectToChartValuePage(chartData.id)}
                                        >
                                            {chartData.name}
                                        </div>
                                        <div>{chartData.chartVersion}</div>
                                        <div>{chartData.updatedBy || '-'}</div>
                                        <div>{getUpdatedOnDateTime(chartData.updatedOn)}</div>
                                        <div className="flex right" data-testid = "preset-element-options">
                                            <Tippy
                                                className="default-tt"
                                                arrow={false}
                                                placement="bottom"
                                                content={'Use value to deploy'}
                                            >
                                                <Launch
                                                    className="icon-dim-18 mr-16 dc__vertical-align-middle pointer action-icon scn-6"
                                                    onClick={() => redirectToChartValuePage(chartData.id, true)}
                                                    data-testid = "preset-element-options-0"
                                                />
                                            </Tippy>
                                            <Tippy
                                                className="default-tt"
                                                arrow={false}
                                                placement="bottom"
                                                content={'Edit value'}
                                            >
                                                <Edit
                                                    className="icon-dim-18 mr-16 dc__vertical-align-middle pointer action-icon"
                                                    onClick={() => redirectToChartValuePage(chartData.id)}
                                                    data-testid = "preset-element-options-1"
                                                />
                                            </Tippy>
                                            <Tippy
                                                className="default-tt"
                                                arrow={false}
                                                placement="bottom"
                                                content={'Delete value'}
                                            >
                                                <Delete
                                                    className="icon-dim-18 dc__vertical-align-middle pointer action-icon"
                                                    onClick={() => onDeleteButtonClick(chartData)}
                                                    data-testid = "preset-element-options-2"
                                                />
                                            </Tippy>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                'preset-values': { component: 'Preset values', linked: false },
                ':chartId': appStoreApplicationName || null,
                chart: null,
                'chart-store': null,
            },
        },
        [appStoreApplicationName],
    )

    const renderBreadcrumbs = () => {
        return (
            <div className="flex left">
                <BreadCrumb breadcrumbs={breadcrumbs} />
            </div>
        )
    }
    if (loader) {
        return <Progressing pageLoader />
    }
    if (errorStatusCode > 0) {
        return (
            <div className="error-screen-wrapper flex column h-100">
                <ErrorScreenManager
                    code={errorStatusCode}
                    subtitle="Information on this page is available only to superadmin users."
                />
            </div>
        )
    }
    return (
        <>
            <PageHeader isBreadcrumbs={true} breadCrumbs={renderBreadcrumbs} />
            {renderSavedValuesList()}
            {showDeleteDialog && renderDeleteDialog()}
        </>
    )
}
