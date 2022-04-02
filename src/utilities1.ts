import fs from 'fs';
import * as icc from './constants';
import { MdStruct } from './incommon';
import * as pn1 from './propnodes1';

/**
 * Loads a file and tries to parse it as serialized JSON.
 * Returns: loaded and parsed object
 * @param jsonFp file path of the JSON file
 */
export function loadFromJson (jsonFp: string): object {
    if (!fs.existsSync(jsonFp))
        return {};
    let stringdata: string = fs.readFileSync(jsonFp, {"encoding": "utf-8"});
    let loadedObject: object;
    try {
        loadedObject = JSON.parse(stringdata)
    }
    catch (e){
        return {};
    }
    return loadedObject;
}


/**
 * Writes a data object serialized as JSON to a file
 * Returns: true if the writing was successful, else false
 * @param jsonFp file path of the JSON file
 * @param dataObject data as object
 */
export function writeAsJson (jsonFp: string, dataObject: object): boolean {
    const jsonString = JSON.stringify(dataObject, null, 2);
    try {
        fs.writeFileSync(jsonFp, jsonString, {encoding: "utf-8"});
    }
    catch (e) {
        return false;
    }
    return true;
}

/**
 * Generates the state structure template from the IPTC PMD TechGuide object
 * @param ipmdTechRefData Object of the IPTC PMD TechGuide file
 */
export function generateIpmdChkResultsStateTemplate(ipmdTechRefData: MdStruct): object {
    let reftop: MdStruct = ipmdTechRefData[icc.itgIpmdTop];
    if (reftop === {})
        return {};
    let refstruct: MdStruct = ipmdTechRefData[icc.itgIpmdStruct];
    if (refstruct === {})
        return {};
    let stateStruct: MdStruct = {};
    // presets
    let dataStructXmp: object = {"XMP": 0};
    let dataStructXmpMulti: object = {"XMP": 0, "XMPVALOCCUR": -1};
    let dataStructXmpIim: object = {"XMP": 0, "IIM": 0, "INSYNC": -1};
    let dataStructXmpIimMulti: object = {"XMP": 0, "XMPVALOCCUR": -1, "IIM": 0, "INSYNC": -1};
    let dataStructXmpIimExif: object = {"XMP": 0, "IIM": 0, "EXIF": 0, "INSYNC": -1,  "MAPINSYNC": -1};
    let dataStructXmpIimExifMulti: object = {"XMP": 0, "XMPVALOCCUR": -1, "IIM": 0, "EXIF": 0, "INSYNC": -1,  "MAPINSYNC": -1};
    let reftopkeys: string[] = Object.keys(reftop);
    reftopkeys.forEach( function(reftopkey) {
        stateStruct[reftopkey] = {}
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
                let structId: string = reftop[reftopkey][icc.itgDataformat];
                if (structId !== "AltLang"){
                    if (refstruct[structId] !== undefined){
                        let generateStruct = refstruct[structId];
                        let structSub = generateIpmdRefStateStructOfStruct(generateStruct, refstruct);
                        if (!objectIsEmpty(structSub)) {
                            stateStruct[reftopkey][icc.stateStruct] =  structSub;
                        }
                    }
                }
            }
        }
    })
    return stateStruct;
}

/**
 * Generates a structure inside the state structure template from the IPTC PMD TechGuide object.
 * Is a recursive function.
 * @param refstruct
 * @param toprefstruct
 */
