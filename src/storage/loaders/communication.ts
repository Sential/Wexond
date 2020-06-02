import { parentPort } from 'worker_threads';

import { IStorageMessage } from '~/interfaces';
import BookmarkService from '../services/bookmark';

export default () => {
  parentPort.on('message', (message: IStorageMessage) => {
    const type = message?.type;

    console.log(type);

    if (type === 'bookmarks-get-children') {
      const res = BookmarkService.get(['6', '2']);

      console.log(res);
    }
  });
};
