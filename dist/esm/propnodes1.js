import * as icc from "./constants";
import * as util1 from "./utilities1";
import FixedStructureData from "./fixed_structure_data";
/**
 * Class holds all options relevant for the design of the output
 */
export class OutputDesignOptions {
    constructor() {
        this.ipmdfull = false; // IPTC photo metadata, full set of properties
        this.topics = false; // IPTC photo metadata, grouped by User Guide topics
        this.fstds = false; // format standards: XMP, IIM, Exif
        this.isearch1 = false; // metadata properties relevant for search engines
        this.wvalonly = false; // only properties with value are in the generated PropNodes
    }
}
/**
 * Enumeration of types of label values:
 * ipmd = IPTC Photo Metadata Standard
 * valuefmt = standards of the value format
 * et = ExifTool
 */
export var Labeltype;
(function (Labeltype) {
    Labeltype[Labeltype["ipmd"] = 0] = "ipmd";
    Labeltype[Labeltype["valuefmt"] = 1] = "valuefmt";
    Labeltype[Labeltype["et"] = 2] = "et";
})(Labeltype || (Labeltype = {}));
/**
 * Class with properties holding arrays of PropNodes
 * for different Output Designs
 */
export class PropNodesArraysSet1 {
    constructor() {
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
        // any other data than IPTC photo metadata
        this.anyOtherDataPna = [];
    }
}
/**
 * Enumeration of types of PropNodes, see property ptype of IPropNode
 */
export var Ptype;
(function (Ptype) {
    Ptype[Ptype["plain"] = 0] = "plain";
    Ptype[Ptype["struct"] = 1] = "struct";
})(Ptype || (Ptype = {}));
// Internal constants
const fsdLsep = "/";
const fsdIsel = "#";
/**
 * Transforms an IPTC Photo Metadata Checker Result object
 *   to a set of trees of PropNodes (property nodes)
 * @param ipmdChkResult The to-be-transformed IPTC Photo Metadata Checker Result
 * @param opdOpt Options for the design of the output
 * @param labeltype To-be-used type of the labels
 * @param noValueText Text to be shown if no value was found for a property
 * @param ipmdIdFilter Array of to-be-shown IPTC property Ids, if empty all properties are shown
 * @param ipmdTechRef Data of the IPTC PMD TechReference
 * @param anyOtherDataRef Reference data of any non-IPTC properties
 */
