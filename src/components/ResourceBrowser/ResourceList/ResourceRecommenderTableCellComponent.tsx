import { MouseEvent, useEffect, useState } from 'react'
import { generatePath, useHistory, useParams } from 'react-router-dom'
import DOMPurify from 'dompurify'

import {
    ALL_NAMESPACE_OPTION,
    Button,
    ButtonVariantType,
    ClipboardButton,
    ComponentSizeType,
    FiltersTypeEnum,
    highlightSearchText,
    Icon,
    ResourceRecommenderHeaderWithRecommendation,
    TableCellComponentProps,
    TableSignalEnum,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import {
    DUMMY_RESOURCE_GVK_VERSION,
    K8S_EMPTY_GROUP,
    RESOURCE_ACTION_MENU,
    RESOURCE_BROWSER_ROUTES,
} from '../Constants'
import { ClusterDetailBaseParams, ResourceFilterOptionsProps } from '../Types'

const ApplyResourceRecommendationModal = importComponentFromFELibrary(
    'ApplyResourceRecommendationModal',
    null,
    'function',
)
const ResourceRecommendationChip = importComponentFromFELibrary('ResourceRecommendationChip', null, 'function')

interface ResourceRecommenderTableCellComponentProps
    extends TableCellComponentProps<FiltersTypeEnum.URL>,
        Pick<ResourceFilterOptionsProps, 'resourceRecommenderConfig'> {
    handleReloadDataAfterBulkOperation: () => void
}

const ResourceRecommenderTableCellComponent = ({
    field: columnName,
    row: { id, data: resourceData },
    filterData: { searchKey: searchText },
    signals,
    handleReloadDataAfterBulkOperation,
    resourceRecommenderConfig: { showAbsoluteValuesInResourceRecommender },
}: ResourceRecommenderTableCellComponentProps) => {
    const { push } = useHistory()
    const { clusterId } = useParams<ClusterDetailBaseParams>()
    const [applyResourceRecommendationConfig, setApplyResourceRecommendationConfig] = useState<any>(null)

    const handleResourceClick = (e: MouseEvent<HTMLButtonElement>) => {
        const {
            name,
            namespace = ALL_NAMESPACE_OPTION.value,
            kind,
            group: _group,
            tab = RESOURCE_ACTION_MENU.manifest,
        } = e.currentTarget.dataset

        const url = generatePath(RESOURCE_BROWSER_ROUTES.K8S_RESOURCE_DETAIL, {
            clusterId,
            namespace,
            name,
            kind: kind.toLowerCase(),
            group: _group || K8S_EMPTY_GROUP,
            version: DUMMY_RESOURCE_GVK_VERSION,
        })

        push(`${url}/${tab}`)
    }

    useEffect(() => {
        const handleEnterPressed = ({ detail: { activeRowData } }) => {
            if (activeRowData.id === id) {
                setApplyResourceRecommendationConfig(activeRowData.data)
            }
        }

        if (columnName === 'name') {
            signals.addEventListener(TableSignalEnum.ENTER_PRESSED, handleEnterPressed)
        }

        return () => {
            if (columnName === 'name') {
                signals.removeEventListener(TableSignalEnum.ENTER_PRESSED, handleEnterPressed)
            }
        }
    }, [])

    const onApplyClick = () => {
        setApplyResourceRecommendationConfig(resourceData)
    }

    const handleClose = () => {
        setApplyResourceRecommendationConfig(null)
    }

    if (resourceData.additionalMetadata?.[columnName]) {
        return (
            <ResourceRecommendationChip
                resourceInfo={resourceData.additionalMetadata[columnName]}
                columnName={columnName as ResourceRecommenderHeaderWithRecommendation}
                showAbsoluteValuesInResourceRecommender={showAbsoluteValuesInResourceRecommender}
            />
        )
    }

    return (
        <>
            {columnName === 'name' ? (
                <div
                    className="flexbox dc__align-items-center dc__gap-4 dc__content-space dc__visible-hover dc__visible-hover--parent py-10 pr-6"
                    data-testid="created-resource-name"
                >
                    <div className="flexbox dc__align-start dc__content-space dc__gap-8 flex-grow-1">
                        <div className="flexbox dc__align-start dc__gap-4 flex-grow-1">
                            <Tooltip content={resourceData.name}>
                                {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                                <button
                                    type="button"
                                    className="dc__unset-button-styles dc__align-left dc__truncate cursor-default"
                                    data-name={resourceData.name}
                                    data-namespace={resourceData.namespace}
                                    data-kind={resourceData.kind}
                                    data-api-version={resourceData.apiVersion}
                                    onClick={handleResourceClick}
                                >
                                    <span
                                        className="dc__link cursor"
                                        // eslint-disable-next-line react/no-danger
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(
                                                highlightSearchText({
                                                    searchText,
                                                    text: String(resourceData.name),
                                                    highlightClasses: 'p-0 fw-6 bcy-2',
                                                }),
                                            ),
                                        }}
                                    />
                                </button>
                            </Tooltip>
                            <ClipboardButton
                                content={String(resourceData.name)}
                                rootClassName="mt-4 dc__visible-hover--child"
                            />
                        </div>

                        <div className="dc__visible-hover--child">
                            <Button
                                dataTestId={`apply-recommendation-${resourceData.id as string}`}
                                text="Apply"
                                endIcon={<Icon name="ic-caret-right" color={null} />}
                                onClick={onApplyClick}
                                size={ComponentSizeType.medium}
                                variant={ButtonVariantType.text}
                                isOpacityHoverChild
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flexbox py-10 dc__align-items-center">
                    <Tooltip content={resourceData[columnName]?.toString()}>
                        <span
                            className={columnName === 'status' ? 'dc__no-shrink' : 'dc__truncate dc__ellipsis-right'}
                            data-testid={`${columnName}-count`}
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                    highlightSearchText({
                                        searchText,
                                        text: resourceData[columnName]?.toString(),
                                        highlightClasses: 'p-0 fw-6 bcy-2',
                                    }),
                                ),
                            }}
                        />
                    </Tooltip>
                </div>
            )}

            {applyResourceRecommendationConfig && (
                <ApplyResourceRecommendationModal
                    handleClose={handleClose}
                    clusterId={+clusterId}
                    resourceList={[applyResourceRecommendationConfig]}
                    handleReloadDataAfterBulkOperation={handleReloadDataAfterBulkOperation}
                />
            )}
        </>
    )
}

export default ResourceRecommenderTableCellComponent
