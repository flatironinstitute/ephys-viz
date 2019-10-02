import traceback
import numpy as np
from mountaintools import client as mt
from mountaintools import MountainClient
import spikeextractors as se
from ..pycommon.autoextractors import AutoSortingExtractor
from .examples import examples

    

class SpikeRasterPlot:
    examples = examples
    
    def __init__(self):
        super().__init__()

    def javascript_state_changed(self, prev_state, state):
        self._set_status('running', 'Running SpikeRasterPlot')

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

        spike_trains = dict()
        for unit_id in self._sorting.get_unit_ids():
            spike_trains[int(unit_id)] = self._sorting.get_unit_spike_train(unit_id=unit_id)
        num_timepoints = np.max([
            np.max(spike_trains[unit_id])
            for unit_id in self._sorting.get_unit_ids()
        ])
        
        self._set_state(
            unit_ids=self._sorting.get_unit_ids(),
            spike_trains=spike_trains,
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