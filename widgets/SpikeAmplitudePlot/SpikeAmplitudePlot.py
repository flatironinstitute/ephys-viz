import traceback
import numpy as np
from mountaintools import client as mt
from mountaintools import MountainClient
import spikeextractors as se
from ..pycommon.autoextractors import AutoSortingExtractor, AutoRecordingExtractor
from .examples import examples


class SpikeAmplitudePlot:
    examples = examples
    
    def __init__(self):
        super().__init__()
        self._sorting = None
        self._recording = None

    def javascript_state_changed(self, prev_state, state):
        unit_ids = state.get('unit_ids', None)
        if unit_ids is None:
            self._set_error('Missing: unit_ids')
            return

        if not self._sorting:
            self._set_status('running', 'Loading sorting')
            sorting0 = state.get('sorting', None)
            if not sorting0:
                self._set_error('Missing: sorting')
                return
            try:
                self._sorting = AutoSortingExtractor(sorting0)
            except Exception as err:
                traceback.print_exc()
                self._set_error('Problem initiating sorting: {}'.format(err))
                return

        if not self._recording:
            self._set_status('running', 'Loading recording')
            recording0 = state.get('recording', None)
            if not recording0:
                self._set_error('Missing: recording')
                return
            try:
                self._recording = AutoRecordingExtractor(recording0)
            except Exception as err:
                traceback.print_exc()
                self._set_error('Problem initiating recording: {}'.format(err))
                return

        spike_trains = dict()
        spike_amplitudes = dict()
        for unit_id in unit_ids:
            self._set_status('running', 'Processing unit {}'.format(unit_id))
            times0 = self._sorting.get_unit_spike_train(unit_id=unit_id)
            spike_trains[int(unit_id)] = times0
            spike_amplitudes[int(unit_id)] = _get_spike_amplitudes(self._recording, times0)
        num_timepoints = self._recording.get_num_frames()
        
        self._set_status('running', 'Returning results')
        self._set_state(
            spike_trains=spike_trains,
            spike_amplitudes=spike_amplitudes,
            num_timepoints=num_timepoints,
            status='finished',
            status_message='finished'
        )

    def _set_state(self, **kwargs):
        self.set_state(kwargs)
    
    def _set_error(self, error_message):
        self._set_status('error', error_message)
    
    def _set_status(self, status, status_message=''):
        self._set_state(status=status, status_message=status_message)

def _get_spike_amplitudes(recording: se.RecordingExtractor, times):
    snippets = recording.get_snippets(reference_frames=times, snippet_len=50)
    avg_waveform = np.mean(np.stack(snippets), axis=0)
    maxchan = np.argmax(np.max(np.abs(avg_waveform), 1))
    maxt = np.argmax(np.abs(avg_waveform[maxchan, :]))
    baselines = np.mean(np.stack(snippets), axis=2)[:, maxchan]
    peaks = np.stack(snippets)[:, maxchan, maxt]
    amplitudes = peaks-baselines
    return amplitudes
    