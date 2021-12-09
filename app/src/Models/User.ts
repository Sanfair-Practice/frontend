import {Backend} from "../Api";

export interface IUser {
    readonly id: number,
    readonly firstName: string,
    readonly lastName: string,
    readonly phone: string,
    readonly email: string
}

export interface ILoggedUser extends IUser {
    readonly token: string
}

function isLoggedUser(obj: unknown): obj is ILoggedUser {
    if (typeof obj !== "object") {
        return false;
    }

    return typeof (obj as ILoggedUser).id !== "undefined"
        && typeof (obj as ILoggedUser).firstName !== "undefined"
        && typeof (obj as ILoggedUser).lastName !== "undefined"
        && typeof (obj as ILoggedUser).phone !== "undefined"
        && typeof (obj as ILoggedUser).email !== "undefined"
        && typeof (obj as ILoggedUser).token !== "undefined"
}

export class User implements IUser {

    constructor(
        public readonly id: number,
        public readonly firstName: string,
        public readonly lastName: string,
        public readonly phone: string,
        public readonly email: string,
    ) {
    }

    public static fromRecord(record: Backend.IRecordUser): IUser {
        return new User(record.id, record.first_name, record.last_name, record.phone, record.email);
    }

}

export class LoggedUser extends User implements ILoggedUser {

    constructor(
        id: number,
        firstName: string,
        lastName: string,
        phone: string,
        email: string,
        public readonly token: string,
    ) {
        super(id, firstName, lastName, phone, email);
    }

    public static fromRecord(record: Backend.IRecordLoggedUser): ILoggedUser {
        return new LoggedUser(record.id, record.first_name, record.last_name, record.phone, record.email, record.token);
    }

    public static fromJson(json: string|null): ILoggedUser|undefined {
        if (typeof json === undefined || json === null) {
            return undefined;
        }
        const obj = JSON.parse(json);
        if (! isLoggedUser(obj)) {
            return undefined;
        }
        return new LoggedUser(obj.id, obj.firstName, obj.lastName, obj.phone, obj.email, obj.token);
    }

    public toString(): string {
        return JSON.stringify({
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            phone: this.phone,
            email: this.email,
            token: this.token,
        })
    }


}
