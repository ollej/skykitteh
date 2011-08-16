
  // state holds path for current operation or an empty string if idle.
  // Should be replaced with a process struct which holds path and abortHandler.
  var state = '';

  // editor is the active file. ed['code'] is only valid for inactive editors.
  var editor = {
      code: '',
      base: '',
      filename: '-',
      checksum: '',
      scrollTop: 0
  };

  var editors = new Object();
  editors['-'] = editor;

  function addEditor(newEditor)
  {
      if(newEditor == null) return;

      var filename = newEditor['filename'];
      editors[filename] = newEditor;

      // FIXME: Escape string.
      var parts = filename.split('/');
      var file = parts[parts.length-1].substr(0, 16);
      var link = '<a class="editTab" href="#'+filename+'" id="edit_'+$.md5(filename)+'" onclick="switchEditor(editors[\''+filename+'\']); return false;">'+file+'</a>';

      $('#tabBar').prepend(link);
      //switchEditor()?
  }

  function closeOpenEditor()
  {
      if(state != '' || editor == null || editor['filename'] == '-') return;
      closeEditor(editor['filename']);
  }

  function closeEditor(filename)
  {
      if(state != '' || editor == null) return;

      if(isEdited(filename)) {
	  if(!confirm("The file "+filename+" has been modified.\nDo you want to discard the changes?")) {
	      return;
	  }
      }

      $('#edit_'+$.md5(filename)).remove();

      if(editor == editors[filename]) {
	  var links = $('.editTab');
	  var next = '-';
	  if(links[0]) { // Other editors
	      // TODO: FIXME: Keep LRU data for editors.
	      next = links[0].href.split('#')[1];
	  }

	  switchEditor(editors[next]);
      }

      log("Closed "+filename);

      delete editors[filename];
  }

  // FIXME: If each file has its own (hidden) text area instead of ['code'], it's possible to keep multiple files open with "it's all text".
  // FIXME: Restoring an editor should restore the scroll position. (this is free if multiple text areas are used.)
  function switchEditor(newEditor)
  {
     if(editor == newEditor || state != '') return;

     if(editor != null) {
	 editor['scrollTop'] = getEdScrollTop();
	 editor['code'] = getEdContent();
	 var id = $.md5(editor['filename']);
	 $('#edit_'+id).toggleClass('selectedTab', false);
	 $('#file_entry_'+id).toggleClass('activeFileEntry', false);
     }

     editor = newEditor;
     setEdContent(editor['code']);
     setEdScrollTop(editor['scrollTop']);
     $('#statusBar').text(editor['filename']);
     $('#edit_'+$.md5(editor['filename'])).toggleClass('selectedTab', true);
     $('#file_entry_'+$.md5(editor['filename'])).toggleClass('activeFileEntry', true);
     $('#preview').attr('href', '/ide/preview?filename='+editor['filename']);

     disableEd(editor['filename'] == '-');
  }

  function log(msg, type)
  {
      if(!type) type = 'action';
      msg = msg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      if(type == 'diff') {
	  msg = msg.replace(/^(@.*?)$/gm, '<span class="log_diff_sec">$1</span>');
	  msg = msg.replace(/^(\+.*?)$/gm, '<span class="log_diff_add">$1</span>');
	  msg = msg.replace(/^(\-.*?)$/gm, '<span class="log_diff_del">$1</span>');
      }
      msg = msg.replace(/\n|\r|\r\n/g, '<br/>');
      $('#output').append('<span class="log_out log_'+type+'">'+msg+"</span><br/>\n");
      $('#output')[0].scrollTop = $('#output')[0].scrollHeight;
  }


  function promptNewFile()
  {
      if(state != '') return;
      state = '-';

      jPrompt('File name:', '', 'Can haz noms?', function(path) {
	      // FIXME: Check if file or editor with same path exists.
	      state = '';
	      if(path) {
		  if(editors[path] != null)
		      switchEditor(editors[path]);
		  else
		      startLoadFile(path);
	      }
	  });
  }

  function startSaveFile()
  {
      if(state != '' || editor['filename'] == '' || editor['filename'] != editor['filename']) return;
      state = editor['filename'];

      disableEd(true);

      // FIXME: Check if save is necessary.
      log("Saving "+editor['filename']+" ...");

      jPrompt('Commit message', '', 'Commit message', function(message) {
	      if(message == null) {
		  log('Save aborted.', 'error');
		  state = '';
		  disableEd(false);
		  return;
	      }

	      var data = {
		  format:'json',
		  code: getEdContent(),
		  base: editor['base'],
		  pooh: '',
		  filename: editor['filename'],
		  md5hash: $.md5(getEdContent()),
		  checksum: editor['checksum'],
		  commit_message: message
	      };

	      $.ajax({ url: '/',
		       type: 'POST',
		       dataType: 'json',
		       data: data,
		       success: handleSaveResponse,
		       error: handleError
	             });
	  });
  }

  function handleSaveResponse(data)
  {
      if(data['status']) {
          log("Saved "+state);
	  // FIXME: Get up to date file data from response instead of reverting.
	  state = '';
	  startRevertFile(true);
      }
      else {
	  if(data['error'] && data['error'] == 'test_failed') {
	      log("Failed to save "+state+", test failed:", 'error');
	      log(data['report'], 'code');
	  }
	  else if(data['error'] && data['error'] == 'needs_merge') {
	      // FIXME: Display diff in new editor or popup and allow merge.
	      log("Failed to save "+state+", needs merge:", 'error');
	      log(data['diff'].join("\n"), 'diff');
	  }
	  else {
	      log("Failed to save "+state, 'error');
	  }
	  // FIXME: Handle more cases.
	  // FIXME: Alert?
	  disableEd(false);
	  state = '';
      }
  }


  function startRevertFile(force)
  {
      if(state != '' || editor['filename'] == '') return;

      if(!force && !confirm('Discard any changes and reload from server?')) return;

      log("Reverting "+editor['filename']);

      var path = editor['filename'];
      editor['scrollTop'] = getEdScrollTop();

      // FIXME: If reload fails, we're left in an inconsistent state (editor claims to be $path but holds invalid value and checksum).
      setEdContent('Reloading.');
      disableEd(true);
      editor['checksum'] += 'BOGUS';

      startLoadFile(path, true);
  }

  function startLoadFile(path, revert)
  {
      if(state != '') return;
      if(revert) {
	  if(editor['filename'] != path) return;
      }
      else {
	  if(editor['filename'] == path) return;
	  if(editors[path] != null) {
	      switchEditor(editors[path]);
	      return;
	  }
      }
      state = path;
      disableEd(true);

      log("Loading "+path+" ...");

      $.ajax({ url: '/edit/'+path,
	       dataType: 'json',
	       data: {format:'json'},
	       success: revert ? handleRevertResponse : handleLoadResponse,
	       error: handleError
	     });
  }

  function handleRevertResponse(data)
  {
      if(data['filename'] != state) {
	  alert('Received '+data['filename']+ ' while expecting '+state+'');
	  return;
      }

      setEdContent(data['code']);
      setEdScrollTop(editor['scrollTop']);

      editor['base'] = data['code'];
      editor['filename'] = data['filename'];
      editor['checksum'] = data['checksum'];

      $('#statusBar').text(data['filename']);

      log("Loaded "+data['filename']);

      $('#statusBar').text(data['filename']);
      disableEd(false);

      state = '';
  }

  function handleLoadResponse(data)
  {
      if(data['filename'] != state) {
	  alert('Received '+data['filename']+ ' while expecting '+state+'');
	  return;
      }

      var newEditor = {
	  code: data['code'],
	  base: data['code'],
	  filename: data['filename'],
	  checksum: data['checksum']
      };

      addEditor(newEditor);
      state = '';
      switchEditor(newEditor);

      log("Loaded "+data['filename']);

      setEdMode('perl'); // FIXME: Get from data.
  }

  function isEdited(filename)
  {
      if(!filename) {
	  for(var f in editors) {
	      if(f && editors[f] && isEdited(f)) return true;
	  }
	  return false;
      }

      var ed = editors[filename];
      return (ed != null) && ((editor == ed && getEdContent() != editor['base']) || (editor != ed && ed['base'] != ed['code']));
  }

  function startListFiles()
  {
      if(state != '') return;
      state = '_LIST_FILES_';

      $.ajax({ url: '/ide/files',
	       dataType: 'json',
	       data: {format:'json', path:'.'},
	       success: handleListFilesResponse,
	       error: handleError
	     });
  }

  function toggleDir(label, id)
  {
      $('#dir_view_'+id).toggle();
      $(label).toggleClass('dirEntryOpen', $('#dir_view_'+id).is(":visible"));
  }

  function buildFileTreeHTML(tree)
  {
      var html = '';
      if(tree['dir']) {
	  for(var n in tree['dir']) {
	      var id = $.md5(tree['dir'][n]['path']);
	      html +=
		  '<a href="#" class="dirEntry" onclick="toggleDir(this,\''+id+'\');return false;">'+n+'</a><br/>'+
		  '<div id="dir_view_'+id+'" class="dirBody">'+buildFileTreeHTML(tree['dir'][n])+'</div>';
	  }
      }

      if(tree['file']) {
	  for(var n in tree['file']) {
	      var f = tree['file'][n];
	      var id = $.md5(f);
	      html += '<a class="fileEntry a_file" id="file_entry_'+id+'" href="#'+f+'" onclick="startLoadFile(\''+f+'\'); return false;">'+n+'</a><br/>';
	  }
      }

      return html;
  }

  function handleListFilesResponse(data)
  {
      if(state != '_LIST_FILES_') return;

      if(!data['status']) {
	  log('Failed to retrieve file list from server.', 'error');
	  state = '';
	  return;
      }

      var files = data['files'];

      var tree = new Object();

      for(var i = 0; i < files.length; ++i) {
	  var parts = files[i].split('/');
	  var subtree = tree;
	  var path = '';

	  for(var j = 0; j < parts.length; ++j) {
	      var p = parts[j];
	      path += p;
	      if(j+1 == parts.length) {
		  if(!subtree['file']) subtree['file'] = new Object();
		  subtree['file'][p] = files[i];
	      }
	      else {
		  if(!subtree['dir']) subtree['dir'] = new Object();
		  if(!subtree['dir'][p]) subtree['dir'][p] = new Object();
		  subtree['dir'][p]['path'] = path;
		  subtree = subtree['dir'][p];
	      }
	  }
      }

      var html = buildFileTreeHTML(tree);
      $('#files').html(html);

      state = '';
  }

  function startDiff()
  {
      if(state != '') return;
      state = '_DIFF_';
      log('Diffing '+editor['filename']+' with current version on server ...');

      $.ajax({ url: '/ide/diff',
	       type: 'POST',
	       dataType: 'json',
	       data: { format:'json', filename:editor['filename'], code: getEdContent() },
	       success: handleDiffResponse,
	       error: handleError
	     });
  }

  function handleDiffResponse(data)
  {
      if(state != '_DIFF_') return;

      if(!data['status']) {
	  log('Failed to diff against server version.');
	  state = '';
	  return;
      }

      if(data['diff'] != null && data['diff'].length == 0) {
	  log('File '+data['filename']+' is up to date.');
      }
      else {
	  log('Diff against '+data['filename']+':');
	  log(data['diff'].join("\n"), 'diff');
      }

      state = '';
  }

  function startCompile()
  {
      if (state != '') return;
      state = '_COMPILE_';
      log('Compiling ' + editor['filename'] + ' ...');

      $.ajax({ url: '/ide/compile',
	       type: 'POST',
	       dataType: 'json',
	       data: { format:'json', filename:editor['filename'], code: getEdContent() },
	       success: handleCompileResponse,
	       error: handleError
	     });
  }

  function handleCompileResponse(data)
  {
      if (state != '_COMPILE_') return;

      if (data['status'] == 1) {
	  log('Code compiles.');
      } else {
	  log('Syntax Error: Code does not compile!', 'error');
	  log(data['error_msg'], 'code');
      }
      state = '';
  }

  function handleError(jqXHR, textStatus, errorThrown)
  {
      if(state == '') return;
      log('Request failed: '+textStatus+(errorThrown ? ', '+errorThrown : ''), 'error');

      disableEd(editor['filename'] == '-');

      state = '';
  }

  var initState = 1;

  function init()
  {
      if(initState == 0) return;

      if(state == '') {
	  if(initState == 1) {
	      startListFiles();
	      initState = 2;
	  }
	  else if(initState == 2) {
	      var args = getUrlVars();
	      var file = args['file'] || 'skykitteh';

	      startLoadFile(file);
	      initState = 0;

	      $(window).bind('beforeunload', function(){
		      return isEdited() ? "A file has been modified.\nDo you want to discard the changes?" : null;
		  });
	  }
      }

      window.setTimeout("init()", 500);
  }

