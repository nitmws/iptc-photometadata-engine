/**
 * Maps some IPTC PMD property values to ExifTool tag values
 * @param ipmdValue
 */
export declare function ipmdToEt(ipmdValue: string): string;
/**
 * Maps some ExifTool tag values to IPTC PMD property values
 * @param etValue Exiftool tag value
 */
export declare function etToIpmd(etValue: string): string;
