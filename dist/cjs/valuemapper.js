"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.etToIpmd = exports.ipmdToEt = void 0;
/**
 * Maps some IPTC PMD property values to ExifTool tag values
 * @param ipmdValue
 */
function ipmdToEt(ipmdValue) {
    let etValue = '';
    if (ipmdValue === undefined)
        return etValue;
    if (ipmdValue === '')
        return etValue;
    switch (ipmdValue) {
        // telephone types
        case 'http://ns.useplus.org/ldf/vocab/work':
            return 'Work';
        case 'http://ns.useplus.org/ldf/vocab/cell':
            return 'Cell';
        case 'http://ns.useplus.org/ldf/vocab/fax':
            return 'FAX';
        case 'http://ns.useplus.org/ldf/vocab/home':
            return 'Home';
        case 'http://ns.useplus.org/ldf/vocab/pager':
            return 'Pager';
        // minor model age disclosure
        case 'http://ns.useplus.org/ldf/vocab/AG-UNK':
            return 'Age Unknown';
        case 'http://ns.useplus.org/ldf/vocab/AG-U14':
            return 'Age 14 or Under';
        case 'http://ns.useplus.org/ldf/vocab/AG-A15':
            return 'Age 15';
        case 'http://ns.useplus.org/ldf/vocab/AG-A1':
            return 'Age 16';
        case 'http://ns.useplus.org/ldf/vocab/AG-A17':
            return 'Age 17';
        case 'http://ns.useplus.org/ldf/vocab/AG-A18':
            return 'Age 18';
        case 'http://ns.useplus.org/ldf/vocab/AG-A19':
            return 'Age 19';
        case 'http://ns.useplus.org/ldf/vocab/AG-A20':
            return 'Age 20';
        case 'http://ns.useplus.org/ldf/vocab/AG-A21':
            return 'Age 21';
        case 'http://ns.useplus.org/ldf/vocab/AG-A22':
            return 'Age 22';
        case 'http://ns.useplus.org/ldf/vocab/AG-A23':
            return 'Age 23';
        case 'http://ns.useplus.org/ldf/vocab/AG-A24':
            return 'Age 24';
        case 'http://ns.useplus.org/ldf/vocab/AG-A25':
            return 'Age 25 or Over';
        // model/property release status
        case 'http://ns.useplus.org/ldf/vocab/MR-NON':
        case 'http://ns.useplus.org/ldf/vocab/PR-NON':
            return 'None';
        case 'http://ns.useplus.org/ldf/vocab/MR-NAP':
        case 'http://ns.useplus.org/ldf/vocab/PR-NAP':
            return 'Not Applicable';
        case 'http://ns.useplus.org/ldf/vocab/MR-LMR':
            return 'Limited or Incomplete Model Releases';
        case 'http://ns.useplus.org/ldf/vocab/MR-UMR':
            return 'Unlimited Model Releases';
        case 'http://ns.useplus.org/ldf/vocab/PR-LMR':
            return 'Limited or Incomplete Property Releases';
        case 'http://ns.useplus.org/ldf/vocab/PR-UMR':
            return 'Unlimited Property Releases';
    }
    return etValue;
}
exports.ipmdToEt = ipmdToEt;
/**
 * Maps some ExifTool tag values to IPTC PMD property values
 * @param etValue Exiftool tag value
 */
function etToIpmd(etValue) {
    let ipmdValue = '';
    switch (ipmdValue) {
        // PLUS telephone types
        case 'Work':
            return 'http://ns.useplus.org/ldf/vocab/work';
        case 'Cell':
            return 'http://ns.useplus.org/ldf/vocab/cell';
        case 'FAX':
            return 'http://ns.useplus.org/ldf/vocab/fax';
        case 'Home':
            return 'http://ns.useplus.org/ldf/vocab/home';
        case 'Pager':
            return 'http://ns.useplus.org/ldf/vocab/pager';
        // PLUS minor model age disclosure
        case 'Age Unknown':
            return 'http://ns.useplus.org/ldf/vocab/AG-UNK';
        case 'Age 14 or Under':
            return 'http://ns.useplus.org/ldf/vocab/AG-U14';
        case 'Age 15':
            return 'http://ns.useplus.org/ldf/vocab/AG-A15';
        case 'Age 16':
            return 'http://ns.useplus.org/ldf/vocab/AG-A16';
        case 'Age 17':
            return 'http://ns.useplus.org/ldf/vocab/AG-A17';
        case 'Age 18':
            return 'http://ns.useplus.org/ldf/vocab/AG-A18';
        case 'Age 19':
            return 'http://ns.useplus.org/ldf/vocab/AG-A19';
        case 'Age 20':
            return 'http://ns.useplus.org/ldf/vocab/AG-A20';
        case 'Age 21':
            return 'http://ns.useplus.org/ldf/vocab/AG-A21';
        case 'Age 22':
            return 'http://ns.useplus.org/ldf/vocab/AG-A22';
        case 'Age 23':
            return 'http://ns.useplus.org/ldf/vocab/AG-A23';
        case 'Age 24':
            return 'http://ns.useplus.org/ldf/vocab/AG-A24';
        case 'Age 25 or Over':
            return 'http://ns.useplus.org/ldf/vocab/AG-A25';
        // PLUS model/property release status
        case 'MR-None':
            return 'http://ns.useplus.org/ldf/vocab/MR-NON';
        case 'PR-None':
            return 'http://ns.useplus.org/ldf/vocab/PR-NON';
        case 'MR-Not Applicable':
            return 'http://ns.useplus.org/ldf/vocab/MR-NAP';
        case 'PR-Not Applicable':
            return 'http://ns.useplus.org/ldf/vocab/PR-NAP';
        case 'Limited or Incomplete Model Releases':
            return 'http://ns.useplus.org/ldf/vocab/MR-LMR';
        case 'Unlimited Model Releases':
            return 'http://ns.useplus.org/ldf/vocab/MR-UMR';
        case 'Limited or Incomplete Property Releases':
            return 'http://ns.useplus.org/ldf/vocab/PR-LMR';
        case 'Unlimited Property Releases':
            return 'http://ns.useplus.org/ldf/vocab/PR-UMR';
    }
    return ipmdValue;
}
exports.etToIpmd = etToIpmd;
//# sourceMappingURL=valuemapper.js.map