function generateIpmdRefStateStructOfStruct(refstruct: MdStruct, toprefstruct: MdStruct) : object {
    let stateStruct: MdStruct = {};
    // presets
    let dataStructXmp: object = {"XMP": 0};
    let dataStructXmpMulti: object = {"XMP": 0, "XMPVALOCCUR": -1};
    let dataStructXmpIim: object = {"XMP": 0, "IIM": 0, "INSYNC": -1};
    let dataStructXmpIimExif: object = {"XMP": 0, "IIM": 0, "EXIF": 0, "INSYNC": -1,  "MAPINSYNC": -1};
    let refstructkeys: string[] = Object.keys(refstruct);
    refstructkeys.forEach( function(refstructkey) {
        stateStruct[refstructkey] = {}
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
                let structId: string = refstruct[refstructkey][icc.itgDataformat];
                if (structId !== "AltLang"){
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
    })
    return stateStruct;
}

/******************** G E N E R I C   H E L P E R S   *****************************
/**
 * Checks if a JavaScript object can be considered as empty
 * @param obj
 */
export function objectIsEmpty(obj: object) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * Compares two arrays if they are equal
 * From https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
 * @param a
 * @param b
 */
export function arraysEqual(a: any[] | null, b: any[] | null) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

export function deepCopyPn(inObject: pn1.IPropNode): pn1.IPropNode{
    return JSON.parse(JSON.stringify(inObject));
}

// ***** E X I F T O O L utilities ********************************
/**
 * Replaces in an ExifTool tag a colon with an underscore
 * @param etTagColon ExifTool tag with a colon
 */
export function etTagUnderscore(etTagColon: string): string {
    return etTagColon.replace(":", "_")
}

/**
 * Replaces in an ExifTool tag an underscore with a colon
 * @param etTagUnderscore ExifTool tag with an underscore
 */
export function etTagColon(etTagUnderscore: string): string {
    return etTagUnderscore.replace("_", ":")
}

/**
 * Transforms an ISO DateTime string as used by XMP to an ExifTool date + time value
 * @param xmpIsoDt
 */
export function xmpIsoDatetime2etDatetime(xmpIsoDt: string): string {
    let etDt: string = '';
    if (xmpIsoDt == undefined) return etDt;
    if (xmpIsoDt == '') return etDt;
    let etYear = '';
    let etMonth = '01';
    let etDay = '01';
    let etTime = '00:00:00';
    let etTz = '+00:00';
    // full ISO DT: 2022-03-04T12:02:07+00:00 full-len=25, D+T-len=19 D-len=10
    let xmpIsoDtLen: number = xmpIsoDt.length;
    if (xmpIsoDtLen < 4) return etDt;
    if (xmpIsoDtLen == 4) { // year only
        etYear = xmpIsoDt;
        etDt = etYear + ':' + etMonth  + ':' + etDay  + ' ' + etTime + etTz;
        return etDt;
    }
    if (xmpIsoDtLen == 7) { // year + month only
        etYear = xmpIsoDt.substring(0,4);
        etMonth = xmpIsoDt.substring(5,7);
        etDt = etYear + ':' + etMonth  + ':' + etDay  + ' ' + etTime + etTz;
        return etDt;
    }
    if (xmpIsoDtLen == 10) { // year + month + day only
        etYear = xmpIsoDt.substring(0,4);
        etMonth = xmpIsoDt.substring(5,7);
        etDay = xmpIsoDt.substring(8,19);
        etDt = etYear + ':' + etMonth  + ':' + etDay  + ' ' + etTime + etTz;
        return etDt;
    }
    if (xmpIsoDtLen == 19) { // day date + time only
        etYear = xmpIsoDt.substring(0,4);
        etMonth = xmpIsoDt.substring(5,7);
        etDay = xmpIsoDt.substring(8,10);
        etTime = xmpIsoDt.substring(11,19);
        etDt = etYear + ':' + etMonth  + ':' + etDay  + ' ' + etTime + etTz;
        return etDt;
    }
    if (xmpIsoDtLen == 25) { // day date + time + time zone
        etYear = xmpIsoDt.substring(0,4);
        etMonth = xmpIsoDt.substring(5,7);
        etDay = xmpIsoDt.substring(8,10);
        etTime = xmpIsoDt.substring(11,19);
        etTz = xmpIsoDt.substring(19);
        etDt = etYear + ':' + etMonth  + ':' + etDay  + ' ' + etTime + etTz;
        return etDt;
    }
    // the xmpIsoDt had no matching length, return an empty value
    return etDt;
}


