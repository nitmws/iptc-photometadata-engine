import { MdStruct } from "./incommon";
/**
 * Generate ExifTool JSON options
 */
export declare class GenerateEtJsonOptions {
    disabledPrintConv: boolean;
}
export declare class IpmdSetter {
    ipmdRef: MdStruct;
    _ipmdDataFsd: any;
    _lsep: string;
    /**
     * Constructor of the IpmdSetter class
     * @param iptcPmdTechRefDocFp File path of the JSON file with the IPTC PMD reference data
     */
    constructor(iptcPmdTechRefDocFp: string);
    /**
     * Generates an ExifTool JSON object from an IPTC PMD data object
     * @param ipmdData IPTC PMD data object
     * @param genOptions options for generating the ExifTool JSON object
     * @returns ExifTool JSON object
     */
    generateExiftoolJson(ipmdData: MdStruct, genOptions?: GenerateEtJsonOptions): object;
    private _generateExiftoolJsonStruct;
    /**
     * Loads the IPTC Photo Metadata Reference document from a JSON file.
     * For class-internal use only.
     */
    private static _loadIpmdRefJson;
}
