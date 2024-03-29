# Change Log of the IPTC Photo Metadata Engine project

(Latest changes at the top. Changes refer to a version provided in the "version" property of package.json.)

* v 0.2.15 2024-01-19:
  * ipmdchecker/checkIpmdStd: added checking of Exif ImageUniqueID: if it holds an UUID v4 value it is accepted as value, else not.
  * propnodes1: integrated the new case "IPTC defines only XMP and maps to Exif" (covering the specific case IPTC Digitial Image GUID/Exif ImageUniqueID)
  * utilities1/generateIpmdChkResultsStateTemplate was updated to this new case too.
* v 0.2.14 2024-01-18:
  * ipmdchecker/checkIpmdStd: error in retrieving Exif Copyright fixed
  * propnodes1: dealing with Exif values modified, dealing with INSYNC and MAPINSYNC simplified.
* v 0.2.13 2024-01-18:
  * ipmdchecker/checkIpmdStd: testing if object is empty updated.
  * propnodes1: under condition XMP and IIM exist but not in sync, Exif does not exist, no XMP or IIM was shown - corrected
  * utilities1/objectIsEmpty: testing obj.constructor was removed
* v 0.2.12 2022-11-14:
  * ipmdchecker/_checkIpmdStdStruct(): error in using setPmdState fixed, occured in $anypmdproperty properties with a structure.
* v 0.2.11 2022-10-09:
  * ipmdchecker: enabled to find IPTC properties replacing the placeholder $anypmdproperty in the TechReference
  * propnodes1: enabled to show IPTC properties found in the context of the placeholder $anypmdproperty
* v 0.2.10 2022-09-12: propnodes1: properties with an Exif value only are displayed now in the full list and the tech format list.
* v 0.2.9 2022-09-02: documentation updated
* v 0.2.8 2022-09-02
  * impmdchecker: read ExifTool values are normalized to the IPTC Standard datatype
  * Object ipmdCheckerResult extended
* v 0.2.7 2022-05-25:
  * impmdchecker: comparing of intellectualGenre accepts IIM values without leading "000:" to support backward compatibility.
  * ipmdsetter: setting an array of IIM values of subjectCode corrected 
* v 0.2.6 2022-05-17:
  * ipmdsetter: processing of dateCreated's date-time value was made more flexible, all XMP format variants are supported. 
  * ipmdchecker: comparing dateCreated's XMP and IIM values adjusted to support "Z" as time zone
  * ipmdchecker: special comparing of intellectualGenre added. 
* v 0.2.4+.5 2022-05-03: 
  * ipmdchecker: IPTC/Exif mappings of Date Created, Description and Title corrected, aligned to updated TechReference file
  * ipmdsetter: creating XMP, IIM and Exif properties for Date Created changed: fractions of a second are supported now
* v 0.2.3 2022-04-09: the methods/functions ipmdChkResultToPropNodes (in propnodes1) and ipmdChkResultToTabledata1 (in transform1) don't use instances of FixedStructureData for parameters anymore but their native objects. As first action of the function is to make an FixedStructureData instance from the parameter object. This change excludes the FixedStructureData from to-be-known software, it is still availalable as utility.
* v 0.2.2 2022-04-08: ESlint and TSlint applied
* v 0.2.1 2022-04-07: renaming of constants. Renaming of variables in propnodes1.*.
* v 0.2.0 2022-04-02: initial version of the project in this repository. Earlier versions were held elsewhere.
