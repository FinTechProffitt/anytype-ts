import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Icon, Title, Label } from 'Component';
import { I, translate, analytics, Renderer } from 'Lib';
import { commonStore } from 'Store';
import { observer } from 'mobx-react';

import Head from './head';

interface Props extends I.Popup, RouteComponentProps<any> {
	prevPage: string;
	onPage: (id: string) => void;
};

const PopupSettingsPageAppearance = observer(class PopupSettingsPageAppearance extends React.Component<Props, object> {

	render () {
		const { onPage } = this.props;
		const { theme } = commonStore;
		const themes: any[] = [
			{ id: '', class: 'light', name: 'Light' },
			{ id: 'dark', class: 'dark', name: 'Dark' },
			{ id: 'system', class: 'system', name: 'System' },
		];

		const inner = <div className="inner" />;

		return (
			<div>
				<Head {...this.props} returnTo="index" name={translate('popupSettingsTitle')} />
				<Title text={translate('popupSettingsAppearanceTitle')} />

				<div className="rows">
					<div className="row" onClick={() => { onPage('wallpaper'); }}>
						<Icon className="wallpaper" />
						<Label text={translate('popupSettingsWallpaperTitle')} />
						<Icon className="arrow" />
					</div>

					<Label className="sectionName center" text="Mode" />

					<div className="buttons">
						{themes.map((item: any, i: number) => (
							<div 
								key={i} 
								className={[ 'btn', (theme == item.id ? 'active' : '') ].join(' ')} 
								onClick={() => { this.onTheme(item.id); }}
							>
								<Icon className={item.class} inner={inner} />
								<Label text={item.name} />
							</div>
						))}
					</div>
				</div>
			</div>
		);
	};

	onTheme (id: string) {
		commonStore.themeSet(id);
		Renderer.send('setTheme', id);
		analytics.event('ThemeSet', { id });
	};

});

export default PopupSettingsPageAppearance;