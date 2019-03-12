const fs = require('fs');
const path = require('path');
const stripJsonComments = require('strip-json-comments');

let mozillaRepo = '';
let commRepo = '';
let goShrink = false;

const outputSpec = {
  prefix: 'tbext',
  resultBase: {
    title: 'JSON schema for Thunderbird Extension manifest file',
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    additionalProperties: true,
    required: [ 'manifest_version', 'name', 'version' ],
    definitions: {
      permissions: {
        enum: [],
      },
    },
    properties: {
      permissions: {
        type: 'array',
        uniqueItems: true,
        items: {
          '$ref': '#/definitions/permissions',
        },
      },
    },
  },
  groupList: [
    /** APIs reside within comm repository. */
    {
      name: 'commAPI',
      getRepository: () => { return commRepo; },
      schemaDir: 'mail/components/extensions/schemas/',
      apiListFile: 'mail/components/extensions/ext-mail.json',
      useMdn: false,
      schemaList: [],
    },
    /** APIs reside within mozilla repository. */
    {
      name: 'mozillaAPI',
      getRepository: () => { return mozillaRepo; },
      //dummy
      schemaDir: 'toolkit/',
      // apiListFile: '',
      useMdn: true,
      schemaList: [
        {
          name: 'manifest',
          schema: 'toolkit/components/extensions/schemas/manifest.json',
        },
        {
          name: 'contentScripts',
          schema: 'toolkit/components/extensions/schemas/content_scripts.json',
        },
        {
          name: 'experiments',
          schema: 'toolkit/components/extensions/schemas/experiments.json',
        },
        {
          name: 'extension',
          schema: 'toolkit/components/extensions/schemas/extension.json',
        },
        {
          name: 'extension_protocol_handlers',
          schema: 'toolkit/components/extensions/schemas/extension_protocol_handlers.json',
        },
        {
          name: 'extension_types',
          schema: 'toolkit/components/extensions/schemas/extension_types.json',
        },
        {
          name: 'i18n',
          schema: 'toolkit/components/extensions/schemas/i18n.json',
        },
        {
          name: 'management',
          schema: 'toolkit/components/extensions/schemas/management.json',
        },
        {
          name: 'permissions',
          schema: 'toolkit/components/extensions/schemas/permissions.json',
        },
        {
          name: 'pkcs11',
          schema: 'browser/components/extensions/schemas/pkcs11.json',
        },
        {
          name: 'runtime',
          schema: 'toolkit/components/extensions/schemas/runtime.json',
        },
        {
          name: 'theme',
          schema: 'toolkit/components/extensions/schemas/theme.json',
        },
      ],
    },
  ]
};

/**
 * distill from argments.
 * @returns {Object} report
 */
const numerateArgs = () => {
  const report = {
    isValid: true,
    message: [],
  };
  process.argv.forEach((arg, idx) => {
    if(arg === '--mozilla-repo') {
      if(idx + 1 < process.argv.length) {
        mozillaRepo = process.argv[idx + 1];
      }
      else {
        report.isValid = false;
        report.message.push(`please specify as ${arg} somevalue`);
      }
    }
    else if(arg === '--comm-repo') {
      if(idx + 1 < process.argv.length) {
        commRepo = process.argv[idx + 1];
      }
      else {
        report.isValid = false;
        report.message.push(`please specify as ${arg} somevalue`);
      }
    }
    else if(arg === '--shrink') {
      goShrink = true;
    }
  });
  return report;
};

/**
 * Check the structure of repository.
 * @param {string} rootDir root directory of repository
 * @returns {{isValid: boolean, message: string}} the repository has assumed dirs or not
 */
const checkRepositoryDirs = (rootDir, apiGroup) => {
  const report = {
    isValid: true,
    message: [],
  };
  if(rootDir === '') {
    report.isValid = false;
    report.message.push('Lack of arg: --mozilla-repo foo --comm-repo bar');
  }
  else if(fs.existsSync(rootDir) === false) {
    report.isValid = false;
    report.message.push(`root dir does not exist: ${rootDir}`);
  }
  else {
    const schemaDirFull = path.join(rootDir, apiGroup.schemaDir);
    if(fs.existsSync(schemaDirFull) === false) {
      report.isValid = false;
      report.message.push(`schema dir does not exist: ${apiGroup.schemaDir}`);
    }
  }
  return report;
};

const chromeUri2Path = (chromeUri) => {
  const regexSchemaPath = /.+\/([^/]+json)$/;
  //identity is in browser-ui api, but its schema is in toolkit dir. only-one case.
  if(chromeUri.startsWith('chrome://extensions/content/schemas/')) {
    return `toolkit/components/extensions/schemas/${regexSchemaPath.exec(chromeUri)[1]}`;
  }
  else if(chromeUri.startsWith('chrome://browser/content/schemas/')) {
    return `browser/components/extensions/schemas/${regexSchemaPath.exec(chromeUri)[1]}`;
  }
  else if(chromeUri.startsWith('chrome://messenger/content/schemas/')) {
    return `mail/components/extensions/schemas/${regexSchemaPath.exec(chromeUri)[1]}`;
  }
  else {
    return '';
  }
};

