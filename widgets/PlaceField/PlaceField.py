from reactopya import Component
from mountaintools import client as mt
from .h5_to_dict import h5_to_dict
import numpy as np
from scipy import interpolate


class PlaceField(Component):
    def __init__(self):
        super().__init__()

    def javascript_state_changed(self, prev_state, state):
        self.set_python_state(dict(status='running', status_message='Running'))
        mt.configDownloadFrom(state.get('download_from', []))
        nwb_path = state.get('nwb_path', None)
        downsample_factor = state.get('downsample_factor', 1)
        unit_ids = state.get('unit_ids', None)
        if nwb_path:
            if nwb_path.endswith('.nwb'):
                self.set_python_state(dict(status_message='Realizing object from nwb file: {}'.format(nwb_path)))
                obj = h5_to_dict(nwb_path, use_cache=True)
            else:
                self.set_python_state(dict(status_message='Realizing object: {}'.format(nwb_path)))
                obj = mt.loadObject(path=nwb_path)
            if not obj:
                self.set_python_state(dict(
                    status='error',
                    status_message='Unable to realize object: {}'.format(nwb_path)
                ))
                return

            self.set_python_state(dict(status_message='Loading positions and timestamps from: {}'.format(nwb_path)))
            try:
                positions_path = obj['processing']['Behavior']['Position']['Position']['_datasets']['data']['_data']
                timestamps_path = obj['processing']['Behavior']['Position']['Position']['_datasets']['timestamps']['_data']
            except:
                self.set_python_state(dict(
                    status='error',
                    status_message='Problem extracting behavior positions or timestamps in file: {}'.format(nwb_path)
                ))
                return
            positions = np.load(mt.realizeFile(path=positions_path))
            positions = positions[::downsample_factor, :]
            timestamps = np.load(mt.realizeFile(path=timestamps_path))
            timestamps = timestamps[::downsample_factor]

            self.set_python_state(dict(status_message='Loading spike times from: {}'.format(nwb_path)))
            try:
                spike_times_path = obj['units']['_datasets']['spike_times']['_data']
                spike_times_index = obj['units']['_datasets']['spike_times_index']['_data']
                spike_times_index_id = obj['units']['_datasets']['id']['_data']
            except:
                self.set_python_state(dict(
                    status='error',
                    status_message='Problem extracting spike times in file: {}'.format(nwb_path)
                ))
                return
            spike_times = np.load(mt.realizeFile(path=spike_times_path))

            spike_time_indices = _find_closest(timestamps, spike_times)
            spike_labels = np.zeros(spike_time_indices.shape)
            aa = 0
            for i, val in enumerate(spike_times_index):
                spike_labels[aa:val] = spike_times_index_id[i]
                aa = val

            all_unit_ids = sorted(list(set(spike_labels)))

            self.set_python_state(dict(status_message='Finished loading data'))
            state['positions'] = positions
            state['status'] = 'finished'
            state['spike_time_indices'] = spike_time_indices
            state['spike_labels'] = spike_labels
            state['all_unit_ids'] = all_unit_ids
            self.set_python_state(state)
        else:
            self.set_python_state(dict(
                status='error',
                status_message='Missing in state: nwb_path'
            ))

def _find_closest(timestamps, spike_times):
    f = interpolate.interp1d(timestamps, np.arange(len(timestamps)), 'nearest')
    return f(spike_times)