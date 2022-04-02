import * as icc from './constants';
import {MdStruct} from './incommon';
import FixedStructureData from './fixed_structure_data';
import {IipmdCheckerResult} from "./ipmdchecker";
import * as util from './utilities1';

export class Csv1Options {
    fieldsep: string = ','
}

export class Row1Fields {
    topic: string = '';
    sortorder: string = '';
    nameL1: string = ' ';
    nameL2: string = ' ';
    nameL3: string = ' ';
    nameL4: string = ' ';
    nameL5: string = ' ';
    xmpprop: string = 'MISSING';
    iimprop: string = 'not spec';
    valuesinsync: string = ' ';
    comments: string = '';
}

const fsdLsep: string = '/';
const fsdIsel: string = '#';

// constant text values
const propFound: string = 'found';
const propMissing: string = 'MISSING';
const propNotspec: string = 'not spec';
const valInsync: string = 'in sync';
const valNotInsync: string = 'NOT in sync';

/**
 * Transform an IPTC PMD Checker Result object to an array of table rows, type 1 (Row1Fields)
 * @param ipmdChkResultFsd
 * @param ipmdIdFilter
 * @param ipmdTechRefFsd
 */
export function ipmdChkResultToTabledata1(ipmdChkResultFsd: FixedStructureData,
                                          ipmdIdFilter: string[],
                                          ipmdTechRefFsd: FixedStructureData): Row1Fields[] {

    let ipmdDataState: object = ipmdChkResultFsd.getFsData(icc.stateState)['value'];

    let statestructIpmdIds: string[] = [];
    let statestructIpmdIdsPre: string[] = Object.keys(ipmdDataState);
    if (ipmdIdFilter.length == 0) {
        statestructIpmdIds = statestructIpmdIdsPre;
    }
    else {
        statestructIpmdIdsPre.forEach( function(ipmdId) {
            if (ipmdIdFilter.includes(ipmdId)){
                statestructIpmdIds.push(ipmdId);
            }
        })
    }

    let tableRows: Row1Fields[] = [];
    tableRows.push(createTable1Header());

    statestructIpmdIds.forEach( function(ipmdId) {
        let rowFields: Row1Fields = new Row1Fields();
        // get reference data:
        let propIpmdRefData: MdStruct = ipmdTechRefFsd.getFsData(icc.itgIpmdTop + fsdLsep + ipmdId)['value'];
        // get state data:
        let propImpdStateData: MdStruct = ipmdChkResultFsd.getFsData(icc.stateState + fsdLsep + ipmdId
            + fsdLsep + icc.stateData )['value'];
        rowFields.topic = propIpmdRefData[icc.itgUgtopic];
        rowFields.sortorder = propIpmdRefData[icc.itgSortorder];
        rowFields.nameL1 = propIpmdRefData[icc.itgName];
        if (propImpdStateData[icc.stateDxmp] > 0) rowFields.xmpprop = propFound;
        if (propImpdStateData[icc.stateDxmp] == 0) rowFields.xmpprop = propMissing;
        if (icc.stateDiim in propImpdStateData){
            if (propImpdStateData[icc.stateDiim] > 0) rowFields.iimprop = propFound;
            if (propImpdStateData[icc.stateDiim] === 0) rowFields.iimprop = propMissing;
        }
        else rowFields.iimprop = propNotspec;
        if (icc.stateDinsync in propImpdStateData){
            if (propImpdStateData[icc.stateDinsync] > 0) rowFields.valuesinsync = valInsync
            else rowFields.valuesinsync = valNotInsync;
        }
        tableRows.push(rowFields);
        if (propIpmdRefData[icc.itgDatatype] === icc.itgDtStruct) {
            let structId: string = propIpmdRefData[icc.itgDataformat];
            if (structId !== 'AltLang') {
                let structRefPath: string = icc.itgIpmdStruct + fsdLsep + structId;
                let structResultPath: string = icc.stateState + fsdLsep + ipmdId + fsdLsep + icc.stateStruct;
                let propImpdStateStruct: MdStruct = ipmdChkResultFsd.getFsData(structResultPath);
                if (propImpdStateStruct['state'] === 'FOUND') {
                    let structLines: Row1Fields[] = _generateXMPstructlines(ipmdChkResultFsd, structResultPath, structRefPath,
                        rowFields, 2, ipmdTechRefFsd);
                    Array.prototype.push.apply(tableRows, structLines);
                }
            }
        }

    });
    tableRows.sort((a, b) => {
        if (a.sortorder < b.sortorder) return -1;
        if (a.sortorder > b.sortorder) return 1;
        return 0;
    } )
    tableRows.sort((a, b) => {
        if (a.topic < b.topic) return -1;
        if (a.topic > b.topic) return 1;
        return 0;
    } )
    return tableRows;
}

