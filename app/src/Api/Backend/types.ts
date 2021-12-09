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

export interface ITrainingRecord {
    readonly id: number,
    readonly errors: number,
    readonly quantity: number,
    readonly time: number,
    readonly type: string,
    readonly status: string,
    readonly created: string,
}

export interface IChapterRecord {
    readonly id: number,
    readonly name: string,
    readonly sections: Array<ISectionRecord>
}
export interface ISectionRecord {
    readonly id: number,
    readonly name: string,
}
