# tbext-manifest-schema

* JSON Schema for Thunderbird extension.
* This package does not work much as [addons-linter](https://github.com/mozilla/addons-linter) does for Firefox Addons.
* status: raughly O.K.


## how to use

As for VS Code's workspace config, such as `foo.code-workspace`

```
  {
    "settings": {
      "json.schemas": [
        {
          "fileMatch": ["*/path/to/manifest.json"],
          "url": "./path/to/tbext.min.json",
        }
      ]
    }
  }
```

## how to make JSON Schema file

```console
$ npm run build -- --mozilla-repo /path/to/mozilla --comm-repo /path/to/comm
```

(At 2019-04-11) You will see following error messages, but no problem.

```console
> tbext-manifest-schema@0.2.0 build X:\path\to\tbext-manifest-schema
> node build.js "--mozilla-repo" "x:/repository/mozilla-central" "--comm-repo" "x:/repository/mozilla-central/comm"

(API: commAPI, Schema Name: commands): Error: ENOENT: no such file or directory, open 'x:\repository\mozilla-central\comm\mail\components\extensions\schemas\commands.json'
(API: commAPI, Schema Name: geckoProfiler): Error: ENOENT: no such file or directory, open 'x:\repository\mozilla-central\comm\toolkit\components\extensions\schemas\geckoProfiler.json'
(API: commAPI, Schema Name: pkcs11): Error: ENOENT: no such file or directory, open 'x:\repository\mozilla-central\comm\mail\components\extensions\schemas\pkcs11.json'
matches
name
version
error on optional: default_locale
```

# Known Issue

## `//` comment

One-line comment is allowed (only Firefox?), but I can not specify it in the JSON Scheme.

## `default_locale`

For `default_locale`, to be mandatory or prohibited is conditional.
Its condition cannot be described in this JSON Schema, because it involves the existence of `_locales` directory.

## Warning "Matches multiple schemas when only one must validate"

VS Code's validator does not discriminate objects inside `oneOf`
and result in that warning on `background` or so.

```sample.json
  {
    "two different subschema cannot be discriminated."
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
  }
```

c.f. [Combining schemas — Understanding JSON Schema 7.0 documentation](https://json-schema.org/understanding-json-schema/reference/combining.html)


## `format` may result in error or warning


JSON Schema Document says "JSON Schema implementations are not required to implement this part of the specification, and many of them do not".

As for VS Code, validator seems to do nothing for `format`.

So, this schema currently does nothing for it, and non-standard `format`
such as `strictRelativeUrl` remains in.

c.f. [string — Understanding JSON Schema 7.0 documentation](https://json-schema.org/understanding-json-schema/reference/string.html)


## Note for implementation

### `$id` does not work

JSON Schema Document says "This functionality isn’t currently supported by the Python jsonschema library".

I do not know about VS Code's JSON Schema Validator, but anyway it does not handle `$id`.

c.f. [Structuring a complex schema — Understanding JSON Schema 7.0 documentation](https://json-schema.org/understanding-json-schema/structuring.html)


### 'match mode (?i)' of RegExp

For the case of `string` type, it can have `pattern` keyword.
JSON Schema does not handle it, and that results in RegExp error.


# Reference

some useful staff.

* [Thunderbird WebExtension APIs — Thunderbird WebExtensions latest documentation](https://thunderbird-webextensions.readthedocs.io/en/latest/)

* [manifest.json - Mozilla | MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)

* [pkcs11 - Mozilla | MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/pkcs11)

* [API Implementation Basics — Mozilla Source Tree Docs 68.0a1 documentation](https://firefox-source-docs.mozilla.org/toolkit/components/extensions/webextensions/basics.html#webextensions-experiments)

  For `experiments`.

* [API Schemas — Mozilla Source Tree Docs 68.0a1 documentation](https://firefox-source-docs.mozilla.org/toolkit/components/extensions/webextensions/schema.html)

  This says "Refer to the documentation and examples at the JSON Schema site for details on how these items are defined in a schema".
  But some items in API schema (e.g. `choices`) does not match with specs of all versions like 0.4 or 0.7 currently (2019 March) on that site.

* mozilla-central (or mozilla-beta or so)'s `toolkit/components/extensions/Schemas.jsm`

  This module handles `preprocess`, `optional` or so.


# License
MPL-2.0.

npm package includes json files. These contains contents which come from 
json schema files of comm-central repository. 
Some ones are under 3-Clause BSD License, others are under MPL-2.0 License. 
Both are in `License` directory.

# Release Notes

* 2019-03-21 0.0.1
* 2019-03-27 0.1.0 geckoProfiler
* 2019-04-10 0.2.0 new property: `dark_theme`
* 2019-04-16 0.3.0 new property: `chrome_settings_overrides`
* 2019-04-26 0.4.0 new permission: `accountsFolders`
* 2019-05-09 0.5.0 Removed: `icons` of `ThemeType`
  [1548769](https://bugzilla.mozilla.org/show_bug.cgi?id=1548769)
* 2019-05-20 0.5.1 fix: many permissions. `tabs`, `experiments` or so. 
* 2019-05-22 0.6.0 new `type` property of `legacy`
* 2019-06-15 0.7.0 new `edge` property of `browser_specific_settings`
  [1542351](https://bugzilla.mozilla.org/show_bug.cgi?id=1542351)
* 2019-09-27 0.8.0
  * New: `messageDisplayAction` API [1531597](https://bugzilla.mozilla.org/show_bug.cgi?id=1531597)
  * New:  `data_format` property of `cloud_file` [1580838](https://bugzilla.mozilla.org/show_bug.cgi?id=1580838)
* 2019-10-25 0.9.0 Removal: `settingsUrl` of `CloudFile` API
  [1581496](https://bugzilla.mozilla.org/show_bug.cgi?id=1581496)


[//]: # (vim:expandtab ff=unix fenc=utf-8 sw=2)
