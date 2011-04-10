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

  // Handle create file button
  $('#btn_newfile').click(function() {
    var filename = prompt('Dah naem of new code nomz:');
    if (filename) {
      document.location = '/edit/' + filename;
    }
  });

  // Hide all functionality
  if (document.location.toString().match(/skykitteh.com\/edit\//)) {
    // Scroll down to edit area
    scrollTo('#skykitteh-edit');
  } else {
    // Don't hide edit source on the edit page.
    $('#skykitteh-edit').hide();
  }
  $('#skykitteh-view').hide();
  $('#skykitteh-files').hide();
  $('#skykitteh-upload').hide();
  $('#skykitteh-modules').hide();
  
  setupToggleButton('#btn_editsource', '#skykitteh-edit');
  setupToggleButton('#btn_viewsource', '#skykitteh-view');
  setupToggleButton('#btn_listfiles', '#skykitteh-files');
  setupToggleButton('#btn_upload', '#skykitteh-upload');
  setupToggleButton('#btn_listmodules', '#skykitteh-modules');

});
