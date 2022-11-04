import React from "react";
import { OptionType } from "../userGroups/userGroups.types";

export interface CustomCredential{
  server: string
  email: string
  username: string
  password: string
}

interface CredentialTypes{
  SAME_AS_REGISTRY: string
  NAME: string
  CUSTOM_CREDENTIAL: string
}

export const CredentialType: CredentialTypes = {
  SAME_AS_REGISTRY: 'SAME_AS_REGISTRY',
  NAME: 'NAME',
  CUSTOM_CREDENTIAL: 'CUSTOM_CREDENTIAL',
}
export interface ManageRegistryType{
  clusterOption: OptionType[]
  blackList: OptionType[]
  setBlackList: React.Dispatch<React.SetStateAction<OptionType[]>>
  whiteList: OptionType[]
  setWhiteList: React.Dispatch<React.SetStateAction<OptionType[]>>
  blackListEnabled: boolean
  setBlackListEnabled: React.Dispatch<React.SetStateAction<boolean>>
  credentialsType: string
  setCredentialType: React.Dispatch<React.SetStateAction<string>>
  credentialValue: string
  setCredentialValue: React.Dispatch<React.SetStateAction<string>>
  onClickHideManageModal: () => void
  appliedClusterList: OptionType[]
  ignoredClusterList: OptionType[]
  customCredential: CustomCredential
  setCustomCredential: React.Dispatch<React.SetStateAction<CustomCredential>>
  setErrorValidation:  React.Dispatch<React.SetStateAction<boolean>>
  errorValidation: boolean
}