import base64
from mountaintools import client as mt


class Video:
    def __init__(self):
        super().__init__()

    def javascript_state_changed(self, prev_state, state):
        self._set_status('running', 'Running')

        path = state.get('path', None)
        download_from = state.get('download_from', [])
        mt.configDownloadFrom(download_from)

        if not path:
            self._set_status('finished')
            return

        path = mt.realizeFile(path)
        if not path:
            self._set_error('Unable to realize file.')
            return

        with open(path, 'rb') as f:
            video_data = f.read()
        video_data_b64 = base64.b64encode(video_data).decode()
        self.set_python_state(dict(
            video_data_b64=video_data_b64,
            status='finished',
            status_message=''
        ))

    def _set_error(self, error_message):
        self._set_status('error', error_message)
    
    def _set_status(self, status, status_message=''):
        self.set_python_state(dict(status=status, status_message=status_message))
