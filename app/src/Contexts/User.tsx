import React, {FC, useState} from "react";
import {ILoggedUser, LoggedUser} from "../Models";

interface IUserContextType {
    user: ILoggedUser|undefined,
    setUser(user: ILoggedUser|undefined): void
}

const UserContext = React.createContext<IUserContextType>({
    user: undefined,
    setUser: (user: ILoggedUser | undefined) => {console.log(user)}
});

export const useUser = (): IUserContextType => React.useContext(UserContext) ;

export const UserProvider: FC = ({ children}) => {
    const getUser = () => {
        const data = localStorage.getItem("user");
        return LoggedUser.fromJson(data);
    };

    const [user, setUser] = useState<ILoggedUser|undefined>(getUser);


    const saveUser = (user: ILoggedUser|undefined) => {
        if (user) {
            localStorage.setItem("user", user.toString())
        } else {
            localStorage.removeItem("user")
        }
        setUser(user);
    };

    const value: IUserContextType = {user, setUser: saveUser};

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
};
