import Moment, {MomentProps} from "react-moment";
import React, {FC} from "react";

export const Countdown: FC<MomentProps> = (props) => {
    const filter = props.filter ?? ((date: string) => date);
    const removeNegativeSign = (date: string) => {
        return filter(date.replace("-", ""));
    };
    return <Moment {...props} filter={removeNegativeSign} />
}
