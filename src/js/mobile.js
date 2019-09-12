jQuery.noConflict();

(($, PLUGIN_ID) => {
  'use strict';

  const pluginConfig = kintone.plugin.app.getConfig(PLUGIN_ID);

  const createTableDataArrayFromConfig = () => {
    const tmpArray = [];
    const tmpObjectTemplate = {
      colorScheme: '',
      editorValue: '',
      editorLabel: '',
      fileLink: '',
      previewButton: '',
      mobilePreview: ''
    }
    let tableDataNumber = 0;
    if (Object.keys(pluginConfig).length === 0){
      return tmpArray;
    }
    for (const key in pluginConfig) {
      const number = key.replace(/[^0-9]/g, '');
      if (number > tableDataNumber) {
        tableDataNumber = number
      }
    }
    for (let index = 0; index <= tableDataNumber; index++) {
      const tmpObject = JSON.parse(JSON.stringify(tmpObjectTemplate));
      tmpObject.colorScheme = pluginConfig[`colorScheme${index}`];
      tmpObject.editorValue = pluginConfig[`editorValue${index}`];
      tmpObject.editorLabel = pluginConfig[`editorLabel${index}`];
      tmpObject.fileLink = pluginConfig[`fileLink${index}`];
      tmpObject.previewButton = pluginConfig[`previewButton${index}`];
      tmpObject.mobilePreview = pluginConfig[`mobilePreview${index}`];
      tmpArray.push(tmpObject);
    }
    return tmpArray;
  };

  const changeCSSValue = (element, colorScheme) => {
    const tagNameArray = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
      tagNameArray.forEach(tagName => {
        const editorChildrenTagArray = element.getElementsByTagName(tagName);
        for (let index = 0; index < editorChildrenTagArray.length; index++) {
          editorChildrenTagArray[index].style.color = colorScheme;
        }
      });
  };

  const createMobileView = () => {
    const mobileDiv1 = document.createElement('div');
    const mobileDiv2 = document.createElement('div');
    const mobileDiv31 = document.createElement('h3');
    const mobileDiv32 = document.createElement('div');

    mobileDiv2.classList.add('parent2');
    mobileDiv31.classList.add('parent3label');
    mobileDiv32.classList.add('control-value-gaia');
    mobileDiv32.classList.add('markdown-body');

    mobileDiv2.appendChild(mobileDiv31);
    mobileDiv2.appendChild(mobileDiv32);
    mobileDiv1.appendChild(mobileDiv2);

    mobileDiv31.textContent = 'editor';

    return mobileDiv1;
  };

  const tableDataArray = createTableDataArrayFromConfig();
  
  kintone.events.on('mobile.app.record.detail.show', event => {
    tableDataArray.forEach(tableData => {
      //1: 既存のView画面の削除
      kintone.mobile.app.record.setFieldShown(tableData.editorLabel, false);
      
      //2: mobilePreviewでmobileView生成
      const editorValue = event['record'][tableData.editorLabel]['value'];
      const mobilePreviewElement = kintone.mobile.app.record.getSpaceElement(tableData.mobilePreview);
      const mobileViewElement = createMobileView();
      mobilePreviewElement.appendChild(mobileViewElement);
      mobilePreviewElement.children[0].children[0].children[1].innerHTML = DOMPurify.sanitize(marked(editorValue));
      changeCSSValue(mobilePreviewElement.children[0].children[0].children[1], tableData.colorScheme);
    });
    return event;
  });

})(jQuery, kintone.$PLUGIN_ID);
