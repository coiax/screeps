var protobuf = require("../node_modules/protobufjs/dist/protobuf.js");

module.exports.loop = function() {
    // Memory deserialisation is expensive
    // Before we do that, use a RawMemory page encoded in protobuf
    // for initialisation.
 
    if (!(0 in RawMemory.segments)) {
        RawMemory.setActiveSegments([0]);
        return;
    }

    console.log(Game.time);
}
// vim: shiftwidth=4 tabstop=4 expandtab smarttab softtabstop=4
