import * as React from 'react';

interface Props {
	id?: string;
	num?: number;
	image?: string;
	className?: string;
	type?: number;
	x?: number;
	y?: number;
	scale?: number;
	onClick?(e: any): void;
	onMouseDown?(e: any): void;
};

class Cover extends React.Component<Props, {}> {

	private static defaultProps = {
		type: 0,
		x: 0.5,
		y: 0.5,
		scale: 1,
	};

	render () {
		const { id, num, image, type, x, y, scale, className, onClick, onMouseDown } = this.props;
		
		let cn = [ 'cover', 'type' + type ];
		let style: any = {};
		
		if (className) {
			cn.push(className);
		};
		if (num) {
			cn.push('c' + num);
		} else
		if (image) {
			style.backgroundImage = `url("${image}")`;
			style.backgroundSize = '';
		};
		
		return (
			<div id={id} className={cn.join(' ')} onClick={onClick} onMouseDown={onMouseDown} style={style} />
		);
	};
	
};

export default Cover;