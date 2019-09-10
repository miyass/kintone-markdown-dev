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

  const createUIButton = (text, type) => {
    const button = new kintoneUIComponent.Button({ text, type });
    return button;
  };

  kintone.events.on('app.record.detail.show', event => {

    const tableDataArray = createTableDataArrayFromConfig();
    console.log(tableDataArray);
    console.log(event);

    tableDataArray.forEach(tableData => {
      //1: mobilePreviewのSpaceIDの削除
      //2: buttonのSpaceIDの削除      
      const mobilePreviewElement = kintone.app.record.getSpaceElement(tableData.mobilePreview);
      const previewButtonElement = kintone.app.record.getSpaceElement(tableData.previewButton);
      mobilePreviewElement.parentNode.parentNode.style.display = 'none';
      previewButtonElement.parentNode.style.display = 'none';

      //3: editorのフィールドコードからマークダウン形式に変換
      const editorValue = event['record'][tableData.editorLabel]['value'];
      const editorElement = kintone.app.record.getFieldElement(tableData.editorLabel);
      console.log(editorElement);
      editorElement.innerHTML = DOMPurify.sanitize(marked(editorValue));
      editorElement.classList.add('markdown-body');

      //4: color codeの設定
      const tagNameArray = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
      tagNameArray.forEach(tagName => {
        const editorChildrenTagArray = editorElement.getElementsByTagName(tagName);
        for (let index = 0; index < editorChildrenTagArray.length; index++) {
          editorChildrenTagArray[index].style.color = tableData.colorScheme;
        }
      });

    });
  
    return event;
  });

  kintone.events.on(['app.record.create.show', 'app.record.edit.show'], (event) => {
    console.log(event);
    return event;
  });


})(jQuery, kintone.$PLUGIN_ID);
