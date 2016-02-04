title: The dangers of HFS+ for git repositories
description: OSX file system, HFS+, is case insensitive.
date: 2016-02-04 20:00:00
tags:
- osx
- file systems
categories:
- programming
---

HFS+ is not case sensitive. It took me 6 months to realize this basic fact. It's one of these things you never bother researching when you consider buying a mac. Last week it hit me hard. I spent 30 minutes trying to fix something that should have been fixed in 30 seconds at most.

A colleague had created `File.ext` on our website hosted on github pages but printed `url/file.ext` on important documents they were supposed to hand over to someone. Without access to either Internet or a printer, they asked me to fix this. Easy as pie. Except...

    $ mkdir gittest && cd gittest
    $ git init
    $ touch File && ls
    File
    $ git add File && git commit -m "add File"
    $ mv File file && ls
    file
    $ git add file && git status
    On branch master
    nothing to commit, working directory clean

Oops. At this point, I lost quite some trying different ideas. I could not believe HFS+ was case insensitive, it never even occurred to me, I thought git was playing a trick on me. I ended up doing the following:

    $ git rm File && git add file
    $ git commit -m "rename file"

The problem being fixed, I investigated a bit.

    $ touch a A && ls
    a
    $ echo b > a
    $ cat A
    b

I then had to get confirmation on the Internet. Of course, most developers already knew about this. I didn't. And I currently have more than 70 repositories in my dedicated folder `~/repositories`. Imagine if one of these had `file` and `File` in the same directory when I cloned it.

Here is what I finally did to prevent any future headache.

    $ du -ch repositories | grep total
    14.8G   total
    $ hdiutil create -type SPARSE -fs 'Case-sensitive Journaled HFS+' -size 20g ~/volume_repos.dmg
    created: ~/volume_repos.dmg.sparseimage

I then decided on a mounting point for this volume, added an alias to mount it to my rc file, created a symlink `~/repositories` -> `~/mountpointrepo`, moved my repos to the volume.

    $ mv repositories backup_repositories
    $ echo alias mountrepos="hdiutil attach ~/volume_repos.dmg.sparseimage -mountpoint /Users/victor/mountpointrepo" > .zshrc
    $ source .zshrc
    $ mountrepos
    $ ln -s /Users/user/mountpointrepo repositories
    $ cp -r backup_repositories/.* backup_repositories/* repositories
    $ touch repositories/a repositories/A && ls repositories/
    A a

Perfect. And the sparse volume will grow without my intervention to fit my `~/repositories` content.

JetBrains IDEs started complaining though:

>    Filesystem Case-Sensitivity Mismatch
>         The project seems to be located on a case-sensitive file system.
>         This does not match the IDE setting (controlled by property "idea.case.sensitive.fs")

Even if their doc on this subject is very, very poor, I found the following solution:

    echo idea.case.sensitive.fs=true >> Library/Preferences/IntelliJIdea15/idea.properties

It feels safer now though I cannot really understand why case insensitive file systems still exist in 2016. Probably because people like me buy macs, I know.
