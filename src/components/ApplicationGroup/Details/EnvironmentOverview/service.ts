import { post } from "@devtron-labs/devtron-fe-common-lib"

export const hibernate = async (appIds:number[],envId:number,envName:string) => {
    return post(`batch/v1beta1/hibernate`, { appIdIncludes: appIds, envId, envName })
}

export const unhibernate = async (appIds:number[],envId:number,envName:string) => {
    return post(`batch/v1beta1/unhibernate`, { appIdIncludes: appIds, envId, envName })
}