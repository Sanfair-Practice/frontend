import {App} from "./Components/App";
import React from "react";
import ReactDOM from "react-dom";
import {ApiProvider, UserProvider} from "./Contexts";

ReactDOM.render(
    <React.StrictMode>
        <ApiProvider>
            <UserProvider>
                <App/>
            </UserProvider>
        </ApiProvider>
    </React.StrictMode>,
    document.getElementById("root")
);
