export class LoginValidation {
    username = (username: string): { message: string | null, result: string | null, isValid: boolean } => {
        if(!username.length)  return { message: "", result: "success", isValid: true }
        if (username.length > 1)
            return { message: "", result: "success", isValid: true }
        else return { message: "Invalid Username", result: "error", isValid: true }
    }

    password = (password: string): { message: string | null, result: string | null, isValid: boolean } => {
        if(!password.length)  return { message: "", result: "success", isValid: true }
        if (password.length > 1)
            return { message: "", result: "success", isValid: true }
        else return { message: "Invalid Password", result: "error", isValid: true }
    }
}