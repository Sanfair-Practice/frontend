import React, { FC } from "react"
import {Api} from "../Api/Backend"

const api = new Api(process.env.REACT_APP_BACKEND_HOST as string, process.env.REACT_APP_DEVICE as string);

const ApiContext = React.createContext(api);

export const useApi = (): Api => React.useContext(ApiContext) ;

export const ApiProvider: FC = ({ children}) => {
    return (
        <ApiContext.Provider value={api}>
            {children}
        </ApiContext.Provider>
    )
};

