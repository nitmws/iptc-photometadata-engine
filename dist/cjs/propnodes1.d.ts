import { MdStruct } from "./incommon";
import { IipmdCheckerResult } from "./ipmdchecker";
/**
 * Class holds all options relevant for the design of the output
 */
export declare class OutputDesignOptions {
    ipmdfull: boolean;
    topics: boolean;
    fstds: boolean;
    isearch1: boolean;
    wvalonly: boolean;
}
/**
 * Enumeration of types of label values:
 * ipmd = IPTC Photo Metadata Standard
 * valuefmt = standards of the value format
 * et = ExifTool
 */
export declare enum Labeltype {
    ipmd = 0,
    valuefmt = 1,
    et = 2
}
/**
 * Class of properties holding arrays of PropNodes
 * for different Output Designs
 */
export declare class PropNodesArraysSet1 {
    ipmdFullPna1: IPropNode[];
    xmpPna: IPropNode[];
    iimPna: IPropNode[];
    exifPna: IPropNode[];
    gimgcontPna: IPropNode[];
    personPna: IPropNode[];
    locationPna: IPropNode[];
    othingsPna: IPropNode[];
    rightsPna: IPropNode[];
    licPna: IPropNode[];
    adminPna: IPropNode[];
    imgregPna: IPropNode[];
    anyPnaTopic: IPropNode[];
    noTopicPna: IPropNode[];
    schemaorgPna: IPropNode[];
    anyOtherDataPna: IPropNode[];
}
/**
 * Interface for the structure used to display data in an HTML page of a Get IPTC PMD site
 */
export interface IPropNode {
    ptype: string;
    plabel: string;
    psort: string;
    pspecidx: string;
    pvalue: string | IPropNode[];
    pinsync: number;
    pembformat: string;
    hasValue: boolean;
}
/**
 * Enumeration of types of PropNodes
 */
export declare enum Ptype {
    plain = 0,
    struct = 1
}
/**
 * Transforms an IPTC PMD Checker Result object to PropNodes (property nodes)
 * @param ipmdChkResult
 * @param opdOpt
 * @param labeltype
 * @param noValueText
 * @param ipmdIdFilter
 * @param ipmdTechRef
 * @param anyOtherDataRef
 */
export declare function ipmdChkResultToPropNodes(ipmdChkResult: IipmdCheckerResult, opdOpt: OutputDesignOptions, labeltype: Labeltype, noValueText: string, ipmdIdFilter: string[], ipmdTechRef: object, anyOtherDataRef: MdStruct): PropNodesArraysSet1;
