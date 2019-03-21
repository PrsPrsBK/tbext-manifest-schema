WIP.

# tbext-manifest-schema

* JSON Schema for Thunderbird extension.
* This package does not work much as [addons-linter](https://github.com/mozilla/addons-linter) does for Firefox Addons.


## make definition files

```console
$ npm run build -- --mozilla-repo /path/to/mozilla --comm-repo /path/to/comm
```

# Known Issue

## `//` comment

One-line comment is allowed (only Firefox?), but I can not specify it in the JSON Scheme.

## `default_locale`

To be mandatory or prohibited is conditional.
Its condition cannot be described, because it is determined by the existence of `_locales` directory.

## VS Code does not discriminate objects inside `oneOf`

This result in warning "Matches multiple schemas when only one must validate".

```sample.json
  "background": {
    "oneOf": [
      {
        "type": "object",
        "properties": {
          "page": {
            "type": "number"
          }
        }
      },
      {
        "type": "object",
        "properties": {
          "scripts": {
            "type": "array",
            "items": {
              "$ref": "#/definitions/ExtensionURL"
            }
          },
          "persistent": {
            "$ref": "#/definitions/PersistentBackgroundProperty"
          }
        }
      }
    ]
  }
```

reference:
[Combining schemas — Understanding JSON Schema 7.0 documentation](https://json-schema.org/understanding-json-schema/reference/combining.html)


## `$id` does not work (Note for implementation)

[Structuring a complex schema — Understanding JSON Schema 7.0 documentation](https://json-schema.org/understanding-json-schema/structuring.html)
says "This functionality isn’t currently supported by the Python jsonschema library".

I do not know about VS Code's JSON Schema Validator, but anyway it does not handle `$id`.


# Reference

* [Thunderbird WebExtension APIs — Thunderbird WebExtensions latest documentation](https://thunderbird-webextensions.readthedocs.io/en/latest/)

* [manifest.json - Mozilla | MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)

* [pkcs11 - Mozilla | MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/pkcs11)

* [API Implementation Basics — Mozilla Source Tree Docs 68.0a1 documentation](https://firefox-source-docs.mozilla.org/toolkit/components/extensions/webextensions/basics.html#webextensions-experiments)

For `experiments`.

* [API Schemas — Mozilla Source Tree Docs 68.0a1 documentation](https://firefox-source-docs.mozilla.org/toolkit/components/extensions/webextensions/schema.html)

This says "Refer to the documentation and examples at the JSON Schema site for details on how these items are defined in a schema".
But some items in API schema (e.g. `choices`) does not match with specs of all versions like 0.4 or 0.7 currently (2019 March) on that site.

* mozilla-central (or so)'s `toolkit/components/extensions/Schemas.jsm`

This module handles `preprocess`, `optional` or so.


# License
MPL-2.0.

npm package includes json files. These contains contents which come from 
json schema files of comm-central repository. 
Some ones are under 3-Clause BSD License, others are under MPL-2.0 License. 
Both are in `License` directory.

# Release Notes

not yet

[//]: # (vim:expandtab ff=unix fenc=utf-8 sw=2)
