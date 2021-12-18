export interface IUserRecord {
    readonly id: number,
    readonly first_name: string,
    readonly last_name: string,
    readonly phone: string,
    readonly email: string
}

export interface IAuthenticatable {
    readonly id: number,
    readonly token: string
}

export type LoggedUser = IUserRecord & IAuthenticatable;

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

export enum TestStatus {
    CREATED = "created",
    STARTED = "started",
    PASSED = "finished",
    FAILED = "failed",
    EXPIRED = "expired",
}

export const CompletedTestStatuses = [TestStatus.PASSED, TestStatus.FAILED, TestStatus.EXPIRED];

export interface ITestRecord {
    readonly id: number,
    readonly errors: number,
    readonly quantity: number,
    readonly time: number,
    readonly type: string,
    readonly status: TestStatus,
    readonly created: string,
    readonly sections?: Array<ISectionRecord>,
    readonly chapters?: Array<IChapterRecord>,
    readonly variants?: Array<IVariantRecord>,
    readonly user?: Array<IUserRecord>,
}

export interface IChapterRecord {
    readonly id: number,
    readonly name: string,
    readonly sections?: Array<ISectionRecord>
}
export interface ISectionRecord {
    readonly id: number,
    readonly name: string,
}

export enum VariantStatus {
    CREATED = "created",
    STARTED = "started",
    PASSED = "finished",
    FAILED = "failed",
    EXPIRED = "expired",
}

export const CompletedVariantStatuses = [VariantStatus.PASSED, VariantStatus.FAILED, VariantStatus.EXPIRED];

export interface IVariantRecord {
    readonly id: number,
    readonly time: number,
    readonly end: string|null,
    readonly errors: number,
    readonly test: ITestRecord,
    readonly input: Record<string, IVariantInput>,
    readonly status: VariantStatus,
    readonly questions?: Array<IQuestionRecord>
}

export interface IVariantInput {
    readonly submitted: string,
    readonly correct: string,
    readonly value: string,
}

export type Choices = Record<string, string>;

export interface IQuestionRecord {
    readonly id: number,
    readonly text: string,
    readonly rules: string,
    readonly explanation: string,
    readonly choices: Choices
}
