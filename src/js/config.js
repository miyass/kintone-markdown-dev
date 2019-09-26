jQuery.noConflict();

(($, PLUGIN_ID) => {
  'use strict';

  const appId = kintone.app.getId();
  const pluginConfig = kintone.plugin.app.getConfig(PLUGIN_ID);
  const kintoneFieldData = {
    multiLineTextArray: [],
    multiLineFieldCodeArray: [],
    spaceIdArray: []
  };

  const tableHeader = {
    editorHeader: 'Markdownエディタ',
    previewButtonHeader: 'プレビューボタンの表示',
    mobilePreviewHeader: 'モバイル版プレビューの表示',
    fileLinkHeader: 'ファイルのリンク表示',
    colorSchemeHeader: '見出しタグの色'
  };

  let tableComponent, notifyPopupComponent;
  
  //configの情報を配列に整形
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

  //button要素の生成
  const createUIButton = (text, type) => {
    const button = new kintoneUIComponent.Button({ text, type });
    return button;
  };

  //tableの元となる行の作成
  const createBaseTableData = () => {
    const originData = { 
      editor: {
        items: []
      },
      previewButton: {
        items: []
      },
      mobilePreview: {
        items: []
      },
      fileLink: {
        items: []
      },
      colorScheme: { value: '' }
    };
    const originTableData = JSON.parse(JSON.stringify(originData));
    const noSelectedItem = {
      label: '-----',
      value: '-----'
    };
    originTableData.editor.items.push(noSelectedItem);
    originTableData.previewButton.items.push(noSelectedItem);
    originTableData.mobilePreview.items.push(noSelectedItem);
    originTableData.fileLink.items.push(noSelectedItem);
    //文字列複数行の一覧を表示
    kintoneFieldData.multiLineTextArray.forEach((multiLineText, index) => {
      const editorItem = {};
      editorItem.label = kintoneFieldData.multiLineFieldCodeArray[index];
      editorItem.value = multiLineText;
      originTableData.editor.items.push(editorItem);
    });
    //spaceIdの一覧を表示
    kintoneFieldData.spaceIdArray.forEach(spaceId => {
      const spaceIdItem = {};
      spaceIdItem.label = spaceId;
      spaceIdItem.value = spaceId;
      originTableData.previewButton.items.push(spaceIdItem);
      originTableData.mobilePreview.items.push(spaceIdItem);
      originTableData.fileLink.items.push(spaceIdItem);
    });

    return originTableData;
  };

  const createExplanationElement = () => {
    const explanationElement = document.getElementById('explanation');
    const explanationField = document.createElement('div');
    const singleTextExplanationField = new kintoneUIComponent.Label({ text: `${tableHeader.editorHeader}は文字列（複数行）フィールドを指定します。` });
    const spaceIdExplanationField = new kintoneUIComponent.Label({ text: `${tableHeader.previewButtonHeader},${tableHeader.mobilePreviewHeader},${tableHeader.fileLinkHeader}はスペースフィールドを指定します。` });
    const colorSchemeExplanationField = new kintoneUIComponent.Label({ text: `${tableHeader.colorSchemeHeader}は#と16進数を記入します。（例 #3498db）` });

    explanationElement.style.marginTop = '30px';

    explanationElement.appendChild(explanationField);
    explanationField.appendChild(singleTextExplanationField.render());
    explanationField.appendChild(spaceIdExplanationField.render());
    explanationField.appendChild(colorSchemeExplanationField.render());
  };

  const createNotifyPopupElement = () => {
    const popupElement = document.getElementById('popup');
    notifyPopupComponent = new kintoneUIComponent.NotifyPopup({ text: '', type: 'error', isVisible: false });
    popupElement.appendChild(notifyPopupComponent.render());
  };

  //table要素の生成
  const createTableElement = () => {
    let tmpTableDataArray = [];

    kintone.api(kintone.api.url('/k/v1/form', true), 'GET', {'app': appId}, (resp) => {
      resp.properties.forEach(field => {
        switch (field.type) {
          case 'MULTI_LINE_TEXT':
            kintoneFieldData.multiLineTextArray.push(field.code);
            kintoneFieldData.multiLineFieldCodeArray.push(field.label);
            break;
          case 'SPACER':
            kintoneFieldData.spaceIdArray.push(field.elementId);
            break;
          default:
            break;
        }
      });

      const tableDataArray = createTableDataArrayFromConfig();
      //+ボタン押した時のデフォルトで選択されている値を設定
      let defaultRowData = createBaseTableData();
      defaultRowData.colorScheme.value = '';
      defaultRowData.editor.value = '-----';
      defaultRowData.fileLink.value = '-----';
      defaultRowData.previewButton.value = '-----';
      defaultRowData.mobilePreview.value = '-----';
      
      if (tableDataArray.length === 0) {
        const originTableData = createBaseTableData();
        originTableData.colorScheme.value = '';
        originTableData.editor.value = '-----';
        originTableData.fileLink.value = '-----';
        originTableData.previewButton.value = '-----';
        originTableData.mobilePreview.value = '-----';
        tmpTableDataArray.push(originTableData);
      } else {
        for (let index = 0; index < tableDataArray.length; index++) {
          const originTableData = createBaseTableData();
          originTableData.colorScheme.value = tableDataArray[index].colorScheme;
          originTableData.editor.value = tableDataArray[index].editorLabel;
          originTableData.fileLink.value = tableDataArray[index].fileLink;
          originTableData.previewButton.value = tableDataArray[index].previewButton;
          originTableData.mobilePreview.value = tableDataArray[index].mobilePreview;
          tmpTableDataArray.push(originTableData);
        }
      }

      tableComponent =  new kintoneUIComponent.Table({
        data: tmpTableDataArray,
        defaultRowData: defaultRowData,
        columns: [
          {
            header: `${tableHeader.editorHeader}*`,
            cell: () => { return kintoneUIComponent.createTableCell('dropdown', 'editor')}
          },
          {
            header: `${tableHeader.previewButtonHeader}*`,
            cell: () => { return kintoneUIComponent.createTableCell('dropdown', 'previewButton')}  
          },
          {
            header: `${tableHeader.mobilePreviewHeader}*`,
            cell: () => { return kintoneUIComponent.createTableCell('dropdown', 'mobilePreview')}
          },
          {
            header: `${tableHeader.fileLinkHeader}`,
            cell: () => { return kintoneUIComponent.createTableCell('dropdown', 'fileLink')}
          },
          {
            header: `${tableHeader.colorSchemeHeader}*`,
            cell: () => { return kintoneUIComponent.createTableCell('text', 'colorScheme')}
          }
        ]
      });
      const configElement = document.getElementById('setting');
      configElement.appendChild(tableComponent.render());
    });
  };

  //save buttonを押した時にtable情報をsave
  const saveTableData = () => {
    const tableValues = tableComponent.getValue();
    const setConfig = {};
    let alertTexts = '';
    let [colorSchemeValueArray, editorValueArray, fileLinkValueArray, previewButtonValueArray, mobilePreviewValueArray] = [[], [], [], [], []];
    
    tableValues.forEach((tableValue, index) => {
      const alertEmptyText = checkTableDataIsEmpty(tableValue, index);
      alertTexts += `${alertEmptyText}`;

      colorSchemeValueArray.push(tableValue.colorScheme.value);
      editorValueArray.push(tableValue.editor.value);
      fileLinkValueArray.push(tableValue.fileLink.value);
      previewButtonValueArray.push(tableValue.previewButton.value);
      mobilePreviewValueArray.push(tableValue.mobilePreview.value);

      setConfig[`colorScheme${index}`] = tableValue.colorScheme.value;
      setConfig[`editorLabel${index}`] = tableValue.editor.value;
      setConfig[`fileLink${index}`] = tableValue.fileLink.value;
      setConfig[`previewButton${index}`] = tableValue.previewButton.value;
      setConfig[`mobilePreview${index}`] = tableValue.mobilePreview.value;
      tableValue.editor.items.forEach((editor) => {
        if (editor.value === tableValue.editor.value) {
          setConfig[`editorValue${index}`] = editor.label;
        }
      });
    });
    const alertDuplicatedTexts = checkTableDataIsDuplicated(editorValueArray, fileLinkValueArray, previewButtonValueArray, mobilePreviewValueArray);
    
    if (alertTexts === '' && alertDuplicatedTexts === '') {
      kintone.plugin.app.setConfig(setConfig);
    } else {
      notifyPopupComponent.setText(`${alertTexts}が未入力です。\n${alertDuplicatedTexts}`);
      notifyPopupComponent.show();
    }
  };
  
  //空欄がないかをcheck
  const checkTableDataIsEmpty = (tableValue, index) => {
    let alertText = '';
    if (tableValue.editor.value === '-----') {
      alertText += `${index + 1}番目のMarkdownエディタ,`;
    }
    if (tableValue.previewButton.value === '-----') {
      alertText += `${index + 1}番目のプレビューボタンの表示,`;
    }
    if (tableValue.mobilePreview.value === '-----') {
      alertText += `${index + 1}番目のモバイル版プレビューの表示,`;
    }
    return alertText;
  };

  //重複がないかをcheck
  const checkTableDataIsDuplicated = (editorValueArray, fileLinkValueArray, previewButtonValueArray, mobilePreviewValueArray) => {
    let alertDuplicatedText = '';

    const filteringEditorValueArray = editorValueArray.filter((editorValue, index, self) => {
      return self.indexOf(editorValue) !== self.lastIndexOf(editorValue);
    });
    const spaceIdValueArray = fileLinkValueArray.concat(previewButtonValueArray, mobilePreviewValueArray);
    const filteringSpaceIdArray = spaceIdValueArray.filter((spaceIdValue, index, self) => {
      if (spaceIdValue !== '-----') {
        return self.indexOf(spaceIdValue) !== self.lastIndexOf(spaceIdValue);
      }
    });

    if (filteringEditorValueArray.length !== 0) {
      alertDuplicatedText += `Markdownエディタの値が重複しています。\n`;
    }
    if (filteringSpaceIdArray.length !== 0) {
      alertDuplicatedText += `プレビューボタンの表示,ファイルのリンク表示,モバイル版プレビューのいずれかの値が重複しています。\n`;
    }

    return alertDuplicatedText;
  };
  
  createTableElement();
  createExplanationElement();
  createNotifyPopupElement();

  const saveButton = createUIButton('Submit','submit');
  const cancelButton = createUIButton('Cancel','normal');
  const buttonElement = document.getElementById('button');
  buttonElement.appendChild(saveButton.render());
  buttonElement.appendChild(cancelButton.render());

  saveButton.on('click', event => {
    console.log('save');
    saveTableData();
  });

  cancelButton.on('click', event => {
    console.log('cancel');
    history.back();
  });

})(jQuery, kintone.$PLUGIN_ID);
