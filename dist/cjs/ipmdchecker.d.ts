import { ErrorMsg, MdStruct, ProcState } from "./incommon";
/**
 * The result object of IpmdChecker
 */
export interface IipmdCheckerResult {
    procstate: ProcState;
    state: MdStruct;
    value: MdStruct;
    errormsgs: ErrorMsg[];
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
 * Class for checking if IPTC Photo Metadata embedded into an image file: do they comply to the IPTC Standard and are existing XMP/IIM and Exif values in sync.
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
    _errmsgs: ErrorMsg[];
    _lsep: string;
    /**
     * Constructor of the IpmdChecker class
     * @param iptcPmdTechRefDocFp File path of the JSON file with the IPTC PMD TechReference data
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
     * Returns all TechReference data about a top level IPTC PMD property
     * @param propertyId identifier of the property as defined for the reference data
     */
    getIpmdTopPropertyData(propertyId: string): object;
    /**
     * Returns all TechReference data about an IPTC PMD structure
     * @param structId identifier of the structure as defined for the reference data
     */
    getIpmdStructData(structId: string): object;
    /**
     * Loads the JSON file with photo metadata as provided by ExifTool and returns it as object.
     * If an error occurs the object is empty.
     */
    loadTestEtJson(): object;
    /**
     * Checks the photo metadata of a test image based on
     *   the properties defined by the IPTC PMD Standard
     * @param imgEtPmdInput - object with photo metadata as provided by ExifTool
     * @param compareValues - "true" = if XMP and IIM values exist they are compared
     * @param countOccurrences - "true" = if the XMP value may occur mulitple times: the occurrences are counted
     * @param anyOtherDataRef - object referencing any non-IPTC (meta)data in the ExifTool object
     * @returns Instance of the ipmdCheckerResult
     */
    checkIpmdStd(imgEtPmdInput?: MdStruct, compareValues?: boolean, countOccurrences?: boolean, anyOtherDataRef?: MdStruct): IipmdCheckerResult;
    /**
     * Checks a specific structure of the photo metadata of a test image
     *   based on the properties defined for this kind of structure
     *   by the IPTC PMD Standard.
     * This method is called by the checkIpmdStd method.
     * Be aware: structures are defined only for the XMP format!
     * @param parentIpmdIdsStr Sequence of IPTC PMD property identifiers, separated by a slash (/)
     * @param refstructId Identifier of the structure in the IPTC PMD reference object
     * @param teststructEtPmd Structure of photo metadata as provided by ExifTool
     * @param countOccurrences - "true" = if the XMP value may occur mulitple times: the occurrences are counted
     * @param setPmdState - "true" = should the ipmdStateData be set
     * @returns Instance of the ipmdCheckerResult
     */
    private _checkIpmdStdStruct;
    /**
     * Check a structure if it has any other property than those defined by the
     *    IPTC PMD standard
     * @param refIpmdStruct Data about the to-be-checked structure from the TechReference
     * @param teststructEtPmd Data of the to-be-checked structure from the ExifTool output
     * @returns A metadata structure including found "other properties"
     * @private
     */
    private _checkStructForAnyOtherProp;
    /**
     * Check "sub-properties" (property inside a structure) by it ExifTool tag
     *   and not by its IPTC spec identifier
     * @param etTag ExifTool tag of the to-be-checked property
     * @param etValue Value of the property as delivered by ExifTool
     * @returns A metadata structure of the checked property
     * @private
     */
    private _checkSubpropByEtTag;
    /**
     * Compares an IPMD Checker Result of a test image against the IPMD Checker Result
     * of a reference image
     * Returns: array of CompareResultRow objects
     * @param resultRef IPMD Checker Result of a reference image
     * @param resultTest IPMD Checker Result of a test image
     * @param ipmdIdFilter Array of to-be-compared IPTC property Id, if empty all properties are compared
     * @param compareOptions Instance of the CompareOptions
     * @returns Array of CompareResultRow
     */
    compareIpmdCheckerResults(resultRef: IipmdCheckerResult, resultTest: IipmdCheckerResult, ipmdIdFilter: string[], compareOptions: CompareOptions): CompareResultRow[];
    /**
     * Sub-method of compareIpmdCheckerResults. Compares a structure of an IPTC PMD property.
     * The ...Struct1 method sorts out a single value vs. multiple values in an array
     * @param refDataValueFsd Value data of a property of the reference image
     * @param testDataValueFsd Value data of a property of the test image
     * @param thisImpdIdPath Path of this IPTC property Id in the hierarchy of properties
     * @param compareOptions Instance of CompareOptions
     * @returns Array of CompareResultRow
     */
    private _compareIpmdCheckerResultsStruct1;
    /**
     * Sub-method of compareIpmdCheckerResults and of _compareIpmdCheckerResultsStruct1.
     * Compares a single value of or in a structure of an IPTC PMD property.
     * @param refDataValueFsd Value data of a property of the reference image
     * @param testDataValueFsd Value data of a property of the test image
     * @param thisImpdIdPath Path of this IPTC property Id in the hierarchy of properties
     * @param compareOptions Instance of CompareOptions
     * @returns Array of CompareResultRow
     */
    private _compareIpmdCheckerResultsStruct2;
    /**
     * Loads the IPTC Photo Metadata TechReference document from a JSON file.
     * For class-internal use only.
     */
    private static _loadIpmdRefJson;
    /**
     * Loods the template of IPTC PMD state data from a JSON file
     * @param ipmdStateDataTemplFp
     */
    private static _loadIpmdStateDataTemplate;
    /**
     * Checks if an instance of this class is ready for doing a check and set the property _readyToCheck accordingly
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
    /**
     * Builds a single string value from an AltLang value - which may have
     *   values in different languages. This single string follows a format
     *   enabling software to split it up into the strings in different languages
     * @param etJsonData JSON object with the AltLang data
     * @param basicPropId IPTC property Id of the property owning this value
     * @returns A single string with text values in different languages
     * @private
     */
    private _buildAltLangValue;
    /**
     * Normalizes (= transforms) the value(s) of a property to a given data type
     *   Sub-methods deal with a single value and an array of values
     * @param propValue The to-be-normalized value
     * @param shouldbeDatatype The target data type
     * @returns The normalized value
     * @private
     */
    private _normalizePropValue;
    /**
     * Sub-method of _normalizePropValue: normalizes an array of values
     * @param propValueArray
     * @param shouldbeDatatype
     * @param propId
     * @returns The normalized values
     * @private
     */
    private _normalizePropValueArray;
    /**
     * Sub-method of _normalizePropValue: normalizes a single value
     * @param propValue
     * @param shouldbeDatatype
     * @param propId
     * @returns The normalized values
     * @private
     */
    private _normalizePropSingleValue;
    /**
     * Gets all ExifTool tags of properties defined by the IPTC PMD Standard
     *   for a structure
     * @param refIpmdStruct Data of the structure from the IPTC TechReference
     * @returns Array of ExifTool tags
     * @private
     */
    private _getEtTagsOfStruct;
}
