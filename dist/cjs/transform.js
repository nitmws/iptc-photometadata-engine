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
exports.ipmdChkResultToIpmd = exports.tabledata1ToCsvstring1 = exports.tabledata1ToCsvdata1 = exports.ipmdChkResultToTabledata1 = exports.Row1Fields = exports.Csv1Options = void 0;
const icc = __importStar(require("./constants"));
const fixed_structure_data_1 = __importDefault(require("./fixed_structure_data"));
const util = __importStar(require("./utilities1"));
class Csv1Options {
    constructor() {
        this.fieldsep = ",";
    }
}
exports.Csv1Options = Csv1Options;
class Row1Fields {
    constructor() {
        this.topic = "";
        this.sortorder = "";
        this.nameL1 = " ";
        this.nameL2 = " ";
        this.nameL3 = " ";
        this.nameL4 = " ";
        this.nameL5 = " ";
        this.xmpprop = "MISSING";
        this.iimprop = "not spec";
        this.valuesinsync = " ";
        this.comments = "";
    }
}
exports.Row1Fields = Row1Fields;
const fsdLsep = "/";
// constant text values
const propFound = "found";
const propMissing = "MISSING";
const propNotspec = "not spec";
const valInsync = "in sync";
const valNotInsync = "NOT in sync";
/**
 * Transform an IPTC PMD Checker Result object to an array of table rows, type 1 (Row1Fields)
 * @param ipmdChkResult
 * @param ipmdIdFilter
 * @param ipmdTechRef
 */
