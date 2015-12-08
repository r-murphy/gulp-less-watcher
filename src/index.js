import fs       from 'fs';
import accord   from 'accord';
import File     from 'vinyl';
import through2 from 'through2';
//import util     from 'gulp-util';
import merge    from 'deepmerge';

import createError   from './createError';
import createWatcher from './createWatcher';

//const {log} = util;
const less  = accord.load('less');

export default (options = {}) => {
  let throughStream = through2.obj(function(file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(createError('Streaming not supported'));
    }

    const filename = file.path;
    const filebase = file.base;
    const filecwd = file.cwd;
    const watch    = createWatcher(filename);

    const scan = () => {
      const contents = fs.readFileSync(filename);
      less.render(contents.toString(), merge(options, { filename })).then(({imports}) => {
        var newFile = new File({
          contents,
          cwd: filecwd,
          base: filebase,
          path: file.path
        });
        this.push(newFile);

        // Filter node_modules imports.
        imports = imports.filter(ffilename => !ffilename.match(/node_modules/));
        watch(imports).on('all', scan);

        // cb(null, newFile);

      }).catch(err => this.emit('error', createError(err)));
    };

    scan();
  });

  throughStream.end = function() {
    //suppress the end call on the stream
  };

  return throughStream;
};
