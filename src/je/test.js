function render(template, vars)
{
    document.mojo.stash(vars);
    document.mojo.render({'template': template});
}

var test = document.mojo.param('test');
var vars = {
    'msg': 'move along.'
};

vars['msg'] += ' (param "test" is "'+test+'")';

render('error', vars);
