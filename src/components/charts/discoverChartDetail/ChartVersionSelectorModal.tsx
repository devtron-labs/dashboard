import React, { useState, useEffect } from 'react'
import { VisibleModal } from '../../common'
import { ReactComponent as GotToBuildDeploy } from '../../../assets/icons/go-to-buildanddeploy@2x.svg'
import { ReactComponent as GoToEnvOverride } from '../../../assets/icons/go-to-envoverride@2x.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as Dropdown } from '../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Back } from '../../../assets/icons/ic-back.svg'
import { useDiscoverDetailsContext } from './DiscoverChartDetails'
import { ChartKind } from '../../v2/values/chartValuesDiff/ChartValuesView.type'
import { ReactComponent as File } from '../../../assets/icons/ic-file-text.svg'

const PrimaryOptions = [
    {
        Icon: GotToBuildDeploy,
        title: 'Preset value',
        subtitle: 'Choose from a list of pre-defined values',
        valueType: 'preset',
    },
    {
        Icon: GoToEnvOverride,
        title: 'Deployed value',
        subtitle: 'Choose from currently deployed values',
        valueType: 'deployed',
    },
    {
        Icon: GotToBuildDeploy,
        title: 'I want to start from scratch',
        subtitle: 'Start with the latest default value for this chart',
        valueType: '',
    },
]
interface ChartVersionSelectorModalType {
    closePopup: () => void
    appStoreApplicationName: string
    appIconUrl: string
    onError: (e) => void
    handleDeploy: () => void
}

export default function ChartVersionSelectorModal({
    closePopup,
    appStoreApplicationName,
    appIconUrl,
    onError,
    handleDeploy,
}: ChartVersionSelectorModalType) {
    const {
        redirectToChartValues,
        openSavedValuesList,
        selectedVersion,
        selectVersion,
        chartValuesList,
        chartValues,
        setChartValues,
    } = useDiscoverDetailsContext()
    const [isListpage, setIsListPage] = useState(false)
    const [selectedValueType, setSelectedValueType] = useState<string>('')
    const [deployedChartValueList, setDeployedChartValueList] = useState<
        {
            id: string
            kind: string
            name: string
            chartVersion: string
            environmentName: string
        }[]
    >([])
    const [presetChartValueList, setPresetChartValueList] = useState<
        {
            id: string
            kind: string
            name: string
            chartVersion: string
            environmentName: string
        }[]
    >([])

    useEffect(() => {
        const _deployedChartValues = [],
            _presetChartValues = []
        for (let index = 0; index < chartValuesList.length; index++) {
            const _chartValue = chartValuesList[index]
            const chartValueObj = {
                id: _chartValue.id,
                kind: _chartValue.kind,
                name: _chartValue.name,
                chartVersion: _chartValue.chartVersion,
                environmentName: '',
            }
            if (_chartValue.kind === ChartKind.DEPLOYED) {
                _deployedChartValues.push(chartValueObj)
            } else if (_chartValue.kind === ChartKind.TEMPLATE) {
                _presetChartValues.push(chartValueObj)
            }
        }
        setDeployedChartValueList(_deployedChartValues)
        setPresetChartValueList(_presetChartValues)
    }, [chartValuesList])

    const onClickActionCard = (valueType): void => {
        if (valueType) {
            setSelectedValueType(valueType)
            togglePageState()
        } else {
            closePopup()
            handleDeploy()
        }
    }
    const createActionCard = (
        Icon: React.FunctionComponent<any>,
        title: string,
        subtitle: string,
        valueType: string,
    ): JSX.Element => {
        return (
            <div
                className="flex left br-4 pt-12 pr-16 pb-12 pl-16 mb-12 ml-20 mr-20 en-2 bw-1 action-card pointer"
                onClick={() => {
                    onClickActionCard(valueType)
                }}
            >
                <div className="h-60 ">
                    <Icon />
                </div>
                <div className="ml-16 mr-16 flex-1">
                    <div className="fw-6 fs-13 cn-9">{title}</div>
                    <div className="fw-4 fs-13 cn-7">{subtitle}</div>
                </div>
                <Dropdown className="icon-dim-20 rotate-270" />
            </div>
        )
    }

    const renderInitialHeader = (): JSX.Element => {
        return (
            <>
                <div className="icon-dim-44 mr-16 mr-16">
                    <img src={appIconUrl} onError={onError} className="chart-grid-item__icon" alt="chart icon" />
                </div>
                <div>
                    <div className="fw-6 fs-16 cn-9">Deploy {appStoreApplicationName}</div>
                    <div className="fw-4 fs-13 cn-9">Choose to start with...</div>
                </div>
            </>
        )
    }

    const togglePageState = (): void => {
        setIsListPage(!isListpage)
    }

    const renderListHeader = (): JSX.Element => {
        return (
            <>
                <button type="button" className="transparent" onClick={togglePageState}>
                    <Back className="icon-dim-20" />
                </button>
                <div>
                    <div className="fw-6 fs-16 cn-9">{appStoreApplicationName}</div>
                    <div className="fw-4 fs-13 cn-9">Select a {selectedValueType} value</div>
                </div>
            </>
        )
    }
    const renderList = (): JSX.Element => {
        return (
            <div style={{ height: 'calc(100vh - 170px)' }}>
                <div className="chart-value-row fw-6 cn-7 fs-12 border-top border-bottom text-uppercase pt-8 pr-16 pb-8 pl-16">
                    <div className="pr-16"></div>
                    <div className="pr-16">Name</div>
                    <div>Chart Version</div>
                </div>
                {(selectedValueType === 'preset' ? presetChartValueList : deployedChartValueList).map((valueDetail) => (
                    <div className="chart-value-row fw-4 cn-9 fs-13 pt-12 pr-16 pb-12 pl-16">
                        <div className="pr-16">
                            <File className="icon-dim-18 icon-n4 vertical-align-middle" />
                        </div>
                        <div className="pr-16">{valueDetail.name}</div>
                        <div>{valueDetail.chartVersion}</div>
                    </div>
                ))}
            </div>
        )
    }
    return (
        <VisibleModal className="transition-effect">
            <div
                className={`modal__body mt-0 no-top-radius chart-version-selector p-0 ${
                    isListpage ? 'no-bottom-radius' : ''
                }`}
            >
                <div className={`header-container mt-20 mr-20 mb-20 ${isListpage ? '' : 'ml-20'}`}>
                    {isListpage ? renderListHeader() : renderInitialHeader()}
                    <button type="button" className="transparent" onClick={closePopup}>
                        <Close className="icon-dim-20" />
                    </button>
                </div>
                {isListpage
                    ? renderList()
                    : PrimaryOptions.map((primaryOption) =>
                          createActionCard(
                              primaryOption.Icon,
                              primaryOption.title,
                              primaryOption.subtitle,
                              primaryOption.valueType,
                          ),
                      )}
                {isListpage && (
                    <div className="pt-20 pr-20 pb-20 pl-20 border-top right-align">
                        <button type="button" className="cta" onClick={closePopup}>
                            Edit & deploy
                            <Back className="icon-dim-20 rotate-180 vertical-align-middle ml-5" />
                        </button>
                    </div>
                )}
            </div>
        </VisibleModal>
    )
}
