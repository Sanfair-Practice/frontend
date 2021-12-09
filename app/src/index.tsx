import {App} from "./Components/App";
import React from "react";
import ReactDOM from "react-dom";
import {ServiceContainerProvider, UserProvider} from "./Contexts";

ReactDOM.render(
    <React.StrictMode>
        <ServiceContainerProvider>
            <UserProvider>
                <App/>
            </UserProvider>
        </ServiceContainerProvider>
    </React.StrictMode>,
    document.getElementById("root")
);