function ipmdChkResultToTabledata1(ipmdChkResult, ipmdIdFilter, ipmdTechRef) {
    const ipmdTechRefFsd = new fixed_structure_data_1.default(ipmdTechRef, false);
    const ipmdChkResultFsd = new fixed_structure_data_1.default(ipmdChkResult, false);
    const ipmdDataState = ipmdChkResultFsd.getFsData(icc.ipmdcrState)["value"];
    let statestructIpmdIds = [];
    const statestructIpmdIdsPre = Object.keys(ipmdDataState);
    if (ipmdIdFilter.length === 0) {
        statestructIpmdIds = statestructIpmdIdsPre;
    }
    else {
        statestructIpmdIdsPre.forEach(function (ipmdId) {
            if (ipmdIdFilter.includes(ipmdId)) {
                statestructIpmdIds.push(ipmdId);
            }
        });
    }
    const tableRows = [];
    tableRows.push(createTable1Header());
    statestructIpmdIds.forEach(function (ipmdId) {
        const rowFields = new Row1Fields();
        // get reference data:
        const propIpmdRefData = ipmdTechRefFsd.getFsData(icc.itgIpmdTop + fsdLsep + ipmdId)["value"];
        // get state data:
        const propImpdStateData = ipmdChkResultFsd.getFsData(icc.ipmdcrState + fsdLsep + ipmdId + fsdLsep + icc.ipmdcrSData)["value"];
        rowFields.topic = propIpmdRefData[icc.itgUgtopic];
        rowFields.sortorder = propIpmdRefData[icc.itgSortorder];
        rowFields.nameL1 = propIpmdRefData[icc.itgName];
        if (propImpdStateData[icc.ipmdcrSDxmp] > 0)
            rowFields.xmpprop = propFound;
        if (propImpdStateData[icc.ipmdcrSDxmp] === 0)
            rowFields.xmpprop = propMissing;
        if (icc.ipmdcrSDiim in propImpdStateData) {
            if (propImpdStateData[icc.ipmdcrSDiim] > 0)
                rowFields.iimprop = propFound;
            if (propImpdStateData[icc.ipmdcrSDiim] === 0)
                rowFields.iimprop = propMissing;
        }
        else
            rowFields.iimprop = propNotspec;
        if (icc.ipmdcrSDinsync in propImpdStateData) {
            if (propImpdStateData[icc.ipmdcrSDinsync] > 0)
                rowFields.valuesinsync = valInsync;
            else
                rowFields.valuesinsync = valNotInsync;
        }
        tableRows.push(rowFields);
        if (propIpmdRefData[icc.itgDatatype] === icc.itgDtStruct) {
            const structId = propIpmdRefData[icc.itgDataformat];
            if (structId !== "AltLang") {
                const structRefPath = icc.itgIpmdStruct + fsdLsep + structId;
                const structResultPath = icc.ipmdcrState + fsdLsep + ipmdId + fsdLsep + icc.ipmdcrSStruct;
                const propImpdStateStruct = ipmdChkResultFsd.getFsData(structResultPath);
                if (propImpdStateStruct["state"] === "FOUND") {
                    const structLines = _generateXMPstructlines(ipmdChkResultFsd, structResultPath, structRefPath, rowFields, 2, ipmdTechRefFsd);
                    Array.prototype.push.apply(tableRows, structLines);
                }
            }
        }
    });
    tableRows.sort((a, b) => {
        if (a.sortorder < b.sortorder)
            return -1;
        if (a.sortorder > b.sortorder)
            return 1;
        return 0;
    });
    tableRows.sort((a, b) => {
        if (a.topic < b.topic)
            return -1;
        if (a.topic > b.topic)
            return 1;
        return 0;
    });
    return tableRows;
}
exports.ipmdChkResultToTabledata1 = ipmdChkResultToTabledata1;
function _generateXMPstructlines(ipmdChkResultFsd, ipmdChkResultFsdPathToStruct, ipmdTechRefFsdPathToStruct, parentRowFields, proplevel, ipmdTechRefFsd) {
    const ipmdDataState = ipmdChkResultFsd.getFsData(ipmdChkResultFsdPathToStruct)["value"];
    const statestructIpmdIds = Object.keys(ipmdDataState);
    const tableRows = [];
    statestructIpmdIds.forEach(function (ipmdId) {
        const rowFields = new Row1Fields();
        // get reference data:
        const propIpmdRefData = ipmdTechRefFsd.getFsData(ipmdTechRefFsdPathToStruct + fsdLsep + ipmdId)["value"];
        // get state data:
        const propImpdStateData = ipmdChkResultFsd.getFsData(ipmdChkResultFsdPathToStruct +
            fsdLsep +
            ipmdId +
            fsdLsep +
            icc.ipmdcrSData)["value"];
        rowFields.topic = parentRowFields.topic;
        rowFields.sortorder =
            parentRowFields.sortorder + "-" + propIpmdRefData[icc.itgSortorder];
        switch (proplevel) {
            case 2:
                rowFields.nameL1 = parentRowFields.nameL1;
                rowFields.nameL2 = propIpmdRefData[icc.itgName];
                break;
            case 3:
                rowFields.nameL1 = parentRowFields.nameL1;
                rowFields.nameL2 = parentRowFields.nameL2;
                rowFields.nameL3 = propIpmdRefData[icc.itgName];
                break;
            case 4:
                rowFields.nameL1 = parentRowFields.nameL1;
                rowFields.nameL2 = parentRowFields.nameL2;
                rowFields.nameL3 = parentRowFields.nameL3;
                rowFields.nameL4 = propIpmdRefData[icc.itgName];
                break;
            case 5:
                rowFields.nameL1 = parentRowFields.nameL1;
                rowFields.nameL2 = parentRowFields.nameL2;
                rowFields.nameL3 = parentRowFields.nameL3;
                rowFields.nameL4 = parentRowFields.nameL4;
                rowFields.nameL5 = propIpmdRefData[icc.itgName];
                break;
        }
        if (propImpdStateData[icc.ipmdcrSDxmp] > 0)
            rowFields.xmpprop = propFound;
        if (propImpdStateData[icc.ipmdcrSDxmp] === 0)
            rowFields.xmpprop = propMissing;
        if (icc.ipmdcrSDiim in propImpdStateData) {
            if (propImpdStateData[icc.ipmdcrSDiim] > 0)
                rowFields.iimprop = propFound;
            if (propImpdStateData[icc.ipmdcrSDiim] === 0)
                rowFields.iimprop = propMissing;
        }
        else
            rowFields.iimprop = propNotspec;
        if (icc.ipmdcrSDinsync in propImpdStateData) {
            if (propImpdStateData[icc.ipmdcrSDinsync] > 0)
                rowFields.valuesinsync = valInsync;
            else
                rowFields.valuesinsync = valNotInsync;
        }
        tableRows.push(rowFields);
        if (propIpmdRefData[icc.itgDatatype] === icc.itgDtStruct) {
            const structId = propIpmdRefData[icc.itgDataformat];
            if (structId !== "AltLang") {
                const structRefPath = icc.itgIpmdStruct + fsdLsep + structId;
                const structResultPath = ipmdChkResultFsdPathToStruct +
                    fsdLsep +
                    ipmdId +
                    fsdLsep +
                    icc.ipmdcrSStruct;
                const propImpdStateStruct = ipmdChkResultFsd.getFsData(structResultPath);
                if (propImpdStateStruct["state"] === "FOUND") {
                    const structLines = _generateXMPstructlines(ipmdChkResultFsd, structResultPath, structRefPath, rowFields, proplevel + 1, ipmdTechRefFsd);
                    Array.prototype.push.apply(tableRows, structLines);
                }
            }
        }
    });
    return tableRows;
}
/**
 * Transforms the tabledata1 format to CSV data, type 1
 * @param tableRows
 * @param csv1Options
 */
function tabledata1ToCsvdata1(tableRows, csv1Options) {
    const csvLines = [];
    tableRows.forEach((lineCsvFields) => {
        const line = row1FieldsToCsvLine(lineCsvFields, csv1Options.fieldsep);
        csvLines.push(line);
    });
    return csvLines;
}
exports.tabledata1ToCsvdata1 = tabledata1ToCsvdata1;
/**
 * Transforms the tabledata1 format to a CSV data in a single string
 * @param tableRows
 * @param csv1Options
 */
