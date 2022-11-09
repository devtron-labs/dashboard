import { AppDetails } from '../../v2/appDetails/appDetails.type'

export interface ErrorBarType {
    appDetails: AppDetails
}

export enum ErrorType {
  ERRIMAGEPULL= 'errimagepull',
  IMAGEPULLBACKOFF ='imagepullbackoff'
}