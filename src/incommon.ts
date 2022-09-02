/* ************************************
 ***** Types
 ************************************* */

/**
 * Metadata structure: the name of the metadata property is a string
 */
export type MdStruct = { [propName: string]: any };

/**
 * Structure of an Error Message
 */
export type ErrorMsg = {
  propId: string;
  propName: string;
  msg: string;
};

/* ************************************
 ***** Enumerations
 ************************************* */

export enum ProcState {
  OK = "OK",
  ProcErr = "PROCERR",
  PmdErr = "PMDERR",
}
