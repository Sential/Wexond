import { observer } from 'mobx-react';
import React from 'react';
import transparency from '../../../../shared/defaults/opacity';
import Store from '../../store';
import BookmarkItem from '../../../../shared/models/bookmark-item';
import AppStore from '../../../../app/store';
import { removeItem } from '../../utils';
import { Root, RemoveIcon, Icon } from '../../../../shared/components/PageItem';
import { Title, Input } from './styles';

const pageIcon = require('../../../../shared/icons/page.svg');
const folderIcon = require('../../../../shared/icons/folder.svg');

export interface IProps {
  data: BookmarkItem;
}

export interface IState {
  hovered: boolean;
  inputVisible: boolean;
}

@observer
export default class Item extends React.Component<IProps, IState> {
  public state: IState = {
    hovered: false,
    inputVisible: false,
  };

  private cmdPressed = false;

  private input: HTMLInputElement;

  public componentDidMount() {
    window.addEventListener('keydown', e => {
      this.cmdPressed = e.key === 'Meta'; // Command on macOS
    });

    window.addEventListener('keyup', e => {
      if (e.key === 'Meta') {
        this.cmdPressed = false;
      }
    });
  }

  public onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { data } = this.props;

    if (this.cmdPressed || e.ctrlKey) {
      if (Store.selectedItems.indexOf(data.id) === -1) {
        Store.selectedItems.push(data.id);
      } else {
        Store.selectedItems.splice(Store.selectedItems.indexOf(data.id), 1);
      }
    } else if (data.type === 'folder') {
      Store.goTo(data.id);
    } else {
      AppStore.getCurrentWorkspace().addTab(data.url);
      AppStore.menu.hide();
    }
  };

  public onMouseEnter = () => this.setState({ hovered: true });

  public onMouseLeave = () => this.setState({ hovered: false });

  public onRemoveClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.stopPropagation();

    const { data } = this.props;
    const { id, type } = data;

    removeItem(id, type);
  };

  public onTitleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { data } = this.props;

    if (data.type === 'folder') {
      e.preventDefault();
      e.stopPropagation();

      this.setState({ inputVisible: true });
      this.input.focus();

      window.addEventListener('mousedown', this.onWindowMouseDown);
    }
  };

  public onInputMouseEvent = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  public onWindowMouseDown = () => {
    this.setState({ inputVisible: false });
    window.removeEventListener('mousedown', this.onWindowMouseDown);
  };

  public render() {
    const { data } = this.props;
    const { hovered, inputVisible } = this.state;

    const isFolder = data.type === 'folder';
    let opacity = 1;
    let favicon = AppStore.favicons[data.favicon];

    if (favicon == null || favicon.trim() === '') {
      favicon = isFolder ? folderIcon : pageIcon;
      opacity = transparency.light.inactiveIcon;
    }

    if (hovered) opacity = 0;

    return (
      <Root
        onFocus={() => null}
        onMouseOver={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onClick={this.onClick}
        selected={Store.selectedItems.indexOf(data.id) !== -1}
      >
        <RemoveIcon onClick={this.onRemoveClick} visible={hovered} />
        <Icon style={{ opacity }} icon={favicon} />
        <Title isFolder={isFolder} onClick={this.onTitleClick}>
          {data.title}
        </Title>
        {isFolder && (
          <Input
            innerRef={r => (this.input = r)}
            visible={inputVisible}
            onClick={this.onInputMouseEvent}
            onMouseDown={this.onInputMouseEvent}
            placeholder="Name"
          />
        )}
      </Root>
    );
  }
}
