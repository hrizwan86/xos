module.exports = {
  "files": [
    '../../xos/core/dashboard/*.html',
    '../../xos/core/xoslib/**/*.html',
    '../../xos/core/xoslib/static/**/*.js',
    '../../xos/core/xoslib/static/**/*.css',
    '../../xos/core/dashboard/views/*.py',
    '../../xos/templates/**/*.html',
    '../../xos/core/static/xos.css'
  ],
  proxy: "xos.dev:9999",
  open: true
};
