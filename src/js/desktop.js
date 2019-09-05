jQuery.noConflict();

(($, PLUGIN_ID) => {
  'use strict';




  kintone.events.on('app.record.detail.show', event => {
    //プラグインの設定画面でeditorのフィールドコードとる。

    let editorValue = event.record.editor.value;
    const editorElement = kintone.app.record.getFieldElement('editor');

    editorElement.innerHTML = DOMPurify.sanitize(marked(editorValue));
    editorElement.classList.add('markdown-body');
    console.log(event);
    return event;
  });



  kintone.events.on(['app.record.create.show', 'app.record.edit.show'], (event) => {
    console.log(event);
    return event;
  });


})(jQuery, kintone.$PLUGIN_ID);
