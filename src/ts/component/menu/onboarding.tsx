import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Icon } from 'ts/component';
import { I, Docs, Onboarding, Util, analytics, keyboard } from 'ts/lib';
import { menuStore } from 'ts/store';

interface Props extends I.Menu {};

const $ = require('jquery');

class MenuOnboarding extends React.Component<Props, {}> {

	constructor (props: any) {
		super(props);

		this.onClose = this.onClose.bind(this)
	};

	render () {
		const { param } = this.props;
		const { data } = param;
		const { key, current } = data;
		const items = Docs.Help.Onboarding[key];
		const item = items[current];
		const l = items.length;
		const cnl = [ 'arrow', 'left', (current == 0 ? 'disabled' : '') ];
		const cnr = [ 'arrow', 'right', (current == l - 1 ? 'disabled' : '') ];

		return (
			<div className="wrap">
				<div className="name"  dangerouslySetInnerHTML={{ __html: item.name }} />
				<div className="descr" dangerouslySetInnerHTML={{ __html: item.description }} />

				<Icon className="close" onClick={this.onClose} />

				{l > 1 ? (
					<div className="bottom">
						<Icon className={cnl.join(' ')} onClick={(e: any) => { this.onArrow(e, -1); }} />
						<div className="number">{current + 1} of {l}</div>
						<Icon className={cnr.join(' ')} onClick={(e: any) => { this.onArrow(e, 1); }} />
					</div>
				) : ''}
			</div>
		);
	};

	componentDidMount () {
		this.rebind();
		Util.renderLink($(ReactDOM.findDOMNode(this)));
	};

	componentDidUpdate () {
		const { param, position } = this.props;
		const { data } = param;

		if (data.onShow) {
			data.onShow();
			position();
		};

		this.rebind();
		Util.renderLink($(ReactDOM.findDOMNode(this)));

		analytics.event('ScreenOnboarding');
	};

	onClose () {
		this.props.close();
	};

	rebind () {
		this.unbind();
		$(window).on('keydown.menu', (e: any) => { this.onKeyDown(e); });
	};
	
	unbind () {
		$(window).unbind('keydown.menu');
	};

	onKeyDown (e: any) {
		keyboard.shortcut('arrowleft', e, () => { this.onArrow(e, -1); });
		keyboard.shortcut('arrowright', e, () => { this.onArrow(e, 1); });
	};

	onArrow (e: any, dir: number) {
		const { data } = this.props.param;
		const { key, current, isPopup } = data;
		const items = Docs.Help.Onboarding[key];

		if (((dir < 0) && (current == 0)) || ((dir > 0) && (current == items.length - 1))) {
			return;
		};

		const next = current + dir;
		const item = items[next];

		if (!item) {
			return;
		};

		const param = Onboarding.getParam(item, isPopup);

		menuStore.open('onboarding', {
			...param,
			data: {
				...data,
				...param.data,
				current: next,
			},
		});
	};

};

export default MenuOnboarding;