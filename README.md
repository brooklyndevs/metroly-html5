metroly
=======

Grrr... Grunt!
=====

When do I use it?
---------
Use can use grunt for following things:

- running JSHint to lint files: ```grunt jshint```
- minifying, linting files for new releases run: ```grunt``` (default command)
- compress files (Zip, GZip) (first modify compress option in Gruntfile) and run: ```grunt compress```
- preprocess index.html file and the likes - **make sure to check** [grunt preprocess][2] plugin and [the way we use it in index.html (including script tags)][index] ([from Gruntfile's processhtml task (line 110)][Gruntfile]).


How do I install grunt?
-----------------------
1. First install [node and npm][1]
2. Next run: ```npm install```, which installs all necessary dependencies
3. Now you can run ```grunt``` to compile scripts!


Can I add more stuff to grunt?
--------
Feel free to install as much of useful pluging to grunt as as you wish! ;p


Notes
=====
Just a general list of dependencies we
need to install additionally

```npm install```

```npm install grunt-cli -g```

```npm install grunt --save-dev```

```npm install almond -g```

```npm install karma@0.10.2```

```npm install chai```


CSS
===

In CSS folder when you want to add CSS for a new feature, just add
```@import 'my_new_file_name.css'``` instead of working in one huge file. Later we will compile it all into one big file.


References
==========
* [Node GTFS][3]
* [RequireJS Optimization options][requirejs_optimize]
* [grunt-cssmin options][cssmin]
* [Mobile Workflow by Addy Osmani][mw]
* [Backbone Boilerplate][bb]

[1]: http://www.joyent.com/blog/installing-node-and-npm/
[2]: https://github.com/jsoverson/grunt-preprocess
[3]: https://github.com/brendannee/node-gtfs
[index]: https://github.com/brooklyndevs/metroly-html5/blob/dev/index.html
[Gruntfile]: https://github.com/brooklyndevs/metroly-html5/blob/dev/Gruntfile.js
[requirejs_optimize]: https://github.com/jrburke/r.js/blob/master/build/example.build.js
[cssmin]: https://github.com/gruntjs/grunt-contrib-cssmin
[mw]: https://speakerdeck.com/addyosmani/mobile-workflow
[bb]: https://github.com/backbone-boilerplate/backbone-boilerplate/