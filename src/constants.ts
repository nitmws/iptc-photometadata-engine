
// constant property names and property values
//    of the IPTC PMD TechGuide object
// top level properties
export const itgIpmdTop: string = 'ipmd_top';
export const itgIpmdStruct: string = 'ipmd_struct';
export const itgEtTopwpre: string = 'et_topwithprefix';
export const itgEtTonopre: string = 'et_topnoprefix';
export const itgEtInstruct: string = 'et_instructure';
// sub-properties of top level properties
export const itgName: string = 'name';
export const itgIpmdschema: string = 'ipmdschema';
export const itgSortorder: string = 'sortorder';
export const itgUgtopic: string = 'ugtopic';
export const itgSpecidx: string = 'specidx';
export const itgDatatype: string = 'datatype';
export const itgDataformat: string = 'dataformat';
export const itgPropoccurrence: string = 'propoccurrence';
export const itgXmpid: string = 'XMPid';
export const itgIimid: string = 'IIMid';
export const itgIimname: string = 'IIMname';
export const itgIimmaxbytes: string = 'IIMmaxbytes';
export const itgExifid: string = 'EXIFid';
export const itgEtXmp: string = 'etXMP';
export const itgEtIim: string = 'etIIM';
export const itgEtExif: string = 'etEXIF';
export const itgEtTag: string = 'etTag';
export const itgIpmdid: string = 'ipmdid';
export const itgIpmddatatype: string = 'ipmddatatype';
// values for itgDatatype
export const itgDtString: string = 'string';
export const itgDtNumber: string = 'number';
export const itgDtStruct: string = 'struct';
// values for itgDataformat
export const itgDfAlg: string = 'AltLang';
export const itgDfDt: string = 'date-time';
export const itgDfUri: string = 'uri';
export const itgDfUrl: string = 'url';
// calues for itgPropoccurrence values
export const itgPropoccurSingle: string = 'single';
export const itgPropoccurMulti: string = 'multi';
// values for itgUgtopic
export const itgUgtAdmin: string = 'admin';
export const itgUgtGimgcont: string = 'gimgcont';
export const itgUgtImgreg: string = 'imgreg';
export const itgUgtLicensing: string = 'licensing';
export const itgUgtLocation : string = 'location';
export const itgUgtOthings : string = 'othings';
export const itgUgtPerson : string = 'person';
export const itgUgtRights : string = 'rights';

// constant property names of an IPTC PMD Checker Result (ipmdcr) object
export const ipmdcrState: string = 'state';
// ... property names inside the top level "state" property
export const ipmdcrSData: string = 'data';
// ... property names inside sub-property "data" of the top level "state"
export const ipmdcrSDxmp: string = 'XMP';
export const ipmdcrSDiim: string = 'IIM';
export const ipmdcrSDexif: string = 'EXIF';
export const ipmdcrSDinsync: string = 'INSYNC';
export const ipmdcrSDmapinsync: string = 'MAPINSYNC';
export const ipmdcrSDvaloccur: string = 'XMPVALOCCUR';
export const ipmdcrSStruct: string = 'struct';
// ... property names inside the top level "value" property
export const ipmdcrValue: string = 'value';
export const ipmdcrVxmp: string = 'XMP';
export const ipmdcrViim: string = 'IIM';
export const ipmdcrVexif: string = 'EXIF';
export const ipmdcrVet: string ='EXIFTOOL';
export const ipmdcrVaodPrefix: string = 'AOD__';


// constant values of the Property Node (pnode)
export const pnodeTypePlain: string = 'plain';
export const pnodeTypeStruct: string = 'struct';

// constant values of the FixedStructureData class
export const fsdResState: string = 'state';
export const fsdResValue: string = 'value';
export const fsdStFound: string = 'FOUND';
export const fsdStErr: string = 'ERROR';
export const fsdStSearch: string = 'SEARCHING';
export const fsdStRO: string = 'READONLY';

// constant values of compareIpmdCheckerResults
export const cmpRCvchngd: string = 'valueCHANGED';
export const cmpRCvmisg: string = 'valueMISSING';
export const cmpRCvnotarr: string = 'valueNOTARRAY';
export const cmpRCpmisg: string = 'propMISSING';

// any other relevant constant values
export const anyPlusBaseUrl: string = 'http://ns.useplus.org/ldf/vocab/';
