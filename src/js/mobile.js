jQuery.noConflict();

(($, PLUGIN_ID) => {
  'use strict';

  kintone.events.on('mobile.app.record.detail.show', event => {
    const editorValue = event.record.editor.value;
    // const editorElement = kintone.app.record.getFieldElement('editor');
    kintone.mobile.app.record.setFieldShown('editor', false);

    const mobileTextAreaField = kintone.mobile.app.record.getSpaceElement('editorMobile');
    const mobileDiv1 = document.createElement('div');
    const mobileDiv2 = document.createElement('div');
    const mobileDiv31 = document.createElement('h3');
    const mobileDiv32 = document.createElement('div');
    //mobileDiv1.classList.add('row-gaia');
    mobileDiv2.classList.add('parent2');
    mobileDiv31.classList.add('parent3label');
    //mobileDiv32.setAttribute('id', 'parent3valueId');
    // mobileDiv32.classList.add('parent3valueClass');
    mobileDiv32.classList.add('control-value-gaia');
    mobileDiv32.classList.add('markdown-body');

    mobileDiv2.appendChild(mobileDiv31);
    mobileDiv2.appendChild(mobileDiv32);
    mobileDiv1.appendChild(mobileDiv2);

    mobileDiv31.textContent = 'editor'
    mobileDiv32.innerHTML = DOMPurify.sanitize(marked(editorValue));
    mobileTextAreaField.appendChild(mobileDiv1);

    return event;
  });

})(jQuery, kintone.$PLUGIN_ID);
