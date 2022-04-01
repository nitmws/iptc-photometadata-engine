# IPTC Photo Metadata Engine

Processing of photo metadata in compliance with the [IPTC Photo Metadata Standard](https://iptc.org/standards/photo-metadata/iptc-standard/):
* Supports all properties up to the latest standard version
* Supports the use of the XMP and the IPTC IIM format of embedded metadata
* Supports property values in multiple languages of XMP LangAlt properties.
* Checks if metadata embedded into an image file complies with the IPTC standard
* Checks if values of the XMP and - if available - of the IIM format are in sync.
* Retrieves embedded metadata and creates a simplified data object: XMP values take precedence over IIM values. (Other options are available.)
* Saves/embeds photo metadata as long as they comply with the IPTC standard. Uses the XMP and the IIM format and sets values of mapped Exif tags.
* Retrieving and embedding metadata builds on [ExifTool](https://exiftool.org).