function _generateXMPstructlines(ipmdChkResultFsd: FixedStructureData,
                                 ipmdChkResultFsdPathToStruct: string,
                                 ipmdTechRefFsdPathToStruct: string,
                                 parentRowFields: Row1Fields,
                                 proplevel: number,
                                 ipmdTechRefFsd: FixedStructureData): Row1Fields[] {
    let ipmdDataState: object = ipmdChkResultFsd.getFsData(ipmdChkResultFsdPathToStruct)['value'];
    let statestructIpmdIds: string[] = Object.keys(ipmdDataState);
    let tableRows: Row1Fields[] = [];
    statestructIpmdIds.forEach( function(ipmdId) {
        let rowFields: Row1Fields = new Row1Fields();
        // get reference data:
        let propIpmdRefData: MdStruct = ipmdTechRefFsd.getFsData(ipmdTechRefFsdPathToStruct + fsdLsep + ipmdId)['value'];
        // get state data:
        let propImpdStateData: MdStruct = ipmdChkResultFsd.getFsData(ipmdChkResultFsdPathToStruct + fsdLsep + ipmdId
            + fsdLsep + icc.stateData )['value'];
        rowFields.topic = parentRowFields.topic;
        rowFields.sortorder = parentRowFields.sortorder + '-' + propIpmdRefData[icc.itgSortorder];
        switch (proplevel){
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

        if (propImpdStateData[icc.stateDxmp] > 0) rowFields.xmpprop = propFound;
        if (propImpdStateData[icc.stateDxmp] == 0) rowFields.xmpprop = propMissing;
        if (icc.stateDiim in propImpdStateData){
            if (propImpdStateData[icc.stateDiim] > 0) rowFields.iimprop = propFound;
            if (propImpdStateData[icc.stateDiim] === 0) rowFields.iimprop = propMissing;
        }
        else rowFields.iimprop = propNotspec;
        if (icc.stateDinsync in propImpdStateData){
            if (propImpdStateData[icc.stateDinsync] > 0) rowFields.valuesinsync = valInsync
            else rowFields.valuesinsync = valNotInsync;
        }
        tableRows.push(rowFields);
        if (propIpmdRefData[icc.itgDatatype] === icc.itgDtStruct) {
            let structId: string = propIpmdRefData[icc.itgDataformat];
            if (structId !== 'AltLang') {
                let structRefPath: string = icc.itgIpmdStruct + fsdLsep + structId;
                let structResultPath: string = ipmdChkResultFsdPathToStruct + fsdLsep + ipmdId + fsdLsep + icc.stateStruct;
                let propImpdStateStruct: MdStruct = ipmdChkResultFsd.getFsData(structResultPath);
                if (propImpdStateStruct['state'] === 'FOUND') {
                    let structLines: Row1Fields[] = _generateXMPstructlines(ipmdChkResultFsd, structResultPath, structRefPath,
                        rowFields,proplevel + 1, ipmdTechRefFsd);
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
export function tabledata1ToCsvdata1(tableRows: Row1Fields[], csv1Options: Csv1Options): string[] {
    let csvLines: string[] = [];
    tableRows.forEach(lineCsvFields => {
        let line: string = row1FieldsToCsvLine(lineCsvFields, csv1Options.fieldsep);
        csvLines.push(line);
    })
    return csvLines;
}

/**
 * Transforms the tabledata1 format to a CSV data in a single string
 * @param tableRows
 * @param csv1Options
 */
export function tabledata1ToCsvstring1(tableRows: Row1Fields[], csv1Options: Csv1Options): string {
    let csvString: string = '';
    tableRows.forEach(lineCsvFields => {
        let line: string = row1FieldsToCsvLine(lineCsvFields, csv1Options.fieldsep);
        csvString += line + '\n';
    })
    return csvString;
}

/**
 * Transforms the value object of IPTC PMD Checker Result format to a simple object
 * with the (same) property names as defined by the IPTC PMD standard
 * @param ipmdChkResult the IPTC PMD Checker Result
 * @param embFormatPref selects the preferred format of embedded metadata: XMP or IIM
 * @param thisEmbFormatOnly if true, only values of the embFormatPref are recognized
 */
export function ipmdChkResultToIpmd(
    ipmdChkResult: IipmdCheckerResult,
    embFormatPref: string,
    thisEmbFormatOnly = false): object {
    const ipmdchkVals = ipmdChkResult.value;
    return ipmdcVal2ipmd(ipmdchkVals, embFormatPref, thisEmbFormatOnly);
}


/**
 * Recursive processing of the values-object of IPTC PMD Checker Result
 * @param ipmdcVals the values-object of IPTC PMD Checker Result
 * @param fmtPref selects the preferred format of embedded metadata: XMP or IIM
 * @param thisFmtOnly if true, only values of the embFormatPref are recognized
 */
function ipmdcVal2ipmd(
    ipmdcVals: MdStruct,
    fmtPref: string,
    thisFmtOnly: boolean): object | object[] {
    if (Array.isArray(ipmdcVals)) {
        let ipmdArr: object[] = [];
        ipmdcVals.forEach( ipmdcValsObj => {
            const ipmdObj = ipmdcVal2ipmd(ipmdcValsObj, fmtPref, thisFmtOnly);
            if (!util.objectIsEmpty(ipmdObj)) ipmdArr.push(ipmdObj);
        });
        return ipmdArr;
    } else {
        let ipmdObj: MdStruct = {};
        for (const ipmdpropid in ipmdcVals) {
            if (ipmdcVals.hasOwnProperty(ipmdpropid)) {
                if (ipmdcVals[ipmdpropid].hasOwnProperty('struct')) {
                    let tranRes = ipmdcVal2ipmd(ipmdcVals[ipmdpropid]['struct'], fmtPref, thisFmtOnly);
                    if (Array.isArray(tranRes)){
                        if (tranRes.length > 0) ipmdObj[ipmdpropid] = tranRes;
                    } else {
                        if (!util.objectIsEmpty(tranRes)) ipmdObj[ipmdpropid] = tranRes;
                    }
                } else { // a single plain value
                    switch (fmtPref){
                        case icc.stateVxmp:
                            if (ipmdcVals[ipmdpropid].hasOwnProperty(icc.stateVxmp)) {
                                ipmdObj[ipmdpropid] = ipmdcVals[ipmdpropid][icc.stateVxmp];
                            }
                            else {
                                if (!thisFmtOnly) {
                                    if (ipmdcVals[ipmdpropid].hasOwnProperty(icc.stateViim)) {
                                        ipmdObj[ipmdpropid] = ipmdcVals[ipmdpropid][icc.stateViim];
                                    }
                                }
                            }
                            break;
                        case icc.stateViim:
                            if (ipmdcVals[ipmdpropid].hasOwnProperty(icc.stateViim)) {
                                ipmdObj[ipmdpropid] = ipmdcVals[ipmdpropid][icc.stateViim];
                            }
                            else {
                                if (!thisFmtOnly) {
                                    if (ipmdcVals[ipmdpropid].hasOwnProperty(icc.stateVxmp)) {
                                        ipmdObj[ipmdpropid] = ipmdcVals[ipmdpropid][icc.stateVxmp];
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

function createTable1Header(): Row1Fields {
    let headerfields: Row1Fields = new Row1Fields();
    headerfields.topic = 'Topic';
    headerfields.sortorder = 'Sortorder';
    headerfields.nameL1 = 'IPTC Name L1';
    headerfields.nameL2 = 'IPTC Name L2';
    headerfields.nameL3 = 'IPTC Name L3';
    headerfields.nameL4 = 'IPTC Name L4';
    headerfields.nameL5 = 'IPTC Name L5';
    headerfields.xmpprop = 'XMP Value';
    headerfields.iimprop = 'IIM Value';
    headerfields.valuesinsync = 'Sync Values';
    headerfields.comments = 'Comments';
    return headerfields;
}

function row1FieldsToCsvLine(fields: Row1Fields, fieldsep: string): string{
    let line: string = '';
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
