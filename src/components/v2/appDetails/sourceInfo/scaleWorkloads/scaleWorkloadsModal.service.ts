import { Routes } from "../../../../../config";
import { post } from "../../../../../services/api";
import { HibernateRequest, HibernateResponse } from "./scaleWorkloadsModal.type";

export function hibernateApp(request: HibernateRequest): Promise<HibernateResponse> {
    return post(Routes.HELM_APP_HIBERNATE_API, request)
}

export function unhibernateApp(request: HibernateRequest): Promise<HibernateResponse> {
    return post(Routes.HELM_APP_UNHIBERNATE_API, request)
}


export function getScalePodList(): Promise<{
    result: {
        scalePodToZeroList:
        {
            kind: string;
            name: string;
            isChecked: boolean;
            value: "CHECKED" | "INTERMEDIATE";
        }[],
        objectToRestoreList:
        {
            kind: string;
            name: string;
            isChecked: boolean;
            value: "CHECKED" | "INTERMEDIATE";
        }[]
    },
}> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                result: {
                    scalePodToZeroList: scalePodToZeroList.map((list) => {
                        return {
                            kind: list.kind,
                            name: list.name,
                            isChecked: false,
                            value: "CHECKED"
                        }
                    },
                    ),
                    objectToRestoreList: objectToRestoreList.map((list) => {
                        return {
                            kind: list.kind,
                            name: list.name,
                            isChecked: false,
                            value: "CHECKED"
                        }
                    })
                }
            }
            )
        }, 1000)
    })
}

const scalePodToZeroList = [
    {
        kind: "rollout",
        name: "dashboard-bp-devtroncd",
    },
    {
        kind: "horizontalPodAutoscaler",
        name: "dashboard-bp-devtroncd",
    },
    {
        kind: "deployment",
        name: "dashboard-bp-devtroncd",
    },
]

const objectToRestoreList = [
    {
        kind: "rollout",
        name: "dashboard-bp-devtroncd",
    },
    {
        kind: "horizontalPodAutoscaler",
        name: "dashboard-bp-devtroncd",
    },
] 