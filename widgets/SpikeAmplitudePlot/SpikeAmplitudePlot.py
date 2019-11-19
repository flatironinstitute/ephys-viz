import traceback
import numpy as np
from mountaintools import client as mt
from mountaintools import MountainClient
import spikeextractors as se
from ..pycommon.autoextractors import AutoRecordingExtractor
from ..pycommon.autoextractors import AutoSortingExtractor
    

class SpikeAmplitudePlot:
    def __init__(self):
        super().__init__()
        self._amplitude_range = [0, 0]

    def javascript_state_changed(self, prev_state, state):
        self._set_status('running', 'Running SpikeAmplitudePlot')

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

        self._set_state(
            # unit_ids = self._sorting.get_unit_ids(),
            num_timepoints=self._recording.get_num_frames(),
            num_channels=self._recording.get_num_channels(),
            samplerate=self._recording.get_sampling_frequency(),
            status='finished',
            status_message='finished'
        )

    def on_message(self, msg):
        if msg.get('name', '') == 'requestAmplitudeData':
            unit_id = msg['unit_id']
            blockNum = msg['blockNum']
            blockSize = msg['blockSize']
            t1 = blockNum * blockSize
            t2 = (blockNum + 1) * blockSize

            times0 = self._sorting.get_unit_spike_train(unit_id=unit_id, start_frame=t1, end_frame=t2)
            # times0 = np.array(times0)
            # times0 = times0[(t1 <= times0) & (times0 < t2)]
            amplitudes0 = _get_spike_amplitudes(self._recording, times0)
            self.send_message(dict(
                name='amplitudeData',
                unit_id=unit_id,
                blockNum=blockNum,
                blockSize=blockSize,
                times=times0,
                amplitudes=amplitudes0
            ))

            arange_new = [
                np.min([self._amplitude_range[0], np.min(amplitudes0)]),
                np.max([self._amplitude_range[1], np.max(amplitudes0)])
            ]
            if arange_new[0] != self._amplitude_range[0] or arange_new[1] != self._amplitude_range[1]:
                self._amplitude_range = arange_new
                self.send_message(dict(
                    name='amplitudeRange',
                    amplitude_range=self._amplitude_range
                ))

    def _set_state(self, **kwargs):
        self.set_state(kwargs)
    
    def _set_error(self, error_message):
        self._set_status('error', error_message)
    
    def _set_status(self, status, status_message=''):
        self._set_state(status=status, status_message=status_message)

def _get_spike_amplitudes(recording: se.RecordingExtractor, times: np.ndarray):
    if len(times) == 0:
        return np.array([])
    snippets = recording.get_snippets(reference_frames=times, snippet_len=20)
    avg_waveform = np.mean(np.stack(snippets), axis=0)
    maxchan = np.argmax(np.max(np.abs(avg_waveform), 1))
    maxt = np.argmax(np.abs(avg_waveform[maxchan, :]))
    baselines = np.mean(np.stack(snippets), axis=2)[:, maxchan]
    peaks = np.stack(snippets)[:, maxchan, maxt]
    amplitudes = peaks-baselines
    return amplitudes