/**
 * Distill JSON file names from API schema file's content.
 * @param {string} rootDir 
 * @param {Object[]} apiGroup
 */
const makeSchemaList = (rootDir, apiGroup) => {
  if(apiGroup.apiListFile !== undefined) {
    const apiListFileFull = path.join(rootDir, apiGroup.apiListFile);
    const apiItemList = JSON.parse(stripJsonComments(fs.readFileSync(apiListFileFull, 'utf8')));
    for(const apiName in apiItemList) {
      if(apiItemList[apiName].schema !== undefined) { //only background page of mozilla?
        const schema = chromeUri2Path(apiItemList[apiName].schema);
        if(schema !== '') {
          const apiItem = {
            name: apiName,
            schema,
          };
          apiGroup.schemaList.push(apiItem);
        }
        else {
          console.log(`skiped: irregular path for ${apiName}. ${apiItemList[apiName].schema}`);
        }
      }
    }
  }
};

const aggregate = (rootDir, apiGroup, result) => {
  makeSchemaList(rootDir, apiGroup);
  for(const schemaItem of apiGroup.schemaList) {
    const schemaFileFull = path.join(rootDir, schemaItem.schema);
    try {
      const apiSpecList = JSON.parse(stripJsonComments(fs.readFileSync(schemaFileFull, 'utf8')));
      apiSpecList.forEach(apiSpec => {
        if(apiSpec.namespace === 'manifest') {
          if(apiSpec.types !== undefined) { // !define is common in specific apiGroup
            for(const typ of apiSpec.types) {
              if(typ['$extend'] === 'WebExtensionManifest') {
                for(const propName of Object.keys(typ.properties)) {
                  result.properties[propName] = typ.properties[propName];
                }
              }
              else if(typ.id) {
                result.definitions[typ.id] = typ;
                // result.definitions[typ.id].id = undefined;
              }
            }
          }
        }
        else {
          if(apiSpec.permissions) {
            for(const p of apiSpec.permissions) {
              if(result.definitions.permissions.enum.includes(p) === false) {
                result.definitions.permissions.enum.push(p);
              }
            }
          }
        }
      });
    } catch(err) {
      // e.g. comm-central does not have a file for pkcs11, so fs.readFileSync() fails.
      console.log(`(API: ${apiGroup.name}, Schema Name: ${schemaItem.name}): ${err}`);
    }
  }
};

const cnvOptional = (member, key) => {
  if(member.optional !== undefined) {
    if(typeof member.optional === 'boolean') {
      if(member.optional) {
        member.optional = undefined;
      }
      else {
        console.log(key);
      }
    }
    else {
      //"default_locale".optional = "true" (string)
      if(member.optional === 'true') {
        member.optional = undefined;
      }
      console.log(`error on optional: ${key}`);
    }
  }
};

const cnvType = member => {
  if(member.type === 'integer') {
    member.type = 'number';
  }
  else if(member.type === 'any') {
    member.type = [
      'string',
      'number',
      'object',
      'array',
      'boolean',
      'null',
    ];
  }
};

const cnvChoices = member => {
};

const convertSub = (tree, rootName) => {
  if(tree.id) {
    tree.id = undefined;
  }
  cnvOptional(tree, rootName);
  cnvType(tree);
  if(tree.choices) {
    if(tree.choices.length === 1) {
      convertSub(tree.choices[0], ''); // only 2 cases, so maybe meaningless
      for(const key of Object.keys(tree.choices[0])) {
        tree[key] = tree.choices[0][key];
      }
    }
    else {
      for(const elm of tree.choices) {
        convertSub(elm, '');
      }
      tree.oneOf = tree.choices;
    }
    tree.choices = undefined;
  }
  if(tree.properties) {
    for(const key of Object.keys(tree.properties)) {
      convertSub(tree.properties[key], key);
    }
  }
};

const convertRoot = raw => {
  for(const key of Object.keys(raw.definitions)) {
    convertSub(raw.definitions[key], key);
  }
  for(const key of Object.keys(raw.properties)) {
    convertSub(raw.properties[key], key);
  }
};

const isValidEnv = (report) => {
  report.message.forEach(m => {
    console.log(m);
  });
  return report.isValid;
};

const program = () => {
  if(isValidEnv(numerateArgs()) === false) {
    return;
  }
  const result = outputSpec.resultBase;
  outputSpec.groupList.forEach(apiGroup => {
    const tgtRepo = apiGroup.getRepository();
    if(tgtRepo !== '' && isValidEnv(checkRepositoryDirs(tgtRepo, apiGroup))) {
      aggregate(tgtRepo, apiGroup, result);
    }
  });
  fs.writeFileSync('tbext.raw.json', JSON.stringify(result, null, 2));
  convertRoot(result);
  if(goShrink) {
    fs.writeFileSync('tbext.min.json', JSON.stringify(result));
  }
  else {
    fs.writeFileSync('tbext.json', JSON.stringify(result, null, 2));
  }
};

program();

// vim:expandtab ff=unix fenc=utf-8 sw=2