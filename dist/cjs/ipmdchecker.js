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
exports.IpmdChecker = exports.CompareResultRow = exports.CompareOptions = void 0;
const fs_1 = __importDefault(require("fs"));
const validator_1 = __importDefault(require("validator"));
const icc = __importStar(require("./constants"));
const incommon_1 = require("./incommon");
const util1 = __importStar(require("./utilities1"));
const fixed_structure_data_1 = __importDefault(require("./fixed_structure_data"));
/**
 * Options for comparing two results of IpmdChecker
 */
class CompareOptions {
    constructor() {
        this.mergeXmpIimRows = false;
    }
}
exports.CompareOptions = CompareOptions;
/**
 * Class with a structure holding the result of comparing a property across two images
 */
class CompareResultRow {
    constructor() {
        this.result = ""; // see icc.cmpgRC...
        this.message = "";
        this.comparedNamePath = "";
        this.comparedIpmdIdPath = "";
        this.comparedValueFormat = ""; // XMP or IIM
        this.refValue = "";
        this.testValue = "";
        this.dispparam1 = ""; // parameters for displaying the results, can be used outside the IPTC PMD Checker
        this.dispparam2 = "";
        this.dispparam3 = "";
    }
}
exports.CompareResultRow = CompareResultRow;
/**
 * Class for checking if IPTC Photo Metadata embedded into an image file: do they comply to the IPTC Standard and are existing XMP/IIM and Exif values in sync.
 */
