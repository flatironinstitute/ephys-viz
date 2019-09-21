from mountaintools import client as mt
import mlprocessors as mlpr
from ..pycommon.nwb_to_dict import nwb_to_dict
import numpy as np
import imageio
import base64
import tempfile

class ExtractTwoPhotonSeriesMp4(mlpr.Processor):
    NAME = 'H5ToDict'
    VERSION = '0.1.1'

    # Inputs
    nwb_in = mlpr.Input()

    # Outputs
    mp4_out = mlpr.Output()

    def run(self):
        nwb_obj = nwb_to_dict(self.nwb_in, use_cache=True)
        npy_path = nwb_obj['acquisition']['TwoPhotonSeries']['_datasets']['data']['_data']
        npy_path2 = mt.realizeFile(npy_path)
        if not npy_path2:
            nwb_obj = nwb_to_dict(self.nwb_in, use_cache=False)
            npy_path = nwb_obj['acquisition']['TwoPhotonSeries']['_datasets']['data']['_data']
            npy_path2 = mt.realizeFile(npy_path)
            if not npy_path2:
                self._set_error('Unable to realize npy file: {}'.format(npy_path))
                return
        X = np.load(npy_path2)

        # Note that there is a bug in imageio.mimwrite that prevents us to
        # write to a memory buffer.
        # See: https://github.com/imageio/imageio/issues/157

        imageio.mimwrite(self.mp4_out, X, format='mp4', fps=10)

class TwoPhotonSeries:
    def __init__(self):
        super().__init__()

    def javascript_state_changed(self, prev_state, state):
        self._set_status('running', 'Running TwoPhotonSeries')

        nwb_path = state.get('nwb_path', None)
        download_from = state.get('download_from', [])

        if not nwb_path:
            self._set_error('Missing nwb_path')
            return

        mt.configDownloadFrom(download_from)

        nwb_path2 = mt.realizeFile(nwb_path)
        if not nwb_path2:
            self._set_error('Unable to realize nwb file: {}'.format(nwb_path))
            return
        
        self._set_status('running', 'Extracting .mp4 data')
        outputs = ExtractTwoPhotonSeriesMp4.execute(nwb_in=nwb_path2, mp4_out={'ext': '.mp4'}).outputs

        self._set_status('running', 'Reading .mp4 data')
        mp4_fname = mt.realizeFile(outputs['mp4_out'])
        with open(mp4_fname, 'rb') as f:
            video_data = f.read()

        self._set_status('running', 'Encoding .mp4 data')
        video_data_b64 = base64.b64encode(video_data).decode()
        video_url = 'data:video/mp4;base64,{}'.format(video_data_b64)

        self._set_status('running', 'Setting .mp4 data to python state')
        self.set_python_state(dict(
            video_url=video_url,
            status='finished',
            status_message=''
        ))
    
    def _set_error(self, error_message):
        self._set_status('error', error_message)
    
    def _set_status(self, status, status_message=''):
        self.set_python_state(dict(status=status, status_message=status_message))