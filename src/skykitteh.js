// SkyKitteh javascript

$(document).ready(function() {

  function scrollTo(sel) {
    var destination = $(sel).offset().top;
    $("html:not(:animated),body:not(:animated)").animate({ scrollTop: destination-20}, 500 );
  }

  // Handle create file button
  $('#btn_newfile').click(function() {
    var filename = prompt('Dah naem of new code nomz:');
    if (filename) {
      document.location = '/edit/' + filename;
    }
  });

  // Hide edit and view source
  $('#skykitteh-edit').hide();
  $('#skykitteh-view').hide();
  $('#skykitteh-modules').hide();
  
  $('#btn_editsource').click(function() {
    $('#skykitteh-edit').toggle();
    scrollTo('#skykitteh-edit');
  });
  $('#btn_viewsource').click(function() {
    $('#skykitteh-view').toggle();
    scrollTo('#skykitteh-view');
  }); 
  $('#btn_listmodules').click(function() {
    $('#skykitteh-modules').toggle();
    scrollTo('#skykitteh-modules');
  });

});
