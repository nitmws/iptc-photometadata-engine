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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipmdChkResultToPropNodes = exports.Ptype = exports.PropNodesArraysSet1 = exports.Labeltype = exports.OutputDesignOptions = void 0;
const icc = __importStar(require("./constants"));
const util1 = __importStar(require("./utilities1"));
/**
 * Class holds all options relevant for the design of the output
 */
class OutputDesignOptions {
    constructor() {
        this.ipmdfull = false; // IPTC photo metadata, full set of properties
        this.topics = false; // IPTC photo metadata, grouped by User Guide topics
        this.fstds = false; // format standards: XMP, IIM, Exif
        this.isearch1 = false; // metadata properties relevant for search engines
        this.wvalonly = false; // only properties with value are selected (and returned)
    }
}
exports.OutputDesignOptions = OutputDesignOptions;
var Labeltype;
(function (Labeltype) {
    Labeltype[Labeltype["ipmd"] = 0] = "ipmd";
    Labeltype[Labeltype["valuefmt"] = 1] = "valuefmt";
    Labeltype[Labeltype["et"] = 2] = "et";
})(Labeltype = exports.Labeltype || (exports.Labeltype = {}));
class PropNodesArraysSet1 {
    constructor() {
        // Arrays of objects for output of the PMD in different sections of the HTML output
        // for full IPTC PMD design
        this.ipmdFullPna1 = [];
        // for the 'format standards' design
        this.xmpPna = [];
        this.iimPna = [];
        this.exifPna = [];
        // for the 'topics' design
        this.gimgcontPna = [];
        this.personPna = [];
        this.locationPna = [];
        this.othingsPna = [];
        this.rightsPna = [];
        this.licPna = [];
        this.adminPna = [];
        this.imgregPna = [];
        this.anyPnaTopic = [];
        this.noTopicPna = [];
        // for other purposes
        this.schemaorgPna = []; // container of schema.org metadata (property name/value pair objects)
        // any other daata than IPTC photo metadata
        this.anyOtherDataPna = [];
    }
}
exports.PropNodesArraysSet1 = PropNodesArraysSet1;
var Ptype;
(function (Ptype) {
    Ptype[Ptype["plain"] = 0] = "plain";
    Ptype[Ptype["struct"] = 1] = "struct";
})(Ptype = exports.Ptype || (exports.Ptype = {}));
const fsdLsep = '/';
const fsdIsel = '#';
/**
 * Transforms a ipmdchecker result object to pnodes (property nodes)
 * @param ipmdChkResultFsd
 * @param opdOpt
 * @param labeltype
 * @param noValueText
 * @param ipmdIdFilter
 * @param ipmdTechRefFsd
 * @param anyOtherDataRef
 */
