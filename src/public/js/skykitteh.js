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
  $('.nyroModal').nyroModal();

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

  // Open chat window
  $('#chat').click(function() {
    jPrompt('Naem:', '', 'Identify yourself', function(username) {
      if (username) {
        window.open('/chat/?user=' + username, 'chatpopup', '');
      }
    });
  });

  // Setup tabby on textarea to allow tabbing
  $('#skykitteh-editcode').tabby();

  // Setup ACE editor.
  $('#aceeditor').click(function() {
    var editor = ace.edit("skykitteh-editcode");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/perl");
    //editor.options.showPrintMargin = "true";
    //editor.options.gutter = "true";
    //editor.transformTextarea(document.getElementById('skykitteh-editcode'));
    return false;
  });

  // Add MD5 hash spam protection.
  $('#editForm').submit( function() {
    var md5hash = $.md5($('#skykitteh-editcode').val());
    var input = $("<input>").attr("type", "hidden").attr("name", "md5hash").val(md5hash);
    $('#editForm').append($(input));
  });
});