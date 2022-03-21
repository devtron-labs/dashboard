import { ChartValuesType, ChartVersionType } from '../../../charts/charts.types';
import { InstalledAppInfo, ReleaseInfo } from '../../../external-apps/ExternalAppService';
import { ChartRepoOtions } from '../DeployChart';

export interface ChartSelectorType {
    isExternal?: boolean;
    releaseInfo?: ReleaseInfo;
    installedAppInfo?: InstalledAppInfo;
    isUpdate?: boolean;
}

export interface ChartEnvironmentSelectorType extends ChartSelectorType {
    selectedEnvironment?: { label: string; value: number };
    selectEnvironment?: React.Dispatch<React.SetStateAction<{ label: string; value: number }>>;
    environments?: any[];
}

export interface ChartRepoDetailsType {
    chartRepoName: string;
    chartName: string;
    version: string;
}

export interface ChartRepoSelectorType extends ChartSelectorType {
    repoChartValue?: ChartRepoOtions;
    repoChartSelectOptionLabel?: (chartRepoDetails: ChartRepoDetailsType) => JSX.Element;
    handleRepoChartValueChange?: (event: any) => void;
    repoChartOptionLabel?: (props: any) => JSX.Element;
    chartDetails?: ChartRepoOtions;
}

export interface ChartDeprecatedType {
    isUpdate: boolean;
    deprecated: boolean;
    chartName: string;
    name: string;
}

export interface ChartVersionSelectorType {
    isUpdate?: boolean;
    selectedVersion: number;
    selectVersion: React.Dispatch<React.SetStateAction<number>>;
    chartVersionObj?: ChartVersionType;
    versions?: Map<number, ChartVersionType>;
    selectedVersionUpdatePage: ChartVersionType;
    setSelectedVersionUpdatePage: React.Dispatch<React.SetStateAction<ChartVersionType>>;
    chartVersionsData: ChartVersionType[];
}

export interface ChartValuesSelectorType {
    chartValuesList: ChartValuesType[];
    chartValues: ChartValuesType;
    setChartValues: React.Dispatch<React.SetStateAction<ChartValuesType>>;
    redirectToChartValues?: () => Promise<void>;
    hideVersionFromLabel?: boolean;
}

export interface ChartVersionValuesSelectorType extends ChartVersionSelectorType, ChartValuesSelectorType {}

export interface ChartValuesEditorType {
    loading: boolean;
    valuesText: string;
    onChange: (value: string) => void;
    repoChartValue: ChartRepoOtions;
    hasChartChanged: boolean;
    parentRef: React.MutableRefObject<HTMLDivElement>;
    autoFocus: boolean;
}
