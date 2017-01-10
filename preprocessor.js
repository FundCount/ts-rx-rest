const tsc = require('typescript');

module.exports = {
    process: function (src, path) {
        if (path.endsWith('.ts')) {
            return tsc.transpile(
                src,
                {
                    module: tsc.ModuleKind.CommonJS,
                },
                path,
                []
            );
        }
        return src;
    },
};