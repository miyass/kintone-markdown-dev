jQuery.noConflict();

(($, PLUGIN_ID) => {
  'use strict';

  const appId = kintone.app.getId();
  let pluginConfig = kintone.plugin.app.getConfig(PLUGIN_ID);
  const kintoneFieldData = {
    multiLineTextArray: [],
    multiLineFieldCodeArray: [],
    spaceIdArray: []
  };

  //labelがフィールドコード、valueは文字列
  pluginConfig = {
    colorScheme0: "",
    editorLabel0: "editor",
    editorValue0: "起案／議題一覧（公開）",
    fileLink0: "-----",
    preview0: "-----",
    colorScheme1: "#111111",
    editorLabel1: "文字列__複数行_",
    editorValue1: "相談（公開）1",
    fileLink1: "-----",
    preview1: "space2"
  };

  //configの情報を配列に整形
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

  //button要素の生成
  const createUIButton = (text, type) => {
    const button = new kintoneUIComponent.Button({ text, type });
    return button;
  };

  //table要素の生成
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

  //tableの元となる行の作成
  const createBaseTableData = () => {
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
    const originTableData = JSON.parse(JSON.stringify(originData));
    const noSelectedItem = {
      label: '-----',
      value: '-----'
    };
    originTableData.editor.items.push(noSelectedItem);
    originTableData.preview.items.push(noSelectedItem);
    originTableData.fileLink.items.push(noSelectedItem);

    kintoneFieldData.multiLineTextArray.forEach((multiLineText, index) => {
      const editorItem = {};
      editorItem.label = kintoneFieldData.multiLineFieldCodeArray[index];
      editorItem.value = multiLineText;
      originTableData.editor.items.push(editorItem);
    });

    kintoneFieldData.spaceIdArray.forEach(spaceId => {
      const spaceIdItem = {};
      spaceIdItem.label = spaceId;
      spaceIdItem.value = spaceId;
      originTableData.preview.items.push(spaceIdItem);
      originTableData.fileLink.items.push(spaceIdItem);
    });

    return originTableData;
  }
  //tableにconfig情報から値をセット
  const setTableValue = (table) => {
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
      if (tableDataArray.length === 0) {
        const originTableData = createBaseTableData();
        originTableData.colorScheme.value = '';
        originTableData.editor.value = '-----';
        originTableData.fileLink.value = '-----';
        originTableData.preview.value = '-----';
        tmpTableDataArray.push(originTableData);
      } else {
        for (let index = 0; index < tableDataArray.length; index++) {
          const originTableData = createBaseTableData();
          originTableData.colorScheme.value = tableDataArray[index].colorScheme;
          originTableData.editor.value = tableDataArray[index].editorLabel;
          originTableData.fileLink.value = tableDataArray[index].fileLink;
          originTableData.preview.value = tableDataArray[index].preview;
          tmpTableDataArray.push(originTableData);
        }
      }
      table.setValue(tmpTableDataArray);
    });
  };
  //save buttonを押した時にtable情報をsave
  const saveTableData = () => {
    const tableValues = table.getValue();
    const setConfig = {};
    let alertTexts = '';
    //console.log(tableValues);
    tableValues.forEach((tableValue, index) => {
      const alertText = checkTableData(tableValue, index);
      alertTexts += `${alertText}`;

      setConfig[`colorScheme${index}`] = tableValue.colorScheme.value;
      setConfig[`editorLabel${index}`] = tableValue.editor.value;
      setConfig[`fileLink${index}`] = tableValue.fileLink.value;
      setConfig[`preview${index}`] = tableValue.preview.value;
      tableValue.editor.items.forEach((editor) => {
        if (editor.value === tableValue.editor.value) {
          setConfig[`editorValue${index}`] = editor.label;
        }
      });
    });

    if (alertTexts === '') {
      kintone.plugin.app.setConfig(setConfig);
    } else {
      alert(`${alertTexts}が未入力です。`);
    }
  };

  //重複、空欄がないかをcheck
  const checkTableData = (tableValue, index) => {
    let alertText = '';
    if (tableValue.editor.value === '-----') {
      alertText += `${index}番目のMarkdownエディタ,`;
    }
    if (tableValue.preview.value === '-----') {
      alertText += `${index}番目のプレビューボタンの表示,`;
    }
    return alertText;
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
    saveTableData();
  });

  cancelButton.on('click', event => {
    console.log('cancel');
    history.back();
  });
})(jQuery, kintone.$PLUGIN_ID);
