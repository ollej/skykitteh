// SkyKitteh javascript

$(document).ready(function() {

  // Automatically scroll page to given element.
  function scrollTo(sel) {
    var destination = $(sel).offset().top;
    $("html:not(:animated),body:not(:animated)").animate({ scrollTop: destination-20}, 500 );
  }

  function setupToggleButton(btn, el) {
    $(btn).click(function() {
      $(el).toggle();
      scrollTo(el);
    });
  }

  // Setup nyroModal
  $(function() {
    $('.nyroModal').nyroModal();
  });

  // Hide all functionality
  $('#skykitteh-view').hide();
  $('#skykitteh-files').hide();
  $('#skykitteh-upload').hide();
  $('#skykitteh-modules').hide();
  $('#skykitteh-edit').hide();
  if (document.location.toString().match(/skykitteh.com\/edit\//)) {
    $.nmManual('#skykitteh-edit');
  }

  // Handle create file button
  $('#newfile').click(function() {
    jPrompt('Dah naem of new code nomz:', '', 'Can haz nomz?', function(filename) {
      if (filename) {
        document.location = '/edit/' + filename;
      }
    });
  });

  // Setup tabby on textarea to allow tabbing
  $('#skykitteh-editcode').tabby();

  $('#aceeditor').click(function() {
    var ace = window.__ace_shadowed__;
    ace.options.showPrintMargin = true;
    ace.options.gutter = true;
    var editor = ace.transformTextarea(document.getElementById('skykitteh-editcode'));
    var JavaScriptMode = require("ace/mode/perl").Mode;
    editor.getSession().setMode(new PerlMode());
    window.aceEditor = editor;
    return false;
  });

});