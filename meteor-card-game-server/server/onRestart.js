const clearQueueOnStart = () => {
    console.log('Clear queue on start');
    MeteorApp.QueueOfPlayers.remove({});
};

clearQueueOnStart();