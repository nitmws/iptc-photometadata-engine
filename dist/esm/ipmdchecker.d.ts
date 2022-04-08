import { MdStruct } from "./incommon";
/**
 * The result object of IpmdChecker
 */
export interface IipmdCheckerResult {
    state: MdStruct;
    value: MdStruct;
}
/**
 * Options for comparing two results of IpmdChecker
 */
export declare class CompareOptions {
    mergeXmpIimRows: boolean;
}
/**
 * Class with a structure holding the result of comparing a property across two images
 */
export declare class CompareResultRow {
    result: string;
    message: string;
    comparedNamePath: string;
    comparedIpmdIdPath: string;
    comparedValueFormat: string;
    refValue: string;
    testValue: string;
    dispparam1: string;
    dispparam2: string;
    dispparam3: string;
}
/**
 * Class for checking if IPTC Photo Metadata embedded to an image file: do they comply and are XMP/IIM and Exif values in sync.
 */
export declare class IpmdChecker {
    readonly fsdLsep: string;
    readonly fsdIsel: string;
    ipmdRef: MdStruct;
    _readyToCheck: boolean;
    _testEtJsonFp: string;
    _ipmdStateDataTempl: MdStruct;
    _ipmdStateData: any;
    _ipmdValueData: MdStruct;
    _lsep: string;
    /**
     * Constructor of the IpmdChecker class
     * @param iptcPmdTechRefDocFp File path of the JSON file with the IPTC PMD reference data
     * @param ipmdCheckerResultTemplateFp File path of the JSON file with the IPTC PMD State Data template
     */
    constructor(iptcPmdTechRefDocFp: string, ipmdCheckerResultTemplateFp: string);
    /**
     * Sets value of the file path for the ExifTool JSON file.
     * Is required by some methods.
     * @param value
     */
    set testEtJsonFp(value: string);
    get readyToCheck(): boolean;
    /**
     * Returns all reference data about a top level IPTC PMD property
     * @param propertyId identifier of the property as defined for the reference data
     */
    getIpmdTopPropertyData(propertyId: string): object;
    /**
     * Returns all reference data about an IPTC PMD structure
     * @param structId identifier of the structure as defined for the reference data
     */
    getIpmdStructData(structId: string): object;
    /**
     * Loads the JSON file with photo metadata as provided by ExifTool and returns it as object.
     * If an error occurs the object is empty.
     */
    loadTestEtJson(): object;
    /**
     * Checks the PMD of a test image based on the properties defined by the IPTC PMD Standard
     * @param imgEtPmdInput - object with photo metadata as provided by ExifTool
     * @param compareValues - "true" = if XMP and IIM values exist they are compared
     * @param countOccurrences - "true" = if the XMP value may occur mulitple times: the occurrences are counted
     * @param anyOtherDataRef - object referencing any non-IPTC (meta)data in the ExifTool object
     */
    checkIpmdStd(imgEtPmdInput?: MdStruct, compareValues?: boolean, countOccurrences?: boolean, anyOtherDataRef?: MdStruct): IipmdCheckerResult;
    /**
     * Checks a specific structure of PMD of a test image based on the properties
     * defined for this kind of structure by the IPTC PMD Standard.
     * This method is called by the checkIpmdStd method.
     * Be aware: only for the XMP format structures are defined!
     * @param parentIpmdIdsStr Sequence of IPTC PMD property identifiers, separated by a slash (/)
     * @param refstructId Identifier of the structure in the IPTC PMD reference object
     * @param teststructEtPmd Structure of photo metadata as provided by ExifTool
     * @param countOccurrences - "true" = if the XMP value may occur mulitple times: the occurrences are counted
     */
    private _checkIpmdStdStruct;
    /**
     * Compares an IPMD Checker Result of a test image against the IPMD Checker Result
     * of a reference image
     * Returns: array of CompareResultRow objects
     * @param resultRef
     * @param resultTest
     * @param ipmdIdFilter
     * @param compareOptions
     */
    compareIpmdCheckerResults(resultRef: IipmdCheckerResult, resultTest: IipmdCheckerResult, ipmdIdFilter: string[], compareOptions: CompareOptions): CompareResultRow[];
    /**
     * Sub-method of compareIpmdCheckerResults. Compares a structure of an IPTC PMD property.
     * The ...Struct1 method sorts out a single value vs. multiple values in an array
     * @param refDataValueFsd
     * @param testDataValueFsd
     * @param thisImpdIdPath
     * @param compareOptions
     */
    private _compareIpmdCheckerResultsStruct1;
    /**
     * Sub-method of compareIpmdCheckerResults and of _compareIpmdCheckerResultsStruct1.
     * Compares a single value of or in a structure of an IPTC PMD property.
     * @param refDataValueFsd
     * @param testDataValueFsd
     * @param thisImpdIdPath
     * @param compareOptions
     */
    private _compareIpmdCheckerResultsStruct2;
    /**
     * Loads the IPTC Photo Metadata Reference document from a JSON file.
     * For class-internal use only.
     */
    private static _loadIpmdRefJson;
    /**
     * Loods the template of IPTC PMD state data from a JSON file
     * @param ipmdStateDataTemplFp
     */
    private static _loadIpmdStateDataTemplate;
    /**
     * Checks if the class instance is ready for doing a check and set the property _readyToCheck
     */
    private _checkReadyToCheck;
    /**
     * Compares two arrays, item by item
     * @param array1
     * @param array2
     */
    private static _arraysAreEqual;
    /**
     * Transforms an FSD ipmdId-path to a corresponding sequence of IPTC PMD property names
     * @param ipmdIdPath
     */
    private _ipmdIdPath2nameSeq;
    private _buildAltLangValue;
}