$(document).ready(function() {

  // Setup nyroModal
  $('.nyroModal').nyroModal();
  $('#skykitteh-upload').hide();

  $('#editcode').tabby();
  $('#xResizeHandle').mousedown(function(e){
	  e.preventDefault();
	  $(document).mousemove(function(e){
		  var left = e.pageX;
		  left = (left < 150) ? 150 : left;
		  var view = $(window).width();
		  var right = view - left;
		  right -= 10; // margin
		  right = (right < 10) ? 10 : right;

		  // FIXME: Get these values at init.
		  $('#sideBar').css("width", right - 5);
		  $('#xResizeHandle').css("right", right + 4);
		  $('#mainArea').css("right", right + 17);
	      })
	      });

  $('#yResizeHandle').mousedown(function(e){
	  e.preventDefault();
	  $(document).mousemove(function(e){
		  var top = e.pageY;
		  top = (top < 150) ? 150 : top;
		  var view = $(window).height();
		  var bottom = view - top;
		  bottom -= 20; // margin
		  bottom = (bottom < 10) ? 10 : bottom;

		  // FIXME: Get these values at init.
		  $('#output').css("height", bottom + 5);
		  $('#yResizeHandle').css("bottom", bottom + 7);
		  $('#toolBar').css("bottom", bottom + 17);
		  $('#codeArea').css("bottom", bottom + 47);
	      })
	      });

  $(document).mouseup(function(e){
	  $(document).unbind('mousemove');
      });

  init();
});

