const Store = require('electron-store');

class MainStore {
    constructor(){
        this.store = new Store();
        this.clipsDefault = [];
        this.playerCountDefault = 4;
        this.getChannelProp = {
            [property]: (channelNumber) => { return this.store.get(`${property}.${channelNumber}`)}
        }
    }
    get savedClips() { return this.store.get('clips', this.clipsDefault) };
    get playerCountToCreate() { return this.store.get('playerCount', this.playerCountDefault) };
    get playbackRateForPreview() { return this.store.get('playbackRate') };
    // get urlsOfChannel[channelNumber]() { return this.store.get(`src.${channelNumber}`) };
    // get titlesOfChannel() { return this.store.get('title') };
    // get scheduledIntervalOfChannel() {return this.store.get('interval')};
    // get saveDirectoryOfChannel() {return this.store.get('directory')};
    // get mountByResetOfChannel() {return this.store.get('mountByReset')};

    set savedClips(clips) { return this.store.set('clips', clips) };
    set playerCountToCreate(playerCount) { return this.store.set('playerCount', playerCount)};
    // set playbackRateForPreview() { return this.store.set('playbackRate') };
    // set urlsOfChannel() { return this.store.set('src') };
    // set titlesOfChannel() { return this.store.set('title') };
    // set scheduledIntervalOfChannel() {return this.store.set('interval')};
    // set saveDirectoryOfChannel() {return this.store.set('directory')};
    // set mountByResetOfChannel() {return this.store.get('mountByReset')};
}

const createStore = () => {
    return new MainStore();
}

export default createStore;