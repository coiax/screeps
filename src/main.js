module.exports.loop = function() {
    var segment_zero = load_s0();
    if (segment_zero === null)
        return;

    for (var cn in Memory.creeps) {
        if (!(cn in Game.creeps)) {
            delete Memory.creeps[cn];
        }
    }

    for (var sn in Game.spawns) {
        var spawn = Game.spawns[sn];
        var room = spawn.room;
        var sources = room.find(FIND_SOURCES);

        /* Each source supports 2 generic worker creeps. */
        var count = sources.length * 2;

        var room_creeps = _.filter(Game.creeps, function(creep) {
            if (creep.memory.room == room.name)
                return true;
            return false;
        });

        if (room_creeps.length < count) {
            var name = new_creep_name();

            var source = sources[room_creeps.length % sources.length];

            var rc = spawn.spawnCreep([WORK, CARRY, MOVE], name, {
                memory: {
                    type: "generic_worker",
                    room: room.name,
                    source_id: source.id
                }
            });
        }
    }

    handle_creeps();

}

function handle_creeps() {
    for (var cn in Game.creeps) {
        var creep = Game.creeps[cn];

        if (creep.memory.type != "generic_worker" || !creep.memory.room) {
            var spawn = room.find(FIND_MY_SPAWNS)[0];
            if(spawn.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
            } else {
                continue;
            };
        };
        var room = creep.room;
        var source = Game.getObjectById(creep.memory.source_id);

        if (creep.memory.working) {
            if(_.sum(creep.carry) == 0)
                creep.memory.working = false;
            else if (creep.upgradeController(room.controller) == ERR_NOT_IN_RANGE)
                creep.moveTo(room.controller);
        } else {
            if(_.sum(creep.carry) == creep.carryCapacity)
                creep.memory.working = true;
            else if(creep.harvest(source) == ERR_NOT_IN_RANGE)
                creep.moveTo(source);
        }
    }
}

function new_creep_name() {
    var name = "";
    var charset = "thequickfoxjumpedoverthelazydog";
    /* And now a naming algorithm that has O(inf) worst case performance */
    while (true) {
        name += charset.charAt(Math.floor(Math.random() * charset.length));
        if (Game.creeps[name] === undefined) {
            return name;
        }
    }
}

function load_s0() {
    // Segment zero should be kept as small as possible, for CPU fast load times.
    if (!(0 in RawMemory.segments)) {
        RawMemory.setActiveSegments([0]);
        return null;
    }

    try {
        var segment_zero = JSON.parse(RawMemory.segments[0]);
    } catch (err) {
        if (err instanceof SyntaxError) {
            // Corrupted or non-initialised segment_zero memory, set to defaults.
            RawMemory.segments[0] = JSON.stringify({});
            return null;
        } else {
            throw err;
        }
    }

    return segment_zero;
}

// vim: shiftwidth=4 tabstop=4 expandtab smarttab softtabstop=4
