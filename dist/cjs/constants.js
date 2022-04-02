"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateValue = exports.stateDvaloccur = exports.stateDmapinsync = exports.stateDinsync = exports.stateDexif = exports.stateDiim = exports.stateDxmp = exports.stateData = exports.stateState = exports.itgUgtRights = exports.itgUgtPerson = exports.itgUgtOthings = exports.itgUgtLocation = exports.itgUgtLicensing = exports.itgUgtImgreg = exports.itgUgtGimgcont = exports.itgUgtAdmin = exports.itgDfUrl = exports.itgDfUri = exports.itgDfDt = exports.itgDfAlg = exports.itgDtStruct = exports.itgDtNumber = exports.itgDtString = exports.itgIpmddatatype = exports.itgIpmdid = exports.itgEtTag = exports.itgEtExif = exports.itgEtIim = exports.itgEtXmp = exports.itgExifid = exports.itgIimmaxbytes = exports.itgIimname = exports.itgIimid = exports.itgXmpid = exports.itgPropoccurMulti = exports.itgPropoccurSingle = exports.itgPropoccurrence = exports.itgDataformat = exports.itgDatatype = exports.itgSpecidx = exports.itgUgtopic = exports.itgSortorder = exports.itgIpmdschema = exports.itgName = exports.itgEtInstruct = exports.itgEtTonopre = exports.itgEtTopwpre = exports.itgIpmdStruct = exports.itgIpmdTop = void 0;
exports.anyPlusBaseUrl = exports.cmpRCpmisg = exports.cmpRCvnotarr = exports.cmpRCvmisg = exports.cmpRCvchngd = exports.fsdStRO = exports.fsdStSearch = exports.fsdStErr = exports.fsdStFound = exports.fsdResValue = exports.fsdResState = exports.pnodeTypeStruct = exports.pnodeTypePlain = exports.stateStruct = exports.stateVaodPrefix = exports.stateVet = exports.stateVexif = exports.stateViim = exports.stateVxmp = void 0;
// constant values of the IPTC PMD TechGuide object
exports.itgIpmdTop = 'ipmd_top';
exports.itgIpmdStruct = 'ipmd_struct';
exports.itgEtTopwpre = 'et_topwithprefix';
exports.itgEtTonopre = 'et_topnoprefix';
exports.itgEtInstruct = 'et_instructure';
exports.itgName = 'name';
exports.itgIpmdschema = 'ipmdschema';
exports.itgSortorder = 'sortorder';
exports.itgUgtopic = 'ugtopic';
exports.itgSpecidx = 'specidx';
exports.itgDatatype = 'datatype';
exports.itgDataformat = 'dataformat';
exports.itgPropoccurrence = 'propoccurrence';
exports.itgPropoccurSingle = 'single';
exports.itgPropoccurMulti = 'multi';
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
exports.itgDtString = 'string';
exports.itgDtNumber = 'number';
exports.itgDtStruct = 'struct';
exports.itgDfAlg = 'AltLang';
exports.itgDfDt = 'date-time';
exports.itgDfUri = 'uri';
exports.itgDfUrl = 'url';
// codes for User Guide topics
exports.itgUgtAdmin = 'admin';
exports.itgUgtGimgcont = 'gimgcont';
exports.itgUgtImgreg = 'imgreg';
exports.itgUgtLicensing = 'licensing';
exports.itgUgtLocation = 'location';
exports.itgUgtOthings = 'othings';
exports.itgUgtPerson = 'person';
exports.itgUgtRights = 'rights';
// constant values of an IPTC PMD Checker Result object
exports.stateState = 'state';
exports.stateData = 'data';
exports.stateDxmp = 'XMP';
exports.stateDiim = 'IIM';
exports.stateDexif = 'EXIF';
exports.stateDinsync = 'INSYNC';
exports.stateDmapinsync = 'MAPINSYNC';
exports.stateDvaloccur = 'XMPVALOCCUR';
exports.stateValue = 'value';
exports.stateVxmp = 'XMP';
exports.stateViim = 'IIM';
exports.stateVexif = 'EXIF';
exports.stateVet = 'EXIFTOOL';
exports.stateVaodPrefix = 'AOD__';
exports.stateStruct = 'struct';
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