function tabledata1ToCsvstring1(tableRows, csv1Options) {
    let csvString = "";
    tableRows.forEach((lineCsvFields) => {
        const line = row1FieldsToCsvLine(lineCsvFields, csv1Options.fieldsep);
        csvString += line + "\n";
    });
    return csvString;
}
exports.tabledata1ToCsvstring1 = tabledata1ToCsvstring1;
/**
 * Transforms the value object of IPTC PMD Checker Result format to a simple object
 * with the (same) property names as defined by the IPTC PMD standard
 * @param ipmdChkResult the IPTC PMD Checker Result
 * @param embFormatPref selects the preferred format of embedded metadata: XMP or IIM
 * @param thisEmbFormatOnly if true, only values of the embFormatPref are recognized
 */
function ipmdChkResultToIpmd(ipmdChkResult, embFormatPref, thisEmbFormatOnly = false) {
    const ipmdchkVals = ipmdChkResult.value;
    return ipmdcVal2ipmd(ipmdchkVals, embFormatPref, thisEmbFormatOnly);
}
exports.ipmdChkResultToIpmd = ipmdChkResultToIpmd;
/**
 * Recursive processing of the values-object of IPTC PMD Checker Result
 * @param ipmdcVals the values-object of IPTC PMD Checker Result
 * @param fmtPref selects the preferred format of embedded metadata: XMP or IIM
 * @param thisFmtOnly if true, only values of the embFormatPref are recognized
 */
function ipmdcVal2ipmd(ipmdcVals, fmtPref, thisFmtOnly) {
    if (Array.isArray(ipmdcVals)) {
        const ipmdArr = [];
        ipmdcVals.forEach((ipmdcValsObj) => {
            const ipmdObj = ipmdcVal2ipmd(ipmdcValsObj, fmtPref, thisFmtOnly);
            if (!util.objectIsEmpty(ipmdObj))
                ipmdArr.push(ipmdObj);
        });
        return ipmdArr;
    }
    else {
        const ipmdObj = {};
        for (const ipmdpropid in ipmdcVals) {
            if (ipmdcVals.hasOwnProperty(ipmdpropid)) {
                if (ipmdcVals[ipmdpropid].hasOwnProperty("struct")) {
                    const tranRes = ipmdcVal2ipmd(ipmdcVals[ipmdpropid]["struct"], fmtPref, thisFmtOnly);
                    if (Array.isArray(tranRes)) {
                        if (tranRes.length > 0)
                            ipmdObj[ipmdpropid] = tranRes;
                    }
                    else {
                        if (!util.objectIsEmpty(tranRes))
                            ipmdObj[ipmdpropid] = tranRes;
                    }
                }
                else {
                    // a single plain value
                    switch (fmtPref) {
                        case icc.ipmdcrVxmp:
                            if (ipmdcVals[ipmdpropid].hasOwnProperty(icc.ipmdcrVxmp)) {
                                ipmdObj[ipmdpropid] = ipmdcVals[ipmdpropid][icc.ipmdcrVxmp];
                            }
                            else {
                                if (!thisFmtOnly) {
                                    if (ipmdcVals[ipmdpropid].hasOwnProperty(icc.ipmdcrViim)) {
                                        ipmdObj[ipmdpropid] = ipmdcVals[ipmdpropid][icc.ipmdcrViim];
                                    }
                                }
                            }
                            break;
                        case icc.ipmdcrViim:
                            if (ipmdcVals[ipmdpropid].hasOwnProperty(icc.ipmdcrViim)) {
                                ipmdObj[ipmdpropid] = ipmdcVals[ipmdpropid][icc.ipmdcrViim];
                            }
                            else {
                                if (!thisFmtOnly) {
                                    if (ipmdcVals[ipmdpropid].hasOwnProperty(icc.ipmdcrVxmp)) {
                                        ipmdObj[ipmdpropid] = ipmdcVals[ipmdpropid][icc.ipmdcrVxmp];
                                    }
                                }
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        return ipmdObj;
    }
}
/*  H E L P E R  F U N C T I O N S */
function createTable1Header() {
    const headerfields = new Row1Fields();
    headerfields.topic = "Topic";
    headerfields.sortorder = "Sortorder";
    headerfields.nameL1 = "IPTC Name L1";
    headerfields.nameL2 = "IPTC Name L2";
    headerfields.nameL3 = "IPTC Name L3";
    headerfields.nameL4 = "IPTC Name L4";
    headerfields.nameL5 = "IPTC Name L5";
    headerfields.xmpprop = "XMP Value";
    headerfields.iimprop = "IIM Value";
    headerfields.valuesinsync = "Sync Values";
    headerfields.comments = "Comments";
    return headerfields;
}
function row1FieldsToCsvLine(fields, fieldsep) {
    let line = "";
    line += fields.topic + fieldsep;
    line += fields.sortorder + fieldsep;
    line += fields.nameL1 + fieldsep;
    line += fields.nameL2 + fieldsep;
    line += fields.nameL3 + fieldsep;
    line += fields.nameL4 + fieldsep;
    line += fields.nameL5 + fieldsep;
    line += fields.xmpprop + fieldsep;
    line += fields.iimprop + fieldsep;
    line += fields.valuesinsync + fieldsep;
    line += fields.comments;
    return line;
}
//# sourceMappingURL=transform.js.map