# pj2us-transformer

Transforms `package.json` into userscript metadata, including a local require, if provided. For use in a node-powered(e.g. webpack) userscript development toolchain.


## Usage
Just pass it the contents of the `package.json` file as a string and it will return a transformed string. If target is provided, it will convert that into a file URL require. Target must be an absolute path.

The properties `name` and `version` are required.

It will pull others such as `description` or `author` automatically.

Use the property `userscript` in your `package.json` to include any userscript tags not defined in vanilla `package.json`. It can also be used to override anything from `package.json`.
Values can be strings or arrays.


### TODO
Support for @downloadURL / @updateURL
