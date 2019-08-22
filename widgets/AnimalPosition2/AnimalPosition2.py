from reactopya import Component
from mountaintools import client as mt
from ..pycommon.nwb_to_dict import nwb_to_dict
import numpy as np


class AnimalPosition2(Component):
    def __init__(self):
        super().__init__()

    def javascript_state_changed(self, prev_state, state):
        self.set_python_state(dict(status='running', status_message='Running'))
        mt.configDownloadFrom(state.get('download_from', []))
        nwb_path = state.get('nwb_path', None)
        downsample_factor = state.get('downsample_factor', 1)
        if nwb_path:
            self.set_python_state(dict(status_message='Realizing nwb object: {}'.format(nwb_path)))
            obj = nwb_to_dict(nwb_path, use_cache=True)
            if not obj:
                self.set_python_state(dict(
                    status='error',
                    status_message='Unable to realize object: {}'.format(nwb_path)
                ))
                return
            try:
                positions_path = obj['processing']['Behavior']['Position']['Position']['_datasets']['data']['_data']
            except:
                self.set_python_state(dict(
                    status='error',
                    status_message='Problem extracting behavior positions in file: {}'.format(nwb_path)
                ))
                return
            positions = np.load(mt.realizeFile(path=positions_path))
            positions = positions[::downsample_factor, :]

            self.set_python_state(dict(status_message='Finished loading positions'))
            state['positions'] = positions
            state['status'] = 'finished'
            self.set_python_state(state)
        else:
            self.set_python_state(dict(
                status='error',
                status_message='Missing in state: nwb_path'
            ))
