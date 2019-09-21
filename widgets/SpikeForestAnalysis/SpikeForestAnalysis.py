from mountaintools import client as mt


class SpikeForestAnalysis:
    def __init__(self):
        super().__init__()

    def javascript_state_changed(self, prev_state, state):
        path = state.get('path', None)
        download_from = state.get('download_from', [])
        mt.configDownloadFrom(download_from)

        if not path:
            self.set_python_state(dict(
                status='error',
                status_message='No path provided.'
            ))
            return

        self.set_python_state(dict(status='running', status_message='Loading: {}'.format(path)))
        
        obj = mt.loadObject(path=path)
        if not obj:
            self.set_python_state(dict(
                status='error',
                status_message='Unable to realize object: {}'.format(path)
            ))
            return
        
        obj['StudyAnalysisResults'] = None

        self.set_python_state(dict(
            status='finished',
            object=obj
        ))