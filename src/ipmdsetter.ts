import fs from 'fs';
import * as icc from './constants';
import { MdStruct } from './incommon';
import * as  util1 from './utilities1';
import FixedStructureData from './fixed_structure_data';
import * as valmap from './valuemapper';

/**
 * Generate ExifTool JSON options
 */
export class GenerateEtJsonOptions {
    // default values are defined for each option
    disabledPrintConv: boolean = false; // set to "true" if -f parameter of ExifTool will be used
}

export class IpmdSetter {
    ipmdRef: MdStruct;
    _ipmdDataFsd: any;
    _lsep: string;

    /**
     * Constructor of the IpmdSetter class
     * @param iptcPmdTechRefDocFp File path of the JSON file with the IPTC PMD reference data
     */
    constructor(iptcPmdTechRefDocFp: string) {
        this.ipmdRef = IpmdSetter._loadIpmdRefJson(iptcPmdTechRefDocFp);
        this._lsep = "/";
    }

    /**
     * Generates an ExifTool JSON object from an IPTC PMD data object
     * @param ipmdData IPTC PMD data object
     * @param genOptions options for generating the ExifTool JSON object
     * @returns ExifTool JSON object
     */
    public generateExiftoolJson(
        ipmdData: MdStruct,
        genOptions: GenerateEtJsonOptions = new GenerateEtJsonOptions()): object {
        this._ipmdDataFsd = new FixedStructureData(ipmdData, false);
        let etJson: MdStruct = { SourceFile:  "*"};

        let refIpmdTop = this.ipmdRef[icc.itgIpmdTop];
        // Iterate all properties of the reference ipmd_top
        for (const refPropId in refIpmdTop) {
            let refPropData: MdStruct = refIpmdTop[refPropId];
            // get the value of the property
            let ipmdPropValue;
            let getPropValueFsd = this._ipmdDataFsd.getFsData(refPropId);
            if (getPropValueFsd[icc.fsdResState] === icc.fsdStFound) {
                ipmdPropValue = getPropValueFsd[icc.fsdResValue];
            }
            else continue;
            // the property value of Et-JSON
            let etPropValue;

            let valIsArray: boolean = Array.isArray(ipmdPropValue);
            const datatype: string = refPropData[icc.itgDatatype];
            let dataformat: string = '';
            if (refPropData.hasOwnProperty(icc.itgDataformat)) {
                dataformat = refPropData[icc.itgDataformat];
            }
            let altLangActive: boolean = false;
            let propoccurrence: string = '';
            if (refPropData.hasOwnProperty(icc.itgPropoccurrence)){
                propoccurrence = refPropData[icc.itgPropoccurrence];
            }
            // validate the occurrence
            let ipmdDataOccurrence: number = 1;
            if (valIsArray) {
                ipmdDataOccurrence =  ipmdPropValue.length;
            }
            if (propoccurrence === icc.itgPropoccurSingle) {
                if (ipmdDataOccurrence > 1){
                    ipmdPropValue = ipmdPropValue[0];
                    ipmdDataOccurrence = 1;
                }
            }

            // datatype "string"
            if (datatype === icc.itgDtString && propoccurrence === icc.itgPropoccurSingle && typeof ipmdPropValue === 'string') {
                const ipmdPropValueStr: string = ipmdPropValue.toString();
                if (ipmdPropValueStr.indexOf(icc.anyPlusBaseUrl) == 0)
                {
                    if (genOptions.disabledPrintConv) {
                        etPropValue = ipmdPropValueStr.substring(icc.anyPlusBaseUrl.length);
                    } else {
                        etPropValue = valmap.ipmdToEt(ipmdPropValueStr);
                    }

                }
                else etPropValue = ipmdPropValueStr;
            }
            if (datatype === icc.itgDtString && propoccurrence === icc.itgPropoccurMulti && valIsArray) {
                etPropValue = ipmdPropValue;
            }
            // datatype "string" + dataformat date-time
            if (datatype === icc.itgDtString && dataformat === icc.itgDfDt && propoccurrence === icc.itgPropoccurSingle && typeof ipmdPropValue === 'string') {
                etPropValue = util1.xmpIsoDatetime2etDatetime(ipmdPropValue);
            }
            // datatype "number"
            if (datatype === icc.itgDtNumber && propoccurrence === icc.itgPropoccurSingle && typeof ipmdPropValue === 'number') {
                etPropValue = ipmdPropValue;
            }
            if (datatype === icc.itgDtNumber && propoccurrence === icc.itgPropoccurMulti && valIsArray) {
                etPropValue = ipmdPropValue;
            }
            // datatype "struct" + dataformat = 'AltLang'
            if (datatype === icc.itgDtStruct && dataformat === icc.itgDfAlg && propoccurrence === icc.itgPropoccurSingle && typeof ipmdPropValue === 'string') {
                const ipmdPropValueStr: string = ipmdPropValue.toString();
                const altLangStartIdx: number = ipmdPropValueStr.indexOf('{@');
                if (altLangStartIdx > -1){
                    const ipmdPropValues: string[] = ipmdPropValueStr.split('{@');
                    ipmdPropValues.forEach(altstring => {
                        if (altstring.indexOf('}') > -1){
                            altLangActive = true;
                        }
                    })
                    etPropValue = ipmdPropValues;
                }
                else etPropValue = ipmdPropValue;
            }
            if (datatype === icc.itgDtStruct && dataformat === icc.itgDfAlg && propoccurrence === icc.itgPropoccurMulti && valIsArray) {
                etPropValue = ipmdPropValue;
            }
            // datatype "struct" + dataformat != 'AltLang'
            // console.log(typeof ipmdPropValue);
            if (datatype === icc.itgDtStruct && dataformat !== icc.itgDfAlg && propoccurrence === icc.itgPropoccurSingle && typeof ipmdPropValue === 'object') {
                etPropValue = this._generateExiftoolJsonStruct(refPropId, dataformat, propoccurrence, ipmdDataOccurrence)[0];
            }
            if (datatype === icc.itgDtStruct && dataformat !== icc.itgDfAlg && propoccurrence === icc.itgPropoccurMulti && valIsArray) {
                etPropValue = this._generateExiftoolJsonStruct(refPropId, dataformat, propoccurrence, ipmdDataOccurrence);
            }
            // set XMP value(s)
            if (refPropData.hasOwnProperty(icc.itgEtXmp)) {
                if (etPropValue !== undefined) {
                    if (altLangActive) {
                        etPropValue.forEach((altstring: string) => {
                            let langEndIdx: number = altstring.indexOf('}');
                            if (langEndIdx == -1){
                                etJson[refPropData[icc.itgEtXmp]] = altstring;
                            }
                            if (langEndIdx > -1){
                                let langid: string = altstring.substring(0, langEndIdx);
                                etJson[refPropData[icc.itgEtXmp] + '-' + langid] = altstring.substring(langEndIdx + 1);
                            }
                        })
                    }
                    else etJson[refPropData[icc.itgEtXmp]] = etPropValue;
                }
            }
            // set IIM value(s)
            if (refPropData.hasOwnProperty(icc.itgEtIim)) {
                if (etPropValue !== undefined) {
                    switch (refPropId) {
                        case 'dateCreated':
                            let etPropValues: [string] = etPropValue.split(" ");
                            etJson['IPTC:DateCreated'] = etPropValues[0];
                            if (etPropValues.length > 1){
                                // @ts-ignore
                                etJson['IPTC:TimeCreated'] = etPropValues[1];
                            }
                            break;
                        case 'subjectCodes':
                            etJson[refPropData[icc.itgEtIim]] = 'IPTC:' + etPropValue;
                            break;
                        case 'intellectualGenre':
                            etJson[refPropData[icc.itgEtIim]] = '000:' + etPropValue;
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
                        case 'dateCreated':
                            etJson['ExifIFD:DateTimeOriginal'] = etPropValue.substring(0, 19);
                            etJson['ExifIFD:TimeZoneOffset'] = etPropValue.substring(19);
                            break;
                        case 'imageRegion':  // the mapping to Exif's Subject Area is virtual
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

    private _generateExiftoolJsonStruct(
        propPath: string,
        structId: string,
        propOccurrence: string,
        dataOccurrence: number): [object] {
        let etJsonStructArr: [object] = [{}];
        let dummy = etJsonStructArr.pop();
        for (let itemIdx = 0; itemIdx < dataOccurrence; itemIdx++) {
            let etJsonStruct: MdStruct = {};
            let refIpmdStruct = this.ipmdRef[icc.itgIpmdStruct][structId];
            // Iterate all properties of the reference ipmd_struct[structId]
            for (const refPropId in refIpmdStruct) {
                let refPropData = refIpmdStruct[refPropId];
                let thisPropPath = propPath;
                if (propOccurrence === icc.itgPropoccurMulti){
                    thisPropPath +=  '#' + itemIdx.toString();
                }
                thisPropPath += this._lsep + refPropId;
                // get the value of the property
                let ipmdPropValue;
                let getPropValueFsd = this._ipmdDataFsd.getFsData(thisPropPath);
                if (getPropValueFsd[icc.fsdResState] === icc.fsdStFound) {
                    ipmdPropValue = getPropValueFsd[icc.fsdResValue];
                } else continue;
                // the property value of Et-JSON
                let etPropValue;

                let valIsArray: boolean = Array.isArray(ipmdPropValue);
                const datatype: string = refPropData[icc.itgDatatype];
                let dataformat: string = '';
                if (refPropData.hasOwnProperty(icc.itgDataformat)) {
                    dataformat = refPropData[icc.itgDataformat];
                }
                let altLangActive: boolean = false;
                let propoccurrence: string = '';
                if (refPropData.hasOwnProperty(icc.itgPropoccurrence)){
                    propoccurrence = refPropData[icc.itgPropoccurrence];
                }
                // validate the occurrence
                let ipmdDataOccurrence: number = 1;
                if (valIsArray) {
                    ipmdDataOccurrence =  ipmdPropValue.length;
                }
                if (propoccurrence === icc.itgPropoccurSingle) {
                    if (ipmdDataOccurrence > 1){
                        ipmdPropValue = ipmdPropValue[0];
                        ipmdDataOccurrence = 1;
                    }
                }

                // datatype "string"
                if (datatype === icc.itgDtString && propoccurrence === icc.itgPropoccurSingle && typeof ipmdPropValue === 'string') {
                    const ipmdPropValueStr: string = ipmdPropValue.toString();
                    if (ipmdPropValueStr.indexOf(icc.anyPlusBaseUrl) == 0)
                    {
                        etPropValue = valmap.ipmdToEt(ipmdPropValueStr);
                    }
                    else etPropValue = ipmdPropValueStr;
                }
                if (datatype === icc.itgDtString && propoccurrence === icc.itgPropoccurMulti && valIsArray) {
                    etPropValue = ipmdPropValue;
                }
                // datatype "string" + dataformat date-time
                if (datatype === icc.itgDtString && dataformat === icc.itgDfDt && propoccurrence === icc.itgPropoccurSingle && typeof ipmdPropValue === 'string') {
                    etPropValue = util1.xmpIsoDatetime2etDatetime(ipmdPropValue);
                }
                // datatype "number"
                if (datatype === icc.itgDtNumber && propoccurrence === icc.itgPropoccurSingle && typeof ipmdPropValue === 'number') {
                    etPropValue = ipmdPropValue;
                }
                if (datatype === icc.itgDtNumber && propoccurrence === icc.itgPropoccurMulti && valIsArray) {
                    etPropValue = ipmdPropValue;
                }
                // datatype "struct" + dataformat = 'AltLang'
                if (datatype === icc.itgDtStruct && dataformat === icc.itgDfAlg && propoccurrence === icc.itgPropoccurSingle && typeof ipmdPropValue === 'string') {
                    const ipmdPropValueStr: string = ipmdPropValue.toString();
                    const altLangStartIdx: number = ipmdPropValueStr.indexOf('{@');
                    if (altLangStartIdx > -1){
                        const ipmdPropValues: string[] = ipmdPropValueStr.split('{@');
                        ipmdPropValues.forEach(altstring => {
                            if (altstring.indexOf('}') > -1){
                                altLangActive = true;
                            }
                        })
                        etPropValue = ipmdPropValues;
                    }
                    else etPropValue = ipmdPropValue;
                }
                if (datatype === icc.itgDtStruct && dataformat === icc.itgDfAlg && propoccurrence === icc.itgPropoccurMulti && valIsArray) {
                    etPropValue = ipmdPropValue;
                }
                // datatype "struct" + dataformat != 'AltLang'
                if (datatype === icc.itgDtStruct && dataformat !== icc.itgDfAlg && propoccurrence === icc.itgPropoccurSingle && typeof ipmdPropValue === 'object') {
                    etPropValue = this._generateExiftoolJsonStruct(thisPropPath, dataformat, propoccurrence, ipmdDataOccurrence)[0];
                }
                if (datatype === icc.itgDtStruct && dataformat !== icc.itgDfAlg && propoccurrence === icc.itgPropoccurMulti && valIsArray) {
                    etPropValue = this._generateExiftoolJsonStruct(thisPropPath, dataformat, propoccurrence, ipmdDataOccurrence);
                }
                if (refPropData.hasOwnProperty(icc.itgEtTag)) {
                    if (etPropValue !== undefined) {
                        if (altLangActive) {
                            etPropValue.forEach((altstring: string) => {
                                let langEndIdx: number = altstring.indexOf('}');
                                if (langEndIdx == -1){
                                    etJsonStruct[refPropData[icc.itgEtTag]] = altstring;
                                }
                                if (langEndIdx > -1){
                                    let langid: string = altstring.substring(0, langEndIdx);
                                    etJsonStruct[refPropData[icc.itgEtTag] + '-' + langid] = altstring.substring(langEndIdx + 1);
                                }
                            })
                        }
                        else etJsonStruct[refPropData[icc.itgEtTag]] = etPropValue;
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
    private static _loadIpmdRefJson (ipmdRefFp: string): object {
        if (!fs.existsSync(ipmdRefFp))
            return {};
        return util1.loadFromJson(ipmdRefFp);
    }

}