jQuery.noConflict();

(($, PLUGIN_ID) => {
  'use strict';

  const appId = kintone.app.getId();
  let pluginConfig = kintone.plugin.app.getConfig(PLUGIN_ID);
  const originData = { 
    editor: {
      items: []
    },
    preview: {
      items: []
    },
    fileLink: {
      items: []
    },
    colorScheme: { value: '' }
  };
  //labelがフィールドコード、valueは文字列
  // pluginConfig = {
  //   colorScheme0: "#000000",
  //   colorScheme1: "#111111",
  //   editorValue0: "起案／議題一覧（公開）",
  //   editorValue1: "連絡（公開）",
  //   editorLabel0: "editor",
  //   editorLabel1: "文字列__複数行_",
  //   fileLink0: "editorMobile00",
  //   preview0: "space2",
  //   preview1: "space2",
  // };

  const createTableDataArrayFromConfig = () => {
    const tmpArray = [];
    const tmpObjectTemplate = {
      colorScheme: '',
      editorValue: '',
      editorLabel: '',
      fileLink: '',
      preview: ''
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
      tmpObject.preview = pluginConfig[`preview${index}`];
      tmpArray.push(tmpObject);
    }
    return tmpArray;
  };

  const createUIButton = (text, type) => {
    const button = new kintoneUIComponent.Button({ text, type });
    return button;
  };

  const createTableElement = () => {
    const table =  new kintoneUIComponent.Table({
      data: [],
      columns: [
        {
          header: 'Markdownエディタ*',
          cell: () => { return kintoneUIComponent.createTableCell('dropdown', 'editor')}
        },
        {
          header: 'プレビューボタンの表示*',
          cell: () => { return kintoneUIComponent.createTableCell('dropdown', 'preview')}  
        },
        {
          header: 'ファイルのリンク表示',
          cell: () => { return kintoneUIComponent.createTableCell('dropdown', 'fileLink')}
        },
        {
          header: '見出しタグの色*',
          cell: () => { return kintoneUIComponent.createTableCell('text', 'colorScheme')}
        }
      ]
    });
    return table;
  }

  const setTableValue = (table) => {
    let multiLineTextArray = [];
    let multiLineFieldCodeArray = [];
    let spaceIdArray = [];
    let tmpTableDataArray = [];

    kintone.api(kintone.api.url('/k/v1/form', true), 'GET', {'app': appId}, (resp) => {
      resp.properties.forEach(field => {
        switch (field.type) {
          case 'MULTI_LINE_TEXT':
            multiLineTextArray.push(field.code);
            multiLineFieldCodeArray.push(field.label);
            break;
          case 'SPACER':
            spaceIdArray.push(field.elementId);
            break;
          default:
            break;
        }
      });

      const tableDataArray = createTableDataArrayFromConfig();
      for (let index = 0; index <= tableDataArray.length; index++) {
        const originTableData = JSON.parse(JSON.stringify(originData));
        const noSelectedItem = {
          label: '-----',
          value: '-----'
        };
        originTableData.editor.items.push(noSelectedItem);
        originTableData.preview.items.push(noSelectedItem);
        originTableData.fileLink.items.push(noSelectedItem);

        multiLineTextArray.forEach((multiLineText, index) => {
          const editorItem = {};
          editorItem.label = multiLineFieldCodeArray[index];
          editorItem.value = multiLineText;
          if (tableDataArray[index] === undefined || tableDataArray[index] === null) {
            originTableData.editor.value = '-----';
          } else {
            originTableData.editor.value = tableDataArray[index].editorValue;
          }
          originTableData.editor.items.push(editorItem);
        });

        spaceIdArray.forEach(spaceId => {
          const spaceIdItem = {};
          spaceIdItem.label = spaceId;
          spaceIdItem.value = spaceId;

          if (tableDataArray[index] === undefined || tableDataArray[index] === null) {
            originTableData.preview.value = '-----';
            originTableData.fileLink.value = '-----';
          } else {
            originTableData.preview.value = tableDataArray[index].preview;
            if (tableDataArray[index].fileLink === undefined || tableDataArray[index].fileLink === null) {
              originTableData.fileLink.value = '-----'; 
            } else {
              originTableData.fileLink.value = tableDataArray[index].fileLink; 
            }
          }
          originTableData.preview.items.push(spaceIdItem);
          originTableData.fileLink.items.push(spaceIdItem);
        });
        tmpTableDataArray.push(originTableData);
      }
      console.log(tmpTableDataArray);
      table.setValue(tmpTableDataArray);
    });
  };

  
  const configElement = document.getElementById('setting');
  const buttonElement = document.getElementById('button');
  const table = createTableElement();
  const saveButton = createUIButton('Submit','submit');
  const cancelButton = createUIButton('Cancel','normal');
  setTableValue(table);
  configElement.appendChild(table.render());
  buttonElement.appendChild(saveButton.render());
  buttonElement.appendChild(cancelButton.render());

  saveButton.on('click', event => {
    console.log('save');
  });

  cancelButton.on('click', event => {
    console.log('cancel');
    history.back();
  });
  
  // const validateTableData = () => {
  //   const tableValues = tableElement.getValue();

  //   const setConfig = {};

  //   tableValues.forEach((tableValue, index) => {
  //     setConfig[`colorScheme${index}`] = tableValue.colorScheme.value;
  //     setConfig[`editor${index}`] = tableValue.editor.value;
  //     setConfig[`fileLink${index}`] = tableValue.fileLink.value;
  //     setConfig[`preview${index}`] = tableValue.preview.value;
  //   });
  // };

})(jQuery, kintone.$PLUGIN_ID);
