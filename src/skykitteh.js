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

  // Hide all functionality
  $('#skykitteh-view').hide();
  $('#skykitteh-files').hide();
  $('#skykitteh-upload').hide();
  $('#skykitteh-modules').hide();
  if (document.location.toString().match(/skykitteh.com\/edit\//)) {
    // Scroll down to edit area
    scrollTo('#skykitteh-edit');
  } else {
    // Don't hide edit source on the edit page.
    $('#skykitteh-edit').hide();
  }

  // Setup buttonz  
  setupToggleButton('#btn_editsource', '#skykitteh-edit');
  setupToggleButton('#btn_viewsource', '#skykitteh-view');
  setupToggleButton('#btn_listfiles', '#skykitteh-files');
  setupToggleButton('#btn_upload', '#skykitteh-upload');
  setupToggleButton('#btn_listmodules', '#skykitteh-modules');

  // Handle create file button
  $('#btn_newfile').click(function() {
    var filename = prompt('Dah naem of new code nomz:');
    if (filename) {
      document.location = '/edit/' + filename;
    }
  });

  // Setup tabby on textarea to allow tabbing
  jQuery(document).ready(function () {
    $('#skykitteh-editcode').tabby();
  });

});
