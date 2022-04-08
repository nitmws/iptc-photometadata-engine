/**
 * Class to read or write values of properties/keys in a fixed structure (= an object) of data:
 * The structure is set during initialization and cannot be changed in readAndWrite mode - and should not be
 * changed in the ReadOnly mode.
 * In this structure values of properties/keys can be "get" (read) and "set" (written),
 * the location in the structure is addressed by a path-like string.
 */
class FixedStructureData {
    /**
     * Constructor
     * @param fsData Object of Fixed Structure Data
     * @param readAndWrite default "true" = property/key values ready for reading and writing, else they should be read only
     */
    constructor(fsData, readAndWrite = true) {
        this._readAndWrite = readAndWrite;
        if (this._readAndWrite) {
            this._fsData = JSON.parse(JSON.stringify(fsData)); // Deep copy!
        }
        else {
            this._fsData = fsData; // No deep copy, references external object
        }
    }
    /**
     * Gets/reads the fixed structure data as whole at the current status
     */
    get fsData() {
        return this._fsData;
    }
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
    getFsData(selectpath, levelsep = "/", indexsep = "#") {
        const result = {};
        result["state"] = "ERROR";
        // result['value'] = '';
        if (selectpath === "") {
            result["msg"] = "Function parameter selectpath is an empty string";
            return result;
        }
        const selectors = selectpath.split(levelsep);
        const startResult = { state: "SEARCHING" };
        const returnObj = this._digGetFsData(1, selectors, indexsep, this._fsData, startResult);
        return returnObj;
    }
    /**
     * Internal Worker of getFsData
     * @param level
     * @param selectors
     * @param indexsep
     * @param digFsData
     * @param parentResult
     */
    _digGetFsData(level, selectors, indexsep, digFsData, parentResult) {
        let thisResult = parentResult;
        if (selectors.length > 0) {
            const selectorRaw = selectors.shift();
            if (selectorRaw === undefined) {
                thisResult["state"] = "ERROR";
                thisResult["msg"] = "Level " + level.toString() + ": Empty selector";
                return thisResult;
            }
            // set default values
            let selAddressesArray = false;
            let selector;
            let selectorIdx = -1;
            // check: is the index of an array item addressed, or not
            if (selectorRaw.includes(indexsep)) {
                selAddressesArray = true;
                const selectorParts = selectorRaw.split(indexsep);
                selector = selectorParts[0];
                if (selectorParts.length > 1) {
                    const parsedInt = parseInt(selectorParts[1]);
                    if (isNaN(parsedInt)) {
                        selAddressesArray = false;
                    }
                    else {
                        selectorIdx = parsedInt;
                    }
                }
                else {
                    selAddressesArray = false;
                }
            }
            else {
                selector = selectorRaw;
            }
            if (digFsData.hasOwnProperty(selector)) {
                if (selAddressesArray) {
                    if (Array.isArray(digFsData[selector])) {
                        if (digFsData[selector].length > selectorIdx) {
                            const selectedDigFsData = digFsData[selector][selectorIdx];
                            if (selectors.length === 0) {
                                thisResult["state"] = "FOUND";
                                thisResult["value"] = selectedDigFsData;
                                return thisResult;
                            }
                            else {
                                thisResult = this._digGetFsData(level + 1, selectors, indexsep, selectedDigFsData, thisResult);
                                return thisResult;
                            }
                        }
                        else {
                            thisResult["state"] = "ERROR";
                            thisResult["msg"] =
                                "Level " +
                                    level.toString() +
                                    ": Array index set, but FsData doesnot have that many items";
                            return thisResult;
                        }
                    }
                    else {
                        thisResult["state"] = "ERROR";
                        thisResult["msg"] =
                            "Level " +
                                level.toString() +
                                ": Array index set, but FsData object is not an array";
                        return thisResult;
                    }
                }
                else {
                    // not addressing an array
                    if (selectors.length === 0) {
                        thisResult["state"] = "FOUND";
                        thisResult["value"] = digFsData[selector];
                        return thisResult;
                    }
                    else {
                        thisResult = this._digGetFsData(level + 1, selectors, indexsep, digFsData[selector], thisResult);
                        return thisResult;
                    }
                }
            }
            else {
                thisResult["state"] = "ERROR";
                thisResult["msg"] =
                    "Level " +
                        level.toString() +
                        ": Selector <" +
                        selector +
                        "> does not exist at this level of the object";
                return thisResult;
            }
        }
        else {
            thisResult["state"] = "ERROR";
            thisResult["msg"] =
                "Level " + level.toString() + ": Array of selectors has no items";
            return thisResult;
        }
    }
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
    setFsData(setvalue, selectpath, levelsep = "/", indexsep = "#") {
        const result = {};
        if (!this._readAndWrite) {
            result["state"] = "READONLY";
            result["msg"] = "ReadOnly mode, no setting of values";
            return result;
        }
        if (selectpath === "") {
            result["state"] = "ERROR";
            result["msg"] = "selectpath argument is empty";
            return result;
        }
        const selectors = selectpath.split(levelsep);
        const startResult = { state: "SEARCHING" };
        return this._digSetFsData(1, selectors, indexsep, this._fsData, startResult, setvalue);
    }
    /**
     * Internal Worker of setFsData
     * @param level
     * @param selectors
     * @param indexsep
     * @param digFsData
     * @param parentResult
     * @param setvalue
     */
    _digSetFsData(level, selectors, indexsep, digFsData, parentResult, setvalue) {
        let thisResult = parentResult;
        if (selectors.length > 0) {
            const selectorRaw = selectors.shift();
            if (selectorRaw === undefined) {
                thisResult["state"] = "ERROR";
                thisResult["msg"] = "Level " + level.toString() + ": Empty selector";
                return thisResult;
            }
            // set default values
            let selArray = false;
            let selector;
            let selectorIdx = -1;
            // check: is the index of an array item addressed, or not
            if (selectorRaw.includes(indexsep)) {
                selArray = true;
                const selectorParts = selectorRaw.split(indexsep);
                selector = selectorParts[0];
                if (selectorParts.length > 1) {
                    const parsedInt = parseInt(selectorParts[1]);
                    if (isNaN(parsedInt)) {
                        selArray = false;
                    }
                    else {
                        selectorIdx = parsedInt;
                    }
                }
                else {
                    selArray = false;
                }
            }
            else {
                selector = selectorRaw;
            }
            let activeDigFsData = {};
            if (selArray) {
                if (Array.isArray(digFsData)) {
                    if (digFsData.length > selectorIdx) {
                        activeDigFsData = digFsData[selectorIdx];
                    }
                    else {
                        thisResult["state"] = "ERROR";
                        thisResult["msg"] =
                            "Level " +
                                level.toString() +
                                ": Array index set, but FsData does not have that many items";
                        return thisResult;
                    }
                }
                else {
                    thisResult["state"] = "ERROR";
                    thisResult["msg"] =
                        "Level " +
                            level.toString() +
                            ": Array index set, but FsData object is not an array";
                    return thisResult;
                }
            }
            else {
                activeDigFsData = digFsData;
            }
            if (activeDigFsData.hasOwnProperty(selector)) {
                if (selectors.length === 0) {
                    activeDigFsData[selector] = setvalue;
                    thisResult["state"] = "SET";
                    return thisResult;
                }
                else {
                    thisResult = this._digSetFsData(level + 1, selectors, indexsep, activeDigFsData[selector], thisResult, setvalue);
                    return thisResult;
                }
            }
            else {
                thisResult["state"] = "ERROR";
                thisResult["msg"] =
                    "Level " +
                        level.toString() +
                        ": Selector <" +
                        selector +
                        "> does not exist in this part of the object";
                return thisResult;
            }
        }
        else {
            thisResult["state"] = "ERROR";
            thisResult["msg"] = "Level " + level.toString() + ": Selectors is empty";
            return thisResult;
        }
    }
}
export default FixedStructureData;
//# sourceMappingURL=fixed_structure_data.js.map