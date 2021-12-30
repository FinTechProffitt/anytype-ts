import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { InputWithFile, Icon, Loader, Error, Drag } from 'ts/component';
import { I, translate, focus, Util, keyboard, Action } from 'ts/lib';
import { commonStore } from 'ts/store';
import { observer } from 'mobx-react';

interface Props extends I.BlockComponent {}

const $ = require('jquery');
const Constant = require('json/constant.json');

const BlockAudio = observer(class BlockAudio extends React.Component<Props, {}> {

	_isMounted: boolean = false;
	volume: number = 0;
	playOnSeek: boolean = false;
	refTime: any = null;
	refVolume: any = null;

	constructor (props: any) {
		super(props);
		
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onChangeUrl = this.onChangeUrl.bind(this);
		this.onChangeFile = this.onChangeFile.bind(this);
		this.onPlay = this.onPlay.bind(this);
		this.onMute = this.onMute.bind(this);
	};

	render () {
		const { block, readonly } = this.props;
		const { id, fields, content } = block;
		const { state, hash, name, type, mime } = content;
		
		let element = null;
		
		switch (state) {
			default:
			case I.FileState.Error:
			case I.FileState.Empty:
				element = (
					<React.Fragment>
						{state == I.FileState.Error ? <Error text={translate('blockFileError')} /> : ''}
						<InputWithFile 
							block={block} 
							icon="audio" 
							textFile="Upload an audio" 
							accept={Constant.extension.audio} 
							onChangeUrl={this.onChangeUrl} 
							onChangeFile={this.onChangeFile} 
							readonly={readonly} 
						/>
					</React.Fragment>
				);
				break;
				
			case I.FileState.Uploading:
				element = (
					<Loader />
				);
				break;
				
			case I.FileState.Done:
				element = (
					<div className="wrap resizable audio">
						<audio id="audio" preload="auto" src={commonStore.fileUrl(hash)} />
						<div className="audioControls">
							<Icon className="play" onClick={this.onPlay} />
							<div className="name">
								<span>{name}</span>
							</div>

							<Drag 
								id="time" 
								ref={(ref: any) => { this.refTime = ref; }} 
								value={0} 
								onStart={(e: any, v: number) => { this.onTime(v); }} 
								onMove={(e: any, v: number) => { this.onTime(v); }} 
								onEnd={(e: any, v: number) => { this.onTimeEnd(v); }}
							/>

							<div className="time">
								<span id="timeCurrent" className="current">0:00</span>&nbsp;/&nbsp;
								<span id="timeTotal" className="total">0:00</span>
							</div>

							<Icon className="volume" onClick={this.onMute} />
							<Drag 
								id="volume" 
								ref={(ref: any) => { this.refVolume = ref; }} 
								value={1} 
								onMove={(e: any, v: number) => { this.onVolume(v); }} 
							/>
						</div>
					</div>
				);
				break;
		};
		
		return (
			<div className={[ 'focusable', 'c' + id ].join(' ')} tabIndex={0} onKeyDown={this.onKeyDown} onKeyUp={this.onKeyUp} onFocus={this.onFocus}>
				{element}
			</div>
		);
	};
	
	componentDidMount () {
		this._isMounted = true;
		this.resize();
		this.rebind();
	};
	
	componentDidUpdate () {
		this.resize();
		this.rebind();
	};
	
	componentWillUnmount () {
		this._isMounted = false;
		this.unbind();
	};

	rebind () {
		if (!this._isMounted) {
			return;
		};

		this.unbind();

		const node = $(ReactDOM.findDOMNode(this));
		const icon = node.find('.icon.play');
		const el = node.find('#audio');

		node.on('resize', (e: any, oe: any) => { this.resize(); });

		if (el.length) {
			el.on('canplay timeupdate', () => { this.onTimeUpdate(); });
			el.on('play', () => { 
				node.addClass('isPlaying');
				icon.addClass('active'); 
			});
			el.on('ended pause', () => { 
				node.removeClass('isPlaying');
				icon.removeClass('active'); 
			});
		};
	};
	
	unbind () {
		if (!this._isMounted) {
			return;
		};

		const node = $(ReactDOM.findDOMNode(this));
		const el = node.find('#audio');

		if (el.length) {
			el.unbind('canplay timeupdate play ended pause');
		};
	};

	resize () {
		if (!this._isMounted) {
			return;
		};

		if (this.refTime) {
			this.refTime.resize();
		};

		if (this.refVolume) {
			this.refVolume.resize();
		};
	};

	onKeyDown (e: any) {
		const { onKeyDown } = this.props;

		let ret = false;

		keyboard.shortcut('space', e, (pressed: string) => {
			e.preventDefault();
			e.stopPropagation();

			this.onPlay();
			ret = true;
		});

		if (ret) {
			return;
		};
		
		if (onKeyDown) {
			onKeyDown(e, '', [], { from: 0, to: 0 });
		};
	};
	
	onKeyUp (e: any) {
		const { onKeyUp } = this.props;

		if (onKeyUp) {
			onKeyUp(e, '', [], { from: 0, to: 0 });
		};
	};

	onFocus () {
		const { block } = this.props;
		focus.set(block.id, { from: 0, to: 0 });
	};

	onChangeUrl (e: any, url: string) {
		const { rootId, block } = this.props;
		Action.upload(I.FileType.Audio, rootId, block.id, url, '');
	};
	
	onChangeFile (e: any, path: string) {
		const { rootId, block } = this.props;
		Action.upload(I.FileType.Audio, rootId, block.id, '', path);
	};

	onPlay () {
		if (!this._isMounted) {
			return;
		};

		const node = $(ReactDOM.findDOMNode(this));
		const el = node.find('#audio').get(0);
		const paused = el.paused;

		$('audio, video').each((i: number, item: any) => { item.pause(); });
		paused ? this.play() : this.pause();
	};

	play () {
		if (!this._isMounted) {
			return;
		};

		const node = $(ReactDOM.findDOMNode(this));
		node.find('#audio').get(0).play();
	};

	pause () {
		if (!this._isMounted) {
			return;
		};

		const node = $(ReactDOM.findDOMNode(this));
		node.find('#audio').get(0).pause();
	};

	onMute () {
		if (!this._isMounted) {
			return;
		};

		const node = $(ReactDOM.findDOMNode(this));
		const el = node.find('#audio').get(0);

		el.volume = el.volume ? 0 : (this.volume || 1);

		this.refVolume.setValue(el.volume);
		this.setVolumeIcon();
	};

	onVolume (v: number) {
		if (!this._isMounted) {
			return;
		};

		const node = $(ReactDOM.findDOMNode(this));
		const el = node.find('#audio').get(0);

		this.volume = el.volume = v;
		this.setVolumeIcon();
	};

	setVolumeIcon () {
		if (!this._isMounted) {
			return;
		};

		const node = $(ReactDOM.findDOMNode(this));
		const el = node.find('#audio').get(0);
		const icon = node.find('.icon.volume');

		el.volume ? icon.removeClass('active') : icon.addClass('active');
	};

	onTime (v: number) {
		if (!this._isMounted) {
			return;
		};

		const node = $(ReactDOM.findDOMNode(this));
		const el = node.find('#audio').get(0);
		const paused = el.paused;

		if (!paused) {
			this.pause();
			this.playOnSeek = true;
		};

		el.currentTime = Number(v * el.duration) || 0;
	};

	onTimeEnd (v: number) {
		if (this.playOnSeek) {
			this.play();
		};
	};

	onTimeUpdate () {
		if (!this._isMounted) {
			return;
		};

		const node = $(ReactDOM.findDOMNode(this));
		const el = node.find('#audio').get(0);
		if (!el) {
			return;
		};

		const current = node.find('.time .current');
		const total = node.find('.time .total');

		let t = this.getTime(el.currentTime);
		current.text(`${Util.sprintf('%02d', t.m)}:${Util.sprintf('%02d', t.s)}`);

		t = this.getTime(el.duration);
		total.text(`${Util.sprintf('%02d', t.m)}:${Util.sprintf('%02d', t.s)}`);

		this.refTime.setValue(el.currentTime / el.duration);
	};

	getTime (t: number): { m: number, s: number } {
		let m = Math.floor(t / 60);

		t -= m * 60;
		let s = Math.floor(t);

		return { m, s };
	};
	
});

export default BlockAudio;