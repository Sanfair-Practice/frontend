import {generatePath} from "react-router-dom";

export const routes = {
    HOME: "/",
    TRAINING: "/training/:training",
    VARIANT: "/training/:training/variant/:variant",
    SIGN_IN: "/sign-in",
    SIGN_UP: "/sign-up",

    NOT_FOUND: "*"
}

export const linkHome = (): string => generatePath(routes.HOME);
export const linkTraining = (id: string|number): string => {
    return generatePath(routes.TRAINING, {training: String(id)});
};
export const linkVariant = (training: string|number, variant: string|number): string => {
    return generatePath(routes.VARIANT, {
        training: String(training),
        variant: String(variant),
    });
};
export const linkSignIn = (): string => generatePath(routes.SIGN_IN);
export const linkSignUp = (): string => generatePath(routes.SIGN_UP);
