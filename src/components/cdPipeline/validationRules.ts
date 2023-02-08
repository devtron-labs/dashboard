import { PATTERNS } from "../../config";

export class ValidationRules {

    name = (value: string, pattern?: string): { isValid: boolean, message: string } => {
        let re="";
        if(pattern){
        re=pattern
        }
        else{
         re = PATTERNS.APP_NAME
        }
        let regExp = new RegExp(re)
        if (value.length === 0) return { isValid: false, message: 'This is required' }
        if (value.length < 2) return { isValid: false, message: 'At least 2 characters required' }
        if (value.length > 50) return { isValid: false, message: 'Max 50 characters allowed' }
        else if (!regExp.test(value))
            return {
                isValid: false,
                message:
                    "Min 2 chars; Start with alphabet; End with alphanumeric; Use only lowercase; Allowed:(-), (.); Do not use 'spaces'",
            }
        else return { isValid: true, message: '' }
    }

    environment = (id: number): { isValid: boolean, message: string } => {
        if (!id) return { isValid: false, message: 'This is a required ' };
        else return { isValid: true, message: null };
    }

    isGitProvider = (material) => {
        if ((material.gitProviderId)) return { isValid: true, message: '' };
        else return { isValid: false, message: 'This is a required field' };
    }

    namespace = (name: string): { isValid: boolean, message: string } => {
        return this.name(name,PATTERNS.NAMESPACE)
    }
} 
