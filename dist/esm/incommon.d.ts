/**
 * Metadata structure: the name of the metadata property is a string
 */
export declare type MdStruct = {
    [propName: string]: any;
};
/**
 * Structure of an Error Message
 */
export declare type ErrorMsg = {
    propId: string;
    propName: string;
    msg: string;
};
export declare enum ProcState {
    OK = "OK",
    ProcErr = "PROCERR",
    PmdErr = "PMDERR"
}
