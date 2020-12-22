# Help to translate SkyAutoplayerScript

Follow [Issue#4](https://github.com/StageGuard/SkyAutoPlayerScript/issues/4) request, SkyAutoplayerScript has updated version 21, which supported multi-language.

It can also fetch online language list [source/language_list.json](https://github.com/StageGuard/SkyAutoPlayerScript/blob/master/source/language_list.json). So if you want to translate SkyAutoplayerScript into another language, please follow the steps below.

## Translate to a new language

- Clone this repository.
- Create a new file in **resources/language_pack/xx_XX.json**, the file name must be standard language code (e.g. zh_CN or en_US).
- You can refer to [resources/language_pack/en_US.json](https://github.com/StageGuard/SkyAutoPlayerScript/blob/master/resources/language_pack/en_US.json) to translate.
- Modify **source/language_list.json**: 

```js
{
    "list": [{
        "code": "", //your language code
        "name": "" //language name
    }, {
        "code": "zh_CN",
        "name": "简体中文"
    }, {
        //...
    }]
}
```

- Create a new pull request.

After merging, your language will be shown in Setting-Language list.

## Fix a wrong translation

- Clone this repository.
- Correct wrong translations.
- Update `version` number(+1) of target language in language file and [source/language_list.json](https://github.com/StageGuard/SkyAutoPlayerScript/blob/master/source/language_list.json).
- Create a new pull request.

After merging, SkyAutoplayerScript will notify users who uses this language to update.

I would appreciate it if you could contribute translation!
