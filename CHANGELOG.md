# Change Log of the IPTC Photo Metadata Engine project

(Latest changes at the top. Changes refer to a version provided in the "version" property of package.json.)

* v 0.2.4 2022-05-03: 
  * ipmdchecker: IPTC/Exif mappings of Date Created, Description and Title corrected, aligned to updated TechReference file
  * ipmdsetter: creating XMP, IIM and Exif properties for Date Created changed: fractions of a second are supported now
* v 0.2.3 2022-04-09: the methods/functions ipmdChkResultToPropNodes (in propnodes1) and ipmdChkResultToTabledata1 (in transform1) don't use instances of FixedStructureData for parameters anymore but their native objects. As first action of the function is to make an FixedStructureData instance from the parameter object. This change excludes the FixedStructureData from to-be-known software, it is still availalable as utility.
* v 0.2.2 2022-04-08: ESlint and TSlint applied
* v 0.2.1 2022-04-07: renaming of constants. Renaming of variables in propnodes1.*.
* v 0.2.0 2022-04-02: initial version of the project in this repository. Earlier versions were held elsewhere.
