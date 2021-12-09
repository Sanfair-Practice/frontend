export interface IRecordUser {
    readonly id: number,
    readonly first_name: string,
    readonly last_name: string,
    readonly phone: string,
    readonly email: string
}

export interface IRecordLoggedUser extends IRecordUser {
    readonly token: string
}

export interface ILoginProfile {
    readonly email: string
    readonly password: string,
}

export interface IRegistrationProfile {
    readonly first_name: string,
    readonly last_name: string,
    readonly phone: string,
    readonly email: string
    readonly passport: string,
    readonly password: string,
    readonly password_confirmation: string,
}
