import { MdStruct } from './incommon';
/**
 * Class to read or write values of properties/keys in a fixed structure (= an object) of data:
 * The structure is set during initialization and cannot be changed in readAndWrite mode - and should not be
 * changed in the ReadOnly mode.
 * In this structure values of properties/keys can be "get" (read) and "set" (written),
 * the location in the structure is addressed by a path-like string.
 */
declare class FixedStructureData {
    _fsData: object;
    _readAndWrite: boolean;
    /**
     * Constructor
     * @param fsData Object of Fixed Structure Data
     * @param readAndWrite default "true" = property/key values ready for reading and writing, else they should be read only
     */
    constructor(fsData: object, readAndWrite?: boolean);
    /**
     * Gets/reads the fixed structure data as whole at the current status
     */
    get fsData(): object;
    /**
     * Gets the value of a specific property/key in the structured data.
     *
     * Returns: an object with a "state" property: "FOUND" or "ERROR"
     * If "FOUND" the value is in the "value" property. If "ERROR" a message is in the "msg" property.
     *
     * @param selectpath Path for selecting the property/key: name(s) of the property, top down in the structure.
     * Names of the different levels must be separated.
     * If the property holds an array a specific item may be addressed by an index (starting with 0).
     * @param levelsep Character used for separating the names of different hierarchical levels
     * @param indexsep Character used to separate a property name/key from a suffixed numeric index of an array
     */
    getFsData(selectpath: string, levelsep?: string, indexsep?: string): MdStruct;
    /**
     * Internal Worker of getFsData
     * @param level
     * @param selectors
     * @param indexsep
     * @param digFsData
     * @param parentResult
     */
    private _digGetFsData;
    /**
     * Sets the value of a specific property/key in the structured data.
     *
     * Returns: an object with a "state" property: "SET" or "ERROR"
     * If "SET" the value was set. If "ERROR" a message is in the "msg" property.
     *
     * @param setvalue Value to be set to the addressed property/key
     * @param selectpath Path for selecting the property/key: name(s) of the property, top down in the structure.
     * Names of the different levels must be separated.
     * If the property holds an array a specific item may be addressed by an index (starting with 0).
     * @param levelsep Character used for separating the names of different hierarchical levels
     * @param indexsep Character used to separate a property name/key from a suffixed numeric index of an array
     */
    setFsData(setvalue: any, selectpath: string, levelsep?: string, indexsep?: string): object;
    /**
     * Internal Worker of setFsData
     * @param level
     * @param selectors
     * @param indexsep
     * @param digFsData
     * @param parentResult
     * @param setvalue
     */
    private _digSetFsData;
}
export default FixedStructureData;
