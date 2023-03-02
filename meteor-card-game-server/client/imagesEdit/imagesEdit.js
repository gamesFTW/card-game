Template.imagesEdit.helpers({
    images: function() {
        return MeteorApp.Images.find({}, { sort: { 'original.name': 1 } });
    },
    images2: function() {
        return MeteorApp.Images2.find({});
    },
});


Template.imagesEdit.events({
    "click .delete-image": function (event) {
        if (confirm("Точно точно удалить?")) {
            MeteorApp.Images2.remove(event.currentTarget.getAttribute("imageID"));
        }
    },
    // 'change .image-upload': function (event, template) {
    //     FS.Utility.eachFile(event, function (file) {
    //         MeteorApp.Images.insert(file, function (err, fileObj) {

    //         }.bind(this));
    //     }.bind(this));
    // },
    'change .image-upload': function (event, template) {
        for (let file of event.currentTarget.files) {
            const upload = MeteorApp.Images2.insert({
                file: file,
                chunkSize: 'dynamic'
            }, false
            );
            upload.start();
        }
    }
});
