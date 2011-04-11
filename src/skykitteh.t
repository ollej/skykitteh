# SkyKitteh lifeboat!
use Test::More tests => 6;
use Test::Mojo;

use File::Slurp qw(read_file write_file);
use Digest::MD5 qw(md5_hex);

use FindBin;
$ENV{MOJO_HOME} = "$FindBin::Bin/";
my $kitteh_name = "$ENV{MOJO_HOME}/skykitteh";

require $kitteh_name;

my $filename = '/tmp/'.md5_hex(rand);
my $data = md5_hex(rand);

if (-e $filename) {
    unlink $filename;
}

my $kitteh = read_file($kitteh_name);

my $t = Test::Mojo->new;
$t->get_ok('/?format=json')->status_is(200)->json_content_is({filename => 'skykitteh', checksum => md5_hex($kitteh), code => $kitteh});
$t->post_form_ok('/' => {filename => $filename, code => $data, checksum => md5_hex(undef)});

ok(-e $filename, 'File written.');
ok(read_file($filename) eq $data, 'File ok.');

if (-e $filename) {
    unlink $filename;
}
