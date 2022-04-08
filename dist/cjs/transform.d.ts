import FixedStructureData from "./fixed_structure_data";
import { IipmdCheckerResult } from "./ipmdchecker";
export declare class Csv1Options {
    fieldsep: string;
}
export declare class Row1Fields {
    topic: string;
    sortorder: string;
    nameL1: string;
    nameL2: string;
    nameL3: string;
    nameL4: string;
    nameL5: string;
    xmpprop: string;
    iimprop: string;
    valuesinsync: string;
    comments: string;
}
/**
 * Transform an IPTC PMD Checker Result object to an array of table rows, type 1 (Row1Fields)
 * @param ipmdChkResultFsd
 * @param ipmdIdFilter
 * @param ipmdTechRefFsd
 */
export declare function ipmdChkResultToTabledata1(ipmdChkResultFsd: FixedStructureData, ipmdIdFilter: string[], ipmdTechRefFsd: FixedStructureData): Row1Fields[];
/**
 * Transforms the tabledata1 format to CSV data, type 1
 * @param tableRows
 * @param csv1Options
 */
export declare function tabledata1ToCsvdata1(tableRows: Row1Fields[], csv1Options: Csv1Options): string[];
/**
 * Transforms the tabledata1 format to a CSV data in a single string
 * @param tableRows
 * @param csv1Options
 */
export declare function tabledata1ToCsvstring1(tableRows: Row1Fields[], csv1Options: Csv1Options): string;
/**
 * Transforms the value object of IPTC PMD Checker Result format to a simple object
 * with the (same) property names as defined by the IPTC PMD standard
 * @param ipmdChkResult the IPTC PMD Checker Result
 * @param embFormatPref selects the preferred format of embedded metadata: XMP or IIM
 * @param thisEmbFormatOnly if true, only values of the embFormatPref are recognized
 */
export declare function ipmdChkResultToIpmd(ipmdChkResult: IipmdCheckerResult, embFormatPref: string, thisEmbFormatOnly?: boolean): object;
