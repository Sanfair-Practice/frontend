import axios, {AxiosInstance} from "axios";
import {ILoginProfile, IRecordLoggedUser, IRecordUser, IRegistrationProfile} from "./types";

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
            timeout: 1000,
            headers: {
                "Accept": "application/json"
            }
        });
    }

    public async register(profile: IRegistrationProfile): Promise<IRecordLoggedUser> {
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
            const body = response.data;

            const record: IRecordLoggedUser = body.data;

            this.handleLogin(record.token);
            return record;

        } catch (reason) {
            if (axios.isAxiosError(reason) && reason.response) {
                throw new ValidationError(reason.response.data.message, reason.response.data.errors);
            }
            throw reason;
        }
    }

    public async login(profile: ILoginProfile): Promise<IRecordLoggedUser> {
        const response = await this.httpClient.post("/api/login", {
            email: profile.email,
            password: profile.password,
            device: this.device
        });

        const body = response.data;

        const record: IRecordLoggedUser = body.data;

        this.handleLogin(record.token);
        return record;
    }

    public async status(): Promise<IRecordLoggedUser> {
        const response = await this.httpClient.get("/api/login");
        return response.data.data;
    }

    public async getUser(id: number): Promise<IRecordUser> {
        const response = await this.httpClient.get(`/api/user/${id}`);
        return response.data.data as IRecordUser;
    }


    public handleLogin(token: string|null): void {
        if (token) {
            this.httpClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
        else {
            delete this.httpClient.defaults.headers.common["Authorization"];
        }
    }
}