export function ipmdChkResultToPropNodes(ipmdChkResult, opdOpt, labeltype, noValueText, ipmdIdFilter, ipmdTechRef, anyOtherDataRef) {
    /**
     * As creating the tree of PropNodes is quite complex code lines checking the state of data regarding
     * an IPTC photo metadata property should have a comment on all states at this point in the code
     * using the structure below. This regards to IPTC rules defined for displaying IPTC photo metadata.
     * These states are shown:
     * UI parameter Values: show with value only: wvo, show with or without value: wwov
     * Checker Result state properties:
     *   XMP: doesn't exist: 0, exists: 1
     *   IIM: defined: yes/not defined: no, if yes: doesn't exist: 0, exists: 1
     *   Exif: mapped: yes/not mapped: no, if yes: doesn't exist: 0, exists: 1
     *   XMP/IIM values in sync --> INSYNC:
     *     IIM is defined: yes/IIM not defined: no
     *     if INSYNC:yes: not in sync: 0, in sync: 1, XMP or IIM doesn't exist: -1
     *   (XMP/IIM)/Exif values in sync --> MAPINSYNC:
     *     XMP/IIM sync is checked (INSYNC) + Exif is mapped: yes/
     *     if XMP/IIM sync not checked (INSYNC:no) or Exif is not mapped: no
     *     if yes: not in sync: 0, in sync: 1, XMP/IIM sync or Exif doesn't exist: -1
     * State line examples:
     * wvo, XMP:1, IIM:yes:1, Exif:yes:1, INSYNC:yes:1, MAPINSYNC:yes:1
     * wvo, XMP:1, IIM:yes:1, Exif:yes:1, INSYNC:yes:0, MAPINSYNC:yes:0
     * wvo, XMP:1, IIM:yes:0, Exif:yes:1, INSYNC:yes:0, MAPINSYNC:yes:-1
     * wvo, XMP:1, IIM:no, Exif:yes:1, INSYNC:no, MAPINSYNC:no
     * wvo, XMP:1, IIM:no, Exif:no, INSYNC:no, MAPINSYNC:no
     * wvo, XMP:1, IIM:yes,1, Exif:no, INSYNC:yes:1, MAPINSYNC:no
     */
    const ipmdTechRefFsd = new FixedStructureData(ipmdTechRef, false);
    const ipmdChkResultFsd = new FixedStructureData(ipmdChkResult, false);
    const ipmdChkResultState = ipmdChkResultFsd.getFsData(icc.ipmdcrState)["value"];
    const allPNodesArrays = new PropNodesArraysSet1();
    let ipmdcrSpropIds = [];
    const ipmdcrSpropIdsPre = Object.keys(ipmdChkResultState);
    if (ipmdIdFilter.length === 0) {
        ipmdcrSpropIds = ipmdcrSpropIdsPre;
    }
    else {
        ipmdcrSpropIdsPre.forEach(function (ipmdId) {
            if (ipmdIdFilter.includes(ipmdId)) {
                ipmdcrSpropIds.push(ipmdId);
            }
        });
    }
    ipmdcrSpropIds.forEach((ipmdPropId) => {
        // get reference data:
        const propIpmdRefData = ipmdTechRefFsd.getFsData(icc.itgIpmdTop + fsdLsep + ipmdPropId)["value"];
        // get state data:
        const propImpdStateData = ipmdChkResultFsd.getFsData(icc.ipmdcrState + fsdLsep + ipmdPropId + fsdLsep + icc.ipmdcrSData)["value"];
        let propValue;
        // try to create a PropNode for the IIM-variant of the property
        const iimPropNode = _initPropNode(noValueText);
        iimPropNode.ptype = icc.pnodeTypePlain;
        if (propIpmdRefData[icc.itgIimid] !== undefined) {
            switch (labeltype) {
                case Labeltype.ipmd:
                    iimPropNode.plabel = propIpmdRefData[icc.itgName];
                    break;
                case Labeltype.valuefmt:
                    iimPropNode.plabel =
                        propIpmdRefData[icc.itgIimid] +
                            " " +
                            propIpmdRefData[icc.itgIimname];
                    break;
                case Labeltype.et:
                    iimPropNode.plabel = propIpmdRefData[icc.itgEtIim];
                    break;
            }
            iimPropNode.psort = propIpmdRefData[icc.itgSortorder] + "i";
            iimPropNode.pspecidx = propIpmdRefData[icc.itgSpecidx];
            const iimOccur = propImpdStateData[icc.ipmdcrSDiim];
            if (iimOccur > 0) {
                propValue = ipmdChkResultFsd.getFsData(icc.ipmdcrValue + fsdLsep + ipmdPropId + fsdLsep + icc.ipmdcrViim)["value"];
                iimPropNode.pvalue = _generateOutputStr(propValue);
                iimPropNode.hasValue = true;
            }
        }
        // try to create a PropNode for the Exif-variant of the property
        const exifPropNode = _initPropNode(noValueText);
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
            exifPropNode.psort = propIpmdRefData[icc.itgSortorder] + "x";
            exifPropNode.pspecidx = propIpmdRefData[icc.itgSpecidx];
            const exifOccur = propImpdStateData[icc.ipmdcrSDexif];
            if (exifOccur > 0) {
                propValue = ipmdChkResultFsd.getFsData(icc.ipmdcrValue + fsdLsep + ipmdPropId + fsdLsep + icc.ipmdcrVexif)["value"];
                exifPropNode.pvalue = _generateOutputStr(propValue);
                exifPropNode.hasValue = true;
            }
        }
        // try to create a PropNode for the XMP-variant of the property
        const ipmdChkResPathState = icc.ipmdcrState + fsdLsep + ipmdPropId;
        const ipmdChkResPathValue = icc.ipmdcrValue + fsdLsep + ipmdPropId;
        const ipmdTechRefPath = icc.itgIpmdTop + fsdLsep + ipmdPropId;
        const xmpPropNode = _generateXmpPropNode(ipmdChkResPathState, ipmdChkResPathValue, ipmdChkResultFsd, propIpmdRefData, opdOpt.wvalonly, labeltype, noValueText, ipmdTechRefPath, ipmdTechRefFsd);
        const xmpPropNodeVar1 = util1.deepCopyPn(xmpPropNode);
        let stateInsync = 0;
        if (propImpdStateData[icc.ipmdcrSDinsync] !== undefined) {
            stateInsync = propImpdStateData[icc.ipmdcrSDinsync];
        }
        else {
            stateInsync = -1;
        }
        let stateMapinsync = 0;
        if (propImpdStateData[icc.ipmdcrSDmapinsync] !== undefined) {
            stateMapinsync = propImpdStateData[icc.ipmdcrSDmapinsync];
        }
        else {
            stateMapinsync = 99;
        }
        /** Create the PropNode output for all specified IPTC PMD properties,
         *    regardless of having a value or not */
        if (!opdOpt.wvalonly) {
            if (propImpdStateData[icc.ipmdcrSDiim] !== undefined) {
                // IIM is specified for this property
                const iimPropNodeVar1 = util1.deepCopyPn(iimPropNode);
                iimPropNodeVar1.plabel = iimPropNode.plabel;
                iimPropNodeVar1.pembformat = "IIM";
                if (stateInsync === 1) {
                    // XMP and IIM are in sync
                    if (stateMapinsync < 99) {
                        if (stateMapinsync === 1) {
                            // XMP, IIM, Exif are in sync, MAPINSYNC === 1
                            xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                            xmpPropNodeVar1.pembformat = "XMP,IIM,Exif";
                            xmpPropNodeVar1.pinsync = 2;
                            allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                            _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                            _push_schemaorgPna(opdOpt, ipmdPropId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                        }
                        else {
                            // XMP, IIM exist and are in sync, Exif exists but not in sync
                            //     MAPINSYNC != 1
                            xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                            xmpPropNodeVar1.pembformat = "XMP,IIM";
                            xmpPropNodeVar1.pinsync = 1;
                            allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                            const exifPropNodeVar1 = util1.deepCopyPn(exifPropNode);
                            exifPropNodeVar1.plabel = exifPropNode.plabel;
                            exifPropNodeVar1.pembformat = "Exif";
                            exifPropNodeVar1.pinsync = -2;
                            allPNodesArrays.ipmdFullPna1.push(exifPropNodeVar1);
                            _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, exifPropNodeVar1);
                            _push_schemaorgPna(opdOpt, ipmdPropId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                        }
                    }
                    else {
                        // XMP and IIM exist, are in sync - no value for MAPINSYNC exists
                        xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                        xmpPropNodeVar1.pembformat = "XMP,IIM";
                        xmpPropNodeVar1.pinsync = 1;
                        allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                        _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                        _push_schemaorgPna(opdOpt, ipmdPropId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                    }
                }
                else {
                    // XMP and IIM exist, are not in sync, INSYNC != 1
                    xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                    xmpPropNodeVar1.pembformat = "XMP";
                    xmpPropNodeVar1.pinsync = -1;
                    allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                    iimPropNodeVar1.pinsync = -1;
                    allPNodesArrays.ipmdFullPna1.push(iimPropNodeVar1);
                    if (propImpdStateData[icc.ipmdcrSDmapinsync] !== undefined) {
                        // XMP and IIM exist, are not in sync, Exif exists
                        const exifPropNodeVar1 = util1.deepCopyPn(exifPropNode);
                        exifPropNodeVar1.plabel = exifPropNode.plabel;
                        exifPropNodeVar1.pembformat = "Exif";
                        exifPropNodeVar1.pinsync = -2;
                        allPNodesArrays.ipmdFullPna1.push(exifPropNodeVar1);
                        _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, iimPropNodeVar1, exifPropNodeVar1);
                    }
                    else {
                        // XMP and IIM exist, are not in sync, Exif does not exist
                        _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, iimPropNodeVar1, null);
                    }
                    _push_schemaorgPna(opdOpt, ipmdPropId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                }
            }
            else {
                // IIM is "undefined" - therefore only XMP is specified
                xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                xmpPropNodeVar1.pembformat = "XMP";
                allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                _push_schemaorgPna(opdOpt, ipmdPropId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
            }
        }
        else {
            /** Create the PropNode output only for specified IPTC PMD properties
             * if they have a value */
            if (propImpdStateData[icc.ipmdcrSDiim] !== undefined) {
                // IIM is specified for this property
                const iimPropNodeVar1 = util1.deepCopyPn(iimPropNode);
                iimPropNodeVar1.plabel = iimPropNode.plabel;
                iimPropNodeVar1.pembformat = "IIM";
                if (stateInsync === 1) {
                    // XMP and IIM are in sync
                    if (stateMapinsync < 99) {
                        if (stateMapinsync === 1) {
                            // XMP, IIM, Exif are in sync
                            xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                            xmpPropNodeVar1.pembformat = "XMP,IIM,Exif";
                            xmpPropNodeVar1.pinsync = 2;
                            if (xmpPropNodeVar1.hasValue) {
                                allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                                _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                                _push_schemaorgPna(opdOpt, ipmdPropId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                            }
                        }
                        else {
                            // XMP, IIM exist and are in sync, Exif exists but not in sync
                            xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                            xmpPropNodeVar1.pembformat = "XMP,IIM";
                            xmpPropNodeVar1.pinsync = 1;
                            if (xmpPropNodeVar1.hasValue) {
                                allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                                _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                                _push_schemaorgPna(opdOpt, ipmdPropId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                            }
                            const exifPropNodeVar1 = util1.deepCopyPn(exifPropNode);
                            exifPropNodeVar1.plabel = exifPropNode.plabel;
                            exifPropNodeVar1.pembformat = "Exif";
                            exifPropNodeVar1.pinsync = -2;
                            if (exifPropNodeVar1.hasValue) {
                                allPNodesArrays.ipmdFullPna1.push(exifPropNodeVar1);
                                _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], null, null, exifPropNodeVar1);
                            }
                            else {
                                exifPropNodeVar1.pvalue = "[no value]";
                                allPNodesArrays.ipmdFullPna1.push(exifPropNodeVar1);
                                _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], null, null, exifPropNodeVar1);
                            }
                        }
                    }
                    else {
                        // XMP and IIM exist, are in sync
                        xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                        xmpPropNodeVar1.pembformat = "XMP,IIM";
                        xmpPropNodeVar1.pinsync = 1;
                        if (xmpPropNodeVar1.hasValue) {
                            allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                            _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                            _push_schemaorgPna(opdOpt, ipmdPropId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                        }
                    }
                }
                else {
                    // XMP and IIM exist, are not in sync - INSYNC != 1
                    xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                    xmpPropNodeVar1.pembformat = "XMP";
                    xmpPropNodeVar1.pinsync = -1;
                    if (xmpPropNodeVar1.hasValue) {
                        allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                        _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                        _push_schemaorgPna(opdOpt, ipmdPropId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                    }
                    if (iimPropNodeVar1.hasValue) {
                        iimPropNodeVar1.pinsync = -1;
                        allPNodesArrays.ipmdFullPna1.push(iimPropNodeVar1);
                        _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], null, iimPropNodeVar1, null);
                    }
                    if (exifPropNode.hasValue) {
                        // XMP and IIM exist, are not in sync, Exif exists and has a value
                        const exifPropNodeVar1 = util1.deepCopyPn(exifPropNode);
                        exifPropNodeVar1.plabel = exifPropNode.plabel;
                        exifPropNodeVar1.pembformat = "Exif";
                        exifPropNodeVar1.pinsync = -2;
                        allPNodesArrays.ipmdFullPna1.push(exifPropNodeVar1);
                        _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], null, null, exifPropNodeVar1);
                    }
                }
            }
            else {
                // XMP only is specified - IIM is undefined
                if (xmpPropNodeVar1.pvalue !== "" && !exifPropNode.hasValue) {
                    // XMP has a value, Exif has no value
                    xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                    xmpPropNodeVar1.pembformat = "XMP";
                    if (xmpPropNodeVar1.hasValue) {
                        allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                        _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                        _push_schemaorgPna(opdOpt, ipmdPropId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                    }
                    /*
                    if (exifPropNode.hasValue) {
                      // both XMP and Exif exist and have a value
                      const exifPropNodeVar1: IPropNode = util1.deepCopyPn(exifPropNode);
                      exifPropNodeVar1.plabel = exifPropNode.plabel;
                      exifPropNodeVar1.pembformat = "Exif";
                      if (stateMapinsync === 1) {
                        exifPropNodeVar1.pinsync = 2;
                      } else {
                        exifPropNodeVar1.pinsync = -2;
                      }
                      allPNodesArrays.ipmdFullPna1.push(exifPropNodeVar1);
                      _ugtPush_allPNodesArr(
                        opdOpt,
                        allPNodesArrays,
                        propIpmdRefData[icc.itgUgtopic],
                        null,
                        null,
                        exifPropNodeVar1,
                      );
                    }
                     */
                }
                if (xmpPropNodeVar1.pvalue !== "" && exifPropNode.hasValue) {
                    // both XMP and Exif have a value
                    xmpPropNodeVar1.plabel = xmpPropNode.plabel;
                    xmpPropNodeVar1.pembformat = "XMP";
                    const exifPropNodeVar1 = util1.deepCopyPn(exifPropNode);
                    exifPropNodeVar1.plabel = exifPropNode.plabel;
                    exifPropNodeVar1.pembformat = "Exif";
                    if (stateMapinsync === 1) {
                        exifPropNodeVar1.pinsync = 2;
                    }
                    else {
                        exifPropNodeVar1.pinsync = -2;
                    }
                    if (exifPropNodeVar1.pinsync > 0) {
                        // XMP and Exif are in sync
                        xmpPropNodeVar1.pembformat = "XMP,Exif";
                        xmpPropNodeVar1.pinsync = 2;
                        allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                        _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                        _push_schemaorgPna(opdOpt, ipmdPropId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                    }
                    else {
                        // exifPropNodeVar1.pinsync <= 0
                        // XMP and Exif are NOT in sync
                        allPNodesArrays.ipmdFullPna1.push(xmpPropNodeVar1);
                        allPNodesArrays.ipmdFullPna1.push(exifPropNodeVar1);
                        _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], xmpPropNodeVar1, null, null);
                        _push_schemaorgPna(opdOpt, ipmdPropId, propIpmdRefData, xmpPropNodeVar1, allPNodesArrays);
                        _ugtPush_allPNodesArr(opdOpt, allPNodesArrays, propIpmdRefData[icc.itgUgtopic], null, null, exifPropNodeVar1);
                    }
                }
            }
        }
        // create the PropNode output for the OutputDesign option "fstds"
        if (opdOpt.fstds) {
            if (propImpdStateData[icc.ipmdcrSDxmp] !== undefined) {
                // XMP is specified for this property
                if (opdOpt.wvalonly) {
                    if (xmpPropNode.hasValue) {
                        allPNodesArrays.xmpPna.push(xmpPropNode);
                    }
                }
                else
                    allPNodesArrays.xmpPna.push(xmpPropNode);
            }
            if (propImpdStateData[icc.ipmdcrSDiim] !== undefined) {
                // IIM is specified for this property
                if (opdOpt.wvalonly) {
                    if (iimPropNode.hasValue) {
                        allPNodesArrays.iimPna.push(iimPropNode);
                    }
                }
                else
                    allPNodesArrays.iimPna.push(iimPropNode);
            }
            if (propImpdStateData[icc.ipmdcrSDexif] !== undefined) {
                // Exif is specified for this property
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
        const label = anyOtherDataProp["label"];
        const anyOtherDataId = icc.ipmdcrVaodPrefix + etTag;
        const propValue = ipmdChkResultFsd.getFsData(icc.ipmdcrValue + fsdLsep + anyOtherDataId + fsdLsep + icc.ipmdcrVet)["value"];
        if (propValue !== undefined) {
            const anyDataPropNode = _initPropNode(noValueText);
            anyDataPropNode.plabel = label;
            anyDataPropNode.ptype = icc.pnodeTypePlain;
            anyDataPropNode.pvalue = _generateOutputStr(propValue);
            anyDataPropNode.hasValue = true;
            allPNodesArrays.anyOtherDataPna.push(anyDataPropNode);
        }
    }
    return allPNodesArrays;
}
/**
 * Recursive internal function for creating XMP values which may be structured
 * @param ipmdChkResPathState Path to this property in the State segment of the ipmdCheckResult object
 * @param ipmdChkResPathValue Path to this property in the Value segment of the ipmdCheckResult object
 * @param ipmdChkResultFsd The ipmdCheckResult as Fixed Structure Data
 * @param propIpmdRefData  Structured data of this property from the TechReference
 * @param wValueOnly Boolean parameter, if only properties with a value should be included (if true)
 * @param labeltype Parameter to set the type of the used property labels
 * @param noValueText Parameter with a (short) string which is used in PNodes without a value
 * @param ipmdTechRefPath Path to this property in the TechReference object
 * @param ipmdTechRefFsd The TechReference as Fixed Structure Data
 */
