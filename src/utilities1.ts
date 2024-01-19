import fs from "fs";
import * as icc from "./constants";
import { MdStruct } from "./incommon";
import * as pn1 from "./propnodes1";

/**
 * Loads a file and tries to parse it as serialized JSON.
 * Returns: loaded and parsed object
 * @param jsonFp file path of the JSON file
 */
export function loadFromJson(jsonFp: string): object {
  if (!fs.existsSync(jsonFp)) return {};
  const stringdata: string = fs.readFileSync(jsonFp, { encoding: "utf-8" });
  let loadedObject: object;
  try {
    loadedObject = JSON.parse(stringdata);
  } catch (e) {
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
export function writeAsJson(jsonFp: string, dataObject: object): boolean {
  const jsonString = JSON.stringify(dataObject, null, 2);
  try {
    fs.writeFileSync(jsonFp, jsonString, { encoding: "utf-8" });
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * Generates the state structure template from the IPTC PMD TechGuide object
 * @param ipmdTechRefData Object of the IPTC PMD TechGuide file
 */
export function generateIpmdChkResultsStateTemplate(
  ipmdTechRefData: MdStruct,
): object {
  const reftop: MdStruct = ipmdTechRefData[icc.itgIpmdTop];
  if (objectIsEmpty(reftop)) return {};
  const refstruct: MdStruct = ipmdTechRefData[icc.itgIpmdStruct];
  if (objectIsEmpty(refstruct)) return {};
  const stateStruct: MdStruct = {};
  // presets
  const dataStructXmp: object = { XMP: 0 };
  const dataStructXmpMulti: object = { XMP: 0, XMPVALOCCUR: -1 };
  const dataStructXmpIim: object = { XMP: 0, IIM: 0, INSYNC: -1 };
  const dataStructXmpIimMulti: object = {
    XMP: 0,
    XMPVALOCCUR: -1,
    IIM: 0,
    INSYNC: -1,
  };
  const dataStructXmpIimExif: object = {
    XMP: 0,
    IIM: 0,
    EXIF: 0,
    INSYNC: -1,
    MAPINSYNC: -1,
  };
  const dataStructXmpExif: object = {
    XMP: 0,
    EXIF: 0,
    MAPINSYNC: -1,
  };
  const dataStructXmpIimExifMulti: object = {
    XMP: 0,
    XMPVALOCCUR: -1,
    IIM: 0,
    EXIF: 0,
    INSYNC: -1,
    MAPINSYNC: -1,
  };
  const reftopkeys: string[] = Object.keys(reftop);
  reftopkeys.forEach(function (reftopkey) {
    stateStruct[reftopkey] = {};
    if (
      reftop[reftopkey][icc.itgXmpid] !== undefined &&
      reftop[reftopkey][icc.itgIimid] !== undefined &&
      reftop[reftopkey][icc.itgExifid] !== undefined
    ) {
      // XMP and IIM and Exif are defined
      if (reftop[reftopkey][icc.itgPropoccurrence] === icc.itgPropoccurSingle) {
        stateStruct[reftopkey][icc.ipmdcrSData] = dataStructXmpIimExif;
      }
      if (reftop[reftopkey][icc.itgPropoccurrence] === icc.itgPropoccurMulti) {
        stateStruct[reftopkey][icc.ipmdcrSData] = dataStructXmpIimExifMulti;
      }
    } else {
      if (
        reftop[reftopkey][icc.itgXmpid] !== undefined &&
        reftop[reftopkey][icc.itgIimid] !== undefined
      ) {
        // both XMP and IIM are defined
        if (
          reftop[reftopkey][icc.itgPropoccurrence] === icc.itgPropoccurSingle
        ) {
          stateStruct[reftopkey][icc.ipmdcrSData] = dataStructXmpIim;
        }
        if (
          reftop[reftopkey][icc.itgPropoccurrence] === icc.itgPropoccurMulti
        ) {
          stateStruct[reftopkey][icc.ipmdcrSData] = dataStructXmpIimMulti;
        }
      } else {
        // not both XMP and IIM are defined
        if (
          reftop[reftopkey][icc.itgXmpid] !== undefined &&
          reftop[reftopkey][icc.itgExifid] !== undefined
        ) {
          // both XMP and Exif are defined
          if (
            reftop[reftopkey][icc.itgPropoccurrence] === icc.itgPropoccurSingle
          ) {
            stateStruct[reftopkey][icc.ipmdcrSData] = dataStructXmpExif;
          }
        } else {
          if (reftop[reftopkey][icc.itgXmpid] !== undefined) {
            // only XMP is defined
            if (
              reftop[reftopkey][icc.itgPropoccurrence] ===
              icc.itgPropoccurSingle
            ) {
              stateStruct[reftopkey][icc.ipmdcrSData] = dataStructXmp;
            }
            if (
              reftop[reftopkey][icc.itgPropoccurrence] === icc.itgPropoccurMulti
            ) {
              stateStruct[reftopkey][icc.ipmdcrSData] = dataStructXmpMulti;
            }
          }
        }
      }
    }
    if (reftop[reftopkey][icc.itgDatatype] === "struct") {
      if (reftop[reftopkey][icc.itgDataformat] !== undefined) {
        const structId: string = reftop[reftopkey][icc.itgDataformat];
        if (structId !== "AltLang") {
          if (refstruct[structId] !== undefined) {
            const generateStruct = refstruct[structId];
            const structSub = generateIpmdRefStateStructOfStruct(
              generateStruct,
              refstruct,
            );
            if (!objectIsEmpty(structSub)) {
              stateStruct[reftopkey][icc.ipmdcrSStruct] = structSub;
            }
          }
        }
      }
    }
  });
  return stateStruct;
}

/**
 * Generates a structure inside the state structure template from the IPTC PMD TechGuide object.
 * Is a recursive function.
 * @param refstruct
 * @param toprefstruct
 */
function generateIpmdRefStateStructOfStruct(
  refstruct: MdStruct,
  toprefstruct: MdStruct,
): object {
  const stateStruct: MdStruct = {};
  // presets
  const dataStructXmp: object = { XMP: 0 };
  const dataStructXmpMulti: object = { XMP: 0, XMPVALOCCUR: -1 };
  const dataStructXmpIim: object = { XMP: 0, IIM: 0, INSYNC: -1 };
  const dataStructXmpIimExif: object = {
    XMP: 0,
    IIM: 0,
    EXIF: 0,
    INSYNC: -1,
    MAPINSYNC: -1,
  };
  const refstructkeys: string[] = Object.keys(refstruct);
  refstructkeys.forEach(function (refstructkey) {
    stateStruct[refstructkey] = {};
    if (
      refstruct[refstructkey][icc.itgXmpid] !== undefined &&
      refstruct[refstructkey][icc.itgIimid] !== undefined &&
      refstruct[refstructkey][icc.itgExifid] !== undefined
    ) {
      stateStruct[refstructkey][icc.ipmdcrSData] = dataStructXmpIimExif;
    } else {
      if (
        refstruct[refstructkey][icc.itgXmpid] !== undefined &&
        refstruct[refstructkey][icc.itgIimid] !== undefined
      ) {
        stateStruct[refstructkey][icc.ipmdcrSData] = dataStructXmpIim;
      } else {
        if (refstruct[refstructkey][icc.itgXmpid] !== undefined) {
          if (
            refstruct[refstructkey][icc.itgPropoccurrence] ===
            icc.itgPropoccurSingle
          ) {
            stateStruct[refstructkey][icc.ipmdcrSData] = dataStructXmp;
          }
          if (
            refstruct[refstructkey][icc.itgPropoccurrence] ===
            icc.itgPropoccurMulti
          ) {
            stateStruct[refstructkey][icc.ipmdcrSData] = dataStructXmpMulti;
          }
        }
      }
    }
    if (refstruct[refstructkey][icc.itgDatatype] === "struct") {
      if (refstruct[refstructkey][icc.itgDataformat] !== undefined) {
        const structId: string = refstruct[refstructkey][icc.itgDataformat];
        if (structId !== "AltLang") {
          if (toprefstruct[structId] !== undefined) {
            const generateStruct = toprefstruct[structId];
            const structSub = generateIpmdRefStateStructOfStruct(
              generateStruct,
              toprefstruct,
            );
            if (!objectIsEmpty(structSub)) {
              stateStruct[refstructkey][icc.ipmdcrSStruct] = structSub;
            }
          }
        }
      }
    }
  });
  return stateStruct;
}

/******************** G E N E R I C   H E L P E R S   *****************************
/**
 * Checks if a JavaScript object can be considered as empty
 * @param obj
 */
export function objectIsEmpty(obj: object) {
  return Object.keys(obj).length === 0; // && obj.constructor === Object;
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
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function deepCopyPn(inObject: pn1.IPropNode): pn1.IPropNode {
  return JSON.parse(JSON.stringify(inObject));
}

// ***** E X I F T O O L utilities ********************************
/**
 * Replaces in an ExifTool tag a colon with an underscore
 * @param etTagColon ExifTool tag with a colon
 */
export function etTagUnderscore(etTagColon: string): string {
  return etTagColon.replace(":", "_");
}

/**
 * Replaces in an ExifTool tag an underscore with a colon
 * @param etTagUnderscore ExifTool tag with an underscore
 */
export function etTagColon(etTagUnderscore: string): string {
  return etTagUnderscore.replace("_", ":");
}

/**
 * Object covering all IPTC related variants of date and time formats
 */
export type EtDateTimeVariants = {
  xmpDateTime: string | null; // date + time + timezone
  iimDate: string | null; // date
  iimTime: string | null; // time + time zone
  exifDateTime: string | null; // date + time, integer seconds only
  exifSubSeconds: string | null; // fractions of the time-seconds
  exifTzOffset: string | null; // time zone
};

/**
 * Transforms an ISO DateTime string as used by XMP to an ExifTool date + time value
 * @param xmpIsoDt A string with date and optionally time as specified by XMP
 * @returns EtDateTimeVariants
 */
export function xmpIsoDatetime2etDatetime(
  xmpIsoDt: string,
): EtDateTimeVariants {
  const etDt: EtDateTimeVariants = {
    xmpDateTime: null,
    iimDate: null,
    iimTime: null,
    exifDateTime: null,
    exifSubSeconds: null,
    exifTzOffset: null,
  };
  if (xmpIsoDt === undefined) return etDt;
  if (xmpIsoDt === "") return etDt;
  // default values:
  let etDate: string;
  let etTime: string;
  let etTz = "";
  // Supported incoming formats
  // year only DT: 2022 - len=4
  // year + month DT: 2022-05 - len=7
  // day only DT: 2022-05-17 - len=10
  // day + simple time DT: 2022-03-04T12:02:07 - D+T-len=19, D-len=10
  // full ISO DT, simple time + time zone: 2022-03-04T12:02:07+00:00 full-len=25, D+T-len=19 D-len=10
  // full ISO DT: 2022-03-04T12:02:07.123+00:00 full-len=?, D+T-len=? D-len=10
  const xmpIsoDtLen: number = xmpIsoDt.length;
  if (xmpIsoDtLen < 4) return etDt;
  if (xmpIsoDtLen === 4) {
    // year only
    etDate = xmpIsoDt;
    etDt.xmpDateTime = etDate;
    etDt.iimDate = etDate + ":00:00";
    etDt.exifDateTime = etDate;
    return etDt;
  }
  if (xmpIsoDtLen === 7) {
    // year + month only
    etDate = xmpIsoDt.replace("-", ":");
    etDt.xmpDateTime = etDate;
    etDt.iimDate = etDate + ":00";
    etDt.exifDateTime = etDate;
    return etDt;
  }
  if (xmpIsoDtLen === 10) {
    // year + month + day only
    etDate = xmpIsoDt.replace("-", ":");
    etDate = etDate.replace("-", ":");
    etDt.xmpDateTime = etDate;
    etDt.iimDate = etDate;
    etDt.exifDateTime = etDate;
    return etDt;
  }
  if (xmpIsoDtLen === 19) {
    // day date + simple time only
    etDate = xmpIsoDt.substring(0, 10);
    etDate = etDate.replace("-", ":");
    etDate = etDate.replace("-", ":");
    etTime = xmpIsoDt.substring(11, 19);
    etDt.xmpDateTime = etDate + " " + etTime;
    etDt.iimDate = etDate;
    etDt.iimTime = etTime;
    etDt.exifDateTime = etDate + " " + etTime;
    return etDt;
  }
  if (xmpIsoDtLen > 19) {
    // day date + time + more
    etDate = xmpIsoDt.substring(0, 10);
    etDate = etDate.replace("-", ":");
    etDate = etDate.replace("-", ":");
    etTime = xmpIsoDt.substring(11, 19);

    let subSeconds = "";

    if (xmpIsoDtLen >= 20) {
      if (xmpIsoDt[19] === ".") {
        // this means: with subSeconds
        let idx = 20;
        let quitloop = false;
        let outofstr = false;
        while (!quitloop) {
          if (xmpIsoDt[idx] >= "0" && xmpIsoDt[idx] <= "9") {
            subSeconds += xmpIsoDt[idx];
          } else {
            quitloop = true;
          }
          idx++;
          if (idx >= xmpIsoDtLen) {
            quitloop = true;
            outofstr = true;
          }
        }
        // if (subSeconds !== "") etTime += "." + subSeconds;
        // idx is beyond subSeconds, maybe out of string
        if (!outofstr) {
          etTz = xmpIsoDt.substring(idx - 1);
          if (etTz === "Z") etTz = "+00:00";
        }
      } else {
        etTz = xmpIsoDt.substring(19);
        if (etTz === "Z") etTz = "+00:00";
      }
    }
    etDt.xmpDateTime = etDate + " " + etTime + subSeconds + etTz;
    etDt.iimDate = etDate;
    etDt.iimTime = etTime + etTz;
    etDt.exifDateTime = etDate + " " + etTime;
    if (subSeconds !== "") etDt.exifSubSeconds = subSeconds;
    if (etTz !== "") etDt.exifTzOffset = etTz;
    return etDt;
  }
  // the xmpIsoDt had no matching length, return an empty value
  return etDt;
}