function setTextContent(val)
{
    return $('#editcode').val(val);
}

function getTextContent()
{
    return $('#editcode').val();
}

function setEdMode(mode)
{
}

function setEdScrollTop(scrollTop)
{
    $('#editcode')[0].scrollTop = scrollTop;
}

function getEdScrollTop()
{
    return $('#editcode')[0].scrollTop;
}

function disableTextEd(disabled)
{
    $('#editcode').attr('readonly', disabled ? 'readonly' : '');
}

var aceEd;

function setAceContent()
{
}

function getAceContent()
{
}

function setAceMode(mode)
{
    //var JavaScriptMode = require("ace/mode/javascript").Mode;
    //aceEd.getSession().setMode(new JavaScriptMode());
}

var codeMirror;

function getCodeMirrorContent()
{
    return codeMirror.getValue();
}

function setCodeMirrorContent(val)
{
    codeMirror.setValue(val);
}

function disableCodeMirrorEd(disabled)
{
    codeMirror.setOption('readOnly', disabled);
}

var getEdContent = getTextContent;
var setEdContent = setTextContent;
var disableEd    = disableTextEd;

function goAce()
{
    alert('Fix CSS and implement setAceContent() and getAceContent().');
  aceEd = window.__ace_shadowed__;
  aceEd.options.showPrintMargin = "true";
  aceEd.options.gutter = "true";
  aceEd.transformTextarea(document.getElementById('editcode'));
  // aceEd.edit('editcode');
  getEdContent = getAceContent;
  setEdContent = setAceContent;
}


function goCodeMirror()
{
    codeMirror = CodeMirror.fromTextArea(document.getElementById('editcode'), {
	    value: "",
	    mode:  "javascript", //"clike"//"perl"
	    readOnly: editor['filename'] == '-'
	});

    getEdContent = getCodeMirrorContent;
    setEdContent = setCodeMirrorContent;
    disableEd    = disableCodeMirrorEd;
}

function goTextArea()
{
    //var text = getEdContent();

    if(codeMirror) {
	codeMirror.toTextArea();
	codeMirror = null;
    }

    getEdContent = getTextContent;
    setEdContent = setTextContent;
    disableEd    = disableTextEd;

    disableEd(editor['filename'] == '-');
}

function getUrlVars()
{
    var vars = [], hash;
    var params = window.location.href.slice(window.location.href.indexOf('?') + 1);
    var hashes = params.split('#')[0].split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = decodeURIComponent(hash[1]);
    }
    return vars;
}

