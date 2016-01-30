title: Enhancing GitHub with Chrome extensions
description: GitHub lacks a few features which might be useful for popular projects maintainers. Here are some helpful Chrome extensions.
date: 2016-01-30 18:18:18
tags:
- chrome
- github
categories:
- project
- tools
---

If you ever maintained a popular GitHub project, you might have suffered from a couple of things:

* Your GitHub news feed became [useless](/images/github-feed.png) because stars, issues/PR comments, wiki edits notifications were burying the notifications you were interested in in an endless flood.
* You spent a lot of time repeating the same things over and over on your project's issues or PRs, such as *Thanks for your contribution! Please read the [Formatting section of our `CONTRIBUTING.md`](https://github.com/vhf/free-programming-books/blob/master/CONTRIBUTING.md#formatting) and fix your PR accordingly.* (While still adding a custom comment to each contributor pointing them at what they did wrong or how they can fix it, of course.)

And since we spend so much time on GitHub, why not also customizing it in some fun ways?

Here are four Chrome extensions for GitHub I enjoy using -- and they are all compatible with each others.

### [dashboard](https://chrome.google.com/webstore/detail/dashboard/pcnaddhmngnnpookfhhamkelhhakimdg) ([src](https://github.com/muan/dashboard))

dashboard inserts a row of checkboxes at the top of your GitHub feed. Toggling these checkboxes show/hide specific types of notifications. For example you could use it to hide all fork notifications. Or only show new issues/PR notifications.

I use it to quickly navigate in my feed.

### [github-feed-blacklist](https://chrome.google.com/webstore/detail/github-feed-blacklist/dbhboodpldcdeolligbmnhnjpkkolcnl) ([src](https://github.com/vhf/github-feed-blacklist))

dashboard is great and all but what if you only want to hide star notifications and issues/PR comments coming from a specific repository? github-feed-blacklist got your back. It adds an icon to your extensions list, clicking it provides you with a way to add (remove) repositories to the list and blacklist notifications for each repo you added by checking boxes. (Keep in mind it's a *blacklist*: check a box to hide, not the opposite.) To keep your feed "full", it automatically loads the next notifications until 50 notifications are displayed. It also adds a counter at the top of your feed to tell you how many notifications have been hidden - clicking this counter will temporarily show them all. The UI is kinda ugly but heh, I'm no design ninja.

I use it to mute specific notification types coming from specific repos.

### [GitHub Canned Responses](https://chrome.google.com/webstore/detail/github-canned-responses/lhehmppafakahahobaibfcomknkhoina) ([src](https://github.com/notwaldorf/github-canned-responses))

GitHub Canned Responses adds a button inside the issues/PR comment form. Activating it will allow you to insert a predefined answer in the comment form. The saved canned answers list can be edited to modify the existing ones, add your own or delete the ones you don't need.

I intend to use it to insert repetitive answers to the PRs I got, I'm sure it will prove particularly useful to avoid having to explain the same stuff over and over again, for example to tell people that a failed Travis run on a PR means they should go check Travis' logs and actually fix their commits or ask for help.

### [Isometric Contributions](https://chrome.google.com/webstore/detail/isometric-contributions/mjoedlfflcchnleknnceiplgaeoegien) ([src](https://github.com/jasonlong/isometric-contributions))

Isometric Contributions is the fun one. It does not serve a particularly useful purpose. All it does is rendering a GitHub user contribution graph (the small squares you keep abusing to draw cat emojis or propose to your SO, you know) as isometric pixel art. And it's beautiful.

Please tweet me [`@_vhf`](https://twitter.com/_vhf) if you think I forgot your favorite GitHub Chrome extension!