function ipmdChkResultToPropNodes(ipmdChkResultFsd, opdOpt, labeltype, noValueText, ipmdIdFilter, ipmdTechRefFsd, anyOtherDataRef) {
    let ipmdDataState = ipmdChkResultFsd.getFsData(icc.stateState)['value'];
    let allPNodesArrays = new PropNodesArraysSet1();
    let statestructIpmdIds = [];
    let statestructIpmdIdsPre = Object.keys(ipmdDataState);
    if (ipmdIdFilter.length == 0) {
        statestructIpmdIds = statestructIpmdIdsPre;
    }
    else {
        statestructIpmdIdsPre.forEach(function (ipmdId) {
            if (ipmdIdFilter.includes(ipmdId)) {
                statestructIpmdIds.push(ipmdId);
            }
        });
    }
    statestructIpmdIds.forEach(function (ipmdId) {
        // get reference data:
        let propIpmdRefData = ipmdTechRefFsd.getFsData(icc.itgIpmdTop + fsdLsep + ipmdId)['value'];
        // get state data:
        let propImpdStateData = ipmdChkResultFsd.getFsData(icc.stateState + fsdLsep + ipmdId
            + fsdLsep + icc.stateData)['value'];
        let propValue;
        // try to create a PropNode for the IIM-variant of the property
        let iimPropNode = _initPropNode(noValueText);
        iimPropNode.ptype = icc.pnodeTypePlain;
        if (propIpmdRefData[icc.itgIimid] !== undefined) {
            switch (labeltype) {
                case Labeltype.ipmd:
                    iimPropNode.plabel = propIpmdRefData[icc.itgName];
                    break;
                case Labeltype.valuefmt:
                    iimPropNode.plabel = propIpmdRefData[icc.itgIimid] + ' ' + propIpmdRefData[icc.itgIimname];
                    break;
                case Labeltype.et:
                    iimPropNode.plabel = propIpmdRefData[icc.itgEtIim];
                    break;
            }
            iimPropNode.psort = propIpmdRefData[icc.itgSortorder] + 'i';
            iimPropNode.pspecidx = propIpmdRefData[icc.itgSpecidx];
            let iimOccur = propImpdStateData[icc.stateDiim];
            if (iimOccur > 0) {
                propValue = ipmdChkResultFsd.getFsData(icc.stateValue + fsdLsep + ipmdId + fsdLsep
                    + icc.stateViim)['value'];
                iimPropNode.pvalue = _generateOutputStr(propValue);
                iimPropNode.hasValue = true;
            }
        }
        // try to create a PropNode for the Exif-variant of the property
        let exifPropNode = _initPropNode(noValueText);
        exifPropNode.ptype = icc.pnodeTypePlain;
        if (propIpmdRefData[icc.itgExifid] !== undefined) {
            switch (labeltype) {
                case Labeltype.ipmd:
                    exifPropNode.plabel = propIpmdRefData[icc.itgName];
                    break;
                case Labeltype.valuefmt:
                    exifPropNode.plabel = propIpmdRefData[icc.itgExifid];
                    break;
                case Labeltype.et:
                    exifPropNode.plabel = propIpmdRefData[icc.itgEtExif];
                    break;
            }
            exifPropNode.psort = propIpmdRefData[icc.itgSortorder] + 'x';
            exifPropNode.pspecidx = propIpmdRefData[icc.itgSpecidx];
            let exifOccur = propImpdStateData[icc.stateDexif];
            if (exifOccur > 0) {
                propValue = ipmdChkResultFsd.getFsData(icc.stateValue + fsdLsep + ipmdId + fsdLsep
                    + icc.stateVexif)['value'];
                exifPropNode.pvalue = _generateOutputStr(propValue);
                exifPropNode.hasValue = true;
            }
        }
        // try to create a PropNode for the XMP-variant of the property
        let ipmdChkResPathState = icc.stateState + fsdLsep + ipmdId;
        let ipmdChkResPathValue = icc.stateValue + fsdLsep + ipmdId;
        let ipmdTechRefPath = icc.itgIpmdTop + fsdLsep + ipmdId;
        let xmpPropNode = _generateXmpPropNode(ipmdChkResPathState, ipmdChkResPathValue, ipmdChkResultFsd, propIpmdRefData, opdOpt.wvalonly, labeltype, noValueText, ipmdTechRefPath, ipmdTechRefFsd);
        let xmpPropNodeVar1 = util1.deepCopyPn(xmpPropNode);
        // create the PropNode output for all specified IPTC PMD properties, regardless of having a value or not
        if (!opdOpt.wvalonly) {
            if (propImpdStateData[icc.stateDiim] !== undefined) { // IIM is specified for this property
                let iimPropNodeVar1 = util1.deepCopyPn(iimPropNode);
                iimPropNodeVar1.plabel = iimPropNode.plabel;
                iimPropNodeVar1.pembformat = 'IIM';
                if (propImpdStateData[icc.stateDinsync] !== undefined) {
                    if (propImpdStateData[icc.stateDinsync] === 1) { // XMP and IIM are in sync
                        if (propImpdStateData[icc.stateDmapinsync] !== undefined) {
                            if (propImpdStateData[icc.stateDmapinsync] === 1) { // XMP, IIM, Exif are in sync
                                xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                                xmpPropNodeVar1.pembformat = 'XMP,IIM,Exif';
                                xmpPropNodeVar1.pinsync = 2;
                                allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                                _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                                _push_schemaorgPna(opdOpt, ipmdId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                            }
                            else { // XMP, IIM exist and are in sync, Exif exists but not in sync
                                xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                                xmpPropNodeVar1.pembformat = 'XMP,IIM';
                                xmpPropNodeVar1.pinsync = 1;
                                allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                                let exifPropNodeVar1 = util1.deepCopyPn(exifPropNode);
                                exifPropNodeVar1.plabel = exifPropNode.plabel;
                                exifPropNodeVar1.pembformat = 'Exif';
                                exifPropNodeVar1.pinsync = -2;
                                allPNodesArrays.ipmdFullPna1.push(exifPropNodeVar1);
                                _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, exifPropNodeVar1);
                                _push_schemaorgPna(opdOpt, ipmdId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                            }
                        }
                        else { // XMP and IIM exist, are in sync
                            xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                            xmpPropNodeVar1.pembformat = 'XMP,IIM';
                            xmpPropNodeVar1.pinsync = 1;
                            allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                            _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                            _push_schemaorgPna(opdOpt, ipmdId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                        }
                    }
                    else { // XMP and IIM exist, are not in sync
                        xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                        xmpPropNodeVar1.pembformat = 'XMP';
                        xmpPropNodeVar1.pinsync = -1;
                        allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                        iimPropNodeVar1.pinsync = -1;
                        allPNodesArrays.ipmdFullPna1.push(iimPropNodeVar1);
                        _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, iimPropNodeVar1, null);
                        _push_schemaorgPna(opdOpt, ipmdId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                    }
                }
                else { // IIM is specified, but no sync value available = same as: both exist, not in sync
                    xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                    xmpPropNodeVar1.pembformat = 'XMP';
                    xmpPropNodeVar1.pinsync = -1;
                    allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                    iimPropNodeVar1.pinsync = -1;
                    allPNodesArrays.ipmdFullPna1.push(iimPropNodeVar1);
                    _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, iimPropNode, null);
                    _push_schemaorgPna(opdOpt, ipmdId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                }
            }
            else { // only XMP is specified
                xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                xmpPropNodeVar1.pembformat = 'XMP';
                allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                _push_schemaorgPna(opdOpt, ipmdId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
            }
        }
        else { //  create the PropNode output only for specified IPTC PMD properties if they have a value
            if (propImpdStateData[icc.stateDiim] !== undefined) { // IIM is specified for this property
                let iimPropNodeVar1 = util1.deepCopyPn(iimPropNode);
                iimPropNodeVar1.plabel = iimPropNode.plabel;
                iimPropNodeVar1.pembformat = 'IIM';
                if (propImpdStateData[icc.stateDinsync] !== undefined) {
                    if (propImpdStateData[icc.stateDinsync] === 1) { // XMP and IIM are in sync
                        if (propImpdStateData[icc.stateDmapinsync] !== undefined) {
                            if (propImpdStateData[icc.stateDmapinsync] === 1) { // XMP, IIM, Exif are in sync
                                xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                                xmpPropNodeVar1.pembformat = 'XMP,IIM,Exif';
                                xmpPropNodeVar1.pinsync = 2;
                                if (xmpPropNodeVar1.hasValue) {
                                    allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                                    _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                                    _push_schemaorgPna(opdOpt, ipmdId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                                }
                            }
                            else { // XMP, IIM exist and are in sync, Exif exists but not in sync
                                xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                                xmpPropNodeVar1.pembformat = 'XMP,IIM';
                                xmpPropNodeVar1.pinsync = 1;
                                if (xmpPropNodeVar1.hasValue) {
                                    allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                                    _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                                    _push_schemaorgPna(opdOpt, ipmdId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                                }
                                let exifPropNodeVar1 = util1.deepCopyPn(exifPropNode);
                                exifPropNodeVar1.plabel = exifPropNode.plabel;
                                exifPropNodeVar1.pembformat = 'Exif';
                                exifPropNodeVar1.pinsync = -2;
                                if (exifPropNodeVar1.hasValue) {
                                    allPNodesArrays.ipmdFullPna1.push(exifPropNodeVar1);
                                    _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], null, null, exifPropNodeVar1);
                                }
                            }
                        }
                        else { // XMP and IIM exist, are in sync
                            xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                            xmpPropNodeVar1.pembformat = 'XMP,IIM';
                            xmpPropNodeVar1.pinsync = 1;
                            if (xmpPropNodeVar1.hasValue) {
                                allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                                _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                                _push_schemaorgPna(opdOpt, ipmdId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                            }
                        }
                    }
                    else { // XMP and IIM exist, are not in sync
                        xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                        xmpPropNodeVar1.pembformat = 'XMP';
                        xmpPropNodeVar1.pinsync = -1;
                        if (xmpPropNodeVar1.hasValue) {
                            allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                            _push_schemaorgPna(opdOpt, ipmdId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                        }
                        if (iimPropNodeVar1.hasValue) {
                            iimPropNodeVar1.pinsync = -1;
                            allPNodesArrays.ipmdFullPna1.push(iimPropNodeVar1);
                            _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], null, iimPropNodeVar1, null);
                        }
                    }
                }
                else { // IIM is specified, but no sync value available = same as: both exist, not in sync
                    xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                    xmpPropNodeVar1.pembformat = 'XMP';
                    xmpPropNodeVar1.pinsync = -1;
                    if (xmpPropNodeVar1.hasValue) {
                        allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                        _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                        _push_schemaorgPna(opdOpt, ipmdId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                    }
                    if (iimPropNodeVar1.hasValue) {
                        iimPropNodeVar1.pinsync = -1;
                        allPNodesArrays.ipmdFullPna1.push(iimPropNodeVar1);
                        _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], null, iimPropNode, null);
                    }
                }
            }
            else { // XMP only is specified
                if (xmpPropNodeVar1.pvalue != '') {
                    xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                    xmpPropNodeVar1.pembformat = 'XMP';
                    if (xmpPropNodeVar1.hasValue) {
                        allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                        _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                        _push_schemaorgPna(opdOpt, ipmdId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                    }
                }
            }
        }
        // create the PropNode output for the OutputDesign option "fstds"
        if (opdOpt.fstds) {
            if (propImpdStateData[icc.stateDxmp] !== undefined) { // XMP is specified for this property
                if (opdOpt.wvalonly) {
                    if (xmpPropNode.hasValue) {
                        allPNodesArrays.xmpPna.push(xmpPropNode);
                    }
                }
                else
                    allPNodesArrays.xmpPna.push(xmpPropNode);
            }
            if (propImpdStateData[icc.stateDiim] !== undefined) { // IIM is specified for this property
                if (opdOpt.wvalonly) {
                    if (iimPropNode.hasValue) {
                        allPNodesArrays.iimPna.push(iimPropNode);
                    }
                }
                else
                    allPNodesArrays.iimPna.push(iimPropNode);
            }
            if (propImpdStateData[icc.stateDexif] !== undefined) { // Exif is specified for this property
                if (opdOpt.wvalonly) {
                    if (exifPropNode.hasValue) {
                        allPNodesArrays.exifPna.push(exifPropNode);
                    }
                }
                else
                    allPNodesArrays.exifPna.push(exifPropNode);
            }
        }
    }); // eo each top level property
    // special anyOtherData
    for (const refPropId in anyOtherDataRef) {
        const anyOtherDataProp = anyOtherDataRef[refPropId];
        const etTag = anyOtherDataProp[icc.itgEtTag];
        const label = anyOtherDataProp['label'];
        let anyOtherDataId = icc.stateVaodPrefix + etTag;
        let propValue = ipmdChkResultFsd.getFsData(icc.stateValue + fsdLsep + anyOtherDataId + fsdLsep
            + icc.stateVet)['value'];
        if (propValue !== undefined) {
            let anyDataPropNode = _initPropNode(noValueText);
            anyDataPropNode.plabel = label;
            anyDataPropNode.ptype = icc.pnodeTypePlain;
            anyDataPropNode.pvalue = _generateOutputStr(propValue);
            anyDataPropNode.hasValue = true;
            allPNodesArrays.anyOtherDataPna.push(anyDataPropNode);
        }
    }
    return allPNodesArrays;
}
exports.ipmdChkResultToPropNodes = ipmdChkResultToPropNodes;
function _generateXmpPropNode(ipmdChkResPathState, ipmdChkResPathValue, ipmdChkResultFsd, propIpmdRefData, wValueOnly, labeltype, noValueText, ipmdTechRefPath, ipmdTechRefFsd) {
    let propRefDtIsStruct = false;
    if (propIpmdRefData[icc.itgDatatype] === icc.itgDtStruct) {
        propRefDtIsStruct = true;
    }
    let propRefStructId = '';
    if (propRefDtIsStruct) {
        propRefStructId = propIpmdRefData[icc.itgDataformat];
    }
    let propNode = _initPropNode(noValueText);
    switch (labeltype) {
        case Labeltype.ipmd:
            propNode.plabel = propIpmdRefData[icc.itgName];
            break;
        case Labeltype.valuefmt:
            propNode.plabel = propIpmdRefData[icc.itgXmpid];
            break;
        case Labeltype.et:
            propNode.plabel = propIpmdRefData[icc.itgEtXmp];
            break;
    }
    propNode.psort = propIpmdRefData[icc.itgSortorder];
    propNode.pspecidx = propIpmdRefData[icc.itgSpecidx];
    // sort out: is the value of the property a plain value or a structure
    let propContentType = Ptype.plain;
    let testIsStruct = ipmdChkResultFsd.getFsData(ipmdChkResPathState + fsdLsep + icc.stateStruct);
    if (testIsStruct['state'] === 'FOUND') {
        propContentType = Ptype.struct;
    }
    if (propContentType === Ptype.plain) { // value type === plain
        propNode.ptype = icc.pnodeTypePlain;
        let propValue = ipmdChkResultFsd.getFsData(ipmdChkResPathValue + fsdLsep + icc.stateVxmp)['value'];
        propNode.pvalue = _generateOutputStr(propValue);
        if (propNode.pvalue !== '') {
            propNode.hasValue = true;
        }
        else {
            propNode.pvalue = noValueText;
        }
    }
    else { // value type === struct
        propNode.ptype = icc.pnodeTypeStruct;
        let ipmdDataState = ipmdChkResultFsd.getFsData(ipmdChkResPathState
            + fsdLsep + icc.stateStruct)['value'];
        let statestructIpmdIds = Object.keys(ipmdDataState);
        let fullStructPna = [];
        // check if the value of this structure is a single object or an array of objects
        let testStructValue = ipmdChkResultFsd.getFsData(ipmdChkResPathValue
            + fsdLsep + icc.stateStruct)['value'];
        if (Array.isArray(testStructValue)) { // structure value is an array of objects
            let superIdx = testStructValue.length;
            // loop across all value-objects in the array
            for (let idx = 0; idx < superIdx; idx++) {
                // iterate across all properties of the single value-object of this structure
                statestructIpmdIds.forEach(function (ipmdId) {
                    // get reference data:
                    let ipmdTechRefPathSub = icc.itgIpmdStruct + fsdLsep + propRefStructId + fsdLsep + ipmdId;
                    let propIpmdRefDataSub = ipmdTechRefFsd.getFsData(ipmdTechRefPathSub)['value'];
                    // get state data:
                    let ipmdChkResPathStateSub = ipmdChkResPathState + fsdLsep + icc.stateStruct
                        + fsdLsep + ipmdId;
                    let ipmdChkResPathValueSub = ipmdChkResPathValue + fsdLsep + icc.stateStruct
                        + fsdIsel + idx.toString() + fsdLsep + ipmdId;
                    let structPropNode = _generateXmpPropNode(ipmdChkResPathStateSub, ipmdChkResPathValueSub, ipmdChkResultFsd, propIpmdRefDataSub, wValueOnly, labeltype, noValueText, ipmdTechRefPathSub, ipmdTechRefFsd);
                    structPropNode.plabel = '[' + (idx + 1).toString() + '] ' + structPropNode.plabel;
                    if (wValueOnly) {
                        if (structPropNode.hasValue)
                            fullStructPna.push(structPropNode);
                    }
                    else {
                        fullStructPna.push(structPropNode);
                    }
                });
            }
        }
        else { // structure value is a single object only
            // iterate across all properties of the single value-object of this structure
            statestructIpmdIds.forEach(function (ipmdId) {
                // get reference data:
                let ipmdTechRefPathSub = icc.itgIpmdStruct + fsdLsep + propRefStructId + fsdLsep + ipmdId;
                let propIpmdRefDataSub = ipmdTechRefFsd.getFsData(ipmdTechRefPathSub)['value'];
                // get state data:
                let ipmdChkResPathBothSub = ipmdChkResPathState + fsdLsep + icc.stateStruct + fsdLsep + ipmdId;
                let structPropNode = _generateXmpPropNode(ipmdChkResPathBothSub, ipmdChkResPathBothSub, ipmdChkResultFsd, propIpmdRefDataSub, wValueOnly, labeltype, noValueText, ipmdTechRefPathSub, ipmdTechRefFsd);
                fullStructPna.push(structPropNode);
            });
        }
        propNode.pvalue = fullStructPna;
        let fullStructHasValue = false;
        let pnaLen = fullStructPna.length;
        for (let idx = 0; idx < pnaLen; idx++) {
            if (fullStructPna[idx].hasValue) {
                fullStructHasValue = true;
            }
        }
        propNode.hasValue = fullStructHasValue;
    }
    return propNode;
}
/**
 * Generate a single string for the output from a property value of different types
 * @param propValue
 */
function _generateOutputStr(propValue) {
    let outputStr = '';
    if (Array.isArray(propValue)) {
        for (let idx = 0; idx < propValue.length; idx++) {
            let singlevalue = propValue[idx];
            outputStr += '[' + (idx + 1).toString() + '] ' + singlevalue + ', ';
        }
    }
    else {
        if (typeof propValue === 'string') {
            outputStr = propValue;
        }
        if (typeof propValue === 'number') {
            outputStr = propValue.toString();
        }
    }
    return outputStr;
}
/**
 * Initalizes an object of type IPropNode with default values
 */
function _initPropNode(pvalueDefault = '') {
    return {
        ptype: '', plabel: '', psort: '', pspecidx: '', pvalue: pvalueDefault,
        pinsync: 0, pembformat: '', hasValue: false
    };
}
/**
 * Pushes XMP, IIM and Exif properties to a topical subPna of allPNodesArrays
 * @param opdOpt
 * @param allPNodesArrays
 * @param ugtopic
 * @param xmpPropNode
 * @param iimPropNode
 * @param exifPropNode
 */
function _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, ugtopic, xmpPropNode, iimPropNode, exifPropNode) {
    if (!opdOpt.topics) { // outputdesign topics is required
        return;
    }
    switch (ugtopic) {
        case icc.itgUgtAdmin:
            if (xmpPropNode !== null)
                allPNodesArrays.adminPna.push(xmpPropNode);
            if (iimPropNode !== null)
                allPNodesArrays.adminPna.push(iimPropNode);
            if (exifPropNode !== null)
                allPNodesArrays.adminPna.push(exifPropNode);
            break;
        case icc.itgUgtGimgcont:
            if (xmpPropNode !== null)
                allPNodesArrays.gimgcontPna.push(xmpPropNode);
            if (iimPropNode !== null)
                allPNodesArrays.gimgcontPna.push(iimPropNode);
            if (exifPropNode !== null)
                allPNodesArrays.gimgcontPna.push(exifPropNode);
            break;
        case icc.itgUgtImgreg:
            if (xmpPropNode !== null)
                allPNodesArrays.imgregPna.push(xmpPropNode);
            if (iimPropNode !== null)
                allPNodesArrays.imgregPna.push(iimPropNode);
            if (exifPropNode !== null)
                allPNodesArrays.imgregPna.push(exifPropNode);
            break;
        case icc.itgUgtLicensing:
            if (xmpPropNode !== null)
                allPNodesArrays.licPna.push(xmpPropNode);
            if (iimPropNode !== null)
                allPNodesArrays.licPna.push(iimPropNode);
            if (exifPropNode !== null)
                allPNodesArrays.licPna.push(exifPropNode);
            break;
        case icc.itgUgtLocation:
            if (xmpPropNode !== null)
                allPNodesArrays.locationPna.push(xmpPropNode);
            if (iimPropNode !== null)
                allPNodesArrays.locationPna.push(iimPropNode);
            if (exifPropNode !== null)
                allPNodesArrays.locationPna.push(exifPropNode);
            break;
        case icc.itgUgtOthings:
            if (xmpPropNode !== null)
                allPNodesArrays.othingsPna.push(xmpPropNode);
            if (iimPropNode !== null)
                allPNodesArrays.othingsPna.push(iimPropNode);
            if (exifPropNode !== null)
                allPNodesArrays.othingsPna.push(exifPropNode);
            break;
        case icc.itgUgtPerson:
            if (xmpPropNode !== null)
                allPNodesArrays.personPna.push(xmpPropNode);
            if (iimPropNode !== null)
                allPNodesArrays.personPna.push(iimPropNode);
            if (exifPropNode !== null)
                allPNodesArrays.personPna.push(exifPropNode);
            break;
        case icc.itgUgtRights:
            if (xmpPropNode !== null)
                allPNodesArrays.rightsPna.push(xmpPropNode);
            if (iimPropNode !== null)
                allPNodesArrays.rightsPna.push(iimPropNode);
            if (exifPropNode !== null)
                allPNodesArrays.rightsPna.push(exifPropNode);
            break;
        default:
            if (xmpPropNode !== null)
                allPNodesArrays.noTopicPna.push(xmpPropNode);
            if (iimPropNode !== null)
                allPNodesArrays.noTopicPna.push(iimPropNode);
            if (exifPropNode !== null)
                allPNodesArrays.noTopicPna.push(exifPropNode);
            break;
    }
}
/**
 * Pushes a Pnode to the schemaorgPna
 * @param opdOpt
 * @param ipmdId
 * @param propIpmdRefData
 * @param xmpPropNodeVar
 * @param allPNodesArrays
 */
function _push_schemaorgPna(opdOpt, ipmdId, propIpmdRefData, xmpPropNodeVar, allPNodesArrays) {
    if (!opdOpt.isearch1) { // outputdesing isearch1 is required
        return;
    }
    if (propIpmdRefData['SCHEMAid'] !== undefined) {
        let xmpPropNodeVar1 = util1.deepCopyPn(xmpPropNodeVar);
        xmpPropNodeVar1.plabel = _getSchemaOrgPropName(propIpmdRefData['SCHEMAid']);
        allPNodesArrays.schemaorgPna.push(xmpPropNodeVar1);
    }
    // next: workaround to map the Licensor URL in a Licensor structure to a schema.org property
    if (ipmdId == 'licensors') {
        let licUrlPropNode = _initPropNode();
        licUrlPropNode.ptype = icc.pnodeTypePlain;
        licUrlPropNode.plabel = 'acquireLicensePage';
        let valCount = xmpPropNodeVar.pvalue.length;
        for (let idx = 0; idx < valCount; idx++) {
            let testPnode = xmpPropNodeVar.pvalue[idx];
            if (typeof testPnode !== 'string') {
                if (testPnode['plabel'].includes('Licensor URL')) {
                    licUrlPropNode.pvalue = testPnode['pvalue'];
                    break;
                }
            }
        }
        if (licUrlPropNode.pvalue !== '') {
            allPNodesArrays.schemaorgPna.push(licUrlPropNode);
        }
    }
}
/**
 * Extracts the local Schema.org property id from the full schema.org identifier URL to act as property name
 * @param schemaOrgUrl
 */
function _getSchemaOrgPropName(schemaOrgUrl) {
    let propName;
    let urlParts = schemaOrgUrl.split('/');
    let lastIdx = urlParts.length - 1;
    propName = urlParts[lastIdx];
    return propName;
}
//# sourceMappingURL=propnodes1.js.map