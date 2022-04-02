"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.xmpIsoDatetime2etDatetime = exports.etTagColon = exports.etTagUnderscore = exports.deepCopyPn = exports.arraysEqual = exports.objectIsEmpty = exports.generateIpmdChkResultsStateTemplate = exports.writeAsJson = exports.loadFromJson = void 0;
const fs_1 = __importDefault(require("fs"));
const icc = __importStar(require("./constants"));
/**
 * Loads a file and tries to parse it as serialized JSON.
 * Returns: loaded and parsed object
 * @param jsonFp file path of the JSON file
 */
function loadFromJson(jsonFp) {
    if (!fs_1.default.existsSync(jsonFp))
        return {};
    let stringdata = fs_1.default.readFileSync(jsonFp, { "encoding": "utf-8" });
    let loadedObject;
    try {
        loadedObject = JSON.parse(stringdata);
    }
    catch (e) {
        return {};
    }
    return loadedObject;
}
exports.loadFromJson = loadFromJson;
/**
 * Writes a data object serialized as JSON to a file
 * Returns: true if the writing was successful, else false
 * @param jsonFp file path of the JSON file
 * @param dataObject data as object
 */
function writeAsJson(jsonFp, dataObject) {
    const jsonString = JSON.stringify(dataObject, null, 2);
    try {
        fs_1.default.writeFileSync(jsonFp, jsonString, { encoding: "utf-8" });
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.writeAsJson = writeAsJson;
/**
 * Generates the state structure template from the IPTC PMD TechGuide object
 * @param ipmdTechRefData Object of the IPTC PMD TechGuide file
 */
function generateIpmdChkResultsStateTemplate(ipmdTechRefData) {
    let reftop = ipmdTechRefData[icc.itgIpmdTop];
    if (reftop === {})
        return {};
    let refstruct = ipmdTechRefData[icc.itgIpmdStruct];
    if (refstruct === {})
        return {};
    let stateStruct = {};
    // presets
    let dataStructXmp = { "XMP": 0 };
    let dataStructXmpMulti = { "XMP": 0, "XMPVALOCCUR": -1 };
    let dataStructXmpIim = { "XMP": 0, "IIM": 0, "INSYNC": -1 };
    let dataStructXmpIimMulti = { "XMP": 0, "XMPVALOCCUR": -1, "IIM": 0, "INSYNC": -1 };
    let dataStructXmpIimExif = { "XMP": 0, "IIM": 0, "EXIF": 0, "INSYNC": -1, "MAPINSYNC": -1 };
    let dataStructXmpIimExifMulti = { "XMP": 0, "XMPVALOCCUR": -1, "IIM": 0, "EXIF": 0, "INSYNC": -1, "MAPINSYNC": -1 };
    let reftopkeys = Object.keys(reftop);
    reftopkeys.forEach(function (reftopkey) {
        stateStruct[reftopkey] = {};
        if (reftop[reftopkey][icc.itgXmpid] !== undefined && reftop[reftopkey][icc.itgIimid] !== undefined &&
            reftop[reftopkey][icc.itgExifid] !== undefined) {
            if (reftop[reftopkey][icc.itgPropoccurrence] === icc.itgPropoccurSingle) {
                stateStruct[reftopkey][icc.stateData] = dataStructXmpIimExif;
            }
            if (reftop[reftopkey][icc.itgPropoccurrence] === icc.itgPropoccurMulti) {
                stateStruct[reftopkey][icc.stateData] = dataStructXmpIimExifMulti;
            }
        }
        else {
            if (reftop[reftopkey][icc.itgXmpid] !== undefined && reftop[reftopkey][icc.itgIimid] !== undefined) {
                if (reftop[reftopkey][icc.itgPropoccurrence] === icc.itgPropoccurSingle) {
                    stateStruct[reftopkey][icc.stateData] = dataStructXmpIim;
                }
                if (reftop[reftopkey][icc.itgPropoccurrence] === icc.itgPropoccurMulti) {
                    stateStruct[reftopkey][icc.stateData] = dataStructXmpIimMulti;
                }
            }
            else {
                if (reftop[reftopkey][icc.itgXmpid] !== undefined) {
                    if (reftop[reftopkey][icc.itgPropoccurrence] === icc.itgPropoccurSingle) {
                        stateStruct[reftopkey][icc.stateData] = dataStructXmp;
                    }
                    if (reftop[reftopkey][icc.itgPropoccurrence] === icc.itgPropoccurMulti) {
                        stateStruct[reftopkey][icc.stateData] = dataStructXmpMulti;
                    }
                }
            }
        }
        if (reftop[reftopkey][icc.itgDatatype] === "struct") {
            if (reftop[reftopkey][icc.itgDataformat] !== undefined) {
                let structId = reftop[reftopkey][icc.itgDataformat];
                if (structId !== "AltLang") {
                    if (refstruct[structId] !== undefined) {
                        let generateStruct = refstruct[structId];
                        let structSub = generateIpmdRefStateStructOfStruct(generateStruct, refstruct);
                        if (!objectIsEmpty(structSub)) {
                            stateStruct[reftopkey][icc.stateStruct] = structSub;
                        }
                    }
                }
            }
        }
    });
    return stateStruct;
}
exports.generateIpmdChkResultsStateTemplate = generateIpmdChkResultsStateTemplate;
/**
 * Generates a structure inside the state structure template from the IPTC PMD TechGuide object.
 * Is a recursive function.
 * @param refstruct
 * @param toprefstruct
 */
function generateIpmdRefStateStructOfStruct(refstruct, toprefstruct) {
    let stateStruct = {};
    // presets
    let dataStructXmp = { "XMP": 0 };
    let dataStructXmpMulti = { "XMP": 0, "XMPVALOCCUR": -1 };
    let dataStructXmpIim = { "XMP": 0, "IIM": 0, "INSYNC": -1 };
    let dataStructXmpIimExif = { "XMP": 0, "IIM": 0, "EXIF": 0, "INSYNC": -1, "MAPINSYNC": -1 };
    let refstructkeys = Object.keys(refstruct);
    refstructkeys.forEach(function (refstructkey) {
        stateStruct[refstructkey] = {};
        if (refstruct[refstructkey][icc.itgXmpid] !== undefined && refstruct[refstructkey][icc.itgIimid] !== undefined &&
            refstruct[refstructkey][icc.itgExifid] !== undefined) {
            stateStruct[refstructkey][icc.stateData] = dataStructXmpIimExif;
        }
        else {
            if (refstruct[refstructkey][icc.itgXmpid] !== undefined && refstruct[refstructkey][icc.itgIimid] !== undefined) {
                stateStruct[refstructkey][icc.stateData] = dataStructXmpIim;
            }
            else {
                if (refstruct[refstructkey][icc.itgXmpid] !== undefined) {
                    if (refstruct[refstructkey][icc.itgPropoccurrence] === icc.itgPropoccurSingle) {
                        stateStruct[refstructkey][icc.stateData] = dataStructXmp;
                    }
                    if (refstruct[refstructkey][icc.itgPropoccurrence] === icc.itgPropoccurMulti) {
                        stateStruct[refstructkey][icc.stateData] = dataStructXmpMulti;
                    }
                }
            }
        }
        if (refstruct[refstructkey][icc.itgDatatype] === "struct") {
            if (refstruct[refstructkey][icc.itgDataformat] !== undefined) {
                let structId = refstruct[refstructkey][icc.itgDataformat];
                if (structId !== "AltLang") {
                    if (toprefstruct[structId] !== undefined) {
                        let generateStruct = toprefstruct[structId];
                        let structSub = generateIpmdRefStateStructOfStruct(generateStruct, toprefstruct);
                        if (!objectIsEmpty(structSub)) {
                            stateStruct[refstructkey][icc.stateStruct] = structSub;
                        }
                    }
                }
            }
        }
    });
    return stateStruct;
}
/******************** G E N E R I C   H E L P E R S   *****************************
/**
 * Checks if a JavaScript object can be considered as empty
 * @param obj
 */
function objectIsEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}
exports.objectIsEmpty = objectIsEmpty;
/**
 * Compares two arrays if they are equal
 * From https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
 * @param a
 * @param b
 */
function arraysEqual(a, b) {
    if (a === b)
        return true;
    if (a == null || b == null)
        return false;
    if (a.length !== b.length)
        return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
}
exports.arraysEqual = arraysEqual;
function deepCopyPn(inObject) {
    return JSON.parse(JSON.stringify(inObject));
}
exports.deepCopyPn = deepCopyPn;
// ***** E X I F T O O L utilities ********************************
/**
 * Replaces in an ExifTool tag a colon with an underscore
 * @param etTagColon ExifTool tag with a colon
 */
function etTagUnderscore(etTagColon) {
    return etTagColon.replace(":", "_");
}
exports.etTagUnderscore = etTagUnderscore;
/**
 * Replaces in an ExifTool tag an underscore with a colon
 * @param etTagUnderscore ExifTool tag with an underscore
 */
function etTagColon(etTagUnderscore) {
    return etTagUnderscore.replace("_", ":");
}
exports.etTagColon = etTagColon;
/**
 * Transforms an ISO DateTime string as used by XMP to an ExifTool date + time value
 * @param xmpIsoDt
 */
function xmpIsoDatetime2etDatetime(xmpIsoDt) {
    let etDt = '';
    if (xmpIsoDt == undefined)
        return etDt;
    if (xmpIsoDt == '')
        return etDt;
    let etYear = '';
    let etMonth = '01';
    let etDay = '01';
    let etTime = '00:00:00';
    let etTz = '+00:00';
    // full ISO DT: 2022-03-04T12:02:07+00:00 full-len=25, D+T-len=19 D-len=10
    let xmpIsoDtLen = xmpIsoDt.length;
    if (xmpIsoDtLen < 4)
        return etDt;
    if (xmpIsoDtLen == 4) { // year only
        etYear = xmpIsoDt;
        etDt = etYear + ':' + etMonth + ':' + etDay + ' ' + etTime + etTz;
        return etDt;
    }
    if (xmpIsoDtLen == 7) { // year + month only
        etYear = xmpIsoDt.substring(0, 4);
        etMonth = xmpIsoDt.substring(5, 7);
        etDt = etYear + ':' + etMonth + ':' + etDay + ' ' + etTime + etTz;
        return etDt;
    }
    if (xmpIsoDtLen == 10) { // year + month + day only
        etYear = xmpIsoDt.substring(0, 4);
        etMonth = xmpIsoDt.substring(5, 7);
        etDay = xmpIsoDt.substring(8, 19);
        etDt = etYear + ':' + etMonth + ':' + etDay + ' ' + etTime + etTz;
        return etDt;
    }
    if (xmpIsoDtLen == 19) { // day date + time only
        etYear = xmpIsoDt.substring(0, 4);
        etMonth = xmpIsoDt.substring(5, 7);
        etDay = xmpIsoDt.substring(8, 10);
        etTime = xmpIsoDt.substring(11, 19);
        etDt = etYear + ':' + etMonth + ':' + etDay + ' ' + etTime + etTz;
        return etDt;
    }
    if (xmpIsoDtLen == 25) { // day date + time + time zone
        etYear = xmpIsoDt.substring(0, 4);
        etMonth = xmpIsoDt.substring(5, 7);
        etDay = xmpIsoDt.substring(8, 10);
        etTime = xmpIsoDt.substring(11, 19);
        etTz = xmpIsoDt.substring(19);
        etDt = etYear + ':' + etMonth + ':' + etDay + ' ' + etTime + etTz;
        return etDt;
    }
    // the xmpIsoDt had no matching length, return an empty value
    return etDt;
}
exports.xmpIsoDatetime2etDatetime = xmpIsoDatetime2etDatetime;
//# sourceMappingURL=utilities1.js.map