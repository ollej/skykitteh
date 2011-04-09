// SkyKitteh javascript

$(document).ready(function() {

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
  
  $('#btn_editsource').click(function() {
    $('#skykitteh-edit').toggle();
  });
  $('#btn_viewsource').click(function() {
    $('#skykitteh-view').toggle();
  }); 

});