class IpmdChecker {
    /**
     * Constructor of the IpmdChecker class
     * @param iptcPmdTechRefDocFp File path of the JSON file with the IPTC PMD TechReference data
     * @param ipmdCheckerResultTemplateFp File path of the JSON file with the IPTC PMD State Data template
     */
    constructor(iptcPmdTechRefDocFp, ipmdCheckerResultTemplateFp) {
        this.fsdLsep = "/";
        this.fsdIsel = "#";
        this._readyToCheck = false;
        this.ipmdRef = IpmdChecker._loadIpmdRefJson(iptcPmdTechRefDocFp);
        this._ipmdStateDataTempl = IpmdChecker._loadIpmdStateDataTemplate(ipmdCheckerResultTemplateFp);
        this._ipmdStateData = new fixed_structure_data_1.default(this._ipmdStateDataTempl, true);
        this._ipmdValueData = {};
        this._errmsgs = [];
        this._testEtJsonFp = "";
        this._lsep = "/";
    }
    // Setters and Getters ****************************************************
    /**
     * Sets value of the file path for the ExifTool JSON file.
     * Is required by some methods.
     * @param value
     */
    set testEtJsonFp(value) {
        this._testEtJsonFp = value;
    }
    get readyToCheck() {
        return this._readyToCheck;
    }
    /**
     * Returns all TechReference data about a top level IPTC PMD property
     * @param propertyId identifier of the property as defined for the reference data
     */
    getIpmdTopPropertyData(propertyId) {
        if (propertyId === "") {
            return {};
        }
        const iptcTop = this.ipmdRef["ipmd_top"];
        if (iptcTop.hasOwnProperty(propertyId)) {
            return iptcTop[propertyId];
        }
        else {
            return {};
        }
    }
    /**
     * Returns all TechReference data about an IPTC PMD structure
     * @param structId identifier of the structure as defined for the reference data
     */
    getIpmdStructData(structId) {
        if (structId === "") {
            return {};
        }
        const iptcStruct = this.ipmdRef["ipmd_struct"];
        if (iptcStruct.hasOwnProperty(structId)) {
            return iptcStruct[structId];
        }
        else {
            return {};
        }
    }
    // ********************************
    // M E T H O D S
    /**
     * Loads the JSON file with photo metadata as provided by ExifTool and returns it as object.
     * If an error occurs the object is empty.
     */
    loadTestEtJson() {
        if (!fs_1.default.existsSync(this._testEtJsonFp))
            return {};
        const stringdata = fs_1.default.readFileSync(this._testEtJsonFp, {
            encoding: "utf-8",
        });
        let testdata;
        try {
            testdata = JSON.parse(stringdata);
        }
        catch (e) {
            return {};
        }
        if (testdata.length > 0)
            return testdata[0];
        else
            return {};
    }
    // ==================================================================================
    // C H E C K E R  methods
    /**
     * Checks the photo metadata of a test image based on
     *   the properties defined by the IPTC PMD Standard
     * @param imgEtPmdInput - object with photo metadata as provided by ExifTool
     * @param compareValues - "true" = if XMP and IIM values exist they are compared
     * @param countOccurrences - "true" = if the XMP value may occur mulitple times: the occurrences are counted
     * @param anyOtherDataRef - object referencing any non-IPTC (meta)data in the ExifTool object
     * @returns Instance of the ipmdCheckerResult
     */
    checkIpmdStd(imgEtPmdInput = {}, compareValues = false, countOccurrences = false, anyOtherDataRef = {}) {
        // prerequisites
        let testImgEtPmd;
        if (util1.objectIsEmpty(imgEtPmdInput)) {
            testImgEtPmd = this.loadTestEtJson();
            if (util1.objectIsEmpty(testImgEtPmd)) {
                const errmsg = {
                    propId: "NA",
                    propName: "Generic processing",
                    msg: "No metadata read by Exiftool can be loaded into the Metadata Engine",
                };
                return {
                    procstate: incommon_1.ProcState.ProcErr,
                    state: {},
                    value: {},
                    errormsgs: [errmsg],
                };
            }
        }
        else {
            testImgEtPmd = imgEtPmdInput;
        }
        if (util1.objectIsEmpty(testImgEtPmd)) {
            const errmsg = {
                propId: "NA",
                propName: "Generic processing",
                msg: "The metadata object read by ExifTool is empty",
            };
            return {
                procstate: incommon_1.ProcState.PmdErr,
                state: {},
                value: {},
                errormsgs: [errmsg],
            };
            // return {procstate: ProcState.PmdErr, state: {}, value: {}, errormsgs: [] };
        }
        this._ipmdStateData = new fixed_structure_data_1.default(this._ipmdStateDataTempl);
        this._ipmdValueData = {};
        this._checkReadyToCheck();
        if (!this._readyToCheck) {
            const errmsg = {
                propId: "NA",
                propName: "Generic processing",
                msg: "The IPTC Photo Metadata Engine is currently not Ready-to-Check - processing cancelled.",
            };
            return {
                procstate: incommon_1.ProcState.ProcErr,
                state: {},
                value: {},
                errormsgs: [errmsg],
            };
        }
        // start checking
        let dtTestval;
        const refIpmdTop = this.ipmdRef[icc.itgIpmdTop];
        /****************************************************************
         * Iterate all properties of the reference ipmd_top
         *   = top level properties
         */
        for (const refPropId in refIpmdTop) {
            let xmpValue;
            let iimValue;
            let exifValue;
            const propVresult = {};
            const refPropData = refIpmdTop[refPropId];
            const etXmpId = refPropData[icc.itgEtXmp];
            const datatype = refPropData[icc.itgDatatype];
            /***
             Check for XMP, IIM and Exif properties
             */
            /*** check for XMP property */
            if (testImgEtPmd.hasOwnProperty(etXmpId)) {
                this._ipmdStateData.setFsData(1, refPropId +
                    this._lsep +
                    icc.ipmdcrSData +
                    this._lsep +
                    icc.ipmdcrSDxmp);
                if (datatype === icc.itgDtStruct) {
                    const structureId = refPropData[icc.itgDataformat];
                    if (structureId !== icc.itgDfAlg) {
                        const structureTestValue = testImgEtPmd[etXmpId];
                        const checkStructProcresult = this._checkIpmdStdStruct(refPropId, structureId, structureTestValue, countOccurrences);
                        switch (checkStructProcresult.procstate) {
                            case incommon_1.ProcState.ProcErr:
                                return {
                                    procstate: incommon_1.ProcState.ProcErr,
                                    state: {},
                                    value: {},
                                    errormsgs: this._errmsgs,
                                };
                        }
                        if (checkStructProcresult.procstate === incommon_1.ProcState.OK) {
                            const checkStructVresult = checkStructProcresult.procresult;
                            if (!util1.objectIsEmpty(checkStructVresult)) {
                                propVresult[icc.itgDtStruct] = checkStructVresult;
                                if (countOccurrences) {
                                    if (Array.isArray(checkStructVresult)) {
                                        this._ipmdStateData.setFsData(checkStructVresult.length, refPropId +
                                            this._lsep +
                                            icc.ipmdcrSData +
                                            this._lsep +
                                            icc.ipmdcrSDvaloccur);
                                    }
                                    else {
                                        this._ipmdStateData.setFsData(1, refPropId +
                                            this._lsep +
                                            icc.ipmdcrSData +
                                            this._lsep +
                                            icc.ipmdcrSDvaloccur);
                                    }
                                }
                            }
                        }
                    }
                    else {
                        // AltLang property
                        xmpValue = this._buildAltLangValue(testImgEtPmd, etXmpId);
                        propVresult[icc.ipmdcrVxmp] = xmpValue;
                        if (countOccurrences) {
                            if (Array.isArray(xmpValue)) {
                                this._ipmdStateData.setFsData(xmpValue.length, refPropId +
                                    this._lsep +
                                    icc.ipmdcrSData +
                                    this._lsep +
                                    icc.ipmdcrSDvaloccur);
                            }
                            else {
                                this._ipmdStateData.setFsData(1, refPropId +
                                    this._lsep +
                                    icc.ipmdcrSData +
                                    this._lsep +
                                    icc.ipmdcrSDvaloccur);
                            }
                        }
                    }
                }
                else {
                    // datatype is NOT a structure
                    xmpValue = this._normalizePropValue(testImgEtPmd[etXmpId], datatype, refPropId);
                    propVresult[icc.ipmdcrVxmp] = xmpValue;
                    if (countOccurrences) {
                        if (Array.isArray(xmpValue)) {
                            this._ipmdStateData.setFsData(xmpValue.length, refPropId +
                                this._lsep +
                                icc.ipmdcrSData +
                                this._lsep +
                                icc.ipmdcrSDvaloccur);
                        }
                        else {
                            this._ipmdStateData.setFsData(1, refPropId +
                                this._lsep +
                                icc.ipmdcrSData +
                                this._lsep +
                                icc.ipmdcrSDvaloccur);
                        }
                    }
                }
            }
            /*** check for IIM data set */
            if (refPropData.hasOwnProperty(icc.itgEtIim)) {
                const etIimId = refPropData[icc.itgEtIim];
                if (etIimId === "IPTC:DateCreated+IPTC:TimeCreated") {
                    if (testImgEtPmd.hasOwnProperty("IPTC:DateCreated") &&
                        testImgEtPmd.hasOwnProperty("IPTC:TimeCreated")) {
                        this._ipmdStateData.setFsData(1, refPropId +
                            this._lsep +
                            icc.ipmdcrSData +
                            this._lsep +
                            icc.ipmdcrSDiim);
                        propVresult[icc.ipmdcrViim] =
                            testImgEtPmd["IPTC:DateCreated"] +
                                " " +
                                testImgEtPmd["IPTC:TimeCreated"];
                        iimValue =
                            testImgEtPmd["IPTC:DateCreated"] +
                                " " +
                                testImgEtPmd["IPTC:TimeCreated"];
                    }
                }
                if (testImgEtPmd.hasOwnProperty(etIimId)) {
                    this._ipmdStateData.setFsData(1, refPropId +
                        this._lsep +
                        icc.ipmdcrSData +
                        this._lsep +
                        icc.ipmdcrSDiim);
                    if (etIimId === "IPTC:By-line") {
                        const tempIimValue = [];
                        tempIimValue.push(this._normalizePropValue(testImgEtPmd[etIimId], datatype, refPropId));
                        propVresult[icc.ipmdcrViim] = tempIimValue;
                        iimValue = tempIimValue;
                    }
                    else {
                        iimValue = this._normalizePropValue(testImgEtPmd[etIimId], datatype, refPropId);
                        propVresult[icc.ipmdcrViim] = iimValue;
                    }
                }
            }
            /*** Check for Exif Tags */
            /** IPTC/Exif mapped properties as of 2024-01 (with Exif 3.0 as background
               Copyright Notice: Copyright/33432/0x8298 // et: IFD0:Copyright
               Creator: Artist/315/0x013B // et: IFD0:Artist
               DateCreated: special mapping as different structures are used, see below
               Description: ImageDescription/270/0x010E et: IFD0:ImageDescription
               Exif 3.0:
               Contributor/ImageEditor:
               DigitalImageGUID: ImageUniqueID/42016/0xA420
               re Creator: Photographer/42039/0xA437
               Contributor w Content Editor role: ImageEditor/42040/0xA438
      
             */
            if (refPropData.hasOwnProperty(icc.itgEtExif)) {
                const etExifId = refPropData[icc.itgEtExif];
                let exifDataSet = false; // changed to true if any Exif data value is set
                /** Check Exif tags regarding IPTC's Date Created */
                // special case: combine Date Created from multiple Exif tags, subSeconds supported
                if (etExifId === "ExifIFD:DateTimeOriginal+ExifIFD:OffsetTimeOriginal") {
                    if (testImgEtPmd.hasOwnProperty("ExifIFD:DateTimeOriginal")) {
                        this._ipmdStateData.setFsData(1, refPropId +
                            this._lsep +
                            icc.ipmdcrSData +
                            this._lsep +
                            icc.ipmdcrSDexif);
                        let tzOffset = "";
                        if (testImgEtPmd.hasOwnProperty("ExifIFD:OffsetTimeOriginal")) {
                            tzOffset = testImgEtPmd["ExifIFD:OffsetTimeOriginal"];
                        }
                        propVresult[icc.ipmdcrVexif] =
                            testImgEtPmd["ExifIFD:DateTimeOriginal"] + tzOffset;
                        exifValue = testImgEtPmd["ExifIFD:DateTimeOriginal"] + tzOffset;
                        exifDataSet = true;
                    }
                }
                if (etExifId ===
                    "ExifIFD:DateTimeOriginal+ExifIFD:SubSecTimeOriginal+ExifIFD:OffsetTimeOriginal") {
                    if (testImgEtPmd.hasOwnProperty("ExifIFD:DateTimeOriginal")) {
                        this._ipmdStateData.setFsData(1, refPropId +
                            this._lsep +
                            icc.ipmdcrSData +
                            this._lsep +
                            icc.ipmdcrSDexif);
                        let subSeconds = "";
                        if (testImgEtPmd.hasOwnProperty("ExifIFD:SubSecTimeOriginal")) {
                            subSeconds = testImgEtPmd["ExifIFD:SubSecTimeOriginal"];
                        }
                        let tzOffset = "";
                        if (testImgEtPmd.hasOwnProperty("ExifIFD:OffsetTimeOriginal")) {
                            tzOffset = testImgEtPmd["ExifIFD:OffsetTimeOriginal"];
                        }
                        propVresult[icc.ipmdcrVexif] =
                            testImgEtPmd["ExifIFD:DateTimeOriginal"] + subSeconds + tzOffset;
                        exifValue =
                            testImgEtPmd["ExifIFD:DateTimeOriginal"] + subSeconds + tzOffset;
                        exifDataSet = true;
                    }
                }
                /* reactivated in 2024-01 // retired 2022-09-02 as agreed with CIPA */
                /** Check Exif tag regarding IPTC's Description */
                if (etExifId === "IFD0:ImageDescription") {
                    if (testImgEtPmd.hasOwnProperty("IFD0:ImageDescription")) {
                        // try ImageDescription first ...
                        this._ipmdStateData.setFsData(1, refPropId +
                            this._lsep +
                            icc.ipmdcrSData +
                            this._lsep +
                            icc.ipmdcrSDexif);
                        propVresult[icc.ipmdcrVexif] =
                            testImgEtPmd["IFD0:ImageDescription"];
                        exifValue = testImgEtPmd["IFD0:ImageDescription"];
                        exifDataSet = true;
                    }
                }
                // Check Exif tags regarding IPTC's Copyright Notice
                if (etExifId === "IFD0:Copyright") {
                    if (testImgEtPmd.hasOwnProperty("IFD0:Copyright")) {
                        this._ipmdStateData.setFsData(1, refPropId +
                            this._lsep +
                            icc.ipmdcrSData +
                            this._lsep +
                            icc.ipmdcrSDexif);
                        propVresult[icc.ipmdcrVexif] = testImgEtPmd["IFD0:Copyright"];
                        exifValue = testImgEtPmd["IFD0:Copyright"];
                        exifDataSet = true;
                    }
                }
                /** Check Exif tags regarding IPTC's Creator */
                // special case: Exif Tag Artist, make its value a single item array to compare properly
                if (etExifId === "IFD0:Artist") {
                    if (testImgEtPmd.hasOwnProperty(etExifId)) {
                        const tempExifValue = [];
                        tempExifValue.push(testImgEtPmd[etExifId]);
                        propVresult[icc.ipmdcrVexif] = tempExifValue;
                        exifValue = tempExifValue;
                        exifDataSet = true;
                        this._ipmdStateData.setFsData(1, refPropId +
                            this._lsep +
                            icc.ipmdcrSData +
                            this._lsep +
                            icc.ipmdcrSDexif);
                    }
                }
                // Check Exif tags regarding IPTC's Digital Image GUID
                if (etExifId === "ExifIFD:ImageUniqueID") {
                    if (testImgEtPmd.hasOwnProperty("ExifIFD:ImageUniqueID")) {
                        const exifImgUID = testImgEtPmd["ExifIFD:ImageUniqueID"];
                        if (validator_1.default.isUUID(exifImgUID, 4)) {
                            this._ipmdStateData.setFsData(1, refPropId +
                                this._lsep +
                                icc.ipmdcrSData +
                                this._lsep +
                                icc.ipmdcrSDexif);
                            propVresult[icc.ipmdcrVexif] =
                                testImgEtPmd["ExifIFD:ImageUniqueID"];
                            exifValue = testImgEtPmd["ExifIFD:ImageUniqueID"];
                            exifDataSet = true;
                        }
                    }
                }
                /** finally, if no Exif data is set yet*/
                if (!exifDataSet && testImgEtPmd.hasOwnProperty(etExifId)) {
                    this._ipmdStateData.setFsData(1, refPropId +
                        this._lsep +
                        icc.ipmdcrSData +
                        this._lsep +
                        icc.ipmdcrSDexif);
                    propVresult[icc.ipmdcrVexif] = testImgEtPmd[etExifId];
                    exifValue = testImgEtPmd[etExifId];
                }
            }
            this._ipmdValueData[refPropId] = propVresult;
            /***
             Comparing values of found XMP, IIM and Exif properties
      
             Compares only if no errors were found during getting property values
             */
            if (compareValues && this._errmsgs.length === 0) {
                /** Compare XMP and IIM --> sync1 */
                if (xmpValue !== undefined && iimValue !== undefined) {
                    let xmpIimAreEqual = false;
                    if (Array.isArray(xmpValue) && Array.isArray(iimValue)) {
                        switch (refPropId) {
                            case "subjectCodes":
                                let valequ = true;
                                for (let idx = 0; idx < xmpValue.length; idx++) {
                                    if (typeof iimValue[idx] !== "string") {
                                        valequ = false;
                                        break;
                                    }
                                    const scode = xmpValue[idx];
                                    const iimtestval = "IPTC:" + scode;
                                    if (iimValue[idx] !== iimtestval) {
                                        valequ = false;
                                    }
                                }
                                xmpIimAreEqual = valequ;
                                break;
                            default:
                                xmpIimAreEqual = util1.arraysEqual(xmpValue, iimValue);
                                break;
                        }
                    }
                    else {
                        if (!Array.isArray(xmpValue) && !Array.isArray(iimValue)) {
                            switch (refPropId) {
                                case "dateCreated":
                                    let xmptestval = xmpValue;
                                    if (xmptestval.includes("Z")) {
                                        xmptestval =
                                            xmptestval.substring(0, xmptestval.length) + "+00:00";
                                    }
                                    xmpIimAreEqual = xmptestval === iimValue;
                                    break;
                                case "intellectualGenre":
                                    xmpIimAreEqual = "000:" + xmpValue === iimValue;
                                    if (!xmpIimAreEqual)
                                        xmpIimAreEqual = xmpValue === iimValue; // "old" variant accepted for backward compatibility
                                    break;
                                default:
                                    xmpIimAreEqual = xmpValue === iimValue;
                                    break;
                            }
                        }
                    }
                    if (xmpIimAreEqual) {
                        this._ipmdStateData.setFsData(1, refPropId +
                            this._lsep +
                            icc.ipmdcrSData +
                            this._lsep +
                            icc.ipmdcrSDinsync);
                        if (exifValue !== undefined) {
                            let iptcExifAreEqual = false;
                            if (Array.isArray(xmpValue) && Array.isArray(exifValue)) {
                                iptcExifAreEqual = util1.arraysEqual(xmpValue, exifValue);
                            }
                            else {
                                if (!Array.isArray(xmpValue) && !Array.isArray(exifValue)) {
                                    iptcExifAreEqual = xmpValue === exifValue;
                                }
                            }
                            if (iptcExifAreEqual) {
                                this._ipmdStateData.setFsData(1, refPropId +
                                    this._lsep +
                                    icc.ipmdcrSData +
                                    this._lsep +
                                    icc.ipmdcrSDmapinsync);
                            }
                            else {
                                this._ipmdStateData.setFsData(0, refPropId +
                                    this._lsep +
                                    icc.ipmdcrSData +
                                    this._lsep +
                                    icc.ipmdcrSDmapinsync);
                            }
                        }
                    }
                    else {
                        this._ipmdStateData.setFsData(0, refPropId +
                            this._lsep +
                            icc.ipmdcrSData +
                            this._lsep +
                            icc.ipmdcrSDinsync);
                    }
                }
                else {
                    // else -> either xmpValue or iimValue is undefined, no sync1 comparing
                    if (xmpValue !== undefined && exifValue !== undefined) {
                        // XMP and Exif have a value:
                        let iptcExifAreEqual = false;
                        if (Array.isArray(xmpValue) && Array.isArray(exifValue)) {
                            iptcExifAreEqual = util1.arraysEqual(xmpValue, exifValue);
                        }
                        else {
                            if (!Array.isArray(xmpValue) && !Array.isArray(exifValue)) {
                                iptcExifAreEqual = xmpValue === exifValue;
                            }
                        }
                        if (iptcExifAreEqual) {
                            this._ipmdStateData.setFsData(1, refPropId +
                                this._lsep +
                                icc.ipmdcrSData +
                                this._lsep +
                                icc.ipmdcrSDmapinsync);
                        }
                        else {
                            this._ipmdStateData.setFsData(0, refPropId +
                                this._lsep +
                                icc.ipmdcrSData +
                                this._lsep +
                                icc.ipmdcrSDmapinsync);
                        }
                    }
                }
            }
        }
        // Retrieve special anyOtherData
        for (const refPropId in anyOtherDataRef) {
            const anyOtherDataProp = anyOtherDataRef[refPropId];
            const etTag = anyOtherDataProp[icc.itgEtTag];
            if (etTag !== "") {
                if (testImgEtPmd.hasOwnProperty(etTag)) {
                    const propVresult = {};
                    propVresult[icc.ipmdcrVet] = testImgEtPmd[etTag];
                    this._ipmdValueData[icc.ipmdcrVaodPrefix + etTag] = propVresult;
                }
            }
        }
        // create the check result object
        const checkResult = {
            procstate: incommon_1.ProcState.OK,
            state: {},
            value: {},
            errormsgs: [],
        };
        checkResult.state = this._ipmdStateData.fsData;
        checkResult.value = this._ipmdValueData;
        checkResult.errormsgs = this._errmsgs;
        if (this._errmsgs.length > 0) {
            checkResult.procstate = incommon_1.ProcState.PmdErr;
        }
        return checkResult;
    }
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
    _checkIpmdStdStruct(parentIpmdIdsStr, refstructId, teststructEtPmd, countOccurrences = false, setPmdState = true) {
        if (typeof teststructEtPmd !== "object") {
            const errMsg = {
                propId: parentIpmdIdsStr,
                propName: "",
                msg: "PMD structure is not an object (1)",
            };
            this._errmsgs.push(errMsg);
            return {
                procstate: incommon_1.ProcState.PmdErr,
                procresult: [{}],
            };
        }
        // create an array of test structures, even if only one test structure exists
        let teststructEtPmdArr = [];
        if (Array.isArray(teststructEtPmd)) {
            teststructEtPmdArr = teststructEtPmd;
        }
        else {
            teststructEtPmdArr.push(teststructEtPmd);
        }
        if (typeof teststructEtPmd !== "object") {
            const errMsg = {
                propId: parentIpmdIdsStr,
                propName: "",
                msg: "PMD structure is not an object (2)",
            };
            this._errmsgs.push(errMsg);
            return {
                procstate: incommon_1.ProcState.PmdErr,
                procresult: [{}],
            };
        }
        const parentIpmdIds = parentIpmdIdsStr.split("/");
        let parentStatePath = "";
        if (parentIpmdIds.length < 2) {
            parentStatePath = parentIpmdIdsStr + "/struct/";
        }
        else {
            parentIpmdIds.forEach((pid) => (parentStatePath += pid + "/struct/"));
        }
        const allErrMsg = []; // array will be returned at the bottom
        const structVresultArr = []; // array will be returned at the bottom
        teststructEtPmdArr.forEach((teststructEtPmdOfArr) => {
            const structVresult = {};
            const refIpmdStruct = this.ipmdRef[icc.itgIpmdStruct][refstructId];
            // Iterate all properties of the reference ipmd_struct[refstructId]
            for (const refPropId in refIpmdStruct) {
                if (refPropId === icc.itgSpidAny) {
                    // is a placeholder for zero to many other IPTC properties
                    const anypropVresult = this._checkStructForAnyOtherProp(refIpmdStruct, teststructEtPmdOfArr);
                    const propIds = Object.keys(anypropVresult);
                    for (const propId of propIds) {
                        structVresult[propId] = anypropVresult[propId];
                    }
                    if (setPmdState && propIds.length > 0)
                        this._ipmdStateData.setFsData(1, parentStatePath +
                            refPropId +
                            this._lsep +
                            icc.ipmdcrSData +
                            this._lsep +
                            icc.ipmdcrSDxmp);
                }
                else {
                    // this is a regular IPTC property
                    const propVresult = {};
                    const refPropData = refIpmdStruct[refPropId];
                    const etTag = refPropData[icc.itgEtTag];
                    if (teststructEtPmdOfArr.hasOwnProperty(etTag)) {
                        if (setPmdState) {
                            this._ipmdStateData.setFsData(1, parentStatePath +
                                refPropId +
                                this._lsep +
                                icc.ipmdcrSData +
                                this._lsep +
                                icc.ipmdcrSDxmp);
                        }
                        const datatype = refPropData[icc.itgDatatype];
                        if (datatype === icc.itgDtStruct) {
                            const structureId = refPropData[icc.itgDataformat];
                            if (structureId !== icc.itgDfAlg) {
                                // not an AltLang structure: recursive call of _checkIpmdStdStruct
                                const structureTestValue = teststructEtPmdOfArr[etTag];
                                const parentIpmdIdsStrSub = parentIpmdIdsStr + "/" + refPropId;
                                const checkStructProcresult = this._checkIpmdStdStruct(parentIpmdIdsStrSub, structureId, structureTestValue, countOccurrences);
                                switch (checkStructProcresult.procstate) {
                                    case incommon_1.ProcState.ProcErr:
                                        return {
                                            procstate: incommon_1.ProcState.ProcErr,
                                            procresult: [{}],
                                        };
                                }
                                if (checkStructProcresult.procstate === incommon_1.ProcState.OK) {
                                    const checkStructVresult = checkStructProcresult.procresult;
                                    if (!util1.objectIsEmpty(checkStructVresult)) {
                                        propVresult[icc.itgDtStruct] = checkStructVresult;
                                        // propVresult[icc.itgDtStruct] = checkStructVresult;
                                        if (setPmdState && countOccurrences) {
                                            if (Array.isArray(checkStructVresult)) {
                                                this._ipmdStateData.setFsData(checkStructVresult.length, parentStatePath +
                                                    refPropId +
                                                    this._lsep +
                                                    icc.ipmdcrSData +
                                                    this._lsep +
                                                    icc.ipmdcrSDvaloccur);
                                            }
                                            else {
                                                this._ipmdStateData.setFsData(1, parentStatePath +
                                                    refPropId +
                                                    this._lsep +
                                                    icc.ipmdcrSData +
                                                    this._lsep +
                                                    icc.ipmdcrSDvaloccur);
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                // AltLang property
                                propVresult[icc.ipmdcrVxmp] = this._buildAltLangValue(teststructEtPmdOfArr, etTag);
                                if (setPmdState && countOccurrences) {
                                    if (Array.isArray(teststructEtPmdOfArr[etTag])) {
                                        this._ipmdStateData.setFsData(teststructEtPmdOfArr[etTag].length, parentStatePath +
                                            refPropId +
                                            this._lsep +
                                            icc.ipmdcrSData +
                                            this._lsep +
                                            icc.ipmdcrSDvaloccur);
                                    }
                                    else {
                                        this._ipmdStateData.setFsData(1, parentStatePath +
                                            refPropId +
                                            this._lsep +
                                            icc.ipmdcrSData +
                                            this._lsep +
                                            icc.ipmdcrSDvaloccur);
                                    }
                                }
                            }
                        }
                        else {
                            // datatype: not a structure
                            propVresult[icc.ipmdcrVxmp] = this._normalizePropValue(teststructEtPmdOfArr[etTag], datatype, parentIpmdIdsStr + "/" + refPropId);
                            if (setPmdState && countOccurrences) {
                                if (Array.isArray(teststructEtPmdOfArr[etTag])) {
                                    this._ipmdStateData.setFsData(teststructEtPmdOfArr[etTag].length, parentStatePath +
                                        refPropId +
                                        this._lsep +
                                        icc.ipmdcrSData +
                                        this._lsep +
                                        icc.ipmdcrSDvaloccur);
                                }
                                else {
                                    this._ipmdStateData.setFsData(1, parentStatePath +
                                        refPropId +
                                        this._lsep +
                                        icc.ipmdcrSData +
                                        this._lsep +
                                        icc.ipmdcrSDvaloccur);
                                }
                            }
                        }
                    }
                    structVresult[refPropId] = propVresult;
                }
            }
            structVresultArr.push(structVresult);
        });
        return {
            procstate: incommon_1.ProcState.OK,
            procresult: structVresultArr,
        };
    }
    // ==================================================================================
    // P R O C E S S   "A N Y   P R O P E R T Y"  methods
    /**
     * Check a structure if it has any other property than those defined by the
     *    IPTC PMD standard
     * @param refIpmdStruct Data about the to-be-checked structure from the TechReference
     * @param teststructEtPmd Data of the to-be-checked structure from the ExifTool output
     * @returns A metadata structure including found "other properties"
     * @private
     */
    _checkStructForAnyOtherProp(refIpmdStruct, teststructEtPmd) {
        const etTagsInRefStruct = this._getEtTagsOfStruct(refIpmdStruct);
        const structVresult = {};
        for (const etTag in teststructEtPmd) {
            if (etTagsInRefStruct.includes(etTag))
                continue; // sort out regular properties
            let subpropIpmdId = "";
            if (etTag in this.ipmdRef[icc.itgEtTonopre]) {
                if (icc.itgIpmdid in this.ipmdRef[icc.itgEtTonopre][etTag]) {
                    subpropIpmdId = this.ipmdRef[icc.itgEtTonopre][etTag][icc.itgIpmdid];
                }
            }
            if (subpropIpmdId === "")
                continue; // no IPTC property id found
            const etValue = teststructEtPmd[etTag];
            const checkResult = this._checkSubpropByEtTag(etTag, etValue);
            if (checkResult != null) {
                structVresult[subpropIpmdId] = checkResult;
            }
        }
        return structVresult;
    }
    // ==================================================================================
    // C H E C K  B Y  E T T A G methods
    /**
     * Check "sub-properties" (property inside a structure) by it ExifTool tag
     *   and not by its IPTC spec identifier
     * @param etTag ExifTool tag of the to-be-checked property
     * @param etValue Value of the property as delivered by ExifTool
     * @returns A metadata structure of the checked property
     * @private
     */
    _checkSubpropByEtTag(etTag, etValue) {
        // Search for Ipmd-Top property with this EtTag, if not found return nothing
        const refEtTopNoprefix = this.ipmdRef[icc.itgEtTonopre];
        if (!refEtTopNoprefix.hasOwnProperty(etTag)) {
            return {};
        }
        const subpropIpmdId = refEtTopNoprefix[etTag][icc.itgIpmdid];
        // Process the IPMD-Top property, XMP only as only XMP has sub-properties
        //    if the datatype is structure: process the structure
        const propVresult = {};
        const refPropData = this.ipmdRef[icc.itgIpmdTop][subpropIpmdId];
        const datatype = refPropData[icc.itgDatatype];
        if (datatype === icc.itgDtStruct) {
            const structureId = refPropData[icc.itgDataformat];
            if (structureId !== icc.itgDfAlg) {
                // not an AltLang structure: recursive call of _checkIpmdStdStruct
                const structureTestValue = etValue;
                const checkStructProcresult = this._checkIpmdStdStruct(subpropIpmdId, structureId, structureTestValue, true, false);
                switch (checkStructProcresult.procstate) {
                    case incommon_1.ProcState.ProcErr:
                        return {
                            procstate: incommon_1.ProcState.ProcErr,
                            procresult: [{}],
                        };
                }
                if (checkStructProcresult.procstate === incommon_1.ProcState.OK) {
                    const checkStructVresult = checkStructProcresult.procresult;
                    if (!util1.objectIsEmpty(checkStructVresult)) {
                        propVresult[icc.itgDtStruct] = checkStructVresult;
                    }
                }
            }
            else {
                // AltLang property
                propVresult[icc.ipmdcrVxmp] = this._buildAltLangValue(etValue, etTag);
            }
        }
        else {
            // datatype: not a structure
            propVresult[icc.ipmdcrVxmp] = this._normalizePropValue(etValue, datatype, subpropIpmdId);
        }
        return propVresult;
    }
    // ==================================================================================
    // C O M P A R E   R E S U L T S methods
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
    compareIpmdCheckerResults(resultRef, resultTest, ipmdIdFilter, compareOptions) {
        const refDataValue = resultRef.value;
        let refValueIpmdIds = [];
        const refValueIpmdIdsPre = Object.keys(refDataValue);
        if (ipmdIdFilter.length === 0) {
            refValueIpmdIds = refValueIpmdIdsPre;
        }
        else {
            refValueIpmdIdsPre.forEach(function (ipmdId) {
                if (ipmdIdFilter.includes(ipmdId)) {
                    refValueIpmdIds.push(ipmdId);
                }
            });
        }
        const refDataValueFsd = new fixed_structure_data_1.default(refDataValue, false);
        const testDataValue = resultTest.value;
        const testDataValueFsd = new fixed_structure_data_1.default(testDataValue, false);
        const compareResultRows = []; // this will be returned as result of this method
        // interate across the top level properties in the values of the reference file
        for (let idx = 0; idx < refValueIpmdIds.length; idx++) {
            const refIpmdId = refValueIpmdIds[idx];
            // set data from the formal IPMD reference data
            const shouldValFmts = new XmpIimTwins();
            if (this.ipmdRef[icc.itgIpmdTop][refIpmdId]) {
                if (this.ipmdRef[icc.itgIpmdTop][refIpmdId][icc.itgXmpid])
                    shouldValFmts.xmp = true;
            }
            if (this.ipmdRef[icc.itgIpmdTop][refIpmdId]) {
                if (this.ipmdRef[icc.itgIpmdTop][refIpmdId][icc.itgIimid])
                    shouldValFmts.iim = true;
            }
            const propTestFsd = testDataValueFsd.getFsData(refIpmdId);
            if (propTestFsd[icc.fsdResState] === icc.fsdStErr) {
                const crRow = new CompareResultRow();
                crRow.result = icc.cmpRCpmisg;
                crRow.message = "Test image: MISSING property";
                crRow.comparedIpmdIdPath = refIpmdId;
                compareResultRows.push(crRow);
                break; // quit
            }
            const propTestValue = propTestFsd[icc.fsdResValue];
            // **** test all possible data-properties of this reference-IPTC property
            const propRefFsd = refDataValueFsd.getFsData(refIpmdId);
            if (propRefFsd[icc.fsdResState] !== icc.fsdStFound) {
                console.log(" in compare: Ref property NOT FOUND: " + refIpmdId); // actually should not be the case
                break; // quit
            }
            const xmpCrRow = new CompareResultRow(); // create empty row, will be filled if used
            const iimCrRow = new CompareResultRow(); // create empty row, will be filled if used
            const propRefValue = propRefFsd[icc.fsdResValue];
            // ** compare XMP
            if (icc.ipmdcrVxmp in propRefValue) {
                const propRefValueXmp = propRefValue[icc.ipmdcrVxmp];
                const propTestValueXmp = propTestValue[icc.ipmdcrVxmp];
                if (typeof propRefValueXmp === "string" ||
                    typeof propRefValueXmp === "number") {
                    // this is a single plain value
                    if (icc.ipmdcrVxmp in propTestValue) {
                        if (propRefValueXmp !== propTestValueXmp) {
                            xmpCrRow.result = icc.cmpRCvchngd;
                            xmpCrRow.message = "Test image: XMP value CHANGED";
                            xmpCrRow.comparedIpmdIdPath = refIpmdId; // + this.fsdLsep + 'XMP';
                            xmpCrRow.comparedValueFormat = icc.ipmdcrVxmp;
                            xmpCrRow.comparedNamePath = this._ipmdIdPath2nameSeq(xmpCrRow.comparedIpmdIdPath + this.fsdLsep + icc.ipmdcrVxmp);
                            xmpCrRow.refValue = propRefValueXmp.toString();
                            xmpCrRow.testValue = propTestValueXmp.toString();
                            compareResultRows.push(xmpCrRow);
                        }
                    }
                    else {
                        xmpCrRow.result = icc.cmpRCvmisg;
                        xmpCrRow.message = "Test image: XMP value is MISSING";
                        xmpCrRow.comparedIpmdIdPath = refIpmdId; // + this.fsdLsep + 'XMP';
                        xmpCrRow.comparedValueFormat = icc.ipmdcrVxmp;
                        xmpCrRow.comparedNamePath = this._ipmdIdPath2nameSeq(xmpCrRow.comparedIpmdIdPath + this.fsdLsep + icc.ipmdcrVxmp);
                        xmpCrRow.refValue = propRefValueXmp.toString();
                        compareResultRows.push(xmpCrRow);
                    }
                }
                if (Array.isArray(propRefValueXmp)) {
                    // this is an array of values in the reference
                    if (propTestValueXmp === undefined) {
                        xmpCrRow.result = icc.cmpRCvmisg;
                        xmpCrRow.message = "Test image: XMP value is MISSING";
                        xmpCrRow.comparedIpmdIdPath = refIpmdId;
                        xmpCrRow.comparedValueFormat = icc.ipmdcrVxmp;
                        xmpCrRow.comparedNamePath = this._ipmdIdPath2nameSeq(xmpCrRow.comparedIpmdIdPath + this.fsdLsep + icc.ipmdcrVxmp);
                        xmpCrRow.refValue = propRefValueXmp.toString();
                        compareResultRows.push(xmpCrRow);
                    }
                    else {
                        if (Array.isArray(propTestValueXmp)) {
                            // compare the arrays
                            if (!IpmdChecker._arraysAreEqual(propRefValueXmp, propTestValueXmp)) {
                                xmpCrRow.result = icc.cmpRCvchngd;
                                xmpCrRow.message = "Test image: XMP value CHANGED";
                                xmpCrRow.comparedIpmdIdPath = refIpmdId;
                                xmpCrRow.comparedValueFormat = icc.ipmdcrVxmp;
                                xmpCrRow.comparedNamePath = this._ipmdIdPath2nameSeq(xmpCrRow.comparedIpmdIdPath + this.fsdLsep + icc.ipmdcrVxmp);
                                xmpCrRow.refValue = propRefValueXmp.toString();
                                xmpCrRow.testValue = propTestValueXmp.toString();
                                compareResultRows.push(xmpCrRow);
                            }
                        }
                        else {
                            xmpCrRow.result = icc.cmpRCvnotarr;
                            xmpCrRow.message = "Test image: XMP value is NOT AN ARRAY";
                            xmpCrRow.comparedIpmdIdPath = refIpmdId;
                            xmpCrRow.comparedValueFormat = icc.ipmdcrVxmp;
                            xmpCrRow.refValue = "[array of value(s)]";
                            xmpCrRow.testValue = "[a plain value]";
                            xmpCrRow.comparedNamePath = this._ipmdIdPath2nameSeq(xmpCrRow.comparedIpmdIdPath + this.fsdLsep + icc.ipmdcrVxmp);
                            compareResultRows.push(xmpCrRow);
                        }
                    }
                }
            }
            // ** compare IIM
            if (icc.ipmdcrViim in propRefValue) {
                const propRefValueIim = propRefValue[icc.ipmdcrViim];
                const propTestValueIim = propTestValue[icc.ipmdcrViim];
                if (propTestValueIim === undefined) {
                    // no test value exists
                    if (shouldValFmts.iim) {
                        iimCrRow.result = icc.cmpRCvmisg;
                        iimCrRow.message = "Test image: IIM value is MISSING";
                        iimCrRow.comparedIpmdIdPath = refIpmdId;
                        iimCrRow.comparedValueFormat = icc.ipmdcrViim;
                        iimCrRow.comparedNamePath = this._ipmdIdPath2nameSeq(iimCrRow.comparedIpmdIdPath + this.fsdLsep + icc.ipmdcrViim);
                        iimCrRow.refValue = propRefValueIim.toString();
                    }
                }
                else {
                    if (typeof propRefValueIim === "string" ||
                        typeof propRefValueIim === "number") {
                        // this is a single plain value
                        if (icc.ipmdcrViim in propTestValue) {
                            if (propRefValueIim !== propTestValueIim) {
                                iimCrRow.result = icc.cmpRCvchngd;
                                iimCrRow.message = "Test image: IIM value CHANGED";
                                iimCrRow.comparedIpmdIdPath = refIpmdId; // + this.fsdLsep + 'IIM';
                                iimCrRow.comparedValueFormat = icc.ipmdcrViim;
                                iimCrRow.comparedNamePath = this._ipmdIdPath2nameSeq(iimCrRow.comparedIpmdIdPath + this.fsdLsep + icc.ipmdcrViim);
                                iimCrRow.refValue = propRefValueIim.toString();
                                iimCrRow.testValue = propTestValueIim.toString();
                            }
                        }
                        else {
                            iimCrRow.result = icc.cmpRCvmisg;
                            iimCrRow.message = "Test image: IIM value is MISSING";
                            iimCrRow.comparedIpmdIdPath = refIpmdId;
                            iimCrRow.comparedValueFormat = icc.ipmdcrViim;
                            iimCrRow.comparedNamePath = this._ipmdIdPath2nameSeq(iimCrRow.comparedIpmdIdPath + this.fsdLsep + icc.ipmdcrViim);
                            iimCrRow.refValue = propRefValueIim.toString();
                        }
                    }
                    if (Array.isArray(propRefValueIim)) {
                        // this is an array of values in the reference and a test value exists
                        if (Array.isArray(propTestValueIim)) {
                            // compare the arrays
                            if (!IpmdChecker._arraysAreEqual(propRefValueIim, propTestValueIim)) {
                                iimCrRow.result = icc.cmpRCvchngd;
                                iimCrRow.message = "Test image: IIM value CHANGED";
                                iimCrRow.comparedIpmdIdPath = refIpmdId; // + this.fsdLsep + 'IIM';
                                iimCrRow.comparedValueFormat = icc.ipmdcrViim;
                                iimCrRow.comparedNamePath = this._ipmdIdPath2nameSeq(iimCrRow.comparedIpmdIdPath + this.fsdLsep + icc.ipmdcrViim);
                                iimCrRow.refValue = propRefValueIim.toString();
                                iimCrRow.testValue = propTestValueIim.toString();
                            }
                        }
                        else {
                            iimCrRow.result = icc.cmpRCvnotarr;
                            iimCrRow.message = "Test image: IIM value is NOT AN ARRAY";
                            iimCrRow.comparedIpmdIdPath = refIpmdId;
                            iimCrRow.comparedValueFormat = icc.ipmdcrViim;
                            iimCrRow.refValue = "[array of value(s)]";
                            iimCrRow.testValue = "[a plain value]";
                            iimCrRow.comparedNamePath = this._ipmdIdPath2nameSeq(iimCrRow.comparedIpmdIdPath + this.fsdLsep + icc.ipmdcrViim);
                        }
                    }
                }
                /* Below the processing of an IIM CompareResult Row:
                        - any further processing only if the row is used: a .result value MUST exist
                        - if the  mergeXmpIimRows option is set:
                        -- requirement: an xmpCrRow must have set values, at least a .result
                        -- double-check: is the coparedIpmdIdPath the same? = are the rows about the same property
                        -- if the values of the xmp- and iim-row are the same: merge the rows and push it
                        -- if the values are different: issue a warning
                        - if the  mergeXmpIimRows option is NOT set: push the IIM row
                         */
                if (iimCrRow.result !== "") {
                    // a .result MUST be set in a used IIM row --> push it, or merge it
                    if (compareOptions.mergeXmpIimRows) {
                        // option mergeXmpIimRows is active
                        if (xmpCrRow.result !== "") {
                            // a .result MUST be set in a used XMP row
                            if (xmpCrRow.comparedIpmdIdPath === iimCrRow.comparedIpmdIdPath) {
                                // both rows are about the same property ... actually this SHOULD be the case
                                if (xmpCrRow.result === iimCrRow.result) {
                                    // ... and have the same result -> merge
                                    xmpCrRow.message = xmpCrRow.message.replace("XMP", "XMP and IIM");
                                    xmpCrRow.comparedNamePath =
                                        xmpCrRow.comparedNamePath + "+IIM";
                                    if (xmpCrRow.testValue !== iimCrRow.testValue) {
                                        xmpCrRow.testValue =
                                            "XMP: " +
                                                xmpCrRow.testValue +
                                                " | IIM: " +
                                                iimCrRow.testValue;
                                    }
                                }
                                else
                                    compareResultRows.push(iimCrRow); // not the same results, push row
                            }
                            else
                                compareResultRows.push(iimCrRow); // not about the same property, push row
                        }
                        else {
                            // IIM result exists, but not an XMP result
                            if (iimCrRow.result === icc.cmpRCvchngd) {
                                iimCrRow.message += " - but NOT the XMP value!";
                            }
                            else
                                iimCrRow.message += " - NOT the XMP value!";
                            compareResultRows.push(iimCrRow); // no XMP row for this IPTC property is used
                        }
                    }
                    else
                        compareResultRows.push(iimCrRow); // mergeXmpIimRows is not active
                }
                else {
                    // no used IIM row exists
                    if (xmpCrRow.result !== "") {
                        // check if a used XMP row exists = a .result MUST be set
                        if (shouldValFmts.iim) {
                            // check if an IIM row should exist too
                            // Modify the XMP row
                            if (xmpCrRow.result === icc.cmpRCvchngd) {
                                xmpCrRow.message += " - but NOT the IIM value!";
                            }
                            else
                                xmpCrRow.message += " - NOT the IIM value!";
                        }
                    }
                }
            }
            // ** compare a structure in this IPTC property
            if (icc.ipmdcrSStruct in propRefValue) {
                const compareResultStructRows = this._compareIpmdCheckerResultsStruct1(refDataValueFsd, testDataValueFsd, refIpmdId + this.fsdLsep + icc.ipmdcrSStruct, compareOptions);
                if (compareResultStructRows.length > 0) {
                    Array.prototype.push.apply(compareResultRows, compareResultStructRows);
                }
            }
        } // eo iterating across refValueIpmdIds
        return compareResultRows;
    }
    /**
     * Sub-method of compareIpmdCheckerResults. Compares a structure of an IPTC PMD property.
     * The ...Struct1 method sorts out a single value vs. multiple values in an array
     * @param refDataValueFsd Value data of a property of the reference image
     * @param testDataValueFsd Value data of a property of the test image
     * @param thisImpdIdPath Path of this IPTC property Id in the hierarchy of properties
     * @param compareOptions Instance of CompareOptions
     * @returns Array of CompareResultRow
     */
    _compareIpmdCheckerResultsStruct1(refDataValueFsd, testDataValueFsd, thisImpdIdPath, compareOptions) {
        const fsdResult = refDataValueFsd.getFsData(thisImpdIdPath);
        if (fsdResult[icc.fsdResState] !== icc.fsdStFound)
            return [];
        const refDataValue = fsdResult[icc.fsdResValue];
        const compareResultRows = []; // this will be retured as result of this method
        if (Array.isArray(refDataValue)) {
            // multiple occurrences of the structure value in an array
            for (let idx = 0; idx < refDataValue.length; idx++) {
                const thisThisImpdIdPath = thisImpdIdPath + this.fsdIsel + idx.toString();
                const singleCompareResultRows = this._compareIpmdCheckerResultsStruct2(refDataValueFsd, testDataValueFsd, thisThisImpdIdPath, compareOptions);
                Array.prototype.push.apply(compareResultRows, singleCompareResultRows);
            }
        }
        else {
            // a single occurence of the structure value
            const singleCompareResultRows = this._compareIpmdCheckerResultsStruct2(refDataValueFsd, testDataValueFsd, thisImpdIdPath, compareOptions);
            Array.prototype.push.apply(compareResultRows, singleCompareResultRows);
        }
        return compareResultRows;
    }
    /**
     * Sub-method of compareIpmdCheckerResults and of _compareIpmdCheckerResultsStruct1.
     * Compares a single value of or in a structure of an IPTC PMD property.
     * @param refDataValueFsd Value data of a property of the reference image
     * @param testDataValueFsd Value data of a property of the test image
     * @param thisImpdIdPath Path of this IPTC property Id in the hierarchy of properties
     * @param compareOptions Instance of CompareOptions
     * @returns Array of CompareResultRow
     */
    _compareIpmdCheckerResultsStruct2(refDataValueFsd, testDataValueFsd, thisImpdIdPath, compareOptions) {
        const fsdResult = refDataValueFsd.getFsData(thisImpdIdPath);
        if (fsdResult[icc.fsdResState] !== icc.fsdStFound)
            return [];
        const refDataValue = fsdResult[icc.fsdResValue];
        const refValueIpmdIds = Object.keys(refDataValue);
        const compareResultRows = []; // this will be retured as result of this method
        for (let idx = 0; idx < refValueIpmdIds.length; idx++) {
            const refIpmdId = refValueIpmdIds[idx];
            const refIpmdIdPath = thisImpdIdPath + this.fsdLsep + refIpmdId;
            const propTestFsd = testDataValueFsd.getFsData(refIpmdIdPath);
            if (propTestFsd[icc.fsdResState] === icc.fsdStErr) {
                const crRow = new CompareResultRow();
                crRow.message = "Test image: MISSING property";
                crRow.comparedIpmdIdPath = refIpmdIdPath;
                crRow.comparedNamePath = this._ipmdIdPath2nameSeq(crRow.comparedIpmdIdPath);
                compareResultRows.push(crRow);
                break; // quit
            }
            const propTestValue = propTestFsd[icc.fsdResValue];
            // **** iterate across all possible data-properties of this reference-IPTC property
            const propRefFsd = refDataValueFsd.getFsData(refIpmdIdPath);
            if (propRefFsd[icc.fsdResState] !== icc.fsdStFound) {
                console.log(" in compare: Ref property NOT FOUND: " + refIpmdIdPath); // actually should not be the case
                break; // quit
            }
            const propRefValue = propRefFsd[icc.fsdResValue];
            // ** compare XMP
            if (icc.ipmdcrVxmp in propRefValue) {
                const propRefValueXmp = propRefValue[icc.ipmdcrVxmp];
                const propTestValueXmp = propTestValue[icc.ipmdcrVxmp];
                if (typeof propRefValueXmp === "string" ||
                    typeof propRefValueXmp === "number") {
                    // this is a single plain value
                    if (icc.ipmdcrVxmp in propTestValue) {
                        if (propRefValueXmp !== propTestValueXmp) {
                            const crRow = new CompareResultRow();
                            crRow.message = "Test image: XMP value CHANGED";
                            crRow.comparedIpmdIdPath = refIpmdIdPath; // + this.fsdLsep + 'XMP';
                            crRow.comparedValueFormat = icc.ipmdcrVxmp;
                            crRow.comparedNamePath = this._ipmdIdPath2nameSeq(crRow.comparedIpmdIdPath + this.fsdLsep + icc.ipmdcrVxmp);
                            crRow.refValue = propRefValueXmp.toString();
                            crRow.testValue = propTestValueXmp.toString();
                            compareResultRows.push(crRow);
                        }
                    }
                    else {
                        const crRow = new CompareResultRow();
                        crRow.message = "Test image: XMP value is MISSING";
                        crRow.comparedIpmdIdPath = refIpmdIdPath; // + this.fsdLsep + 'XMP';
                        crRow.comparedValueFormat = icc.ipmdcrVxmp;
                        crRow.comparedNamePath = this._ipmdIdPath2nameSeq(crRow.comparedIpmdIdPath + this.fsdLsep + icc.ipmdcrVxmp);
                        crRow.refValue = propRefValueXmp.toString();
                        crRow.comparedNamePath = this._ipmdIdPath2nameSeq(crRow.comparedIpmdIdPath);
                        compareResultRows.push(crRow);
                    }
                }
                if (Array.isArray(propRefValueXmp)) {
                    // this is an array of values in the reference
                    if (propTestValueXmp === undefined) {
                        const crRow = new CompareResultRow();
                        crRow.message = "Test image: XMP value is MISSING";
                        crRow.comparedIpmdIdPath = refIpmdIdPath;
                        crRow.comparedValueFormat = icc.ipmdcrVxmp;
                        crRow.comparedNamePath = this._ipmdIdPath2nameSeq(crRow.comparedIpmdIdPath + this.fsdLsep + icc.ipmdcrVxmp);
                        crRow.refValue = propRefValueXmp.toString();
                        crRow.comparedNamePath = this._ipmdIdPath2nameSeq(crRow.comparedIpmdIdPath);
                        compareResultRows.push(crRow);
                    }
                    else {
                        if (Array.isArray(propTestValueXmp)) {
                            // compare the arrays
                            if (!IpmdChecker._arraysAreEqual(propRefValueXmp, propTestValueXmp)) {
                                const crRow = new CompareResultRow();
                                crRow.message = "Test image: XMP value CHANGED";
                                crRow.comparedIpmdIdPath = refIpmdIdPath; // + this.fsdLsep + 'XMP';
                                crRow.comparedValueFormat = icc.ipmdcrVxmp;
                                crRow.comparedNamePath = this._ipmdIdPath2nameSeq(crRow.comparedIpmdIdPath + this.fsdLsep + icc.ipmdcrVxmp);
                                crRow.refValue = propRefValueXmp.toString();
                                crRow.testValue = propTestValueXmp.toString();
                                compareResultRows.push(crRow);
                            }
                        }
                        else {
                            const crRow = new CompareResultRow();
                            crRow.message = "Test image: XMP value is NOT AN ARRAY";
                            crRow.comparedIpmdIdPath = refIpmdIdPath; // + this.fsdLsep + 'XMP';
                            crRow.comparedValueFormat = icc.ipmdcrVxmp;
                            crRow.refValue = "[array of value(s)]";
                            crRow.testValue = "[a plain value]";
                            crRow.comparedNamePath = this._ipmdIdPath2nameSeq(crRow.comparedIpmdIdPath + this.fsdLsep + icc.ipmdcrVxmp);
                            compareResultRows.push(crRow);
                        }
                    }
                }
            }
            // ** compare a structure in this IPTC property
            if (icc.ipmdcrSStruct in propRefValue) {
                const compareResultStructRows = this._compareIpmdCheckerResultsStruct1(refDataValueFsd, testDataValueFsd, refIpmdId + this.fsdLsep + icc.ipmdcrSStruct, compareOptions);
                if (compareResultStructRows.length > 0) {
                    Array.prototype.push.apply(compareResultRows, compareResultStructRows);
                }
            }
        }
        return compareResultRows;
    }
    // ============= I N T E R N A L   H E L P E R   M E T H O D S    ===================
    /**
     * Loads the IPTC Photo Metadata TechReference document from a JSON file.
     * For class-internal use only.
     */
    static _loadIpmdRefJson(ipmdRefFp) {
        if (!fs_1.default.existsSync(ipmdRefFp))
            return {};
        return util1.loadFromJson(ipmdRefFp);
    }
    /**
     * Loods the template of IPTC PMD state data from a JSON file
     * @param ipmdStateDataTemplFp
     */
    static _loadIpmdStateDataTemplate(ipmdStateDataTemplFp) {
        if (!fs_1.default.existsSync(ipmdStateDataTemplFp)) {
            return {};
        }
        return util1.loadFromJson(ipmdStateDataTemplFp);
    }
    /**
     * Checks if an instance of this class is ready for doing a check and set the property _readyToCheck accordingly
     */
    _checkReadyToCheck() {
        this._readyToCheck =
            !util1.objectIsEmpty(this.ipmdRef) &&
                !util1.objectIsEmpty(this._ipmdStateDataTempl) &&
                !util1.objectIsEmpty(this._ipmdStateData) &&
                util1.objectIsEmpty(this._ipmdValueData);
    }
    /**
     * Compares two arrays, item by item
     * @param array1
     * @param array2
     */
    static _arraysAreEqual(array1, array2) {
        if (array1.length !== array2.length)
            return false;
        if (array1.length === 0)
            return true;
        let isEqual = true;
        for (let idx = 0; idx < array1.length; idx++) {
            if (array1[idx] !== array2[idx])
                isEqual = false;
        }
        return isEqual;
    }
    /**
     * Transforms an FSD ipmdId-path to a corresponding sequence of IPTC PMD property names
     * @param ipmdIdPath
     */
    _ipmdIdPath2nameSeq(ipmdIdPath) {
        const embdFmtIds = [
            icc.ipmdcrVxmp,
            icc.ipmdcrViim,
            icc.ipmdcrVexif,
        ];
        let nameSeq = "";
        let parentStructId = "";
        const impdIdPathParts = ipmdIdPath.split(this.fsdLsep);
        for (let idx = 0; idx < impdIdPathParts.length; idx++) {
            if (embdFmtIds.includes(impdIdPathParts[idx])) {
                nameSeq += "--" + impdIdPathParts[idx];
                break;
            }
            if (impdIdPathParts[idx].startsWith("struct")) {
                const structParts = impdIdPathParts[idx].split(this.fsdIsel);
                parentStructId =
                    this.ipmdRef[icc.itgIpmdTop][impdIdPathParts[idx - 1]][icc.itgDataformat];
                if (structParts.length > 1) {
                    const propIdx = +structParts[1] + 1;
                    nameSeq += "[" + propIdx + "]";
                }
            }
            else {
                // id addresses a property
                let propName = "";
                if (parentStructId === "") {
                    // ... at the top level
                    propName =
                        this.ipmdRef[icc.itgIpmdTop][impdIdPathParts[idx]][icc.itgName];
                }
                else {
                    // ... inside a structure
                    propName =
                        this.ipmdRef[icc.itgIpmdStruct][parentStructId][impdIdPathParts[idx]][icc.itgName];
                }
                if (idx > 0)
                    nameSeq += "--";
                nameSeq += propName;
            }
        }
        return nameSeq;
    }
    /**
     * Builds a single string value from an AltLang value - which may have
     *   values in different languages. This single string follows a format
     *   enabling software to split it up into the strings in different languages
     * @param etJsonData JSON object with the AltLang data
     * @param basicPropId IPTC property Id of the property owning this value
     * @returns A single string with text values in different languages
     * @private
     */
    _buildAltLangValue(etJsonData, basicPropId) {
        let altLangStr = "";
        if (basicPropId in etJsonData) {
            altLangStr = etJsonData[basicPropId];
        }
        else
            return "";
        const etKeys = Object.keys(etJsonData);
        etKeys.forEach((etKey) => {
            if (etKey.startsWith(basicPropId + "-")) {
                const lang = etKey.substring(basicPropId.length + 1);
                altLangStr += "{@" + lang + "}" + etJsonData[etKey];
            }
        });
        return altLangStr;
    }
    /**
     * Normalizes (= transforms) the value(s) of a property to a given data type
     *   Sub-methods deal with a single value and an array of values
     * @param propValue The to-be-normalized value
     * @param shouldbeDatatype The target data type
     * @returns The normalized value
     * @private
     */
    _normalizePropValue(propValue, shouldbeDatatype, propId) {
        if (Array.isArray(propValue)) {
            return this._normalizePropValueArray(propValue, shouldbeDatatype, propId);
        }
        return this._normalizePropSingleValue(propValue, shouldbeDatatype, propId);
    }
    /**
     * Sub-method of _normalizePropValue: normalizes an array of values
     * @param propValueArray
     * @param shouldbeDatatype
     * @param propId
     * @returns The normalized values
     * @private
     */
    _normalizePropValueArray(propValueArray, shouldbeDatatype, propId) {
        if (!Array.isArray(propValueArray)) {
            return propValueArray;
        }
        const retArray = [];
        propValueArray.forEach((anItem) => {
            const normAnItem = this._normalizePropSingleValue(anItem, shouldbeDatatype, propId);
            retArray.push(normAnItem);
        });
        return retArray;
    }
    /**
     * Sub-method of _normalizePropValue: normalizes a single value
     * @param propValue
     * @param shouldbeDatatype
     * @param propId
     * @returns The normalized values
     * @private
     */
    _normalizePropSingleValue(propValue, shouldbeDatatype, propId) {
        if (shouldbeDatatype === icc.itgDtStruct) {
            return propValue;
        }
        if (shouldbeDatatype === icc.itgDtString) {
            return propValue.toString();
        }
        if (shouldbeDatatype === icc.itgDtNumber) {
            if (typeof propValue === "string") {
                if (propValue.indexOf(".") > -1) {
                    let retValue;
                    retValue = parseFloat(propValue);
                    if (isNaN(retValue)) {
                        const errmsg = {
                            propId: propId,
                            propName: "",
                            msg: "The read embedded string value <" +
                                propValue +
                                "> does not represent a number",
                        };
                        this._errmsgs.push(errmsg);
                        retValue = null;
                    }
                    return retValue;
                }
                else {
                    let retValue;
                    retValue = parseInt(propValue, 10);
                    if (isNaN(retValue)) {
                        const errmsg = {
                            propId: propId,
                            propName: "",
                            msg: "The read embedded string value <" +
                                propValue +
                                "> does not represent a number",
                        };
                        this._errmsgs.push(errmsg);
                        retValue = null;
                    }
                    return retValue;
                }
            }
            else
                return propValue;
        }
        return propValue;
    }
    /**
     * Gets all ExifTool tags of properties defined by the IPTC PMD Standard
     *   for a structure
     * @param refIpmdStruct Data of the structure from the IPTC TechReference
     * @returns Array of ExifTool tags
     * @private
     */
    _getEtTagsOfStruct(refIpmdStruct) {
        const etTags = [];
        for (const refPropId in refIpmdStruct) {
            if (refPropId === icc.itgSpidAny)
                continue;
            etTags.push(refIpmdStruct[refPropId][icc.itgEtTag]);
        }
        return etTags;
    }
} // class IpmdChecker
exports.IpmdChecker = IpmdChecker;
/**
 * Special purpose class, helps indicating boolean values of the XMP and the IIM properties
 */
class XmpIimTwins {
    constructor() {
        this.xmp = false;
        this.iim = false;
    }
}
//# sourceMappingURL=ipmdchecker.js.map