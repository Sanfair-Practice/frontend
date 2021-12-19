import React, {FC, useCallback, useState} from "react";
import {Api, IAuthenticatable, LoggedUser} from "../Api/Backend";
import {ModalLoader} from "../Components/Loader";
import {Typography} from "@mui/material";

interface IUserContextType {
    user: LoggedUser | undefined,

    setUser(user: LoggedUser | undefined): void
}

const UserContext = React.createContext<IUserContextType>({
    user: undefined,
    setUser: () => {
        //
    }
});

export const useUser = (): IUserContextType => React.useContext(UserContext);

interface UserProviderProps {
    api: Api,
}

export const UserProvider: FC<UserProviderProps> = ({api, children}) => {
    const [user, setUser] = useState<LoggedUser | undefined>();
    const [loading, setLoading] = useState(() => !!localStorage.getItem("user"));

    const saveUser = useCallback((user: LoggedUser | undefined) => {
        if (user) {
            localStorage.setItem("user", JSON.stringify({id: user.id, token: user.token}))
        } else {
            localStorage.removeItem("user")
        }
        setUser(user);
        api.authorize(user);
    }, [api]);

    // Authenticate user from storage.
    React.useEffect(() => {
        const data = localStorage.getItem("user");
        if (data) {
            setLoading(true);
            const storedUser: IAuthenticatable = JSON.parse(data);
            api.authenticate(storedUser)
                .then(setUser)
                .catch(() => saveUser(undefined))
                .finally(() => setLoading(false));
        }
    }, [api, saveUser]);

    if (loading) {
        return (
            <ModalLoader fullHeight>
                <Typography variant="body2" color="text.secondary">User authentication</Typography>
                <Typography variant="body2" color="text.secondary">Please wait a few seconds...</Typography>
            </ModalLoader>
        )
    }

    return (
        <UserContext.Provider value={{user, setUser: saveUser}}>
            {children}
        </UserContext.Provider>
    )
};
