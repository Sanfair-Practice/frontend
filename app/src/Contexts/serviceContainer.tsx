import React, { FC } from "react"
import {createContainer, InjectionMode, asValue, asFunction, AwilixContainer} from "awilix";
import {Backend} from "../Api"

const container = createContainer({
    injectionMode: InjectionMode.PROXY
});

container.register({
    backendApi: asFunction(({backendDomain, device}) => {
        return new Backend.Api(backendDomain, device);
    }).singleton(),
    device: asValue(process.env.DEVICE),
    backendDomain: asValue(process.env.BACKEND_HOST),
});

const ServiceContainerContext = React.createContext(container);

export const useServiceContainer = (): AwilixContainer => React.useContext(ServiceContainerContext) ;

export const ServiceContainerProvider: FC = ({ children}) => {
    return (
        <ServiceContainerContext.Provider value={container}>
            {children}
        </ServiceContainerContext.Provider>
    )
};

