import axios, {AxiosInstance} from "axios";
import {
    IChapterRecord,
    ILoginProfile,
    ILoggedUserRecord,
    IUserRecord,
    IRegistrationProfile, ISectionRecord,
    ITrainingRecord
} from "./types";

export class ValidationError extends Error {
    constructor(message: string, public readonly errors: unknown) {
        super(message);
    }
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

    public async createTrainingForSections(user: number, sections: Array<string>): Promise<ITrainingRecord> {
        const response = await this.httpClient.post(`/api/user/${user}/training`, {sections});
        return response.data.data;
    }

    public async createTrainingForChapters(user: number, chapters: Array<string>): Promise<ITrainingRecord> {
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

    public async getTrainings(user: number): Promise<Array<ITrainingRecord>>
    {
        const response = await this.httpClient.get(`/api/user/${user}/training`);
        return response.data.data;
    }

    public async getTraining(user: number, training: number): Promise<ITrainingRecord>
    {
        const response = await this.httpClient.get(`/api/user/${user}/training/${training}`);
        return response.data.data;
    }

    public async register(profile: IRegistrationProfile): Promise<ILoggedUserRecord> {
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

    public async login(profile: ILoginProfile): Promise<ILoggedUserRecord> {
        const response = await this.httpClient.post("/api/login", {
            email: profile.email,
            password: profile.password,
            device: this.device
        });
        return response.data.data;
    }

    public async status(): Promise<ILoggedUserRecord> {
        const response = await this.httpClient.get("/api/login");
        return response.data.data;
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
