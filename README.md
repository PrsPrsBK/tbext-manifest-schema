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
* 2019-04-10 0.2.0 New property: `dark_theme`
* 2019-04-16 0.3.0 New property: `chrome_settings_overrides`
* 2019-04-26 0.4.0 New permission: `accountsFolders`
* 2019-05-09 0.5.0 Removed: `icons` of `ThemeType`
  [1548769](https://bugzilla.mozilla.org/show_bug.cgi?id=1548769)
* 2019-05-20 0.5.1 fix: many permissions. `tabs`, `experiments` or so. 
* 2019-05-22 0.6.0 New `type` property of `legacy`
* 2019-06-15 0.7.0 New `edge` property of `browser_specific_settings`
  [1542351](https://bugzilla.mozilla.org/show_bug.cgi?id=1542351)
* 2019-09-27 0.8.0
  * New: `messageDisplayAction` API [1531597](https://bugzilla.mozilla.org/show_bug.cgi?id=1531597)
  * New:  `data_format` property of `cloud_file` [1580838](https://bugzilla.mozilla.org/show_bug.cgi?id=1580838)
* 2019-10-25 0.9.0 Removal: `settingsUrl` of `CloudFile` API
  [1581496](https://bugzilla.mozilla.org/show_bug.cgi?id=1581496)
* 2019-11-04 0.10.0 Add: `content_security_policy` may be `{ "extension_pages":xxxx, "content_scripts":xxxx }`
  [1581609](https://bugzilla.mozilla.org/show_bug.cgi?id=1581609)
* 2019-11-08 0.11.0 New property: `l10n_resources`
  [1457865](https://bugzilla.mozilla.org/show_bug.cgi?id=1457865)
* 2020-01-31 0.12.0 New property: `isolated_world` of `content_security_policy`
  [1594232](https://bugzilla.mozilla.org/show_bug.cgi?id=1594232)
* 2020-02-09 0.13.0 New permission: `compose`
  [1613562](https://bugzilla.mozilla.org/show_bug.cgi?id=1613562)
* 2020-02-11 0.14.0 Removal: `legacy` API
  [1614237](https://bugzilla.mozilla.org/show_bug.cgi?id=1614237)
* 2020-03-13 NO RELEASE
  * [1621873](https://bugzilla.mozilla.org/show_bug.cgi?id=1621873)
  * [changeset 28977](https://hg.mozilla.org/comm-central/rev/976e651ef00bb0ce673ffe95961f9114571977cd)

* 2020-10-26 0.15.0 very many changes from April To October. 

  * Permission [1630413](https://bugzilla.mozilla.org/show_bug.cgi?id=1630413)
  * OptionalPermission [1622917](https://bugzilla.mozilla.org/show_bug.cgi?id=1622917)

* 2020-11-28 0.16.0 New property: `default_label` of `browser_action`, `compose_action`, and `message_display_action`
  [1583478](https://bugzilla.mozilla.org/show_bug.cgi?id=1583478)

* 2021-01-23 Removal: `content_scripts` and `isolated_world` properties of `content_security_policy`
  [1594234](https://bugzilla.mozilla.org/show_bug.cgi?id=1594234)

* 2021-02-03 0.17.1 fix: some permissions are not included, e.g. `activeTab`

* 2021-02-06 No Update

  * change: `nativeMessaging` became optional permission
    [1630415](https://bugzilla.mozilla.org/show_bug.cgi?id=1630415)

* 2021-03-18 0.18.0 New: `ftp` for `protocol_handlers`

  [1626365](https://bugzilla.mozilla.org/show_bug.cgi?id=1626365)

* 2021-04-21 No Update
  * change: docstring of `toolbar_field_separator` of `colors` of `ThemeType`
    [1703590](https://bugzilla.mozilla.org/show_bug.cgi?id=1703590)

* 2021-04-24 0.19.0 New: `matrix` scheme of `protocol` of `ProtocolHandler`
  [1688030](https://bugzilla.mozilla.org/show_bug.cgi?id=1688030)

* 2021-04-28 0.20.0 New: `browser_action.type`, `compose_action.type`, `message_display_action.type`
  [1705867](https://bugzilla.mozilla.org/show_bug.cgi?id=1705867)

* 2021-04-29 No Update: Removal: 0.20.0

* 2021-05-02 No Update

  * Change: `content_security_policy` has version specs(`max_manifest_version` and `min...`), but currently this Schema does not handle them.
    Maybe [draft 7's `if-then-else`](https://json-schema.org/understanding-json-schema/reference/conditionals.html) resolves this.
    [1696043](https://bugzilla.mozilla.org/show_bug.cgi?id=1696043)
  * Note: At `mozilla-central`, `chrome_settings_overrides` - `search_provider.favicon_url` can be "strictRelativeUrl" on ManifestV3.
    This has no effect because JSON Schema meta-spec (draft 7, and its validators) does not know Mozilla's "format"s.
    And on `comm`, there is its own `chrome_settings_overrides.json`, so no effect.
    [1697059](https://bugzilla.mozilla.org/show_bug.cgi?id=1697059)

* 2021-05-11 0.21.0 New: `browser_style` of `cloud_file`
  [1523094](https://bugzilla.mozilla.org/show_bug.cgi?id=1523094)

* 2021-05-15 0.22.0 New: object `{ resources: [string], matches: [string] }` array for `web_accessible_resources` (ManifestV3)
    [1696580](https://bugzilla.mozilla.org/show_bug.cgi?id=1696580)
    [1697334](https://bugzilla.mozilla.org/show_bug.cgi?id=1697334)

* 2021-05-22 No Update: default value of `browser_style` changed from `true` to `false`.
  [1712058](https://bugzilla.mozilla.org/show_bug.cgi?id=1712058)

* 2021-05-28 0.23.0 New: `compose.send` permission
  [1699672](https://bugzilla.mozilla.org/show_bug.cgi?id=1699672)

* 2021-06-18 0.24.0 New: `accountsIdentities` permission for `identity` API.
  [1642690](https://bugzilla.mozilla.org/show_bug.cgi?id=1642690)

* 2021-06-25 0.25.0 New: `extensions` array for `web_accessible_resources` (ManifestV3)
  [1711168](https://bugzilla.mozilla.org/show_bug.cgi?id=1711168)

* 2021-07-08 0.26.0 New: `messagesDelete` permission for `messages` API
  [1616114](https://bugzilla.mozilla.org/show_bug.cgi?id=1616114)

* 2021-07-08 0.27.0 Removed(0.25.0): `extensions` array for `web_accessible_resources` (ManifestV3)
  [1711168](https://bugzilla.mozilla.org/show_bug.cgi?id=1711168)

* 2021-07-13 No Update Modified: `accountsFolders` permission was removed from `folders` namespace's `permissions` array,
  and added to `permissions` of `create()`, `rename()`, `delete()` of `folders` API.
  [1520427](https://bugzilla.mozilla.org/show_bug.cgi?id=1520427)

* 2021-07-26 0.28.0 New: `host_permissions` for ManifestV3
  [1693385](https://bugzilla.mozilla.org/show_bug.cgi?id=1693385)

* 2021-07-27 0.29.0 New: `default_area` property of `browser_action`; `maintoolbar` or `tabstoolbar`.
  [1722039](https://bugzilla.mozilla.org/show_bug.cgi?id=1722039)

* 2021-08-27 No Update

  * New: `resetScrollPosition` property of argument of `captureTab()` and `captureVisibleTab()` of `tabs` API.
    [1708403](https://bugzilla.mozilla.org/show_bug.cgi?id=1708403)

[//]: # (vim:expandtab ff=unix fenc=utf-8 sw=2)