function _generateXmpPropNode(ipmdChkResPathState, ipmdChkResPathValue, ipmdChkResultFsd, propIpmdRefData, wValueOnly, labeltype, noValueText, ipmdTechRefPath, ipmdTechRefFsd) {
    let propRefDtIsStruct = false;
    if (propIpmdRefData[icc.itgDatatype] === icc.itgDtStruct) {
        propRefDtIsStruct = true;
    }
    let propRefStructId = "";
    if (propRefDtIsStruct) {
        propRefStructId = propIpmdRefData[icc.itgDataformat];
    }
    const propNode = _initPropNode(noValueText);
    switch (labeltype) {
        case Labeltype.ipmd:
            propNode.plabel = propIpmdRefData[icc.itgName];
            break;
        case Labeltype.valuefmt:
            propNode.plabel = propIpmdRefData[icc.itgXmpid];
            break;
        case Labeltype.et:
            if (propIpmdRefData.hasOwnProperty(icc.itgEtXmp)) {
                propNode.plabel = propIpmdRefData[icc.itgEtXmp];
            }
            else {
                if (propIpmdRefData.hasOwnProperty(icc.itgEtTag)) {
                    propNode.plabel = propIpmdRefData[icc.itgEtTag];
                }
                else
                    propNode.plabel = " ";
            }
            break;
    }
    propNode.psort = propIpmdRefData[icc.itgSortorder];
    propNode.pspecidx = propIpmdRefData[icc.itgSpecidx];
    // sort out: is the value of the property a plain value or a structure
    let propContentType = Ptype.plain;
    const testIsStruct = ipmdChkResultFsd.getFsData(ipmdChkResPathState + fsdLsep + icc.ipmdcrSStruct);
    if (testIsStruct["state"] === "FOUND") {
        propContentType = Ptype.struct;
    }
    if (propContentType === Ptype.plain) {
        // value type === plain
        propNode.ptype = icc.pnodeTypePlain;
        const propValue = ipmdChkResultFsd.getFsData(ipmdChkResPathValue + fsdLsep + icc.ipmdcrVxmp)["value"];
        propNode.pvalue = _generateOutputStr(propValue);
        if (propNode.pvalue !== "") {
            propNode.hasValue = true;
        }
        else {
            propNode.pvalue = noValueText;
        }
    }
    else {
        // value type === struct
        propNode.ptype = icc.pnodeTypeStruct;
        const ipmdDataState = ipmdChkResultFsd.getFsData(ipmdChkResPathState + fsdLsep + icc.ipmdcrSStruct)["value"];
        const statestructIpmdIds = Object.keys(ipmdDataState);
        const fullStructPna = [];
        // check if the value of this structure is a single object or an array of objects
        const testStructValue = ipmdChkResultFsd.getFsData(ipmdChkResPathValue + fsdLsep + icc.ipmdcrSStruct)["value"];
        if (Array.isArray(testStructValue)) {
            // structure value is an array of objects
            const superIdx = testStructValue.length;
            // loop across all value-objects in the array
            for (let idx = 0; idx < superIdx; idx++) {
                // iterate across all properties of the single value-object of this structure
                statestructIpmdIds.forEach(function (ipmdId) {
                    // get reference data:
                    const ipmdTechRefPathSub = icc.itgIpmdStruct + fsdLsep + propRefStructId + fsdLsep + ipmdId;
                    const propIpmdRefDataSub = ipmdTechRefFsd.getFsData(ipmdTechRefPathSub)["value"];
                    // get state data:
                    const ipmdChkResPathStateSub = ipmdChkResPathState +
                        fsdLsep +
                        icc.ipmdcrSStruct +
                        fsdLsep +
                        ipmdId;
                    const ipmdChkResPathValueSub = ipmdChkResPathValue +
                        fsdLsep +
                        icc.ipmdcrSStruct +
                        fsdIsel +
                        idx.toString() +
                        fsdLsep +
                        ipmdId;
                    if (ipmdChkResPathStateSub.includes("$anypmdproperty")) {
                        // collect a pnode for each "$anypmdproperty" and insert it
                        const ipmdChkResPathValueBox = ipmdChkResPathValue +
                            fsdLsep +
                            icc.ipmdcrSStruct +
                            fsdIsel +
                            idx.toString();
                        const ipmdTechRefPathBox = icc.itgIpmdStruct + fsdLsep + propRefStructId;
                        const anyPropNodes = _generateAnyXmpPropNodes(ipmdChkResPathValueBox, ipmdChkResultFsd, propIpmdRefData, wValueOnly, labeltype, noValueText, ipmdTechRefPathBox, ipmdTechRefFsd);
                        anyPropNodes.forEach((anyPropNode) => {
                            anyPropNode.plabel =
                                "[" + (idx + 1).toString() + "] " + anyPropNode.plabel;
                            fullStructPna.push(anyPropNode);
                        });
                    }
                    else {
                        // not an "$anypmdproperty"
                        const structPropNode = _generateXmpPropNode(ipmdChkResPathStateSub, ipmdChkResPathValueSub, ipmdChkResultFsd, propIpmdRefDataSub, wValueOnly, labeltype, noValueText, ipmdTechRefPathSub, ipmdTechRefFsd);
                        structPropNode.plabel =
                            "[" + (idx + 1).toString() + "] " + structPropNode.plabel;
                        if (wValueOnly) {
                            if (structPropNode.hasValue)
                                fullStructPna.push(structPropNode);
                        }
                        else {
                            fullStructPna.push(structPropNode);
                        }
                    }
                });
            }
        }
        else {
            // structure value is a single object only
            // iterate across all properties of the single value-object of this structure
            statestructIpmdIds.forEach(function (ipmdId) {
                // get reference data:
                const ipmdTechRefPathSub = icc.itgIpmdStruct + fsdLsep + propRefStructId + fsdLsep + ipmdId;
                const propIpmdRefDataSub = ipmdTechRefFsd.getFsData(ipmdTechRefPathSub)["value"];
                // get state data:
                const ipmdChkResPathBothSub = ipmdChkResPathState + fsdLsep + icc.ipmdcrSStruct + fsdLsep + ipmdId;
                const structPropNode = _generateXmpPropNode(ipmdChkResPathBothSub, ipmdChkResPathBothSub, ipmdChkResultFsd, propIpmdRefDataSub, wValueOnly, labeltype, noValueText, ipmdTechRefPathSub, ipmdTechRefFsd);
                fullStructPna.push(structPropNode);
            });
        }
        propNode.pvalue = fullStructPna;
        let fullStructHasValue = false;
        const pnaLen = fullStructPna.length;
        for (let idx = 0; idx < pnaLen; idx++) {
            if (fullStructPna[idx].hasValue) {
                fullStructHasValue = true;
            }
        }
        propNode.hasValue = fullStructHasValue;
    }
    return propNode;
}
function _generateAnyXmpPropNodes(ipmdChkResPathValueBox, ipmdChkResultFsd, propIpmdRefData, wValueOnly, labeltype, noValueText, ipmdTechRefPath, ipmdTechRefFsd) {
    const anyPropNodes = [];
    const boxStruct = ipmdChkResultFsd.getFsData(ipmdChkResPathValueBox);
    if (boxStruct[icc.ipmdcrState] !== icc.fsdStFound)
        return anyPropNodes;
    const ipmdPropIdsInBox = Object.keys(boxStruct[icc.fsdResValue]);
    const boxTechRefData = ipmdTechRefFsd.getFsData(ipmdTechRefPath);
    if (boxTechRefData[icc.ipmdcrState] !== icc.fsdStFound)
        return anyPropNodes;
    const ipmdRefIdsinTechRef = Object.keys(boxTechRefData[icc.fsdResValue]);
    // remove "$anypmdproperty" - actually it must be here
    const aidx = ipmdRefIdsinTechRef.indexOf(icc.itgSpidAny);
    if (aidx !== -1) {
        ipmdRefIdsinTechRef.splice(aidx, 1);
    }
    ipmdPropIdsInBox.forEach((ipmdPropId) => {
        if (!ipmdRefIdsinTechRef.includes(ipmdPropId)) {
            // process only non-regular properties
            const ipmdChkResPathState = icc.ipmdcrState + fsdLsep + ipmdPropId;
            const ipmdChkResPathValue = ipmdChkResPathValueBox + fsdLsep + ipmdPropId;
            const propIpmdRefData = ipmdTechRefFsd.getFsData(icc.itgIpmdTop + fsdLsep + ipmdPropId)["value"];
            const ipmdTechRefPath = icc.itgIpmdTop + fsdLsep + ipmdPropId;
            const anyPropNode = _generateAnyXmpPropNode(ipmdChkResPathState, ipmdChkResPathValue, ipmdChkResultFsd, propIpmdRefData, wValueOnly, labeltype, noValueText, ipmdTechRefPath, ipmdTechRefFsd);
            if (!util1.objectIsEmpty(anyPropNode)) {
                anyPropNodes.push(anyPropNode);
            }
        }
    });
    return anyPropNodes;
}
/**
 * Recursive internal function for creating XMP values which may be structured
 * @param ipmdChkResPathState Path to this property in the State segment of the ipmdCheckResult object
 * @param ipmdChkResPathValue Path to this property in the Value segment of the ipmdCheckResult object
 * @param ipmdChkResultFsd The ipmdCheckResult as Fixed Structure Data
 * @param propIpmdRefData  Structured data of this property from the TechReference
 * @param wValueOnly Boolean parameter, if only properties with a value should be included (if true)
 * @param labeltype Parameter to set the type of the used property labels
 * @param noValueText Parameter with a (short) string which is used in PNodes without a value
 * @param ipmdTechRefPath Path to this property in the TechReference object
 * @param ipmdTechRefFsd The TechReference as Fixed Structure Data
 */
