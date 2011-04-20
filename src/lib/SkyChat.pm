package SkyChat;

use strict;
use warnings;

my %users = ();

sub login
{
    my ($user) = @_;

    $users{$user} = [] unless($user eq 'skykitteh');
    broadcast('skykitteh', $user.' lurkz in shadwoz.')
}

sub logout
{
    my ($user) = @_;
    delete $users{$user};

    broadcast('skykitteh', $user.' saiz no moar.')
}

sub broadcast
{
    my ($user, $msg) = @_;

    foreach my $u (keys %users)
    {
	push @{$users{$u}}, [$user, $msg];
    }
}

sub poll
{
    my ($user) = @_;

    my $queue = $users{$user};
    return [] unless ($queue);

    $users{$user} = [];

    return $queue;
}

1;
