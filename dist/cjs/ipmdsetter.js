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
exports.IpmdSetter = exports.GenerateEtJsonOptions = void 0;
const fs_1 = __importDefault(require("fs"));
const icc = __importStar(require("./constants"));
const util1 = __importStar(require("./utilities1"));
const fixed_structure_data_1 = __importDefault(require("./fixed_structure_data"));
const valmap = __importStar(require("./valuemapper"));
/**
 * Generate ExifTool JSON options
 */
class GenerateEtJsonOptions {
    constructor() {
        // default values are defined for each option
        this.disabledPrintConv = false; // set to "true" if -f parameter of ExifTool will be used
    }
}
exports.GenerateEtJsonOptions = GenerateEtJsonOptions;
class IpmdSetter {
    /**
     * Constructor of the IpmdSetter class
     * @param iptcPmdTechRefDocFp File path of the JSON file with the IPTC PMD reference data
     */
    constructor(iptcPmdTechRefDocFp) {
        this.ipmdRef = IpmdSetter._loadIpmdRefJson(iptcPmdTechRefDocFp);
        this._lsep = "/";
    }
    /**
     * Generates an ExifTool JSON object from an IPTC PMD data object
     * @param ipmdData IPTC PMD data object
     * @param genOptions options for generating the ExifTool JSON object
     * @returns ExifTool JSON object
     */
    generateExiftoolJson(ipmdData, genOptions = new GenerateEtJsonOptions()) {
        this._ipmdDataFsd = new fixed_structure_data_1.default(ipmdData, false);
        const etJson = { SourceFile: "*" };
        const refIpmdTop = this.ipmdRef[icc.itgIpmdTop];
        // Iterate all properties of the reference ipmd_top
        for (const refPropId in refIpmdTop) {
            const refPropData = refIpmdTop[refPropId];
            // get the value of the property
            let ipmdPropValue;
            const getPropValueFsd = this._ipmdDataFsd.getFsData(refPropId);
            if (getPropValueFsd[icc.fsdResState] === icc.fsdStFound) {
                ipmdPropValue = getPropValueFsd[icc.fsdResValue];
            }
            else
                continue;
            // the property value of Et-JSON
            let etPropValue;
            const valIsArray = Array.isArray(ipmdPropValue);
            const datatype = refPropData[icc.itgDatatype];
            let dataformat = "";
            if (refPropData.hasOwnProperty(icc.itgDataformat)) {
                dataformat = refPropData[icc.itgDataformat];
            }
            let altLangActive = false;
            let propoccurrence = "";
            if (refPropData.hasOwnProperty(icc.itgPropoccurrence)) {
                propoccurrence = refPropData[icc.itgPropoccurrence];
            }
            // validate the occurrence
            let ipmdDataOccurrence = 1;
            if (valIsArray) {
                ipmdDataOccurrence = ipmdPropValue.length;
            }
            if (propoccurrence === icc.itgPropoccurSingle) {
                if (ipmdDataOccurrence > 1) {
                    ipmdPropValue = ipmdPropValue[0];
                    ipmdDataOccurrence = 1;
                }
            }
            // datatype "string"
            if (datatype === icc.itgDtString &&
                propoccurrence === icc.itgPropoccurSingle &&
                typeof ipmdPropValue === "string") {
                const ipmdPropValueStr = ipmdPropValue.toString();
                if (ipmdPropValueStr.indexOf(icc.anyPlusBaseUrl) === 0) {
                    if (genOptions.disabledPrintConv) {
                        etPropValue = ipmdPropValueStr.substring(icc.anyPlusBaseUrl.length);
                    }
                    else {
                        etPropValue = valmap.ipmdToEt(ipmdPropValueStr);
                    }
                }
                else
                    etPropValue = ipmdPropValueStr;
            }
            if (datatype === icc.itgDtString &&
                propoccurrence === icc.itgPropoccurMulti &&
                valIsArray) {
                etPropValue = ipmdPropValue;
            }
            // datatype "string" + dataformat date-time
            if (datatype === icc.itgDtString &&
                dataformat === icc.itgDfDt &&
                propoccurrence === icc.itgPropoccurSingle &&
                typeof ipmdPropValue === "string") {
                etPropValue = util1.xmpIsoDatetime2etDatetime(ipmdPropValue);
            }
            // datatype "number"
            if (datatype === icc.itgDtNumber &&
                propoccurrence === icc.itgPropoccurSingle &&
                typeof ipmdPropValue === "number") {
                etPropValue = ipmdPropValue;
            }
            if (datatype === icc.itgDtNumber &&
                propoccurrence === icc.itgPropoccurMulti &&
                valIsArray) {
                etPropValue = ipmdPropValue;
            }
            // datatype "struct" + dataformat = 'AltLang'
            if (datatype === icc.itgDtStruct &&
                dataformat === icc.itgDfAlg &&
                propoccurrence === icc.itgPropoccurSingle &&
                typeof ipmdPropValue === "string") {
                const ipmdPropValueStr = ipmdPropValue.toString();
                const altLangStartIdx = ipmdPropValueStr.indexOf("{@");
                if (altLangStartIdx > -1) {
                    const ipmdPropValues = ipmdPropValueStr.split("{@");
                    ipmdPropValues.forEach((altstring) => {
                        if (altstring.indexOf("}") > -1) {
                            altLangActive = true;
                        }
                    });
                    etPropValue = ipmdPropValues;
                }
                else
                    etPropValue = ipmdPropValue;
            }
            if (datatype === icc.itgDtStruct &&
                dataformat === icc.itgDfAlg &&
                propoccurrence === icc.itgPropoccurMulti &&
                valIsArray) {
                etPropValue = ipmdPropValue;
            }
            // datatype "struct" + dataformat != 'AltLang'
            // console.log(typeof ipmdPropValue);
            if (datatype === icc.itgDtStruct &&
                dataformat !== icc.itgDfAlg &&
                propoccurrence === icc.itgPropoccurSingle &&
                typeof ipmdPropValue === "object") {
                etPropValue = this._generateExiftoolJsonStruct(refPropId, dataformat, propoccurrence, ipmdDataOccurrence)[0];
            }
            if (datatype === icc.itgDtStruct &&
                dataformat !== icc.itgDfAlg &&
                propoccurrence === icc.itgPropoccurMulti &&
                valIsArray) {
                etPropValue = this._generateExiftoolJsonStruct(refPropId, dataformat, propoccurrence, ipmdDataOccurrence);
            }
            // set XMP value(s)
            if (refPropData.hasOwnProperty(icc.itgEtXmp)) {
                if (etPropValue !== undefined) {
                    if (altLangActive) {
                        etPropValue.forEach((altstring) => {
                            const langEndIdx = altstring.indexOf("}");
                            if (langEndIdx === -1) {
                                etJson[refPropData[icc.itgEtXmp]] = altstring;
                            }
                            if (langEndIdx > -1) {
                                const langid = altstring.substring(0, langEndIdx);
                                etJson[refPropData[icc.itgEtXmp] + "-" + langid] =
                                    altstring.substring(langEndIdx + 1);
                            }
                        });
                    }
                    else
                        etJson[refPropData[icc.itgEtXmp]] = etPropValue;
                }
            }
            // set IIM value(s)
            if (refPropData.hasOwnProperty(icc.itgEtIim)) {
                if (etPropValue !== undefined) {
                    switch (refPropId) {
                        case "dateCreated":
                            const etPropValues = etPropValue.split(" ");
                            etJson["IPTC:DateCreated"] = etPropValues[0];
                            if (etPropValues.length > 1) {
                                etJson["IPTC:TimeCreated"] = etPropValues[1];
                            }
                            break;
                        case "subjectCodes":
                            etJson[refPropData[icc.itgEtIim]] = "IPTC:" + etPropValue;
                            break;
                        case "intellectualGenre":
                            etJson[refPropData[icc.itgEtIim]] = "000:" + etPropValue;
                            break;
                        default:
                            etJson[refPropData[icc.itgEtIim]] = etPropValue;
                            break;
                    }
                }
            }
            // set Exif value(s)
            if (refPropData.hasOwnProperty(icc.itgEtExif)) {
                if (etPropValue !== undefined) {
                    switch (refPropId) {
                        case "dateCreated":
                            etJson["ExifIFD:DateTimeOriginal"] = etPropValue.substring(0, 19);
                            etJson["ExifIFD:TimeZoneOffset"] = etPropValue.substring(19);
                            break;
                        case "imageRegion": // the mapping to Exif's Subject Area is virtual
                            break;
                        default:
                            etJson[refPropData[icc.itgEtExif]] = etPropValue;
                            break;
                    }
                }
            }
        }
        return etJson;
    }
    // eo generateExiftoolJson
    _generateExiftoolJsonStruct(propPath, structId, propOccurrence, dataOccurrence) {
        const etJsonStructArr = [{}];
        const dummy = etJsonStructArr.pop();
        for (let itemIdx = 0; itemIdx < dataOccurrence; itemIdx++) {
            const etJsonStruct = {};
            const refIpmdStruct = this.ipmdRef[icc.itgIpmdStruct][structId];
            // Iterate all properties of the reference ipmd_struct[structId]
            for (const refPropId in refIpmdStruct) {
                const refPropData = refIpmdStruct[refPropId];
                let thisPropPath = propPath;
                if (propOccurrence === icc.itgPropoccurMulti) {
                    thisPropPath += "#" + itemIdx.toString();
                }
                thisPropPath += this._lsep + refPropId;
                // get the value of the property
                let ipmdPropValue;
                const getPropValueFsd = this._ipmdDataFsd.getFsData(thisPropPath);
                if (getPropValueFsd[icc.fsdResState] === icc.fsdStFound) {
                    ipmdPropValue = getPropValueFsd[icc.fsdResValue];
                }
                else
                    continue;
                // the property value of Et-JSON
                let etPropValue;
                const valIsArray = Array.isArray(ipmdPropValue);
                const datatype = refPropData[icc.itgDatatype];
                let dataformat = "";
                if (refPropData.hasOwnProperty(icc.itgDataformat)) {
                    dataformat = refPropData[icc.itgDataformat];
                }
                let altLangActive = false;
                let propoccurrence = "";
                if (refPropData.hasOwnProperty(icc.itgPropoccurrence)) {
                    propoccurrence = refPropData[icc.itgPropoccurrence];
                }
                // validate the occurrence
                let ipmdDataOccurrence = 1;
                if (valIsArray) {
                    ipmdDataOccurrence = ipmdPropValue.length;
                }
                if (propoccurrence === icc.itgPropoccurSingle) {
                    if (ipmdDataOccurrence > 1) {
                        ipmdPropValue = ipmdPropValue[0];
                        ipmdDataOccurrence = 1;
                    }
                }
                // datatype "string"
                if (datatype === icc.itgDtString &&
                    propoccurrence === icc.itgPropoccurSingle &&
                    typeof ipmdPropValue === "string") {
                    const ipmdPropValueStr = ipmdPropValue.toString();
                    if (ipmdPropValueStr.indexOf(icc.anyPlusBaseUrl) === 0) {
                        etPropValue = valmap.ipmdToEt(ipmdPropValueStr);
                    }
                    else
                        etPropValue = ipmdPropValueStr;
                }
                if (datatype === icc.itgDtString &&
                    propoccurrence === icc.itgPropoccurMulti &&
                    valIsArray) {
                    etPropValue = ipmdPropValue;
                }
                // datatype "string" + dataformat date-time
                if (datatype === icc.itgDtString &&
                    dataformat === icc.itgDfDt &&
                    propoccurrence === icc.itgPropoccurSingle &&
                    typeof ipmdPropValue === "string") {
                    etPropValue = util1.xmpIsoDatetime2etDatetime(ipmdPropValue);
                }
                // datatype "number"
                if (datatype === icc.itgDtNumber &&
                    propoccurrence === icc.itgPropoccurSingle &&
                    typeof ipmdPropValue === "number") {
                    etPropValue = ipmdPropValue;
                }
                if (datatype === icc.itgDtNumber &&
                    propoccurrence === icc.itgPropoccurMulti &&
                    valIsArray) {
                    etPropValue = ipmdPropValue;
                }
                // datatype "struct" + dataformat = 'AltLang'
                if (datatype === icc.itgDtStruct &&
                    dataformat === icc.itgDfAlg &&
                    propoccurrence === icc.itgPropoccurSingle &&
                    typeof ipmdPropValue === "string") {
                    const ipmdPropValueStr = ipmdPropValue.toString();
                    const altLangStartIdx = ipmdPropValueStr.indexOf("{@");
                    if (altLangStartIdx > -1) {
                        const ipmdPropValues = ipmdPropValueStr.split("{@");
                        ipmdPropValues.forEach((altstring) => {
                            if (altstring.indexOf("}") > -1) {
                                altLangActive = true;
                            }
                        });
                        etPropValue = ipmdPropValues;
                    }
                    else
                        etPropValue = ipmdPropValue;
                }
                if (datatype === icc.itgDtStruct &&
                    dataformat === icc.itgDfAlg &&
                    propoccurrence === icc.itgPropoccurMulti &&
                    valIsArray) {
                    etPropValue = ipmdPropValue;
                }
                // datatype "struct" + dataformat != 'AltLang'
                if (datatype === icc.itgDtStruct &&
                    dataformat !== icc.itgDfAlg &&
                    propoccurrence === icc.itgPropoccurSingle &&
                    typeof ipmdPropValue === "object") {
                    etPropValue = this._generateExiftoolJsonStruct(thisPropPath, dataformat, propoccurrence, ipmdDataOccurrence)[0];
                }
                if (datatype === icc.itgDtStruct &&
                    dataformat !== icc.itgDfAlg &&
                    propoccurrence === icc.itgPropoccurMulti &&
                    valIsArray) {
                    etPropValue = this._generateExiftoolJsonStruct(thisPropPath, dataformat, propoccurrence, ipmdDataOccurrence);
                }
                if (refPropData.hasOwnProperty(icc.itgEtTag)) {
                    if (etPropValue !== undefined) {
                        if (altLangActive) {
                            etPropValue.forEach((altstring) => {
                                const langEndIdx = altstring.indexOf("}");
                                if (langEndIdx === -1) {
                                    etJsonStruct[refPropData[icc.itgEtTag]] = altstring;
                                }
                                if (langEndIdx > -1) {
                                    const langid = altstring.substring(0, langEndIdx);
                                    etJsonStruct[refPropData[icc.itgEtTag] + "-" + langid] =
                                        altstring.substring(langEndIdx + 1);
                                }
                            });
                        }
                        else
                            etJsonStruct[refPropData[icc.itgEtTag]] = etPropValue;
                    }
                }
            }
            etJsonStructArr.push(etJsonStruct);
        }
        return etJsonStructArr;
    }
    // eo _generateExiftoolJsonStruct
    // ============= I N T E R N A L   H E L P E R   M E T H O D S    ===================
    /**
     * Loads the IPTC Photo Metadata Reference document from a JSON file.
     * For class-internal use only.
     */
    static _loadIpmdRefJson(ipmdRefFp) {
        if (!fs_1.default.existsSync(ipmdRefFp))
            return {};
        return util1.loadFromJson(ipmdRefFp);
    }
}
exports.IpmdSetter = IpmdSetter;
//# sourceMappingURL=ipmdsetter.js.map