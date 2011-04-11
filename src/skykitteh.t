# SkyKitteh lifeboat!
use Test::More tests => 6;
use Test::Mojo;

use File::Slurp qw(read_file write_file);
use Digest::MD5 qw(md5_hex);

use FindBin;
$ENV{MOJO_HOME} = "$FindBin::Bin/";
require "$ENV{MOJO_HOME}/skykitteh";

my $filename = '/tmp/'.md5_hex(rand);
my $data = md5_hex(rand);

if (-e $filename) {
    unlink $filename;
}

my $t = Test::Mojo->new;
$t->get_ok('/')->status_is(200)->content_like(qr/SkyKitteh/);
$t->post_form_ok('/' => {filename => $filename, code => $data, checksum => md5_hex(undef)});

ok(-e $filename, 'File written.');
ok(read_file($filename) eq $data, 'File ok.');

if (-e $filename) {
    unlink $filename;
}
