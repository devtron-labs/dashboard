import { PATTERNS } from "../../config";

export class ValidationRules {

    name = (name: string, pattern?: string): { isValid: boolean, message: string } => {
        if ((name.length)) {
            let regex = new RegExp(pattern || PATTERNS.CD_PIPELINE_NAME);
            if (regex.test(name)) return { isValid: true, message: null };
            else return {
                isValid: false,
                message: `Must follow the pattern ${PATTERNS.CD_PIPELINE_NAME}`
            };
        }
        else return { isValid: false, message: 'This is a required field' };
    }

    environment = (id: number): { isValid: boolean, message: string } => {
        if (!id) return { isValid: false, message: 'This is a required field' };
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
