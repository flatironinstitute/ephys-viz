from mountaintools import client as mt
from ..pycommon.nwb_to_dict import nwb_to_dict
import numpy as np
from scipy import interpolate
from copy import deepcopy
import tempfile
import os
from .examples import examples


class PlaceField:
    examples = examples
    
    def __init__(self):
        super().__init__()

    def javascript_state_changed(self, prev_state, state):
        self.set_status('running')
        self.set_status_message('Running')

        mt.configDownloadFrom(state.get('download_from', []))
        nwb_query = state.get('nwb_query', None)
        downsample_factor = state.get('downsample_factor', 1)

        if nwb_query:
            self.set_status_message('Loading nwb object')
            obj = _load_nwb_object(nwb_query)
            if not obj:
                self.set_error('Unable to load nwb object')
                return

            self.set_status_message(
                'Loading positions and timestamps from')
            try:
                positions_path = obj['processing']['Behavior']['Position']['Position']['_datasets']['data']['_data']
                timestamps_path = obj['processing']['Behavior']['Position']['Position']['_datasets']['timestamps']['_data']
            except:
                self.set_error('Problem extracting behavior positions or timestamps')
                return
            positions = np.load(mt.realizeFile(path=positions_path))
            positions = positions[::downsample_factor, :]
            timestamps = np.load(mt.realizeFile(path=timestamps_path))
            timestamps = timestamps[::downsample_factor]

            self.set_status_message('Loading spike times')
            try:
                spike_times_path = obj['units']['_datasets']['spike_times']['_data']
                spike_times_index = obj['units']['_datasets']['spike_times_index']['_data']
                spike_times_index_id = obj['units']['_datasets']['id']['_data']
                if 'cluster_name' in obj['units']['_datasets']:
                    cluster_names = obj['units']['_datasets']['cluster_name']['_data']
                else:
                    cluster_names = []
            except:
                self.set_error('Problem extracting spike times')
                return
            spike_times = np.load(mt.realizeFile(path=spike_times_path))

            spike_time_indices = _find_closest(timestamps, spike_times)
            spike_labels = np.zeros(spike_time_indices.shape)
            aa = 0
            for i, val in enumerate(spike_times_index):
                spike_labels[aa:val] = spike_times_index_id[i]
                aa = val

            all_unit_ids = sorted(list(set(spike_labels)))

            state['positions'] = positions
            state['status'] = 'finished'
            state['spike_time_indices'] = spike_time_indices
            state['spike_labels'] = spike_labels
            state['all_unit_ids'] = all_unit_ids
            state['cluster_names'] = cluster_names
            self.set_python_state(state)
            self.set_status('finished')
        else:
            self.set_error('Missing in state: nwb_query')

    def set_status(self, status):
        self.set_python_state(dict(
            status=status
        ))

    def set_status_message(self, msg):
        self.set_python_state(dict(
            status_message=msg
        ))

    def set_error(self, errmsg):
        self.set_python_state(dict(
            status='error',
            status_message=errmsg
        ))

def _load_nwb_object(nwb_query):
    if type(nwb_query) == str:
        return nwb_to_dict(nwb_query, use_cache=True)
    elif type(nwb_query) == dict:
        if 'path' in nwb_query:
            obj = _load_nwb_object(nwb_query['path'])
            obj = _filter_nwb_object(obj, nwb_query)
            return obj
        else:
            raise Exception('Invalid nwb query. Field not found: path')
    else:
        raise Exception('Invalid type for nwb query: {}'.format(type(nwb_query)))

def _filter_nwb_object(obj, nwb_query):
    if 'epochs' in nwb_query:
        epochs = _load_epochs(obj)
        time_ranges = []
        for epoch in epochs:
            if epoch['id'] in nwb_query['epochs']:
                time_ranges.append([epoch['start_time'], epoch['stop_time']])
        obj = _extract_time_ranges(obj, time_ranges)
    return obj

def _extract_time_ranges(obj, time_ranges):
    positions_path = obj['processing']['Behavior']['Position']['Position']['_datasets']['data']['_data']
    timestamps_path = obj['processing']['Behavior']['Position']['Position']['_datasets']['timestamps']['_data']
    spike_times_path = obj['units']['_datasets']['spike_times']['_data']
    spike_times_index = obj['units']['_datasets']['spike_times_index']['_data']
    positions = np.load(mt.realizeFile(path=positions_path))
    timestamps = np.load(mt.realizeFile(path=timestamps_path))
    spike_times = np.load(mt.realizeFile(path=spike_times_path))
    selector = np.full(timestamps.shape, False)
    for time_range in time_ranges:
        a = (time_range[0] <= timestamps) & (timestamps < time_range[1])
        selector = selector | a
    if np.all(selector):
        return obj
    timestamps = timestamps[selector]
    positions = positions[selector, :]

    selector2 = np.full(spike_times.shape, False)
    for time_range in time_ranges:
        a = (time_range[0] <= spike_times) & (spike_times < time_range[1])
        selector2 = selector2 | a
    for j in range(len(spike_times_index)):
        spike_times_index[j] = np.count_nonzero(selector2[:spike_times_index[j]])
    spike_times = spike_times[selector2]

    obj = deepcopy(obj)
    obj['processing']['Behavior']['Position']['Position']['_datasets']['data']['_data'] = _np_snapshot(positions)
    obj['processing']['Behavior']['Position']['Position']['_datasets']['timestamps']['_data'] = _np_snapshot(timestamps)
    obj['units']['_datasets']['spike_times']['_data'] = _np_snapshot(spike_times)
    obj['units']['_datasets']['spike_times_index']['_data'] = spike_times_index
    return obj

def _np_snapshot(X):
    _, fname = tempfile.mkstemp(suffix='.npy')
    try:
        np.save(fname, X)
        ret = mt.createSnapshot(fname)
    except:
        raise
    finally:
        if os.path.exists(fname):
            os.unlink(fname)
    return ret


def _load_epochs(obj):
    if 'epochs' not in obj.get('intervals'):
        return []

    ids = obj['intervals']['epochs']['_datasets']['id']['_data']
    start_times = obj['intervals']['epochs']['_datasets']['start_time']['_data']
    stop_times = obj['intervals']['epochs']['_datasets']['stop_time']['_data']
    epochs = [dict(id=id, label=id, start_time=start_times[i],
                   stop_time=stop_times[i]) for i, id in enumerate(ids)]
    return epochs


def _find_closest(timestamps, spike_times):
    f = interpolate.interp1d(timestamps, np.arange(len(timestamps)), 'nearest', bounds_error=False)
    return f(spike_times)
