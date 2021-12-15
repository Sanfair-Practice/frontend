import axios, {AxiosInstance} from "axios";
import {
    IChapterRecord,
    ILoginProfile,
    LoggedUser,
    IUserRecord,
    IRegistrationProfile, ISectionRecord,
    ITestRecord, IVariantRecord, IAuthenticatable
} from "./types";

export class ValidationError extends Error {
    constructor(message: string, public readonly errors: unknown) {
        super(message);
    }
}

interface AnswerQuestionConfig {
    user: number,
    training: number,
    variant: number,
    question: number,
    answer: string
}

export class Api {
    private readonly httpClient: AxiosInstance;
    private readonly device: string;

    constructor(host: string, device: string) {
        this.device = device;
        this.httpClient = axios.create({
            baseURL: host,
            // TODO optimize create test from chapter.
            timeout: 10000,
            headers:  {
                "Accept": "application/json"
            }
        });
    }

    public async answerQuestion(config:AnswerQuestionConfig): Promise<IVariantRecord> {
        const {user, training, variant, question, answer} = config;
        const url = `/api/user/${user}/training/${training}/variant/${variant}/question/${question}/answer`;
        const response = await this.httpClient.post(url, {
            answer
        });
        return response.data.data;
    }

    public async getVariant(user:number, training:number, variant:number): Promise<IVariantRecord> {
        const response = await this.httpClient.get(`/api/user/${user}/training/${training}/variant/${variant}`);
        return response.data.data;
    }

    public async startVariant(user:number, training:number, variant:number): Promise<IVariantRecord> {
        const response = await this.httpClient.patch(`/api/user/${user}/training/${training}/variant/${variant}`);
        return response.data.data;
    }

    public async createTrainingForSections(user: number, sections: Array<string>): Promise<ITestRecord> {
        const response = await this.httpClient.post(`/api/user/${user}/training`, {sections});
        return response.data.data;
    }

    public async createTrainingForChapters(user: number, chapters: Array<string>): Promise<ITestRecord> {
        const response = await this.httpClient.post(`/api/user/${user}/training`, {chapters});
        return response.data.data;
    }

    public async getChapters(): Promise<Array<IChapterRecord>>
    {
        const response = await this.httpClient.get("/api/chapter");
        return response.data.data;
    }

    public async getSections(): Promise<Array<ISectionRecord>>
    {
        const response = await this.httpClient.get("/api/section");
        return response.data.data;
    }

    public async getTrainings(user: number): Promise<Array<ITestRecord>>
    {
        const response = await this.httpClient.get(`/api/user/${user}/training`);
        return response.data.data;
    }

    public async getTraining(user: number, training: number): Promise<ITestRecord>
    {
        const response = await this.httpClient.get(`/api/user/${user}/training/${training}`);
        return response.data.data;
    }

    public async register(profile: IRegistrationProfile): Promise<LoggedUser> {
        try {
            const response = await this.httpClient.post("/api/register", {
                first_name: profile.first_name,
                last_name: profile.last_name,
                phone: profile.phone,
                passport: profile.passport,
                email: profile.email,
                password: profile.password,
                password_confirmation: profile.password_confirmation,
                device: this.device
            });
            return response.data.data;

        } catch (reason) {
            if (axios.isAxiosError(reason) && reason.response) {
                throw new ValidationError(reason.response.data.message, reason.response.data.errors);
            }
            throw reason;
        }
    }

    public async login(profile: ILoginProfile): Promise<LoggedUser> {
        const response = await this.httpClient.post("/api/login", {
            email: profile.email,
            password: profile.password,
            device: this.device
        });
        return response.data.data;
    }

    public async authenticate(user: IAuthenticatable): Promise<LoggedUser|undefined>
    {
        try {
            this.updateAuthorization(user.token);
            const record = await this.getUser(user.id);
            return {...user, ...record};
        }
        catch (e) {
            if (axios.isAxiosError(e) && e.response?.status === 401) {
                this.updateAuthorization(undefined);
                return undefined;
            }
            throw e;
        }
    }

    public async getUser(id: number): Promise<IUserRecord> {
        const response = await this.httpClient.get(`/api/user/${id}`);
        return response.data.data as IUserRecord;
    }


    public updateAuthorization(token: string|undefined): void {
        if (token) {
            this.httpClient.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
        else {
            delete this.httpClient.defaults.headers.common.Authorization;
        }
    }
}
