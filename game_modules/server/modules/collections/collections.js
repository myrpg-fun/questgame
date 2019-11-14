var zz = require('../../zz');

module.exports = function (server){
    server.Collection = server.FlagGroupClass.extend({
        className: 'Collection',
    });
};