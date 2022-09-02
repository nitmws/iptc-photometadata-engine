# Change Log of the IPTC Photo Metadata Engine project

(Latest changes at the top. Changes refer to a version provided in the "version" property of package.json.)

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
