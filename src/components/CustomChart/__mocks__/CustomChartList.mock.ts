import { ResponseType } from "@devtron-labs/devtron-fe-common-lib"
import { processChartData } from "../CustomChartList.utils"
import { ChartDetailType, ChartListResponse } from "../types"

export const mockFailedResponse: ResponseType = {
    code: 404,
    status:"Not Found",
    errors: [{code:"000",internalMessage:"[{pg: no rows in result set}]",userMessage:"pg: no rows in result set"}]
} 

export const mockSuccessResponseWithEmptyChartList: ChartListResponse ={
    code: 200,
    status: "OK",
    result: null
}

export const mockSuccessResponseWithChartList: ChartListResponse ={
    code: 200,
    status: "OK",
    result: [
        {
            "id": 38,
            "name": "amit-cronjob-chart_1-2-0",
            "chartDescription": "Uploading helm chart.",
            "version": "1.2.0",
            "isUserUploaded": true
        },
        {
            "id": 35,
            "name": "deployment-chart",
            "chartDescription": "A Helm chart for Kubernetes",
            "version": "4.0.0",
            "isUserUploaded": true
        },
        {
            "id": 10,
            "name": "Rollout Deployment",
            "chartDescription": "This chart deploys an advanced version of deployment that supports Blue/Green and Canary deployments. For functioning, it requires a rollout controller to run inside the cluster.",
            "version": "3.9.0",
            "isUserUploaded": false
        },
        {
            "id": 11,
            "name": "Rollout Deployment",
            "chartDescription": "This chart deploys an advanced version of deployment that supports Blue/Green and Canary deployments. For functioning, it requires a rollout controller to run inside the cluster.",
            "version": "3.10.0",
            "isUserUploaded": false
        },
        {
            "id": 12,
            "name": "Rollout Deployment",
            "chartDescription": "This chart deploys an advanced version of deployment that supports Blue/Green and Canary deployments. For functioning, it requires a rollout controller to run inside the cluster.",
            "version": "3.11.0",
            "isUserUploaded": false
        },
        {
            "id": 25,
            "name": "Rollout Deployment",
            "chartDescription": "This chart deploys an advanced version of deployment that supports Blue/Green and Canary deployments. For functioning, it requires a rollout controller to run inside the cluster.",
            "version": "4.16.0",
            "isUserUploaded": false
        },
        {
            "id": 13,
            "name": "Rollout Deployment",
            "chartDescription": "This chart deploys an advanced version of deployment that supports Blue/Green and Canary deployments. For functioning, it requires a rollout controller to run inside the cluster.",
            "version": "3.12.0",
            "isUserUploaded": false
        },
        {
            "id": 14,
            "name": "Rollout Deployment",
            "chartDescription": "This chart deploys an advanced version of deployment that supports Blue/Green and Canary deployments. For functioning, it requires a rollout controller to run inside the cluster.",
            "version": "4.10.0",
            "isUserUploaded": false
        },
        {
            "id": 17,
            "name": "Rollout Deployment",
            "chartDescription": "This chart deploys an advanced version of deployment that supports Blue/Green and Canary deployments. For functioning, it requires a rollout controller to run inside the cluster.",
            "version": "4.11.0",
            "isUserUploaded": false
        },
        {
            "id": 19,
            "name": "Rollout Deployment",
            "chartDescription": "This chart deploys an advanced version of deployment that supports Blue/Green and Canary deployments. For functioning, it requires a rollout controller to run inside the cluster.",
            "version": "4.12.0",
            "isUserUploaded": false
        },
        {
            "id": 21,
            "name": "Rollout Deployment",
            "chartDescription": "This chart deploys an advanced version of deployment that supports Blue/Green and Canary deployments. For functioning, it requires a rollout controller to run inside the cluster.",
            "version": "4.13.0",
            "isUserUploaded": false
        },
        {
            "id": 22,
            "name": "Rollout Deployment",
            "chartDescription": "This chart deploys an advanced version of deployment that supports Blue/Green and Canary deployments. For functioning, it requires a rollout controller to run inside the cluster.",
            "version": "4.14.0",
            "isUserUploaded": false
        },
        {
            "id": 23,
            "name": "Rollout Deployment",
            "chartDescription": "This chart deploys an advanced version of deployment that supports Blue/Green and Canary deployments. For functioning, it requires a rollout controller to run inside the cluster.",
            "version": "3.13.0",
            "isUserUploaded": false
        },
        {
            "id": 24,
            "name": "Rollout Deployment",
            "chartDescription": "This chart deploys an advanced version of deployment that supports Blue/Green and Canary deployments. For functioning, it requires a rollout controller to run inside the cluster.",
            "version": "4.15.0",
            "isUserUploaded": false
        },
        {
            "id": 26,
            "name": "Deployment",
            "chartDescription": "Creates a deployment that runs multiple replicas of your application and automatically replaces any instances that fail or become unresponsive.",
            "version": "1.0.0",
            "isUserUploaded": false
        },
        {
            "id": 18,
            "name": "Job \u0026 CronJob",
            "chartDescription": "This chart deploys Job \u0026 CronJob.  A Job is a controller object that represents a finite task and CronJob is used to schedule creation of Jobs.",
            "version": "1.3.0",
            "isUserUploaded": false
        },
        {
            "id": 27,
            "name": "Job \u0026 CronJob",
            "chartDescription": "This chart deploys Job \u0026 CronJob.  A Job is a controller object that represents a finite task and CronJob is used to schedule creation of Jobs.",
            "version": "1.4.0",
            "isUserUploaded": false
        },
        {
            "id": 28,
            "name": "Deployment",
            "chartDescription": "Creates a deployment that runs multiple replicas of your application and automatically replaces any instances that fail or become unresponsive.",
            "version": "1.1.0",
            "isUserUploaded": false
        },
        {
            "id": 30,
            "name": "StatefulSet",
            "chartDescription": "StatefulSet  is a controller object that manages the deployment and scaling of stateful applications while providing guarantees around the order of deployment and uniqueness of names for each pod.",
            "version": "4.18.0",
            "isUserUploaded": false
        },
        {
            "id": 31,
            "name": "Job \u0026 CronJob",
            "chartDescription": "This chart deploys Job \u0026 CronJob.  A Job is a controller object that represents a finite task and CronJob is used to schedule creation of Jobs.",
            "version": "1.5.0",
            "isUserUploaded": false
        },
        {
            "id": 29,
            "name": "Rollout Deployment",
            "chartDescription": "This chart deploys an advanced version of deployment that supports Blue/Green and Canary deployments. For functioning, it requires a rollout controller to run inside the cluster.",
            "version": "4.17.0",
            "isUserUploaded": false
        },
        {
            "id": 32,
            "name": "Deployment",
            "chartDescription": "Creates a deployment that runs multiple replicas of your application and automatically replaces any instances that fail or become unresponsive.",
            "version": "4.18.0",
            "isUserUploaded": false
        },
        {
            "id": 33,
            "name": "Rollout Deployment",
            "chartDescription": "This chart deploys an advanced version of deployment that supports Blue/Green and Canary deployments. For functioning, it requires a rollout controller to run inside the cluster.",
            "version": "4.18.0",
            "isUserUploaded": false
        }
    ]
}

export const chartListData: ChartDetailType[] = processChartData(mockSuccessResponseWithChartList.result)