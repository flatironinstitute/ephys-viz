from mountaintools import client as mt
import spikeextractors as se
import numpy as np
import io
import base64
from spikeforest import SFMdaRecordingExtractor, mdaio
from spikeforest import EfficientAccessRecordingExtractor


class TimeseriesView:
    def __init__(self):
        super().__init__()
        self._recording = None
        self._multiscale_recordings = None

    def javascript_state_changed(self, prev_state, state):
        if not self._recording:
            recordingPath = state.get('recordingPath', None)
            if not recordingPath:
                return
            self.set_python_state(dict(status_message='Loading recording'))
            mt.configDownloadFrom(state.get('download_from'))
            X = SFMdaRecordingExtractor(
                dataset_directory=recordingPath, download=True)
            self.set_python_state(dict(
                numChannels=X.get_num_channels(),
                numTimepoints=X.get_num_frames(),
                samplerate=X.get_sampling_frequency(),
                status_message='Loaded recording.'
            ))
            self._recording = X
        else:
            X = self._recording

        SR = state.get('segmentsRequested', {})
        for key in SR.keys():
            aa = SR[key]
            if not self.get_python_state(key, None):
                self.set_python_state(dict(status_message='Loading segment {}'.format(key)))
                data0 = self._load_data(aa['ds'], aa['ss'])
                data0_base64 = _mda32_to_base64(data0)
                state0 = {}
                state0[key] = dict(data=data0_base64, ds=aa['ds'], ss=aa['ss'])
                self.set_python_state(state0)
                self.set_python_state(dict(status_message='Loaded segment {}'.format(key)))

    def _load_data(self, ds, ss):
        if ds > 1:
            if self._multiscale_recordings is None:
                self.set_python_state(dict(status_message='Creating multiscale recordings...'))
                self._multiscale_recordings = _create_multiscale_recordings(recording=self._recording, progressive_ds_factor=3)
                self.set_python_state(dict(status_message='Done creating multiscale recording'))
            rx = self._multiscale_recordings[ds]
            X = _extract_data_segment(recording=rx, segment_num=ss, segment_size=self.get_javascript_state('segmentSize') * 2)
            return X

        traces = self._recording.get_traces(
            start_frame=ss*self.get_javascript_state('segmentSize'), end_frame=(ss+1)*self.get_javascript_state('segmentSize'))
        return traces

    def iterate(self):
        pass


def _mda32_to_base64(X):
    f = io.BytesIO()
    mdaio.writemda32(X, f)
    return base64.b64encode(f.getvalue()).decode('utf-8')

def _extract_data_segment(*, recording, segment_num, segment_size):
    segment_num = int(segment_num)
    segment_size = int(segment_size)
    a1 = segment_size * segment_num
    a2 = segment_size * (segment_num + 1)
    if a1 > recording.get_num_frames():
        a1 = recording.get_num_frames()
    if a2 > recording.get_num_frames():
        a2 = recording.get_num_frames()
    X = recording.get_traces(start_frame=a1, end_frame=a2)
    return X

def _create_multiscale_recordings(*, recording, progressive_ds_factor):
    ret = dict()
    current_rx = recording
    current_ds_factor = 1
    N = recording.get_num_frames()
    recording_has_minmax = False
    while current_ds_factor * progressive_ds_factor < N:
        current_rx = _DownsampledRecordingExtractor(
            recording=current_rx, ds_factor=progressive_ds_factor, input_has_minmax=recording_has_minmax)
        current_rx = EfficientAccessRecordingExtractor(recording=current_rx)
        current_ds_factor = current_ds_factor * progressive_ds_factor
        ret[current_ds_factor] = current_rx
        recording_has_minmax = True
    return ret


class _DownsampledRecordingExtractor(se.RecordingExtractor):
    def __init__(self, *, recording, ds_factor, input_has_minmax):
        se.RecordingExtractor.__init__(self)
        self._recording = recording
        self._ds_factor = ds_factor
        self._input_has_minmax = input_has_minmax
        self.copy_channel_properties(recording)

    def hash(self):
        return mt.sha1OfObject(dict(
            name='downsampled-recording-extractor',
            version=2,
            recording=self._recording.hash(),
            ds_factor=self._ds_factor,
            input_has_minmax=self._input_has_minmax
        ))

    def get_channel_ids(self):
        # same channel IDs
        return self._recording.get_channel_ids()

    def get_num_frames(self):
        if self._input_has_minmax:
            # number of frames is just /ds_factor (but not quite -- tricky!)
            return ((self._recording.get_num_frames() // 2) // self._ds_factor) * 2
        else:
            # need to double because we will now keep track of mins and maxs
            return (self._recording.get_num_frames() // self._ds_factor) * 2

    def get_sampling_frequency(self):
        if self._input_has_minmax:
            # sampling frequency is just /ds_factor
            return self._recording.get_sampling_frequency() / self._ds_factor
        else:
            # need to double because we will now keep track of mins and maxes
            return (self._recording.get_sampling_frequency() / self._ds_factor) * 2

    def get_traces(self, channel_ids=None, start_frame=None, end_frame=None):
        ds_factor = self._ds_factor
        if self._input_has_minmax:
            # get the traces *ds_factor
            X = self._recording.get_traces(
                channel_ids=channel_ids,
                start_frame=start_frame * ds_factor,
                end_frame=end_frame * ds_factor
            )
            X_mins = X[:, 0::2]  # here are the minimums
            X_maxs = X[:, 1::2]  # here are the maximums
            X_mins_reshaped = np.reshape(
                X_mins, (X_mins.shape[0], X_mins.shape[1] // ds_factor, ds_factor), order='C')
            X_maxs_reshaped = np.reshape(
                X_maxs, (X_maxs.shape[0], X_maxs.shape[1] // ds_factor, ds_factor), order='C')
            # the size of the output is the size X divided by ds_factor
            ret = np.zeros((X.shape[0], X.shape[1] // ds_factor))
            ret[:, 0::2] = np.min(X_mins_reshaped, axis=2)  # here are the mins
            ret[:, 1::2] = np.max(X_maxs_reshaped, axis=2)  # here are the maxs
            return ret
        else:
            X = self._recording.get_traces(
                channel_ids=channel_ids,
                start_frame=start_frame * self._ds_factor // 2,
                end_frame=end_frame * self._ds_factor // 2
            )
            X_reshaped = np.reshape(
                X, (X.shape[0], X.shape[1] // ds_factor, ds_factor), order='C')
            ret = np.zeros((X.shape[0], (X.shape[1] // ds_factor) * 2))
            ret[:, 0::2] = np.min(X_reshaped, axis=2)
            ret[:, 1::2] = np.max(X_reshaped, axis=2)
            return ret

    @staticmethod
    def write_recording(recording, save_path):
        EfficientAccessRecordingExtractor(
            recording=recording, _dest_path=save_path)

