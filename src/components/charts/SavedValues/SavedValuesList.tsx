import React, { useState, useEffect } from 'react'
import { useParams, useHistory, RouteComponentProps } from 'react-router'
import { DOCUMENTATION, URLS } from '../../../config'
import emptyCustomChart from '../../../assets/img/app-not-configured.png'
import { ReactComponent as Upload } from '../../../assets/icons/ic-arrow-line-up.svg'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import { ReactComponent as File } from '../../../assets/icons/ic-file-text.svg'
import { ReactComponent as Edit } from '../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Delete } from '../../../assets/icons/ic-delete-interactive.svg'
import { BreadCrumb, ErrorScreenManager, Progressing, showError, useBreadcrumb } from '../../common'
import { SavedValueType } from './types'
import EmptyState from '../../EmptyState/EmptyState'
import { deleteChartValues, getChartValuesTemplateList } from '../charts.service'
import './savedValues.scss'
import PageHeader from '../../common/header/PageHeader'
import { toast } from 'react-toastify'

export default function SavedValuesList() {
    const history: RouteComponentProps['history'] = useHistory()
    const { chartId } = useParams<{ chartId: string }>()
    const [loader, setLoader] = useState(false)
    const [searchApplied, setSearchApplied] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [savedValueList, setSavedValueList] = useState<SavedValueType[]>([])
    const [filteredSavedValueList, setFilteredSavedValueList] = useState<SavedValueType[]>([])
    const [errorStatusCode, setErrorStatusCode] = useState(0)

    useEffect(() => {
        getData()
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

    const redirectToChartValuePage = (chartValueId: number): void => {
        history.push(`${URLS.CHARTS_DISCOVER}${URLS.CHART}/${chartId}${URLS.SAVED_VALUES}/${chartValueId}`)
    }

    const deleteChartValue = (chartValueId: number): void => {
        deleteChartValues(chartValueId)
            .then((response) => {
                toast.success('Deleted successfully')
                getData()
            })
            .catch((error) => {
                showError(error)
            })
    }

    const handleFilterChanges = (_searchText: string): void => {
        const _filteredData = savedValueList.filter((cluster) => cluster.name.indexOf(_searchText) >= 0)
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
            <div className="search position-rel margin-right-0 en-2 bw-1 br-4 h-32">
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
                />
                {searchApplied && (
                    <button className="search__clear-button" type="button" onClick={clearSearch}>
                        <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                    </button>
                )}
            </div>
        )
    }

    const renderUploadButton = (): JSX.Element => {
        return (
            <button onClick={() => redirectToChartValuePage(0)} className="add-link cta flex">
                <Upload className="icon-dim-16 mr-8" />
                New
            </button>
        )
    }

    const renderLearnMoreLink = (): JSX.Element => {
        return (
            <a className="no-decor" href={DOCUMENTATION.CUSTOM_CHART} target="_blank" rel="noreferrer noopener">
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
                <div className="flexbox content-space">
                    {renderUploadButton()}
                    {renderSearch()}
                </div>
            </>
        )
    }

    const renderEmptyState = (title?: string, subTitle?: string, showClearButton?: boolean): JSX.Element => {
        return (
            <div style={{ height: 'calc(100vh - 235px)' }}>
                <EmptyState>
                    <EmptyState.Image>
                        <img src={emptyCustomChart} alt={title || 'No values saved for this chart'} />
                    </EmptyState.Image>
                    <EmptyState.Title>
                        <h4 className="title">{title || 'No values saved for this chart'}</h4>
                    </EmptyState.Title>
                    <EmptyState.Subtitle>
                        {subTitle || 'Customize, Dry Run and Save values so they’re ready to be used later.'}&nbsp;
                    </EmptyState.Subtitle>
                    {showClearButton && (
                        <EmptyState.Button>
                            <button onClick={clearSearch} className="add-link cta flex">
                                Clear search
                            </button>
                        </EmptyState.Button>
                    )}
                </EmptyState>
            </div>
        )
    }

    const renderSavedValuesList = (): JSX.Element => {
        return (
            <div className="saved-values-container">
                <div className="cn-9 fw-6 fs-16">Saved values</div>
                {renderSubtitleAndNewButton('Customize, Dry Run and Save values so they’re ready to be used later.')}
                <div className="mt-16 en-2 bw-1 bcn-0 br-8" style={{ minHeight: 'calc(100vh - 235px)' }}>
                    {savedValueList.length === 0 ? (
                        renderEmptyState()
                    ) : filteredSavedValueList.length === 0 ? (
                        renderEmptyState('No matching saved values', 'We couldn’t find any matching results', true)
                    ) : (
                        <>
                            <div className="saved-values-row fw-6 cn-7 fs-12 border-bottom text-uppercase pt-8 pr-16 pb-8 pl-16">
                                <div className="pr-16"></div>
                                <div className="pr-16">Name</div>
                                <div className="pr-16">Version</div>
                                <div className="pr-16"></div>
                            </div>
                            {filteredSavedValueList.map((chartData, index) => (
                                <div
                                    key={`saved-value-${index}`}
                                    className="saved-values-row fw-4 cn-9 fs-13 border-bottom-n1 pt-12 pr-16 pb-12 pl-16"
                                >
                                    <div className="pr-16">
                                        <File className="icon-dim-18 icon-n4 vertical-align-middle" />
                                    </div>
                                    <div
                                        className="pr-16 cb-5 pointer"
                                        onClick={() => redirectToChartValuePage(chartData.id)}
                                    >
                                        {chartData.name}
                                    </div>
                                    <div className="pr-16">{chartData.chartVersion}</div>
                                    <div className="pr-16">
                                        <Edit
                                            className="icon-dim-18 mr-16 vertical-align-middle pointer action-icon"
                                            onClick={() => redirectToChartValuePage(chartData.id)}
                                        />
                                        <Delete
                                            className="icon-dim-18 vertical-align-middle pointer action-icon"
                                            onClick={() => deleteChartValue(chartData.id)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        )
    }

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                'saved-values': { component: 'Saved values', linked: false },
                ':chartId': 'chart name',
                chart: null,
                'chart-store': null,
            },
        },
        [chartId],
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
        </>
    )
}
