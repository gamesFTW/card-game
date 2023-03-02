const DEFAULT_SOUND_PACK = {
    attack: '',
    die: '',
    move: '',
    select: '',
    play: '',
};

Template.soundsEdit.helpers({
    sounds: function() {
        return MeteorApp.Sounds.find({}, { sort: { 'original.name': 1 } });
    },
    sounds2: function() {
        return MeteorApp.Sounds2.find({});
    },
    soundsList: function () {
        return MeteorApp.Sounds.find().map(i => ({id: i._id, value: i.original.name}));
    },
    soundsList2: function () {
        return MeteorApp.Sounds2.find().map(i => ({id: i._id, value: i.name}));
    },
    soundPacks: function() {
        return MeteorApp.SoundPacks.find({}, { sort: { name: 1 } });
    },

    getSoundNameById: function(id) {
        if (id) {
            let sound = MeteorApp.Sounds2.findOne(id);
            if (sound) {
                return sound.name;
            }

            sound = MeteorApp.Sounds.findOne(id);
            if (sound) {
                return sound.original.name;
            }
            return '';
        }
        return '';
    },

    getSoundUlrById: function(id) {
        if (id) {
            let sound = MeteorApp.Sounds2.findOne(id);
            if (sound) {
                return sound.link();
            }
            
            sound = MeteorApp.Sounds.findOne(id);
            if (sound) {
                return sound.url();
            }
            return '';
        }
        return '';
    },

    soundSelected: function (e, suggestion) {
        $(e.target).closest('.soundpack__sound').find('input[name="soundId"]').val(suggestion.id);
        $(e.target).closest('.soundpack__form').submit();

        setTimeout(() => {
            const player = $(e.target).closest('.soundpack__sound').find('audio')[0];
            player.pause();
            player.load();
        }, 200);
    },

    sound2Selected: function (e, suggestion) {
        $(e.target).closest('.soundpack__sound').find('input[name="soundId"]').val(suggestion.id);
        $(e.target).closest('.soundpack__form').submit();

        setTimeout(() => {
            const player = $(e.target).closest('.soundpack__sound').find('audio')[0];
            player.pause();
            player.load();
        }, 200);
    }
});


Template.soundsEdit.events({
    "click .delete-sound": function (event) {
        if (confirm("Точно точно удалить?")) {
            MeteorApp.Sounds2.remove(event.currentTarget.getAttribute("imageID"));
        }
    },
    // 'change .sound-upload': function (event, template) {
    //     FS.Utility.eachFile(event, function (file) {
    //         MeteorApp.Sounds.insert(file, function (err, fileObj) {
    //         }.bind(this));
    //     }.bind(this));
    // },
    'change .sound-upload': function (event, template) {
        for (let file of event.currentTarget.files) {
            const upload = MeteorApp.Sounds2.insert({
                    file: file,
                    chunkSize: 'dynamic'
                }, false
            );
            upload.start();
        }
    },
    'click .soundpack__btn_add': function (e) {
        const name = $('.soundpack__name-input').val();
        if (!name) {
            alert('Insert name');
            return;
        }

        MeteorApp.SoundPacks.insert({
            name,
            sounds: DEFAULT_SOUND_PACK,
        });
        
    },
    "click .soundpack__input_sound": function(e) {
        let target = $(e.currentTarget);
        if(!target.hasClass('tt-input')) {
            Meteor.typeahead.inject(e.currentTarget);
            $(target).focus();
        }
    },
    'click .soundpack__btn_remove': function (e) {
        if (confirm("Точно точно удалить?")) {
            MeteorApp.SoundPacks.remove(this._id);
        }
    },

    'submit .soundpack__form': function(e) {
        e.preventDefault();
        let soundsElement = $(e.currentTarget).find('.soundpack__sound');
        const sounds = this.sounds;
        soundsElement.each(function() {
            let soundName = $(this).find('[name="soundName"]').val();
            let soundId = $(this).find('[name="soundId"]').val();

            sounds[soundName] = soundId;
        });

        MeteorApp.SoundPacks.update(this._id, { ...this, sounds});
        
        return false
    }
});
