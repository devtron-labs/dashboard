import React from 'react';
import { getChartValuesCategorizedListParsed, getChartVersionsMin, getReadme } from '../../../charts/charts.service';
import { ChartVersionType } from '../../../charts/charts.types';
import { showError } from '../../../common';

export async function fetchChartVersionsData(
    id: number,
    isExternal: boolean,
    valueUpdateRequired: boolean,
    setSelectedVersionUpdatePage: React.Dispatch<React.SetStateAction<ChartVersionType>>,
    setChartVersionsData: React.Dispatch<React.SetStateAction<ChartVersionType[]>>,
    setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
    currentChartVersion?: string,
    selectVersion?: React.Dispatch<React.SetStateAction<number>>,
) {
    try {
        setLoading && setLoading(true);
        const { result } = await getChartVersionsMin(id);
        setChartVersionsData(result);

        if (isExternal) {
            const specificVersion = result.find((e) => e.version === currentChartVersion);
            if (specificVersion) {
                selectVersion(specificVersion.id);
                setSelectedVersionUpdatePage(specificVersion);
            } else {
                setSelectedVersionUpdatePage(result[0]);
            }
        } else if (valueUpdateRequired) {
            setSelectedVersionUpdatePage(result[0]);
        }
    } catch (err) {
        showError(err);
    } finally {
        setLoading && setLoading(false);
    }
}

export async function getChartValuesList(
    id: number,
    setChartValuesList: React.Dispatch<React.SetStateAction<any>>,
    setChartValues: React.Dispatch<React.SetStateAction<any>>,
    setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
    initId?: number,
    installedAppVersionId = null,
) {
    setLoading && setLoading(true);
    try {
        const { result } = await getChartValuesCategorizedListParsed(id, installedAppVersionId);
        setChartValuesList(result);
        if (installedAppVersionId) {
            setChartValues({
                id: initId,
                kind: 'EXISTING',
            });
        }
    } catch (err) {
    } finally {
        setLoading && setLoading(false);
    }
}

export async function getChartRelatedReadMe(
    id: number,
    setFetchingReadMe: React.Dispatch<React.SetStateAction<boolean>>,
    setActiveReadMe: React.Dispatch<React.SetStateAction<string>>,
) {
    try {
        setFetchingReadMe(true);
        const { result } = await getReadme(id);
        setActiveReadMe(result.readme);
        setFetchingReadMe(false);
    } catch (err) {
        setFetchingReadMe(false);
    }
}
