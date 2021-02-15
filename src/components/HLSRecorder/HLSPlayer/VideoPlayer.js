import React, { Component } from 'react';
import Box from '@material-ui/core/Box'
import PropTypes from 'prop-types';
import Controls from './Controls.json';
import videojs from 'video.js';
import overlay from 'videojs-overlay';

class VideoPlayer extends Component {
    playerId = `video-player-${Date.now() + (Math.random()*10000).toFixed(0)}`
    player = {};
    componentDidMount() {
        console.log('##### player mounted!', this.props)
        this.init_player(this.props);
        this.init_player_events(this.props);
        console.log('^^^^^', this.player.controlBar)
    }

    componentWillReceiveProps(nextProps){
        console.log('### player componentWillReceiveProps:', nextProps);
        this.set_controls_visibility(this.player, nextProps.hideControls);
        if(this.props.src !== nextProps.src){
            // if (this.player) this.player.dispose();
            this.init_player(nextProps);
        }
    }

    componentWillUnmount() {
        console.log('##### player dismounted');
        if (this.player) {
            console.log('##### dispose and nullify player')
            this.player.dispose();
            this.player = {};
        }
    }

    init_player(props) {
        try {
            console.log('### init_player');
            const playerOptions = this.generate_player_options(props);
            const {enableOverlay=false, overlayContent="This is HLS Player!"} = props;
            console.log('#####', playerOptions)
            this.player = videojs(document.querySelector(`#${this.playerId}`), playerOptions);
            if(enableOverlay){
                this.player.overlay(
                    {
                        overlays:[{
                            content: overlayContent,
                            start:'playing',
                            end:'dispose'
                        }]
                    }
                )
            }
            this.player.src(props.src)
            this.player.poster(props.poster)
            this.set_controls_visibility(this.player, props.hideControls);
        } catch(error) {
            console.error(error)
        }
  
    }

    generate_player_options(props){
        const playerOptions = {};
        playerOptions.inactivityTimeout = props.inactivityTimeout;
        playerOptions.controls = props.controls;
        playerOptions.autoplay = props.autoplay;
        playerOptions.preload = props.preload;
        playerOptions.width = props.width;
        playerOptions.height = props.height;
        playerOptions.bigPlayButton = props.bigPlayButton;
        playerOptions.liveui = props.liveui;
        playerOptions.controlBar = {'pictureInPictureToggle': false};
        playerOptions.loadingSpinner = props.loadingSpinner;
        playerOptions.errorDisplay = props.errorDisplay;

        const hidePlaybackRates = props.hidePlaybackRates || props.hideControls.includes('playbackrates');
        if (!hidePlaybackRates) playerOptions.playbackRates = props.playbackRates;
        return playerOptions;
    }

    set_controls_visibility(player, hidden_controls){
        Object.keys(Controls).map(x => { player.controlBar[Controls[x]].show() })
        hidden_controls.map(x => { player.controlBar[Controls[x]].hide() });
    }

    init_player_events(props) {
        let currentTime = 0;
        let previousTime = 0;
        let position = 0;

        this.player.ready(() => {
            props.onReady(this.player);
            window.player = this.player;
        });
        this.player.on('play', () => {
            props.onPlay(this.player.currentTime());
        });
        this.player.on('pause', () => {
            props.onPause(this.player.currentTime());
        });
        this.player.on('timeupdate', (e) => {
            props.onTimeUpdate(this.player.currentTime());
        });
        this.player.on('canplay', () => {
            props.onCanPlay()
        })
        this.player.on('seeking', () => {
            this.player.off('timeupdate', () => { });
            this.player.one('seeked', () => { });
            props.onSeeking(this.player.currentTime());
        });

        this.player.on('seeked', () => {
            let completeTime = Math.floor(this.player.currentTime());
            props.onSeeked(position, completeTime);
        });
        this.player.on('ended', () => {
            props.onEnd();
        });
        this.player.on('error', error => {
            console.log(player.error());
            props.onError(player.error());
        });
        this.player.on('stalled', () => {
            props.onOtherEvent('stalled')
        })
        this.player.on('suspend', () => {
            props.onOtherEvent('suspend')
        })
        this.player.on('waiting', () => {
            props.onOtherEvent('waiting')
        })
        this.player.on('waiting', () => {
            props.onOtherEvent('abort')
        })
        this.player.on('loadstart', () => {
            props.onOtherEvent('loadstart')
        })
        this.player.on('playing', () => {
            props.onOtherEvent('playing')
        })
        this.player.on('emptied', () => {
            props.onOtherEvent('emptied')
        })
        this.player.on('ratechange', () => {
            props.onOtherEvent('ratechange');
        })
        this.player.on('durationchange', () => {
            // console.log('#####', this.player.duration())
            props.onOtherEvent('durationchange', this.player.duration())
        })

    }

    render() {
        return (
            <div>
                <video id={this.playerId} className={`video-js ${this.props.bigPlayButtonCentered? 'vjs-big-play-centered' : ''} ${this.props.className}`}></video>
            </div>
        )
    }
}

VideoPlayer.propTypes = {
    src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    poster: PropTypes.string,
    controls: PropTypes.bool,
    autoplay: PropTypes.bool,
    preload: PropTypes.oneOf(['auto', 'none', 'metadata']),
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hideControls: PropTypes.arrayOf(PropTypes.string),
    bigPlayButton: PropTypes.bool,
    bigPlayButtonCentered: PropTypes.bool,
    onReady: PropTypes.func,
    onPlay: PropTypes.func,
    onPause: PropTypes.func,
    onTimeUpdate: PropTypes.func,
    onSeeking: PropTypes.func,
    onSeeked: PropTypes.func,
    onEnd: PropTypes.func,
    onError: PropTypes.func,
    onOtherEvent: PropTypes.func,
    playbackRates: PropTypes.arrayOf(PropTypes.number),
    hidePlaybackRates: PropTypes.bool,
    className: PropTypes.string
}

VideoPlayer.defaultProps = {
    src: "",
    poster: "",
    controls: true,
    autoplay: false,
    preload: 'auto',
    playbackRates: [1, 1.5, 2, 4, 8],
    hidePlaybackRates: false,
    className: "",
    hideControls: [],
    bigPlayButton: true,
    bigPlayButtonCentered: true,
    onReady: () => { },
    onPlay: () => { },
    onPause: () => { },
    onTimeUpdate: () => { },
    onSeeking: () => { },
    onSeeked: () => { },
    onEnd: () => { }
}


export default React.memo(VideoPlayer);