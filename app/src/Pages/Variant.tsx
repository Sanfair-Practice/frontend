import React, {FC, useState} from "react";
import {useParams} from "react-router-dom";
import {NotFound} from "./NotFound";
import {IVariantRecord} from "../Api/Backend";
import {useServiceContainer, useUser} from "../Contexts";
import {Backend} from "../Api";
import {useAsync} from "react-async-hook";
import {ILoggedUser} from "../Models";

const Page: FC<{variant: IVariantRecord}> = ({variant}) => {
    return <></>
}
const AsyncPage: FC<{trainingId: number, variantId:number, onLoad: (variant: IVariantRecord) => void}> = ({trainingId, variantId, onLoad}) => {
    const {user} = useUser();
    const api = useServiceContainer().resolve<Backend.Api>("backendApi");
    const callback = async (user:number, training: number, variant:number) => {
        return api.getVariant(user, training, variant);
    };
    const result = useAsync(callback, [(user as ILoggedUser).id, trainingId, variantId]);
    if (result.loading) {
        return <>Loading ...</>;
    }
    if (result.error) {
        return <>Error: {result.error}</>
    }
    if (!result.result) {
        return <NotFound/>
    }
    onLoad(result.result);
    return <Page variant={result.result} />
}

const PageWrapper: FC<{trainingId: number, variantId:number}> = ({trainingId, variantId}) => {
    const [variant, setVariant] = useState<IVariantRecord|undefined>(undefined);

    if (variant) {
        return <Page variant={variant} />
    }

    return <AsyncPage trainingId={trainingId} variantId={variantId} onLoad={setVariant} />
}

export const Variant: FC = () => {
    const {training, variant} = useParams();

    if (variant === undefined || training === undefined) {
        return <NotFound />
    }

    return <PageWrapper trainingId={+training} variantId={+variant} />;
}
