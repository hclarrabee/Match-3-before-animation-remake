function sounds() {

    var $this = this;

    this.config = new Array();
    this.registeredSounds = new Array();
    var onLoad;
    checkSupport();

    function checkSupport() {
        if (!createjs.Sound.initializeDefaultPlugins()) {
            return false;
        }
    }


    this.preloadSound = function (path, track, track2, identifier, onLoad) {

        console.log(path + track + "|" + path + track2);
        var id = ("track_" + identifier);
        var manifest = [
            {
                id: id,
                src: path + track + "|" + path + track2
        }
        ];

        createjs.Sound.registerSound({
            id: id,
            src: path + track
        });
        createjs.Sound.registerSound({
            id: id,
            src: path + track2
        });

        onLoad = id;
        this.registeredSounds["track_" + identifier] = manifest[0].id;
        if (identifier === "bg") {
            createjs.Sound.addEventListener("fileload", onloadSound);
        }

        return manifest[0].id;
    }

    function onloadSound(e) {
        console.log(e);
        var trackID = e.currentTarget.id;
        createjs.Sound.removeAllEventListeners();

        var id = $this.registeredSounds[trackID];

        $.event.trigger({
            type: "soundReady",
            message: "bg sound is ready",
            time: new Date()
        });

    }

    this.playSound = function (id, repeat, volume) {
        id = this.registeredSounds[id];
        var instance = createjs.Sound.play(id);
        if (volume === undefined || volume === null) {
            instance.volume = 0.1;
        } else {
            instance.volume = volume;
        }
        if (repeat === true) {
            instance.addEventListener("complete", repeat);
        }
    }

    function repeat() {

        var id = this.registeredSounds["bg"];
        var instance = createjs.Sound.play(id);
        instance.volume = 0.1;

    }

    this.stopSound = function (id) {
        createjs.Sound.stop(id);
    }

    return this;
};