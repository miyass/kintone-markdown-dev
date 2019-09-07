jQuery.noConflict();

(($, PLUGIN_ID) => {
  'use strict';

  const tableData = { 
    editor: {
      items: []
    },
    preview: {
      items: []
    },
    fileLink: {
      items: []
    },
    colorScheme: { value: '#ffffff' }
  };

  const createUITable = () => {
    const table =  new kintoneUIComponent.Table({
      data: [],
      actionButtonsShown: false,
      columns: [
        {
          header: 'Markdownエディタ',
          cell: () => { return kintoneUIComponent.createTableCell('dropdown', 'editor')}
        },
        {
          header: 'プレビューボタンの表示',
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

  const configElement = document.getElementById('setting');
  const tableElement = createUITable();
  
  configElement.appendChild(tableElement.render());

  const appId = kintone.app.getId();
  let multiLineTextArray = [];
  let spaceIdArray = [];
  let tableDatas = [];

  kintone.api(kintone.api.url('/k/v1/form', true), 'GET', {'app': appId}, (resp) => {
    resp.properties.forEach(field => {
      switch (field.type) {
        case 'MULTI_LINE_TEXT':
          multiLineTextArray.push(field.label);
          break;
        case 'SPACER':
          spaceIdArray.push(field.elementId);
          break;
        default:
          break;
      }
    });
    
    for (let i = 0; i <= 4; i++) {
      const originTableData = JSON.parse(JSON.stringify(tableData));
      const noSelectedItem = {
        label: '-----',
        value: '-----'
      };
      originTableData.editor.items.push(noSelectedItem);
      originTableData.preview.items.push(noSelectedItem);
      originTableData.fileLink.items.push(noSelectedItem);
      multiLineTextArray.forEach((multiLineText, index) => {
        const editorItem = {};
        editorItem.label = multiLineText;
        editorItem.value = multiLineText;
        if(index === 0) {
          originTableData.editor.value = multiLineText; 
        }
        originTableData.editor.items.push(editorItem);
      });

      spaceIdArray.forEach((spaceId, index) => {
        const spaceIdItem = {};
        spaceIdItem.label = spaceId;
        spaceIdItem.value = spaceId;
        if(index === 0) {
          originTableData.preview.value = spaceId; 
          originTableData.fileLink.value = spaceId; 
        }
        originTableData.preview.items.push(spaceIdItem);
        originTableData.fileLink.items.push(spaceIdItem);
      });

      tableDatas.push(originTableData);
    }
    tableElement.setValue(tableDatas);
  });
})(jQuery, kintone.$PLUGIN_ID);
