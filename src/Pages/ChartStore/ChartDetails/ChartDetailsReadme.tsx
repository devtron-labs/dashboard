import {
    APIResponseHandler,
    Button,
    ButtonComponentType,
    ButtonVariantType,
    ComponentSizeType,
    GenericEmptyState,
    getSelectPickerOptionByValue,
    Icon,
    MarkDown,
    SelectPicker,
    SelectPickerVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ChartDetailsReadmeProps } from './types'

const renderEmptyStateButton = () => (
    <Button
        dataTestId="search-readme-on-web"
        component={ButtonComponentType.anchor}
        variant={ButtonVariantType.text}
        size={ComponentSizeType.medium}
        anchorProps={{ href: '' }}
        text="Search the web"
        endIcon={<Icon name="ic-arrow-square-out" color={null} />}
    />
)

export const ChartDetailsReadme = ({
    isLoading = false,
    chartName,
    readme,
    selectedChartVersion,
    chartsOptions,
    onChartChange,
    error,
    reload,
}: ChartDetailsReadmeProps) => {
    const selectedChartVersionValue = getSelectPickerOptionByValue(chartsOptions, selectedChartVersion, null)

    return (
        <div className="mh-500 flexbox-col bg__primary border__primary br-4 dc__overflow-auto">
            <div className="flex left dc__gap-8 bg__secondary border__primary--bottom px-16 pt-10 pb-9">
                <div className="flex left dc__gap-6">
                    <Icon name="ic-list-bullets" color="N900" />
                    <h3 className="m-0 fs-13 lh-20 fw-6 cn-9">Readme</h3>
                </div>
                <div className="flex left dc__gap-4">
                    <span className="fs-13 lh-20 cn-7">Chart version</span>
                    <SelectPicker
                        inputId="chart-version-selector"
                        options={chartsOptions}
                        variant={SelectPickerVariantType.COMPACT}
                        value={selectedChartVersionValue}
                        onChange={onChartChange}
                        isDisabled={isLoading}
                    />
                </div>
            </div>
            <APIResponseHandler
                isLoading={isLoading}
                error={error}
                progressingProps={{ size: 24 }}
                errorScreenManagerProps={{ code: error?.code, reload }}
            >
                {!readme ? (
                    <GenericEmptyState
                        title={`Readme not available for ${chartName} ${selectedChartVersionValue?.label}`}
                        subTitle="A readme file was not found for this chart’s version."
                        illustrationName="img-no-result"
                        isButtonAvailable
                        renderButton={renderEmptyStateButton}
                    />
                ) : (
                    <MarkDown markdown={readme} className="" />
                )}
            </APIResponseHandler>
        </div>
    )
}
