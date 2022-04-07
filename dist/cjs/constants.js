"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipmdcrSStruct = exports.ipmdcrSDvaloccur = exports.ipmdcrSDmapinsync = exports.ipmdcrSDinsync = exports.ipmdcrSDexif = exports.ipmdcrSDiim = exports.ipmdcrSDxmp = exports.ipmdcrSData = exports.ipmdcrState = exports.itgUgtRights = exports.itgUgtPerson = exports.itgUgtOthings = exports.itgUgtLocation = exports.itgUgtLicensing = exports.itgUgtImgreg = exports.itgUgtGimgcont = exports.itgUgtAdmin = exports.itgPropoccurMulti = exports.itgPropoccurSingle = exports.itgDfUrl = exports.itgDfUri = exports.itgDfDt = exports.itgDfAlg = exports.itgDtStruct = exports.itgDtNumber = exports.itgDtString = exports.itgIpmddatatype = exports.itgIpmdid = exports.itgEtTag = exports.itgEtExif = exports.itgEtIim = exports.itgEtXmp = exports.itgExifid = exports.itgIimmaxbytes = exports.itgIimname = exports.itgIimid = exports.itgXmpid = exports.itgPropoccurrence = exports.itgDataformat = exports.itgDatatype = exports.itgSpecidx = exports.itgUgtopic = exports.itgSortorder = exports.itgIpmdschema = exports.itgName = exports.itgEtInstruct = exports.itgEtTonopre = exports.itgEtTopwpre = exports.itgIpmdStruct = exports.itgIpmdTop = void 0;
exports.anyPlusBaseUrl = exports.cmpRCpmisg = exports.cmpRCvnotarr = exports.cmpRCvmisg = exports.cmpRCvchngd = exports.fsdStRO = exports.fsdStSearch = exports.fsdStErr = exports.fsdStFound = exports.fsdResValue = exports.fsdResState = exports.pnodeTypeStruct = exports.pnodeTypePlain = exports.ipmdcrVaodPrefix = exports.ipmdcrVet = exports.ipmdcrVexif = exports.ipmdcrViim = exports.ipmdcrVxmp = exports.ipmdcrValue = void 0;
// constant property names and property values
//    of the IPTC PMD TechGuide object
// top level properties
exports.itgIpmdTop = 'ipmd_top';
exports.itgIpmdStruct = 'ipmd_struct';
exports.itgEtTopwpre = 'et_topwithprefix';
exports.itgEtTonopre = 'et_topnoprefix';
exports.itgEtInstruct = 'et_instructure';
// sub-properties of top level properties
exports.itgName = 'name';
exports.itgIpmdschema = 'ipmdschema';
exports.itgSortorder = 'sortorder';
exports.itgUgtopic = 'ugtopic';
exports.itgSpecidx = 'specidx';
exports.itgDatatype = 'datatype';
exports.itgDataformat = 'dataformat';
exports.itgPropoccurrence = 'propoccurrence';
exports.itgXmpid = 'XMPid';
exports.itgIimid = 'IIMid';
exports.itgIimname = 'IIMname';
exports.itgIimmaxbytes = 'IIMmaxbytes';
exports.itgExifid = 'EXIFid';
exports.itgEtXmp = 'etXMP';
exports.itgEtIim = 'etIIM';
exports.itgEtExif = 'etEXIF';
exports.itgEtTag = 'etTag';
exports.itgIpmdid = 'ipmdid';
exports.itgIpmddatatype = 'ipmddatatype';
// values for itgDatatype
exports.itgDtString = 'string';
exports.itgDtNumber = 'number';
exports.itgDtStruct = 'struct';
// values for itgDataformat
exports.itgDfAlg = 'AltLang';
exports.itgDfDt = 'date-time';
exports.itgDfUri = 'uri';
exports.itgDfUrl = 'url';
// calues for itgPropoccurrence values
exports.itgPropoccurSingle = 'single';
exports.itgPropoccurMulti = 'multi';
// values for itgUgtopic
exports.itgUgtAdmin = 'admin';
exports.itgUgtGimgcont = 'gimgcont';
exports.itgUgtImgreg = 'imgreg';
exports.itgUgtLicensing = 'licensing';
exports.itgUgtLocation = 'location';
exports.itgUgtOthings = 'othings';
exports.itgUgtPerson = 'person';
exports.itgUgtRights = 'rights';
// constant property names of an IPTC PMD Checker Result (ipmdcr) object
exports.ipmdcrState = 'state';
// ... property names inside the top level "state" property
exports.ipmdcrSData = 'data';
// ... property names inside sub-property "data" of the top level "state"
exports.ipmdcrSDxmp = 'XMP';
exports.ipmdcrSDiim = 'IIM';
exports.ipmdcrSDexif = 'EXIF';
exports.ipmdcrSDinsync = 'INSYNC';
exports.ipmdcrSDmapinsync = 'MAPINSYNC';
exports.ipmdcrSDvaloccur = 'XMPVALOCCUR';
exports.ipmdcrSStruct = 'struct';
// ... property names inside the top level "value" property
exports.ipmdcrValue = 'value';
exports.ipmdcrVxmp = 'XMP';
exports.ipmdcrViim = 'IIM';
exports.ipmdcrVexif = 'EXIF';
exports.ipmdcrVet = 'EXIFTOOL';
exports.ipmdcrVaodPrefix = 'AOD__';
// constant values of the Property Node (pnode)
exports.pnodeTypePlain = 'plain';
exports.pnodeTypeStruct = 'struct';
// constant values of the FixedStructureData class
exports.fsdResState = 'state';
exports.fsdResValue = 'value';
exports.fsdStFound = 'FOUND';
exports.fsdStErr = 'ERROR';
exports.fsdStSearch = 'SEARCHING';
exports.fsdStRO = 'READONLY';
// constant values of compareIpmdCheckerResults
exports.cmpRCvchngd = 'valueCHANGED';
exports.cmpRCvmisg = 'valueMISSING';
exports.cmpRCvnotarr = 'valueNOTARRAY';
exports.cmpRCpmisg = 'propMISSING';
// any other relevant constant values
exports.anyPlusBaseUrl = 'http://ns.useplus.org/ldf/vocab/';
//# sourceMappingURL=constants.js.map