function _generateAnyXmpPropNode(ipmdChkResPathState, ipmdChkResPathValue, ipmdChkResultFsd, propIpmdRefData, wValueOnly, labeltype, noValueText, ipmdTechRefPath, ipmdTechRefFsd) {
    let propRefDtIsStruct = false;
    if (propIpmdRefData[icc.itgDatatype] === icc.itgDtStruct) {
        propRefDtIsStruct = true;
    }
    let propRefStructId = "";
    if (propRefDtIsStruct) {
        propRefStructId = propIpmdRefData[icc.itgDataformat];
    }
    const propNode = _initPropNode(noValueText);
    switch (labeltype) {
        case Labeltype.ipmd:
            propNode.plabel = propIpmdRefData[icc.itgName];
            break;
        case Labeltype.valuefmt:
            propNode.plabel = propIpmdRefData[icc.itgXmpid];
            break;
        case Labeltype.et:
            if (propIpmdRefData.hasOwnProperty(icc.itgEtXmp)) {
                propNode.plabel = propIpmdRefData[icc.itgEtXmp];
            }
            else {
                if (propIpmdRefData.hasOwnProperty(icc.itgEtTag)) {
                    propNode.plabel = propIpmdRefData[icc.itgEtTag];
                }
                else
                    propNode.plabel = " ";
            }
            break;
    }
    propNode.psort = propIpmdRefData[icc.itgSortorder];
    propNode.pspecidx = propIpmdRefData[icc.itgSpecidx];
    // sort out: is the value of the property a plain value or a structure
    let propContentType = Ptype.plain;
    const testIsStruct = ipmdChkResultFsd.getFsData(ipmdChkResPathState + fsdLsep + icc.ipmdcrSStruct);
    if (testIsStruct["state"] === "FOUND") {
        propContentType = Ptype.struct;
    }
    if (propContentType === Ptype.plain) {
        // value type === plain
        propNode.ptype = icc.pnodeTypePlain;
        const propValue = ipmdChkResultFsd.getFsData(ipmdChkResPathValue + fsdLsep + icc.ipmdcrVxmp)["value"];
        propNode.pvalue = _generateOutputStr(propValue);
        if (propNode.pvalue !== "") {
            propNode.hasValue = true;
        }
        else {
            propNode.pvalue = noValueText;
        }
    }
    else {
        // value type === struct
        propNode.ptype = icc.pnodeTypeStruct;
        const ipmdDataState = ipmdChkResultFsd.getFsData(ipmdChkResPathState + fsdLsep + icc.ipmdcrSStruct)["value"];
        const statestructIpmdIds = Object.keys(ipmdDataState);
        const fullStructPna = [];
        // check if the value of this structure is a single object or an array of objects
        const testStructValue = ipmdChkResultFsd.getFsData(ipmdChkResPathValue + fsdLsep + icc.ipmdcrSStruct)["value"];
        if (Array.isArray(testStructValue)) {
            // structure value is an array of objects
            const superIdx = testStructValue.length;
            // loop across all value-objects in the array
            for (let idx = 0; idx < superIdx; idx++) {
                // iterate across all properties of the single value-object of this structure
                statestructIpmdIds.forEach(function (ipmdId) {
                    // get reference data:
                    const ipmdTechRefPathSub = icc.itgIpmdStruct + fsdLsep + propRefStructId + fsdLsep + ipmdId;
                    const propIpmdRefDataSub = ipmdTechRefFsd.getFsData(ipmdTechRefPathSub)["value"];
                    // get state data:
                    const ipmdChkResPathStateSub = ipmdChkResPathState +
                        fsdLsep +
                        icc.ipmdcrSStruct +
                        fsdLsep +
                        ipmdId;
                    const ipmdChkResPathValueSub = ipmdChkResPathValue +
                        fsdLsep +
                        icc.ipmdcrSStruct +
                        fsdIsel +
                        idx.toString() +
                        fsdLsep +
                        ipmdId;
                    if (ipmdChkResPathStateSub.includes("$anypmdproperty")) {
                        // collect a pnode for each "$anypmdproperty" and insert it
                        const anyPropNodes = [];
                        anyPropNodes.forEach((anyPropNode) => {
                            fullStructPna.push(anyPropNode);
                        });
                    }
                    else {
                        // not an "$anypmdproperty"
                        const structPropNode = _generateXmpPropNode(ipmdChkResPathStateSub, ipmdChkResPathValueSub, ipmdChkResultFsd, propIpmdRefDataSub, wValueOnly, labeltype, noValueText, ipmdTechRefPathSub, ipmdTechRefFsd);
                        structPropNode.plabel =
                            "[" + (idx + 1).toString() + "] " + structPropNode.plabel;
                        if (wValueOnly) {
                            if (structPropNode.hasValue)
                                fullStructPna.push(structPropNode);
                        }
                        else {
                            fullStructPna.push(structPropNode);
                        }
                    }
                });
            }
        }
        else {
            // structure value is a single object only
            // iterate across all properties of the single value-object of this structure
            statestructIpmdIds.forEach(function (ipmdId) {
                // get reference data:
                const ipmdTechRefPathSub = icc.itgIpmdStruct + fsdLsep + propRefStructId + fsdLsep + ipmdId;
                const propIpmdRefDataSub = ipmdTechRefFsd.getFsData(ipmdTechRefPathSub)["value"];
                // get state data:
                const ipmdChkResPathBothSub = ipmdChkResPathState + fsdLsep + icc.ipmdcrSStruct + fsdLsep + ipmdId;
                const structPropNode = _generateXmpPropNode(ipmdChkResPathBothSub, ipmdChkResPathBothSub, ipmdChkResultFsd, propIpmdRefDataSub, wValueOnly, labeltype, noValueText, ipmdTechRefPathSub, ipmdTechRefFsd);
                fullStructPna.push(structPropNode);
            });
        }
        propNode.pvalue = fullStructPna;
        let fullStructHasValue = false;
        const pnaLen = fullStructPna.length;
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
    let outputStr = "";
    if (Array.isArray(propValue)) {
        for (let idx = 0; idx < propValue.length; idx++) {
            const singlevalue = propValue[idx];
            outputStr += "[" + (idx + 1).toString() + "] " + singlevalue + ", ";
        }
    }
    else {
        if (typeof propValue === "string") {
            outputStr = propValue;
        }
        if (typeof propValue === "number") {
            outputStr = propValue.toString();
        }
    }
    return outputStr;
}
/**
 * Initalizes an object of type IPropNode with default values
 */
function _initPropNode(pvalueDefault = "") {
    return {
        ptype: "",
        plabel: "",
        psort: "",
        pspecidx: "",
        pvalue: pvalueDefault,
        pinsync: 0,
        pembformat: "",
        hasValue: false,
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
    if (!opdOpt.topics) {
        // outputdesign topics is required
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
    if (!opdOpt.isearch1) {
        // outputdesing isearch1 is required
        return;
    }
    if (propIpmdRefData["SCHEMAid"] !== undefined) {
        const xmpPropNodeVar1 = util1.deepCopyPn(xmpPropNodeVar);
        xmpPropNodeVar1.plabel = _getSchemaOrgPropName(propIpmdRefData["SCHEMAid"]);
        allPNodesArrays.schemaorgPna.push(xmpPropNodeVar1);
    }
    // next: workaround to map the Licensor URL in a Licensor structure to a schema.org property
    if (ipmdId === "licensors") {
        const licUrlPropNode = _initPropNode();
        licUrlPropNode.ptype = icc.pnodeTypePlain;
        licUrlPropNode.plabel = "acquireLicensePage";
        const valCount = xmpPropNodeVar.pvalue.length;
        for (let idx = 0; idx < valCount; idx++) {
            const testPnode = xmpPropNodeVar.pvalue[idx];
            if (typeof testPnode !== "string") {
                if (testPnode["plabel"].includes("Licensor URL")) {
                    licUrlPropNode.pvalue = testPnode["pvalue"];
                    break;
                }
            }
        }
        if (licUrlPropNode.pvalue !== "") {
            allPNodesArrays.schemaorgPna.push(licUrlPropNode);
        }
    }
}
/**
 * Extracts the local Schema.org property id from the full schema.org identifier URL to act as property name
 * @param schemaOrgUrl
 */
function _getSchemaOrgPropName(schemaOrgUrl) {
    const urlParts = schemaOrgUrl.split("/");
    const lastIdx = urlParts.length - 1;
    const propName = urlParts[lastIdx];
    return propName;
}
//# sourceMappingURL=propnodes1.js.map