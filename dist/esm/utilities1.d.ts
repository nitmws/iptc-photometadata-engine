import { MdStruct } from "./incommon";
import * as pn1 from "./propnodes1";
/**
 * Loads a file and tries to parse it as serialized JSON.
 * Returns: loaded and parsed object
 * @param jsonFp file path of the JSON file
 */
export declare function loadFromJson(jsonFp: string): object;
/**
 * Writes a data object serialized as JSON to a file
 * Returns: true if the writing was successful, else false
 * @param jsonFp file path of the JSON file
 * @param dataObject data as object
 */
export declare function writeAsJson(jsonFp: string, dataObject: object): boolean;
/**
 * Generates the state structure template from the IPTC PMD TechGuide object
 * @param ipmdTechRefData Object of the IPTC PMD TechGuide file
 */
export declare function generateIpmdChkResultsStateTemplate(ipmdTechRefData: MdStruct): object;
/******************** G E N E R I C   H E L P E R S   *****************************
/**
 * Checks if a JavaScript object can be considered as empty
 * @param obj
 */
export declare function objectIsEmpty(obj: object): boolean;
/**
 * Compares two arrays if they are equal
 * From https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
 * @param a
 * @param b
 */
export declare function arraysEqual(a: any[] | null, b: any[] | null): boolean;
export declare function deepCopyPn(inObject: pn1.IPropNode): pn1.IPropNode;
/**
 * Replaces in an ExifTool tag a colon with an underscore
 * @param etTagColon ExifTool tag with a colon
 */
export declare function etTagUnderscore(etTagColon: string): string;
/**
 * Replaces in an ExifTool tag an underscore with a colon
 * @param etTagUnderscore ExifTool tag with an underscore
 */
export declare function etTagColon(etTagUnderscore: string): string;
/**
 * Transforms an ISO DateTime string as used by XMP to an ExifTool date + time value
 * @param xmpIsoDt
 */
export declare function xmpIsoDatetime2etDatetime(xmpIsoDt: string): string;
export declare type ExifParts = {
    dateTime: string | null;
    subSeconds: string | null;
    tzOffset: string | null;
};
export declare function etDatetime2ExifParts(isoDatetime: string): ExifParts;
