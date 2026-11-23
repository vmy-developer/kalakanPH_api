import { PH_COUNTRY_CODE } from "../constants/constants";

/** "9171234567" -> "+639171234567" */
export const toContactNumber = (phoneNumber: string): string =>
    `${PH_COUNTRY_CODE}${phoneNumber}`;
