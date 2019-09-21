import numpy as np
from mountaintools import client as mt
import mlprocessors as mlpr
import json
import simplejson

def compute_autocorrelogram(times, *, max_dt_tp, bin_size_tp, max_samples=None):
    num_bins_left = int(max_dt_tp / bin_size_tp)  # number of bins to the left of the origin
    L = len(times)  # number of events
    times2 = np.sort(times)  # the sorted times
    step = 1  # This is the index step between an event and the next one to compare
    candidate_inds = np.arange(L)  # These are the events we are going to consider
    if max_samples is not None:
        if len(candidate_inds) > max_samples:
            candidate_inds = np.random.choice(candidate_inds, size=max_samples, replace=False)
    vals_list = []  # A list of all offsets we have accumulated
    while True:
        candidate_inds = candidate_inds[
            candidate_inds + step < L]  # we only consider events that are within workable range
        candidate_inds = candidate_inds[times2[candidate_inds + step] - times2[
            candidate_inds] <= max_dt_tp]  # we only consider event-pairs that are within max_dt_tp apart
        if len(candidate_inds) > 0:  # if we have some events to consider
            vals = times2[candidate_inds + step] - times2[candidate_inds]
            vals_list.append(vals)  # add to the autocorrelogram
            vals_list.append(-vals)  # keep it symmetric
        else:
            break  # no more to consider
        step += 1
    if len(vals_list) > 0:  # concatenate all the values
        all_vals = np.concatenate(vals_list)
    else:
        all_vals = np.array([])
    aa = np.arange(-num_bins_left, num_bins_left + 1) * bin_size_tp
    all_vals = np.sign(all_vals) * (np.abs(
        all_vals) - bin_size_tp * 0.00001)  # a trick to make the histogram symmetric due to differences in rounding for positive and negative, i suppose
    bin_counts, bin_edges = np.histogram(all_vals, bins=aa)
    return (bin_counts, bin_edges)

def listify_ndarray(x):
    if np.issubdtype(x.dtype, np.integer):
        return [int(val) for val in x]
    else:
        return [float(val) for val in x]

def serialize_np(x):
    if isinstance(x, np.ndarray):
        return listify_ndarray(x)
    elif isinstance(x, np.integer):
        return int(x)
    elif isinstance(x, np.floating):
        return float(x)
    elif type(x) == dict:
        ret = dict()
        for key, val in x.items():
            ret[key] = serialize_np(val)
        return ret
    elif type(x) == list:
        ret = []
        for i, val in enumerate(x):
            ret.append(serialize_np(val))
        return ret
    else:
        return x

class ComputeAutocorrelograms(mlpr.Processor):
    NAME = 'ComputeAutocorrelograms'
    VERSION = '0.1.5'

    # Inputs
    firings_path = mlpr.Input()

    # Parameters
    samplerate = mlpr.FloatParameter()
    max_samples = mlpr.IntegerParameter(optional=True, default=100000)
    bin_size_msec = mlpr.FloatParameter(optional=True, default=2)
    max_dt_msec = mlpr.FloatParameter(optional=True, default=50)

    # Outputs
    json_out = mlpr.Output()

    def run(self):
        from spikeforest import SFMdaRecordingExtractor, SFMdaSortingExtractor
        
        sorting = SFMdaSortingExtractor(firings_file=self.firings_path)
        samplerate = self.samplerate
        max_samples = self.max_samples
        max_dt_msec = self.max_dt_msec
        bin_size_msec = self.bin_size_msec

        max_dt_tp = max_dt_msec * samplerate / 1000
        bin_size_tp = bin_size_msec * samplerate / 1000

        autocorrelograms = []
        for unit_id in sorting.get_unit_ids():
            print('Unit::g {}'.format(unit_id))
            (bin_counts, bin_edges) = compute_autocorrelogram(sorting.get_unit_spike_train(unit_id), max_dt_tp=max_dt_tp, bin_size_tp=bin_size_tp, max_samples=max_samples)
            bin_edges = bin_edges / samplerate *1000  # milliseconds
            autocorrelograms.append(dict(
                unit_id=unit_id,
                bin_counts=bin_counts,
                bin_edges=bin_edges
            ))
        ret = dict(
            autocorrelograms=autocorrelograms
        )
        with open(self.json_out, 'w') as f:
            simplejson.dump(serialize_np(ret), f, ignore_nan=True)


class Autocorrelograms:
    def __init__(self):
        super().__init__()

    def javascript_state_changed(self, prev_state, state):
        self.set_python_state(dict(status='running', status_message='Running'))
        mt.configDownloadFrom(state.get('download_from', []))

        max_samples = state.get('max_samples')
        max_dt_msec = state.get('max_dt_msec')
        bin_size_msec = state.get('bin_size_msec')
        if not max_dt_msec:
            return

        firings_path = state.get('firingsPath', None)
        if not firings_path:
            self.set_python_state(dict(
                status='error',
                status_message='No firingsPath provided'
            ))
            return

        samplerate = state.get('samplerate', None)
        if not samplerate:
            self.set_python_state(dict(
                status='error',
                status_message='No samplerate provided'
            ))
            return

        self.set_python_state(dict(status_message='Realizing file: {}'.format(firings_path)))
        firings_path2 = mt.realizeFile(firings_path)
        if not firings_path2:
            self.set_python_state(dict(
                status='error',
                status_message='Unable to realize file: {}'.format(firings_path)
            ))
            return

        result = ComputeAutocorrelograms.execute(
            firings_path=firings_path2,
            samplerate=samplerate,
            max_samples=max_samples,
            bin_size_msec=bin_size_msec,
            max_dt_msec=max_dt_msec,
            json_out=dict(ext='.json')
        )
        if result.retcode != 0:
            self.set_python_state(dict(
                status='error',
                status_message='Error computing autocorrelogram.'
            ))
            return

        output = mt.loadObject(path=result.outputs['json_out'])
        self.set_python_state(dict(
            status='finished',
            output=output
        ))
