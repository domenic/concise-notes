title: Modifying or Deleting a Line from an Old Commit
date: 2016-01-20 23:59:59
tags:
- git
---

I'll spare you and assume you know what you're doing, so here's the short version. Keep reading for a more comprehensive one.

1. Find the commit you want to change or delete
2. Get the SHA of its child commit.
2. `git rebase -i 1a2b3c4d` (1a2b3c4d is the child)
3. Replace `pick` with `edit`
4. `git add yourfile`
5. `git commit --amend`
6. `git rebase --continue`


I work alone on most of my side projects. They are experiments, personal documentations, ~~stupid~~ ideas... they have something in common though, they are versioned using git and I'm often their only contributor. Which means that if I want to rewrite the history and `git push --force`, I can! It won't break someone else's work!

Maybe I shouldn't have stricken out *stupid* here. Two months ago I had an idea. It came out of nowhere and was very easy to do, so I did it. *Let's log the content of my clipboard every minute!*

```sh
* * * * * cd ~/repositories/clipboard/ && pbpaste > clipboard.txt && git aa && git commit -m "`date`" 2>&1 >/dev/null
```

This idea being stupid and/or useless does not mean I *am* stupid or useless, I was obviously not going to push this to a remote server.

But let's pretend I'd like to anyway. We can very safely assume that doing so would be very unsafe: there are probably a bunch of my passwords in the repo (copy-pasted from my password manager), and private emails (written in my text editor and copy-pasted to my webmail), and kilobytes of source code I wrote at work, etc.

Obviously, trying to delete all potential private data from my clipboard repo would be a hard and painful process of carefully reviewing the content of each of the thousands of commits it contains.

So for the sake of the demonstration, and because I used this post as an excuse to tell you about the futility of logging your clipboard, or because I used the futility of logging my clipboard to blog about how to change / delete an old commit, here's how you could achieve the removal of `mysecret` from your git repo without leaving any trace (given that nobody cloned or forked your repo):

1. Find the commit you want to change or delete:
  * If you already know the commit SHA, easy.
  * If you know the commit message, `git log --grep='Versioning my secret' # --all for all branches`
  * If you know the commit content, `git grep mysecret $(git rev-list --all)`
  * If you know which file contains your secret, `git blame file`, find line, get SHA, checkout SHA, blame, repeat until you get the first commit introducing the secret (don't settle for the 20 following commits fiddling with this line's whitespaces).
  * Choose whatever option gets you the SHA the quickest. The order listed here is not that bad in my opinion. So, your secret first appeared in your git repository at commit `054f345865f8f5a319dc05fcfa6cf9b76541e229`
2. You actually need the SHA of the child commit. The commit that came directly after the one you want to modify or get rid of.
  * `git rev-list --all | grep 054f345865f8f5a319dc05fcfa6cf9b76541e229 -A1 | tail -n1`
  * So, the child is `e20645764ce6419e348e6c1b5dea2348e18d050f`
3. We will rebase after the child.
  * `git rebase -i e20645764ce6419e348e6c1b5dea2348e18d050f`
4. The first line should be the one for your "bad" commit: `pick 054f345 versioning secret stuff!`
  * Replace `pick` with `edit`.
  * Close the editor to start rebasing.
5. Your repo is now at the bad commit. Edit `yourfile` and remove your secret from it. Or delete `yourfile`.
6. `git add yourfile`
7. `git commit --amend`
8. `git rebase --continue`
9. Done!

Note that if you simply want to *delete the bad commit* instead of *editing it to remove a secret from a file or remove a file from the commit*, this won't work. Simply drop the commit when rebasing instead of `edit`ing it.

The first time I had to do that it took me quite some time to figure it out, and search engines weren't that helpful.

If you have a complex history and would like to edit a bad merge or other weird cases AND if you like *choose your own adventure* books, take a look at this: [http://sethrobertson.github.io/GitFixUm/fixup.html](http://sethrobertson.github.io/GitFixUm/fixup.html). It's as awesome as it's hard to navigate! :)

PS: I'm not responsible if you rewrite the history of a publicly traded github repository.
PPS: I'm now the very proud owner of a very useless domain name: [☑.ml](http://☑.ml). (You can even append `/blog/` to get here. UTF-8 works!) Finally a URL I could handwrite without worrying about my handwriting (while worrying about the poor people who will try to type it in their browser instead)!
