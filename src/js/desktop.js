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

  const createUIDialog = () => {
    const dialog = new kintoneUIComponent.Dialog({
      header: 'Preview',
      content: '',
      footer: '',
      isVisible: false,
      showCloseButton: true
    });
    return dialog;
  }

  const hideMobileView = (tableData) => {
    const mobilePreviewElement = kintone.app.record.getSpaceElement(tableData.mobilePreview);
    mobilePreviewElement.parentNode.parentNode.style.display = 'none';
  };

  const hidePreviewButton = (tableData) => {
    const previewButtonElement = kintone.app.record.getSpaceElement(tableData.previewButton);
    previewButtonElement.parentNode.style.display = 'none';
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

  const tableDataArray = createTableDataArrayFromConfig();

  kintone.events.on('app.record.detail.show', event => {

    tableDataArray.forEach(tableData => {
      //1: mobilePreviewのSpaceIDの削除
      //2: buttonのSpaceIDの削除      
      hideMobileView(tableData);
      hidePreviewButton(tableData);

      //3: editorのフィールドコードからマークダウン形式に変換
      const editorValue = event['record'][tableData.editorLabel]['value'];
      const editorElement = kintone.app.record.getFieldElement(tableData.editorLabel);
      editorElement.innerHTML = DOMPurify.sanitize(marked(editorValue));
      editorElement.classList.add('markdown-body');
      //4: color codeの設定
      changeCSSValue(editorElement, tableData.colorScheme)
    });
  
    return event;
  });

  kintone.events.on(['app.record.create.show', 'app.record.edit.show'], (event) => {

    tableDataArray.forEach(tableData => {
      //1: mobilePreviewのSpaceIDの削除
      hideMobileView(tableData);
      //2: buttonの設置 
      const previewButton = createUIButton('preview', 'normal');
      const preViewDialog = createUIDialog();
      const previewDiv = document.createElement('div');
      previewDiv.classList.add('markdown-body');
      
      previewButton.on('click', clickEvent => {
        //3: buttonを押した時のpopupの出現
        const editorValue = kintone.app.record.get().record[tableData.editorLabel].value;  
        previewDiv.innerHTML = DOMPurify.sanitize(marked(editorValue));
        preViewDialog.setContent(previewDiv);
        changeCSSValue(previewDiv, tableData.colorScheme)
        preViewDialog.show();
      });

      const previewButtonElement = kintone.app.record.getSpaceElement(tableData.previewButton);
      previewButtonElement.appendChild(previewButton.render());
      previewButtonElement.appendChild(preViewDialog.render());
    });
    return event;
  });

})(jQuery, kintone.$PLUGIN_ID);
